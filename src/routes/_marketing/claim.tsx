import { createFileRoute } from "@tanstack/react-router";
import { getSalons } from "../../../server/functions/salons";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export const Route = createFileRoute("/_marketing/claim")({
  component: ClaimSalon,
  head: () => ({
    meta: [
      { title: "Claim Your Salon | Snepr" },
    ],
  }),
});

function ClaimSalon() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: salons, isLoading } = useQuery({
    queryKey: ["salons"],
    queryFn: () => getSalons(),
  });

  const filteredSalons = salons?.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.address?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <main className="min-h-screen bg-background">
      <div className="bg-surface-2 py-20 border-b border-border">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-ink mb-6">
            Is this your salon?
          </h1>
          <p className="text-lg text-ink-soft max-w-2xl mx-auto mb-10">
            We've pre-loaded top-rated salons in Bhubaneswar. Search for your business below to claim your listing, update your details, and start managing your live queue.
          </p>
          
          <div className="relative max-w-xl mx-auto">
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or address (e.g. Patia, Jawed Habib)" 
              className="w-full rounded-2xl border border-border bg-card px-6 py-4 text-[16px] shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {isLoading ? (
          <p className="text-center text-ink-soft">Loading salons...</p>
        ) : filteredSalons.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-ink-soft mb-4">Can't find your salon?</p>
            <button className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary-hover">
              List your salon from scratch
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredSalons.map(salon => (
              <div key={salon.id} className="p-6 bg-card border border-border rounded-2xl flex flex-col justify-between hover:border-primary/30 transition-colors">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-ink">{salon.name}</h3>
                    {salon.rating && (
                      <span className="bg-yellow-500/10 text-yellow-600 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        ⭐ {salon.rating}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-ink-soft mb-4">{salon.address}</p>
                </div>
                
                <button 
                  onClick={() => alert(`Claim request submitted for ${salon.name}! We will contact you shortly.`)}
                  className="w-full py-2.5 bg-surface-2 text-ink hover:bg-primary hover:text-primary-foreground font-semibold rounded-xl transition-colors border border-border hover:border-transparent"
                >
                  Claim This Business
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
