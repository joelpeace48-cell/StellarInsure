"use client";

import React, { startTransition, useEffect, useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";

import { Icon, type IconName } from "@/components/icon";
import { Skeleton } from "@/components/skeleton";

type PolicyStatus = "active" | "pending" | "expired" | "claimed" | "all";
type PolicyType = "weather" | "flight" | "smart-contract" | "asset" | "health" | "all";
type SortBy = "date" | "coverage";

interface Policy {
  id: string;
  title: string;
  type: PolicyType;
  status: Exclude<PolicyStatus, "all">;
  coverageAmount: number;
  premiumAmount: number;
  createdAt: string;
  expiresAt: string;
  oracleSource: string;
}

const MOCK_POLICIES: Policy[] = [
  {
    id: "weather-alpha",
    title: "Northern Plains Weather Guard",
    type: "weather",
    status: "active",
    coverageAmount: 5000,
    premiumAmount: 125.5,
    createdAt: "2026-02-15",
    expiresAt: "2026-05-15",
    oracleSource: "NOAA Weather API",
  },
  {
    id: "flight-orbit",
    title: "Flight Orbit Delay Cover",
    type: "flight",
    status: "active",
    coverageAmount: 2000,
    premiumAmount: 45.0,
    createdAt: "2026-03-01",
    expiresAt: "2026-06-01",
    oracleSource: "Airline Delay API",
  },
];

const POLICY_TYPE_DISPLAY: Record<PolicyType, { label: string; icon: IconName }> = {
  weather: { label: "Weather", icon: "shield" },
  flight: { label: "Flight Delay", icon: "clock" },
  "smart-contract": { label: "Smart Contract", icon: "spark" },
  asset: { label: "Asset Protection", icon: "wallet" },
  health: { label: "Health", icon: "heart" },
  all: { label: "All Types", icon: "shield" },
};

const POLICY_STATUS_DISPLAY: Record<Exclude<PolicyStatus, "all">, { label: string; tone: "success" | "warning" | "danger" }> = {
  active: { label: "Active", tone: "success" },
  pending: { label: "Pending", tone: "warning" },
  claimed: { label: "Claimed", tone: "success" },
  expired: { label: "Expired", tone: "danger" },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

function StatusBadge({ status }: { status: Exclude<PolicyStatus, "all"> }) {
  const { label, tone } = POLICY_STATUS_DISPLAY[status];
  const toneClass = {
    success: "policy-badge--success",
    warning: "policy-badge--warning",
    danger: "policy-badge--danger",
  }[tone];

  return <span className={`policy-badge ${toneClass}`}>{label}</span>;
}

function PolicyCard({ policy }: { policy: Policy }) {
  const typeDisplay = POLICY_TYPE_DISPLAY[policy.type as PolicyType];

  return (
    <Link href={`/policies/${policy.id}`} className="policy-card motion-panel">
      <article className="policy-card__inner">
        <div className="policy-card__header">
          <div className="policy-card__title-group">
            <h3>{policy.title}</h3>
            <StatusBadge status={policy.status} />
          </div>
          <div className="policy-card__icon">
            <Icon name={typeDisplay.icon} size="md" tone="accent" />
          </div>
        </div>

        <div className="policy-card__details">
          <div className="policy-card__detail-row">
            <span className="policy-card__label">Coverage</span>
            <span className="policy-card__value">{formatCurrency(policy.coverageAmount)}</span>
          </div>
          <div className="policy-card__detail-row">
            <span className="policy-card__label">Premium</span>
            <span className="policy-card__value">{formatCurrency(policy.premiumAmount)}</span>
          </div>
        </div>

        <div className="policy-card__footer">
          <div className="policy-card__meta">
            <span className="policy-card__type-badge">
              <Icon name={typeDisplay.icon} size="sm" tone="muted" />
              {typeDisplay.label}
            </span>
            <span className="policy-card__date">{formatDate(policy.createdAt)}</span>
          </div>
          <span className="policy-card__cta" aria-hidden="true">
            <Icon name="arrow-up-right" size="sm" tone="accent" />
          </span>
        </div>
      </article>
    </Link>
  );
}

export default function PoliciesListPageClient() {
  const [statusFilter, setStatusFilter] = useState<PolicyStatus>("all");
  const [typeFilter, setTypeFilter] = useState<PolicyType>("all");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [isLoading, setIsLoading] = useState(true);

  const deferredStatusFilter = useDeferredValue(statusFilter);
  const deferredTypeFilter = useDeferredValue(typeFilter);
  const deferredSortBy = useDeferredValue(sortBy);

  const isFiltering =
    deferredStatusFilter !== statusFilter ||
    deferredTypeFilter !== typeFilter ||
    deferredSortBy !== sortBy;

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    return MOCK_POLICIES.filter((policy) => {
      const matchStatus = deferredStatusFilter === "all" || policy.status === deferredStatusFilter;
      const matchType = deferredTypeFilter === "all" || policy.type === deferredTypeFilter;
      return matchStatus && matchType;
    });
  }, [deferredStatusFilter, deferredTypeFilter]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    if (deferredSortBy === "date") {
      copy.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (deferredSortBy === "coverage") {
      copy.sort((a, b) => b.coverageAmount - a.coverageAmount);
    }
    return copy;
  }, [filtered, deferredSortBy]);

  function handleStatusChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value as PolicyStatus;
    startTransition(() => {
      setStatusFilter(value);
    });
  }

  function handleTypeChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value as PolicyType;
    startTransition(() => {
      setTypeFilter(value);
    });
  }

  function handleSortChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value as SortBy;
    startTransition(() => {
      setSortBy(value);
    });
  }

  return (
    <main id="main-content" className="policy-page">
      <div className="section-header">
        <span className="eyebrow">My Policies</span>
        <h1 id="policies-title">Your Insurance Policies</h1>
        <p>
          Manage your active parametric insurance policies, view coverage details,
          and track claim status with full transparency.
        </p>
      </div>

      <div className="policy-filters motion-panel" role="search" aria-label="Filter and sort policies">
        <div className="policy-filter-group">
          <label htmlFor="status-filter" className="policy-filter-label">
            Status
          </label>
          <select
            id="status-filter"
            className="policy-select"
            value={statusFilter}
            onChange={handleStatusChange}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="claimed">Claimed</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        <div className="policy-filter-group">
          <label htmlFor="type-filter" className="policy-filter-label">
            Type
          </label>
          <select
            id="type-filter"
            className="policy-select"
            value={typeFilter}
            onChange={handleTypeChange}
          >
            <option value="all">All Types</option>
            <option value="weather">Weather</option>
            <option value="flight">Flight Delay</option>
            <option value="smart-contract">Smart Contract</option>
            <option value="asset">Asset Protection</option>
            <option value="health">Health</option>
          </select>
        </div>

        <div className="policy-filter-group">
          <label htmlFor="sort-filter" className="policy-filter-label">
            Sort By
          </label>
          <select
            id="sort-filter"
            className="policy-select"
            value={sortBy}
            onChange={handleSortChange}
          >
            <option value="date">Newest First</option>
            <option value="coverage">Highest Coverage</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="policy-grid motion-panel" role="region" aria-label="Loading policies" aria-busy="true">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={`sk-${i}`} className="policy-card--skeleton">
              <Skeleton style={{ height: "24px", width: "100%", marginBottom: "12px" }} />
              <Skeleton style={{ height: "16px", width: "80%", marginBottom: "16px" }} />
              <Skeleton style={{ height: "14px", width: "60%", marginBottom: "8px" }} />
              <Skeleton style={{ height: "14px", width: "70%" }} />
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="policy-empty" role="status">
          <span className="policy-empty-icon" aria-hidden="true">
            <Icon name="document" size="lg" tone="muted" />
          </span>
          <h2>No policies found</h2>
          <p>No policies match your current filters.</p>
          <Link href="/create" className="cta-secondary">
            Create your first policy
          </Link>
        </div>
      ) : (
        <div className={`policy-grid motion-panel ${isFiltering ? "policy-grid--loading" : ""}`}>
          {sorted.map((policy) => (
            <PolicyCard key={policy.id} policy={policy} />
          ))}
        </div>
      )}
    </main>
  );
}