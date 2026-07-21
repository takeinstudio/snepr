import { createFileRoute } from "@tanstack/react-router";
import { getSalons, createSalon, updateSalon, deleteSalon } from "../../../backend/functions/salons";
import { login } from "../../../backend/functions/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export const Route = createFileRoute("/app/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<{ id: number; username: string; role: string } | null>(null);
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const { data: salons, isLoading } = useQuery({
    queryKey: ["salons"],
    queryFn: () => getSalons(),
    enabled: !!user,
  });

  const [editingSalonId, setEditingSalonId] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({});

  const loginMutation = useMutation({
    mutationFn: () => login({ data: { username, password } }),
    onSuccess: (data) => {
      setUser(data);
      setLoginError("");
    },
    onError: () => {
      setLoginError("Invalid credentials");
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateSalon({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salons"] });
      setEditingSalonId(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteSalon({ data: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salons"] });
    }
  });

  const handleEdit = (salon: any) => {
    setEditingSalonId(salon.id);
    setFormData(salon);
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
        <div className="w-full max-w-sm bg-card p-8 rounded-[32px] shadow-lg border border-border">
          <h1 className="text-2xl font-bold text-ink text-center font-display mb-6">Admin Login</h1>
          {loginError && <p className="text-destructive text-sm text-center mb-4">{loginError}</p>}
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-surface-2 border-none focus:ring-2 focus:ring-primary/50"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-surface-2 border-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              onClick={() => loginMutation.mutate()}
              disabled={loginMutation.isPending}
              className="press w-full py-3.5 bg-primary text-primary-foreground font-bold rounded-xl active:scale-[0.98]"
            >
              {loginMutation.isPending ? "Logging in..." : "Login"}
            </button>
            <p className="text-xs text-center text-ink-soft pt-2">
              Hint: use <strong>admin / admin</strong> or <strong>subadmin / subadmin</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) return <div className="p-8 text-center text-ink-soft">Loading dashboard...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-ink">Admin Dashboard</h1>
          <p className="text-sm text-ink-soft mt-1">
            Logged in as <strong className="text-primary">{user.username}</strong> ({user.role})
          </p>
        </div>
        <button onClick={() => setUser(null)} className="text-sm font-medium text-destructive hover:underline">
          Logout
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-left text-sm text-ink">
          <thead className="bg-surface-2 uppercase text-ink-soft">
            <tr>
              <th className="px-6 py-4 font-semibold border-b border-border">Name</th>
              <th className="px-6 py-4 font-semibold border-b border-border">Category</th>
              <th className="px-6 py-4 font-semibold border-b border-border">Phone</th>
              <th className="px-6 py-4 font-semibold border-b border-border text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {salons?.map((salon) => (
              <tr key={salon.id} className="hover:bg-surface/50 transition-colors">
                {editingSalonId === salon.id ? (
                  <>
                    <td className="px-6 py-4">
                      <input 
                        type="text" 
                        value={formData.name || ""} 
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full border rounded px-2 py-1"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="text" 
                        value={formData.category || ""} 
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full border rounded px-2 py-1"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="text" 
                        placeholder="Add phone..."
                        value={formData.phone || ""} 
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full border rounded px-2 py-1"
                      />
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={handleSave} className="text-primary font-medium hover:underline">Save</button>
                      <button onClick={() => setEditingSalonId(null)} className="text-ink-soft hover:underline">Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 font-medium">{salon.name}</td>
                    <td className="px-6 py-4 text-ink-soft">{salon.category || "-"}</td>
                    <td className="px-6 py-4 text-ink-soft">{salon.phone || <span className="text-muted-foreground italic">Missing</span>}</td>
                    <td className="px-6 py-4 text-right space-x-4">
                      <button onClick={() => handleEdit(salon)} className="text-primary font-medium hover:underline">Edit</button>
                      {user.role === 'admin' && (
                        <button 
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this salon?")) {
                              deleteMutation.mutate(salon.id);
                            }
                          }} 
                          className="text-destructive font-medium hover:underline"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
