"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { AmountInput, formatAssetAmount, parseAmountInput } from "@/components/amount-input";
import { Icon } from "@/components/icon";
import { Skeleton, SkeletonText } from "@/components/skeleton";
import { PolicyTypeSelector, type PolicyType } from "@/components/policy-type-selector";
import { TransactionTimeline, DEFAULT_TX_STEPS, type TimelineStep } from "@/components/transaction-timeline";
import { useAutosave } from "@/hooks/use-autosave";

type CreateStep = 0 | 1 | 2 | 3;
type ReviewState = "idle" | "loading" | "ready" | "error";

interface PolicyDraft {
  policyType: PolicyType | null;
  coverageAmount: string;
  premium: string;
  triggerCondition: string;
  duration: string;
}

interface PolicyReviewSummary {
  policyTypeLabel: string;
  coverageAmountLabel: string;
  premiumLabel: string;
  durationLabel: string;
  triggerCondition: string;
  premiumRateLabel: string;
  activationLabel: string;
  payoutTimingLabel: string;
}

const INITIAL_DRAFT: PolicyDraft = {
  policyType: null,
  coverageAmount: "",
  premium: "",
  triggerCondition: "",
  duration: "",
};

const STEP_LABELS = [
  "Select Type",
  "Configure",
  "Review",
  "Submit",
];

const POLICY_TYPE_LABELS: Record<PolicyType, string> = {
  weather: "Weather protection",
  flight: "Flight delay",
  "smart-contract": "Smart contract",
  asset: "Asset protection",
  health: "Health",
};

function formatAssetAmount(amount: number) {
  if (Number.isInteger(amount)) {
    return amount.toString();
  }

  return amount.toFixed(2);
}

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function buildReviewSummary(draft: PolicyDraft): PolicyReviewSummary | null {
  if (!draft.policyType) {
    return null;
  }

  if (
    draft.coverageAmount.trim() === "" ||
    draft.premium.trim() === "" ||
    draft.triggerCondition.trim() === "" ||
    draft.duration.trim() === ""
  ) {
    return null;
  }

  const coverageAmount = toNumber(draft.coverageAmount);
  const premium = toNumber(draft.premium);
  const duration = toNumber(draft.duration);

  if (
    coverageAmount === null ||
    premium === null ||
    duration === null ||
    coverageAmount <= 0 ||
    premium <= 0 ||
    duration <= 0
  ) {
    throw new Error("Invalid policy review values");
  }

  const premiumRate = (premium / coverageAmount) * 100;
  const activationWindow = duration <= 30
    ? "Short-term policy setup"
    : duration <= 120
      ? "Seasonal monitoring window"
      : "Extended coverage window";

  return {
    policyTypeLabel: POLICY_TYPE_LABELS[draft.policyType],
    coverageAmountLabel: `${formatAssetAmount(coverageAmount)} XLM`,
    premiumLabel: `${formatAssetAmount(premium)} XLM`,
    durationLabel: `${formatAssetAmount(duration)} days`,
    triggerCondition: draft.triggerCondition.trim(),
    premiumRateLabel: `${premiumRate.toFixed(1)}% of coverage`,
    activationLabel: `${activationWindow} with automatic draft recovery on this device.`,
    payoutTimingLabel: "Payout review begins automatically after the trigger is verified on-chain.",
  };
}

function ReviewLoadingState() {
  return (
    <div className="panel" aria-live="polite" aria-busy="true">
      <div className="section-header">
        <span className="eyebrow">Final Review</span>
        <h2>Building your policy summary</h2>
        <p>We&apos;re assembling all policy details so you can verify everything before signing.</p>
      </div>
      <div className="create-review-grid">
        <div className="hero-card">
          <Skeleton style={{ width: "42%", height: "14px", marginBottom: "0.75rem" }} />
          <Skeleton style={{ width: "70%", height: "28px", marginBottom: "0.75rem" }} />
          <SkeletonText lines={3} />
        </div>
        <div className="panel">
          <Skeleton style={{ width: "36%", height: "14px", marginBottom: "0.9rem" }} />
          <SkeletonText lines={4} />
        </div>
      </div>
    </div>
  );
}
const MAX_COVERAGE_AMOUNT = 1_000_000;

