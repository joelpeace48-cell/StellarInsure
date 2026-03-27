import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { LanguageProvider } from "@/i18n/provider";

import { LanguageSwitcher } from "./language-switcher";

describe("LanguageSwitcher", () => {
  it("switches the active locale button", async () => {
    const user = userEvent.setup();

    render(
      <LanguageProvider>
        <LanguageSwitcher />
      </LanguageProvider>,
    );

    const englishButton = screen.getByRole("button", { name: "English" });
    const arabicButton = screen.getByRole("button", { name: "Arabic" });

    expect(englishButton).toHaveAttribute("aria-pressed", "true");
    expect(arabicButton).toHaveAttribute("aria-pressed", "false");

    await user.click(arabicButton);

    expect(arabicButton).toHaveAttribute("aria-pressed", "true");
  });
});
