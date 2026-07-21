import React from "react";
import { CompactAppBanner } from "./CompactAppBanner";
import { AppPromoBottomSheet } from "./AppPromoBottomSheet";

export function AppPromoManager() {
  return (
    <>
      <CompactAppBanner />
      <AppPromoBottomSheet />
    </>
  );
}
