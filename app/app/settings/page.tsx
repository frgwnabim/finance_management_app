import { Settings as SettingsIcon } from "lucide-react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Manage your account and categories." />
      <EmptyState
        icon={SettingsIcon}
        title="Settings coming soon"
        description="Profile, categories and preferences will be available here."
      />
    </>
  );
}
