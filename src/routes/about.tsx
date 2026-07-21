import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [{ title: "About — Snepr" }],
  }),
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:py-24">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          About Snepr
        </h1>
        <p className="text-lg text-ink-soft">
          We are changing the way people wait for their haircuts and salon appointments.
        </p>
      </div>

      <div className="prose prose-lg mx-auto text-ink-soft">
        <p className="mb-6">
          Nobody likes waiting. Whether it's sitting in a crowded salon lobby for an hour or driving across town only to find out your favorite barber has a line out the door, the traditional walk-in experience is fundamentally broken.
        </p>
        
        <p className="mb-6">
          <strong>Snepr</strong> was built to fix this. We provide real-time transparency into salon wait times, allowing customers to see exactly how busy a salon is before they even leave their house. With our virtual queue system, you can join a line from your phone and walk straight into the chair when it's your turn.
        </p>

        <h2 className="mb-4 mt-12 text-2xl font-bold text-ink">Our Mission</h2>
        <p className="mb-6">
          Our mission is to eliminate the concept of physical waiting rooms entirely. We believe your time is valuable, and it shouldn't be spent reading outdated magazines in a lobby. We want to empower local businesses to provide a frictionless, modern experience for their customers without the need for expensive hardware or complex booking systems.
        </p>

        <h2 className="mb-4 mt-12 text-2xl font-bold text-ink">For Salons</h2>
        <p className="mb-6">
          For salon owners and barbers, Snepr is a lightweight, effortless way to manage flow. Walk-ins are the lifeblood of many salons, but unpredictable crowds can lead to stressed staff and frustrated customers. Snepr smooths out that curve, providing a digital waiting room that keeps customers happy and chairs full.
        </p>
      </div>
    </div>
  );
}
