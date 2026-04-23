import type { Metadata } from "next";

import { StructuredData } from "@/components/structured-data";
import { buildMetadata, webPageStructuredData } from "@/lib/seo";

import PoliciesListPageClient from "./policies-list-page-client";

const PAGE_TITLE = "My Policies";
const PAGE_DESCRIPTION = "View all your active and past parametric insurance policies with coverage details, premium amounts, and claim status on Stellar.";

export const metadata: Metadata = buildMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  pathname: "/policies",
  keywords: ["my policies", "policy list", "coverage", "claims", "parametric insurance"],
});

export default function PoliciesListPage() {
  return (
    <>
      <StructuredData
        data={webPageStructuredData({
          title: `${PAGE_TITLE} | StellarInsure`,
          description: PAGE_DESCRIPTION,
          pathname: "/policies",
        })}
      />
      <PoliciesListPageClient />
    </>
  );
}