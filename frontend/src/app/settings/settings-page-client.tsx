"use client";

import { useState } from "react";

export default function SettingsPageClient() {
  const [timezone, setTimezone] = useState("UTC");
  const [currency, setCurrency] = useState("XLM");
  const [email, setEmail] = useState(true);
  const [sms, setSms] = useState(false);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setStatus("");
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSaving(false);
    setStatus("Preferences saved.");
  }

  return (
    <main id="main-content" className="policy-page">
      <div className="section-header">
        <span className="eyebrow">Preferences</span>
        <h1>Account Preferences</h1>
        <p>Configure timezone, display currency, and communication options.</p>
      </div>
      <form className="panel form-grid" onSubmit={onSubmit} aria-label="Account preferences form">
        <label className="field">
          <span className="field__label">Timezone</span>
          <select className="tx-select" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York</option>
            <option value="Europe/London">Europe/London</option>
            <option value="Asia/Tokyo">Asia/Tokyo</option>
          </select>
        </label>
        <label className="field">
          <span className="field__label">Display Currency</span>
          <select className="tx-select" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="XLM">XLM</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </label>
        <fieldset className="fieldset field--full">
          <legend className="field__label">Communication</legend>
          <label className="choice">
            <input type="checkbox" checked={email} onChange={(e) => setEmail(e.target.checked)} />
            Email updates
          </label>
          <label className="choice">
            <input type="checkbox" checked={sms} onChange={(e) => setSms(e.target.checked)} />
            SMS alerts
          </label>
        </fieldset>
        <div className="form-actions field--full">
          <button className="cta-primary" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Preferences"}
          </button>
          <p className="form-status" role="status">{status}</p>
        </div>
      </form>
    </main>
  );
}
