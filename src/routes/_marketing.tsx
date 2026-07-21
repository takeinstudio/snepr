import { Outlet, createFileRoute, useLocation } from "@tanstack/react-router";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";

export const Route = createFileRoute("/_marketing")({
  component: MarketingLayout,
});

function MarketingLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}