function StepIndicator({ current }: { current: CreateStep }) {
  return (
    <nav className="stepper" aria-label="Policy creation steps">
      <ol className="stepper__list">
        {STEP_LABELS.map((label, index) => {
          const isDone = index < current;
          const isActive = index === current;
          return (
            <li
              key={label}
              className={`stepper__item ${isActive ? "stepper__item--active" : ""} ${isDone ? "stepper__item--done" : ""}`}
              aria-current={isActive ? "step" : undefined}
            >
              <span className="stepper__marker" aria-hidden="true">
                {isDone ? (
                  <Icon name="check" size="sm" tone="contrast" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </span>
              <span className="stepper__label">{label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default function CreatePolicyPage() {
  const [draft, setDraft, clearDraft] = useAutosave<PolicyDraft>(
    "stellarinsure-policy-draft",
    INITIAL_DRAFT,
  );
  const [step, setStep] = useState<CreateStep>(() => {
    if (draft.policyType && draft.coverageAmount && draft.triggerCondition) return 2;
    if (draft.policyType) return 1;
    return 0;
  });
  const [txSteps, setTxSteps] = useState<TimelineStep[]>(DEFAULT_TX_STEPS);
  const [reviewState, setReviewState] = useState<ReviewState>(() => (step === 2 ? "loading" : "idle"));

  const missingReviewFields = useMemo(() => {
    const missingFields: string[] = [];

    if (!draft.policyType) missingFields.push("policy type");
    if (!draft.coverageAmount.trim()) missingFields.push("coverage amount");
    if (!draft.premium.trim()) missingFields.push("premium");
    if (!draft.triggerCondition.trim()) missingFields.push("trigger condition");
    if (!draft.duration.trim()) missingFields.push("policy duration");

    return missingFields;
  }, [draft]);

  const reviewSummary = useMemo(() => {
    try {
      return buildReviewSummary(draft);
    } catch {
      return "error" as const;
    }
  }, [draft]);

  useEffect(() => {
    if (step !== 2) {
      setReviewState("idle");
      return;
    }

    setReviewState("loading");

    const timer = window.setTimeout(() => {
      if (reviewSummary === "error") {
        setReviewState("error");
        return;
      }

      setReviewState("ready");
    }, 320);

    return () => window.clearTimeout(timer);
  }, [reviewSummary, step]);
  const [coverageTouched, setCoverageTouched] = useState(false);

  function updateDraft<K extends keyof PolicyDraft>(field: K, value: PolicyDraft[K]) {
    setDraft({ ...draft, [field]: value });
  }

  function handleTypeSelect(type: PolicyType) {
    updateDraft("policyType", type);
    setStep(1);
  }

  function handleConfigureNext() {
    setReviewState("loading");
    setCoverageTouched(true);

    if (!isConfigValid) {
      return;
    }

    setStep(2);
  }

  function handleBack() {
    if (step > 0) {
      setStep((step - 1) as CreateStep);
    }
  }

  function simulateSubmit() {
    setStep(3);

    const updatedSteps = [...DEFAULT_TX_STEPS];
    updatedSteps[0] = { ...updatedSteps[0], status: "active" };
    setTxSteps(updatedSteps);

    setTimeout(() => {
      const next = [...updatedSteps];
      next[0] = { ...next[0], status: "completed" };
      next[1] = { ...next[1], status: "active" };
      setTxSteps(next);
    }, 1200);

    setTimeout(() => {
      const next = [...updatedSteps];
      next[0] = { ...next[0], status: "completed" };
      next[1] = { ...next[1], status: "completed" };
      next[2] = { ...next[2], status: "active" };
      setTxSteps(next);
    }, 2400);

    setTimeout(() => {
      const next = [...updatedSteps];
      next[0] = { ...next[0], status: "completed" };
      next[1] = { ...next[1], status: "completed" };
      next[2] = { ...next[2], status: "completed" };
      setTxSteps(next);
      clearDraft();
    }, 3600);
  }

  const parsedCoverageAmount = parseAmountInput(draft.coverageAmount);
  const coverageError =
    draft.coverageAmount.trim() === ""
      ? "Enter a coverage amount to continue."
      : parsedCoverageAmount === null || parsedCoverageAmount <= 0
        ? "Enter a valid coverage amount in XLM."
        : parsedCoverageAmount > MAX_COVERAGE_AMOUNT
          ? `Coverage amount cannot exceed ${formatAssetAmount(MAX_COVERAGE_AMOUNT)} XLM.`
          : undefined;

  const isConfigValid =
    coverageError === undefined &&
    draft.triggerCondition.trim() !== "" &&
    draft.premium.trim() !== "" &&
    draft.duration.trim() !== "";

  return (
    <main id="main-content" className="create-page">
      <div className="section-header">
        <span className="eyebrow">New Policy</span>
        <h1>Create a Policy</h1>
        <p>
          Configure your parametric insurance policy step by step. Your progress is saved
          automatically and will be restored if you leave and return.
        </p>
      </div>

      <StepIndicator current={step} />

      {step === 0 && (
        <section className="create-section motion-panel" aria-labelledby="step-type-title">
          <div className="section-header">
            <h2 id="step-type-title">Choose a Policy Type</h2>
            <p>Select the type of parametric coverage that fits your needs.</p>
          </div>
          <PolicyTypeSelector selected={draft.policyType} onSelect={handleTypeSelect} />
        </section>
      )}

      {step === 1 && (
        <section className="create-section motion-panel" aria-labelledby="step-config-title">
          <div className="section-header">
            <h2 id="step-config-title">Configure Your Policy</h2>
            <p>Set the coverage parameters for your {draft.policyType?.replace("-", " ")} policy.</p>
          </div>

          <div className="form-grid">
            <label className="field">
              <span className="field__label">Coverage Amount (XLM)</span>
              <AmountInput
                className="field__input"
                aria-invalid={Boolean(coverageError) && coverageTouched}
                aria-describedby={coverageError && coverageTouched ? "coverage-error" : "coverage-hint"}
                placeholder="e.g. 5,000.00"
                value={draft.coverageAmount}
                onChange={(value) => updateDraft("coverageAmount", value)}
                onBlur={() => setCoverageTouched(true)}
              />
              <span id="coverage-hint" className="field__hint">
                Maximum payout if the trigger condition is met. Limit: {formatAssetAmount(MAX_COVERAGE_AMOUNT)} XLM.
              </span>
              {coverageError && coverageTouched ? (
                <span id="coverage-error" className="field__error">
                  {coverageError}
                </span>
              ) : null}
            </label>

            <label className="field">
              <span className="field__label">Premium (XLM)</span>
              <input
                className="field__input"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="e.g. 200"
                value={draft.premium}
                onChange={(e) => updateDraft("premium", e.target.value)}
              />
              <span className="field__hint">One-time payment to activate the policy.</span>
            </label>

            <label className="field field--full">
              <span className="field__label">Trigger Condition</span>
              <textarea
                className="field__input field__input--textarea"
                rows={3}
                placeholder="Describe the condition that triggers the payout"
                value={draft.triggerCondition}
                onChange={(e) => updateDraft("triggerCondition", e.target.value)}
              />
              <span className="field__hint">
                The on-chain oracle evaluates this condition automatically.
              </span>
            </label>

            <label className="field">
              <span className="field__label">Duration (days)</span>
              <input
                className="field__input"
                type="number"
                inputMode="numeric"
                min="1"
                placeholder="e.g. 90"
                value={draft.duration}
                onChange={(e) => updateDraft("duration", e.target.value)}
              />
              <span className="field__hint">How long the policy stays active.</span>
            </label>
          </div>

          <div className="form-actions">
            <button className="cta-secondary" type="button" onClick={handleBack}>
              Back
            </button>
            <button
              className="cta-primary"
              type="button"
              disabled={!isConfigValid}
              onClick={handleConfigureNext}
            >
              Continue to Review
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="create-section motion-panel" aria-labelledby="step-review-title">
          <div className="section-header">
            <h2 id="step-review-title">Review Your Policy</h2>
            <p>Confirm the details below before submitting to the Stellar network.</p>
          </div>

          {reviewState === "loading" ? <ReviewLoadingState /> : null}

          {reviewState === "ready" && reviewSummary !== "error" && !reviewSummary ? (
            <div className="state-card motion-panel" role="status">
              <span className="state-icon" aria-hidden="true">
                <Icon name="document" size="lg" tone="muted" />
              </span>
              <h3>Review details still missing</h3>
              <p className="state-copy">
                Add {missingReviewFields.join(" and ")} before confirmation so the final review can show every policy detail.
              </p>
          <div className="panel">
            <dl className="definition-grid">
              <div>
                <dt>Policy Type</dt>
                <dd>{draft.policyType?.replace("-", " ")}</dd>
              </div>
              <div>
                <dt>Coverage</dt>
                <dd>{parsedCoverageAmount !== null ? formatAssetAmount(parsedCoverageAmount) : draft.coverageAmount} XLM</dd>
              </div>
              <div>
                <dt>Premium</dt>
                <dd>{draft.premium} XLM</dd>
              </div>
              <div>
                <dt>Duration</dt>
                <dd>{draft.duration} days</dd>
              </div>
            </dl>
            <div className="policy-copy-block" style={{ marginTop: "var(--space-4)" }}>
              <h3>Trigger Condition</h3>
              <p>{draft.triggerCondition}</p>
            </div>
          ) : null}

          {reviewState === "error" || reviewSummary === "error" ? (
            <div className="state-card motion-panel" role="alert">
              <span className="state-icon" aria-hidden="true">
                <Icon name="alert" size="lg" tone="warning" />
              </span>
              <h3>Review summary could not be prepared</h3>
              <p className="state-copy">
                Fix the policy values and return to review. Coverage, premium, and duration must all be valid positive numbers.
              </p>
            </div>
          ) : null}

          {reviewState === "ready" && reviewSummary !== "error" && reviewSummary ? (
            <div className="create-review-grid">
              <section className="hero-card motion-panel" aria-labelledby="policy-review-summary-title">
                <div className="section-header create-review-header">
                  <span className="eyebrow">Final Review</span>
                  <h3 id="policy-review-summary-title">Final policy review</h3>
                  <p>Review every detail below before you sign and submit this policy to Stellar.</p>
                </div>

                <dl className="definition-grid">
                  <div>
                    <dt>Policy Type</dt>
                    <dd>{reviewSummary.policyTypeLabel}</dd>
                  </div>
                  <div>
                    <dt>Coverage</dt>
                    <dd>{reviewSummary.coverageAmountLabel}</dd>
                  </div>
                  <div>
                    <dt>Premium</dt>
                    <dd>{reviewSummary.premiumLabel}</dd>
                  </div>
                  <div>
                    <dt>Duration</dt>
                    <dd>{reviewSummary.durationLabel}</dd>
                  </div>
                  <div>
                    <dt>Premium Rate</dt>
                    <dd>{reviewSummary.premiumRateLabel}</dd>
                  </div>
                  <div>
                    <dt>Payout Timing</dt>
                    <dd>{reviewSummary.payoutTimingLabel}</dd>
                  </div>
                </dl>

                <div className="policy-copy-block" style={{ marginTop: "var(--space-4)" }}>
                  <h3>Trigger Condition</h3>
                  <p>{reviewSummary.triggerCondition}</p>
                </div>
              </section>

              <aside className="panel motion-panel" aria-labelledby="policy-review-checklist-title">
                <div className="section-header create-review-header">
                  <span className="eyebrow">Confirmation Checklist</span>
                  <h3 id="policy-review-checklist-title">Before you confirm</h3>
                  <p>Use this checklist to validate cost, timing, and trigger behavior on mobile or desktop.</p>
                </div>

                <div className="create-review-callout">
                  <Icon name="calendar" size="md" tone="accent" />
                  <p>{reviewSummary.activationLabel}</p>
                </div>

                <ul className="policy-checklist create-review-list">
                  <li>The trigger condition matches the oracle data source you expect.</li>
                  <li>The coverage amount and premium reflect the policy cost you want to approve.</li>
                  <li>The duration is correct for the time window you need monitored.</li>
                  <li>You can go back now without losing draft progress on this device.</li>
                </ul>
              </aside>
            </div>
          ) : null}

          <div className="form-actions">
            <button className="cta-secondary" type="button" onClick={handleBack}>
              Back
            </button>
            <button
              className="cta-primary"
              type="button"
              onClick={simulateSubmit}
              disabled={reviewState !== "ready" || reviewSummary === "error" || !reviewSummary}
            >
              Sign and Submit
            </button>
            <button
              className="cta-secondary"
              type="button"
              onClick={() => {
                clearDraft();
                setStep(0);
              }}
            >
              Discard Draft
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="create-section motion-panel" aria-labelledby="step-submit-title">
          <div className="section-header">
            <h2 id="step-submit-title">Submitting Your Policy</h2>
            <p>Follow the progress of your on-chain transaction below.</p>
          </div>

          <div className="panel">
            <TransactionTimeline steps={txSteps} />
          </div>

          {txSteps.every((s) => s.status === "completed") && (
            <div className="create-success state-card motion-panel" role="status">
              <span className="state-icon" aria-hidden="true">
                <Icon name="check" size="lg" tone="success" />
              </span>
              <h3>Policy Created Successfully</h3>
              <p className="state-copy">
                Your policy has been confirmed on the Stellar network.
              </p>
              <div className="inline-actions">
                <Link className="cta-primary" href="/history">
                  View Transaction History
                </Link>
                <button
                  className="cta-secondary"
                  type="button"
                  onClick={() => {
                    setStep(0);
                    setTxSteps(DEFAULT_TX_STEPS);
                  }}
                >
                  Create Another Policy
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
