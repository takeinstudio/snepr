import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/live/checkout")({
  component: AppCheckout,
});

function AppCheckout() {
  return (
    <div className="flex flex-col h-full bg-surface-2">
      <div className="flex items-center gap-3 p-4">
        <Link to="/app/queue" className="rounded-full p-2.5 bg-background shadow-sm hover:bg-surface-2 transition-colors active:scale-95 border border-border/50">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </Link>
      </div>

      <div className="mt-2 flex-1 flex flex-col bg-background rounded-t-[32px] shadow-[0_-4px_24px_rgba(0,0,0,0.03)] px-6 pt-8 pb-6 border-t border-border/50">
        <div className="text-center pb-8 border-b-2 border-dashed border-border/60">
          <h1 className="text-[32px] font-display font-bold tracking-tight text-ink">Checkout</h1>
          <p className="text-[14px] text-ink-soft font-medium mt-1 uppercase tracking-widest">Receipt</p>
        </div>

        <div className="py-8 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-lg text-ink">Haircut & Styling</p>
              <p className="text-[14px] text-ink-soft mt-1">Barber: John Doe</p>
            </div>
            <p className="font-bold text-xl text-ink">₹180</p>
          </div>

          <div className="space-y-3 pt-4">
            <div className="flex justify-between text-[15px] text-ink-soft font-medium">
              <p>Base Price</p>
              <p>₹180</p>
            </div>
            <div className="flex justify-between text-[15px] text-primary font-bold">
              <p>Off-peak Discount</p>
              <p>₹0</p>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-border/50">
          <p className="text-[13px] font-bold text-ink-soft mb-4 uppercase tracking-wider text-center">Select Payment</p>
          <div className="flex gap-3 mb-6">
            <button className="press flex-1 rounded-[16px] bg-surface-2 py-3.5 text-[14px] font-bold text-ink border border-border/50 hover:border-primary/30 active:scale-[0.96]">UPI</button>
            <button className="press flex-1 rounded-[16px] bg-primary/10 py-3.5 text-[14px] font-bold text-primary border-2 border-primary active:scale-[0.96]">Card</button>
            <button className="press flex-1 rounded-[16px] bg-surface-2 py-3.5 text-[14px] font-bold text-ink border border-border/50 hover:border-primary/30 active:scale-[0.96]">Cash</button>
          </div>
          
          <button className="press w-full rounded-[20px] bg-primary py-4.5 text-[16px] font-bold text-primary-foreground shadow-md hover:bg-primary-hover active:scale-[0.98]">
            Pay ₹180
          </button>
        </div>
      </div>
    </div>
  );
}
