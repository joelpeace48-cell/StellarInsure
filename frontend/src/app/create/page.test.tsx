import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import CreatePolicyPage from "./page";

const STORAGE_KEY = "stellarinsure-policy-draft";

describe("CreatePolicyPage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it("renders a final review summary for a completed draft", () => {
    render(<CreatePolicyPage />);

    fireEvent.click(screen.getByRole("radio", { name: /weather protection/i }));
    fireEvent.change(screen.getByLabelText(/coverage amount \(xlm\)/i), {
      target: { value: "5000" },
    });
    fireEvent.change(screen.getByLabelText(/premium \(xlm\)/i), {
      target: { value: "200" },
    });
    fireEvent.change(screen.getByLabelText(/trigger condition/i), {
      target: { value: "Rainfall below 50mm during planting season." },
    });
    fireEvent.change(screen.getByLabelText(/duration \(days\)/i), {
      target: { value: "90" },
    });

    fireEvent.click(screen.getByRole("button", { name: /continue to review/i }));

    expect(screen.getByText(/building your policy summary/i)).toBeInTheDocument();

    act(() => {
      vi.runOnlyPendingTimers();
    });

    expect(screen.getByRole("heading", { name: /final policy review/i })).toBeInTheDocument();
    expect(screen.getByText(/weather protection/i)).toBeInTheDocument();
    expect(screen.getByText(/5000 xlm/i)).toBeInTheDocument();
    expect(screen.getByText(/review every detail below before you sign/i)).toBeInTheDocument();
  });

  it("shows an empty review state for an incomplete restored draft", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        policyType: "weather",
        coverageAmount: "5000",
        premium: "",
        triggerCondition: "Rainfall below threshold.",
        duration: "",
      }),
    );

    render(<CreatePolicyPage />);

    act(() => {
      vi.runOnlyPendingTimers();
    });

    expect(screen.getByRole("heading", { name: /review details still missing/i })).toBeInTheDocument();
    expect(screen.getByText(/add premium and policy duration before confirmation/i)).toBeInTheDocument();
  });

  it("shows an error review state for invalid restored numeric values", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        policyType: "weather",
        coverageAmount: "abc",
        premium: "200",
        triggerCondition: "Rainfall below threshold.",
        duration: "90",
      }),
    );

    render(<CreatePolicyPage />);

    act(() => {
      vi.runOnlyPendingTimers();
    });

    expect(screen.getByRole("heading", { name: /review summary could not be prepared/i })).toBeInTheDocument();
    expect(screen.getByText(/fix the highlighted policy values/i)).toBeInTheDocument();
  });
});
