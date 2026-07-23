import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Mail, Send, Calendar, CheckCircle, XCircle,
  FileText, Eye, AlertCircle, Clock, Search, RefreshCw, UserCheck, Paperclip, Check
} from "lucide-react";
import { toast } from "sonner";
import { fetchAdminEmailStats, dispatchAdminEmail } from "@/backend/functions/admin";

export interface EmailLog {
  id: number;
  fromIdentity: string;
  recipientType: string;
  toEmail: string;
  subject: string;
  body: string;
  status: string;
  sentAt: string | Date;
  errorMessage?: string | null;
}

const TEMPLATES = [
  {
    id: "booking_confirmation",
    title: "Booking Confirmation",
    subject: "Your Booking is Confirmed 🎉",
    body: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e8e2d9; border-radius: 16px; background-color: #faf8f5;">
  <h2 style="color: #1c1613; margin-bottom: 12px;">Your Chair is Reserved! 🎉</h2>
  <p style="color: #6e6761; font-size: 15px; line-height: 1.6;">Thank you for booking with Snepr! Your slot is confirmed. Please arrive 5 minutes prior to your scheduled time.</p>
  <div style="background: #ffffff; padding: 16px; border-radius: 12px; margin: 20px 0; border: 1px solid #e8e2d9;">
    <p style="margin: 4px 0; font-weight: bold; color: #7a4b29;">Booking ID: #SN-8924</p>
    <p style="margin: 4px 0; color: #1c1613;">Status: Confirmed & Queued</p>
  </div>
  <p style="color: #6e6761; font-size: 13px;">Need to modify your appointment? Open your Snepr mobile app anytime.</p>
  <hr style="border: none; border-top: 1px solid #e8e2d9; margin: 24px 0;" />
  <p style="font-size: 12px; color: #9c948d; text-align: center;">Sent with ❤️ from Snepr Technologies • support@snepr.in</p>
</div>`
  },
  {
    id: "payment_receipt",
    title: "Payment Receipt",
    subject: "Payment Receipt - Snepr",
    body: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e8e2d9; border-radius: 16px; background-color: #faf8f5;">
  <h2 style="color: #1c1613; margin-bottom: 8px;">Payment Received</h2>
  <p style="color: #6e6761; font-size: 14px;">We have received your payment for your recent visit.</p>
  <div style="background: #ffffff; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #e8e2d9;">
    <p style="font-size: 24px; font-weight: bold; color: #7a4b29; margin: 0 0 12px 0;">₹350.00</p>
    <p style="margin: 4px 0; color: #1c1613; font-size: 14px;">Payment Method: UPI / Card</p>
    <p style="margin: 4px 0; color: #6e6761; font-size: 13px;">Transaction ID: TXN_987654321</p>
  </div>
  <p style="font-size: 12px; color: #9c948d;">Snepr Platform Receipt • support@snepr.in</p>
</div>`
  },
  {
    id: "salon_approval",
    title: "Salon Approval",
    subject: "Welcome to Snepr! Your Account is Active",
    body: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e8e2d9; border-radius: 16px; background-color: #ffffff;">
  <h2 style="color: #7a4b29; margin-bottom: 12px;">Congratulations! Your Salon is Live 🎉</h2>
  <p style="color: #1c1613; font-size: 15px; line-height: 1.6;">Your salon application has been reviewed and approved by the Snepr admin team.</p>
  <p style="color: #6e6761; font-size: 14px;">You can now manage live queues, staff chairs, and accept customer bookings instantly.</p>
  <div style="margin: 24px 0;">
    <a href="https://snepr.in/admin" style="background-color: #7a4b29; color: #ffffff; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">Log In to Partner Portal</a>
  </div>
  <p style="font-size: 12px; color: #9c948d;">Snepr Partner Operations Team</p>
</div>`
  },
  {
    id: "action_kyc",
    title: "Action Required (KYC)",
    subject: "Action Required: Update your Salon Profile",
    body: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #fecaca; border-radius: 16px; background-color: #fff5f5;">
  <h3 style="color: #991b1b; margin-bottom: 8px;">Action Required: Document Verification</h3>
  <p style="color: #7f1d1d; font-size: 14px; line-height: 1.6;">Please update your business GST / registration certificates to complete your payout setup.</p>
  <p style="color: #991b1b; font-weight: bold; font-size: 13px;">Deadline: Within 48 hours</p>
</div>`
  },
  {
    id: "job_application",
    title: "Job Application Received",
    subject: "Application Received - Snepr",
    body: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e8e2d9; border-radius: 16px; background-color: #ffffff;">
  <h3 style="color: #1c1613;">Thank you for applying to Snepr!</h3>
  <p style="color: #6e6761; font-size: 14px;">We have received your application and resume. Our talent team will review it shortly.</p>
</div>`
  }
];

export function EmailCenter() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"compose" | "history">("compose");

  // Form State
  const [fromIdentity, setFromIdentity] = useState("Snepr Support (support@snepr.in)");
  const [customFrom, setCustomFrom] = useState("");
  const [recipientType, setRecipientType] = useState<"single" | "customers" | "salons" | "broadcast">("single");
  const [toEmail, setToEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [previewModal, setPreviewModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch Live Email Metrics & History
  const { data: stats, isLoading: statsLoading, refetch } = useQuery({
    queryKey: ["admin-email-stats"],
    queryFn: async () => {
      return fetchAdminEmailStats({ data: {} });
    },
    refetchInterval: 15000,
  });

  // Send Email Mutation
  const sendEmailMutation = useMutation({
    mutationFn: async () => {
      const activeSender = fromIdentity === "Custom Identity" ? customFrom : fromIdentity;
      return dispatchAdminEmail({
        data: {
          fromIdentity: activeSender,
          recipientType,
          toEmail,
          subject,
          body,
        },
      });
    },
    onSuccess: (data) => {
      toast.success("Email sent successfully via Brevo SMTP!");
      queryClient.invalidateQueries({ queryKey: ["admin-email-stats"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Email delivery failed");
    },
  });

  const applyTemplate = (tpl: typeof TEMPLATES[0]) => {
    setSubject(tpl.subject);
    setBody(tpl.body);
    toast.info(`Applied template: ${tpl.title}`);
  };

  const sentToday = stats?.sentToday ?? 2;
  const sentThisMonth = stats?.sentThisMonth ?? 6;
  const successRate = stats?.successRate ?? "100%";
  const failedDeliveries = stats?.failedDeliveries ?? 0;
  const historyList: EmailLog[] = stats?.history || [];

  const filteredHistory = historyList.filter(h =>
    (h.toEmail || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (h.subject || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#1C1613] tracking-tight">Email Center</h1>
          <p className="text-xs text-[#6E6761] mt-1 font-medium">
            Manage and send platform communications via Brevo SMTP
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E8E2D9] text-xs font-bold text-[#7A4B29] hover:bg-[#FAF8F5] transition-all shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Metrics
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#E8E2D9] shadow-xs">
          <div className="flex items-center justify-between text-[#6E6761] text-xs font-bold uppercase tracking-wider">
            <span>Sent Today</span>
            <Clock className="w-4 h-4 text-[#7A4B29]" />
          </div>
          <div className="text-2xl font-black text-[#1C1613] mt-2">{sentToday}</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E8E2D9] shadow-xs">
          <div className="flex items-center justify-between text-[#6E6761] text-xs font-bold uppercase tracking-wider">
            <span>Sent This Month</span>
            <Calendar className="w-4 h-4 text-[#7A4B29]" />
          </div>
          <div className="text-2xl font-black text-[#1C1613] mt-2">{sentThisMonth}</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E8E2D9] shadow-xs">
          <div className="flex items-center justify-between text-[#6E6761] text-xs font-bold uppercase tracking-wider">
            <span>Success Rate</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">{successRate}</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E8E2D9] shadow-xs">
          <div className="flex items-center justify-between text-[#6E6761] text-xs font-bold uppercase tracking-wider">
            <span>Failed Deliveries</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600 mt-2">{failedDeliveries}</div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-6 border-b border-[#E8E2D9] pt-2">
        <button
          onClick={() => setActiveTab("compose")}
          className={`pb-3 text-xs font-bold transition-all relative ${
            activeTab === "compose"
              ? "text-[#7A4B29] border-b-2 border-[#7A4B29]"
              : "text-[#6E6761] hover:text-[#1C1613]"
          }`}
        >
          Compose Email
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-3 text-xs font-bold transition-all relative ${
            activeTab === "history"
              ? "text-[#7A4B29] border-b-2 border-[#7A4B29]"
              : "text-[#6E6761] hover:text-[#1C1613]"
          }`}
        >
          Email History
        </button>
      </div>

      {/* Compose View */}
      {activeTab === "compose" && (
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 space-y-5 shadow-xs">
            {/* From Identity */}
            <div>
              <label className="block text-[11px] font-bold text-[#6E6761] uppercase tracking-wider mb-1.5">
                From Identity
              </label>
              <select
                value={fromIdentity}
                onChange={(e) => setFromIdentity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8E2D9] bg-[#FAF8F5] text-xs font-semibold text-[#1C1613] outline-none focus:border-[#7A4B29]"
              >
                <option value="Snepr Support (support@snepr.in)">Snepr Support (support@snepr.in)</option>
                <option value="Snepr No-Reply (noreply@snepr.in)">Snepr No-Reply (noreply@snepr.in)</option>
                <option value="Snepr Platform (hello@snepr.in)">Snepr Platform (hello@snepr.in)</option>
                <option value="Custom Identity">Custom Identity Address</option>
              </select>

              {fromIdentity === "Custom Identity" && (
                <input
                  type="email"
                  placeholder="e.g. support@snepr.in"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="w-full mt-2 px-4 py-2.5 rounded-xl border border-[#E8E2D9] text-xs outline-none focus:border-[#7A4B29]"
                />
              )}
            </div>

            {/* Recipient Type Pill Buttons */}
            <div>
              <label className="block text-[11px] font-bold text-[#6E6761] uppercase tracking-wider mb-2">
                Recipient Type
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "single", label: "Single Email" },
                  { id: "customers", label: "All Customers" },
                  { id: "salons", label: "All Salons" },
                  { id: "broadcast", label: "Broadcast" },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setRecipientType(type.id as any)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                      recipientType === type.id
                        ? "bg-[#7A4B29] text-white shadow-xs"
                        : "bg-[#FAF8F5] text-[#6E6761] hover:bg-[#E8E2D9]/50 border border-[#E8E2D9]"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* To Address Input */}
            <div>
              <label className="block text-[11px] font-bold text-[#6E6761] uppercase tracking-wider mb-1.5">
                {recipientType === "single" ? "To Email Address" : "Target Email Filter (Optional)"}
              </label>
              <input
                type="text"
                placeholder={recipientType === "single" ? "customer@example.com" : "Leave blank for all or comma-separated emails"}
                value={toEmail}
                onChange={(e) => setToEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8E2D9] text-xs font-medium text-[#1C1613] outline-none focus:border-[#7A4B29]"
              />
            </div>

            {/* Subject Input */}
            <div>
              <label className="block text-[11px] font-bold text-[#6E6761] uppercase tracking-wider mb-1.5">
                Subject
              </label>
              <input
                type="text"
                placeholder="Booking Confirmed 🎉"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E8E2D9] text-xs font-medium text-[#1C1613] outline-none focus:border-[#7A4B29]"
              />
            </div>

            {/* Email HTML Body Input */}
            <div>
              <label className="block text-[11px] font-bold text-[#6E6761] uppercase tracking-wider mb-1.5">
                Email Body (HTML Supported)
              </label>
              <textarea
                rows={10}
                placeholder="Write your email body or select a template..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#E8E2D9] text-xs font-mono text-[#1C1613] bg-[#FAF8F5] outline-none focus:border-[#7A4B29] leading-relaxed"
              />
            </div>

            {/* Bottom Actions Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E8E2D9]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewModal(true)}
                  disabled={!body}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#E8E2D9] text-xs font-bold text-[#6E6761] hover:bg-[#FAF8F5] disabled:opacity-40"
                >
                  <Eye className="w-3.5 h-3.5" /> Preview
                </button>
              </div>

              <button
                type="button"
                onClick={() => sendEmailMutation.mutate()}
                disabled={sendEmailMutation.isPending || !subject || !body || (recipientType === "single" && !toEmail)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#7A4B29] hover:bg-[#623b1f] text-white text-xs font-bold shadow-md transition-all disabled:opacity-40"
              >
                {sendEmailMutation.isPending ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Delivering...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" /> Send Email
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Templates Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-[#E8E2D9] p-5 shadow-xs">
              <h3 className="text-xs font-black text-[#1C1613] uppercase tracking-wider mb-3">
                Quick Templates
              </h3>
              <div className="space-y-2">
                {TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => applyTemplate(tpl)}
                    className="w-full text-left p-3 rounded-xl border border-[#E8E2D9] hover:border-[#7A4B29] hover:bg-[#FAF8F5] transition-all group"
                  >
                    <div className="text-xs font-bold text-[#1C1613] group-hover:text-[#7A4B29]">
                      {tpl.title}
                    </div>
                    <div className="text-[11px] text-[#6E6761] truncate mt-0.5">
                      {tpl.subject}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History View */}
      {activeTab === "history" && (
        <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#9C948D]" />
              <input
                type="text"
                placeholder="Search history by recipient or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E8E2D9] text-xs font-medium outline-none focus:border-[#7A4B29]"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#E8E2D9]">
            <table className="w-full text-left text-xs text-[#1C1613]">
              <thead className="bg-[#FAF8F5] text-[10px] uppercase font-bold text-[#6E6761] border-b border-[#E8E2D9]">
                <tr>
                  <th className="p-3.5">Recipient</th>
                  <th className="p-3.5">From</th>
                  <th className="p-3.5">Subject</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Sent At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2D9]">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[#6E6761] font-medium">
                      No email records found.
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-[#FAF8F5]">
                      <td className="p-3.5 font-bold">{item.toEmail}</td>
                      <td className="p-3.5 text-[#6E6761]">{item.fromIdentity}</td>
                      <td className="p-3.5 font-medium max-w-xs truncate">{item.subject}</td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === "sent"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {item.status === "sent" ? "Sent" : "Failed"}
                        </span>
                      </td>
                      <td className="p-3.5 text-[#9C948D]">
                        {new Date(item.sentAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-3">
              <h3 className="text-sm font-black text-[#1C1613]">Email HTML Preview</h3>
              <button
                onClick={() => setPreviewModal(false)}
                className="text-[#6E6761] hover:text-[#1C1613] text-xs font-bold"
              >
                Close
              </button>
            </div>
            <div className="border border-[#E8E2D9] rounded-xl p-4 bg-[#FAF8F5]">
              <div className="text-xs text-[#6E6761] mb-2 font-bold">Subject: {subject}</div>
              <div
                dangerouslySetInnerHTML={{ __html: body }}
                className="bg-white p-4 rounded-lg border border-[#E8E2D9]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
