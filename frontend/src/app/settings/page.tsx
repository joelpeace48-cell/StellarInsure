import type { Metadata } from "next";

import SettingsPageClient from "./settings-page-client";

export const metadata: Metadata = {
  title: "Account Preferences",
  description: "Manage timezone, currency display, and communication preferences.",
};

export default function SettingsPage() {
  return <SettingsPageClient />;
}
