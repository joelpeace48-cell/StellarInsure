import type { Metadata } from "next";

import { StructuredData } from "@/components/structured-data";
import { buildMetadata, webPageStructuredData } from "@/lib/seo";

import TransactionHistoryPageClient from "./history-page-client";

const PAGE_TITLE = "Transaction History";
const PAGE_DESCRIPTION = "Review premium payments, claim payouts, and refunds with filters and direct Stellar Explorer links.";

export const metadata: Metadata = buildMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  pathname: "/history",
  keywords: ["transaction history", "Stellar Explorer", "premium payments", "claim payouts"],
});

export default function TransactionHistoryPage() {
  return (
    <>
      <StructuredData
        data={webPageStructuredData({
          title: `${PAGE_TITLE} | StellarInsure`,
          description: PAGE_DESCRIPTION,
          pathname: "/history",
        })}
      />
      <TransactionHistoryPageClient />
    </>
  );
}
