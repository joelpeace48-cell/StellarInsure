"use client";

import React, { useState } from "react";
import { Icon } from "@/components/icon";

export type Operator = ">" | "<" | "=" | ">=" | "<=";

export interface ConditionRule {
  field: string;
  operator: Operator;
  value: string;
}

interface TriggerConditionBuilderProps {
  initialRules?: ConditionRule[];
  onChange: (conditionString: string) => void;
  availableFields?: { id: string; label: string }[];
}

const DEFAULT_FIELDS = [
  { id: "temperature", label: "Temperature (°C)" },
  { id: "rainfall", label: "Rainfall (mm)" },
  { id: "wind_speed", label: "Wind Speed (km/h)" },
  { id: "delay_minutes", label: "Delay (minutes)" },
];

export function TriggerConditionBuilder({
  initialRules,
  onChange,
  availableFields = DEFAULT_FIELDS,
}: TriggerConditionBuilderProps) {
  const [rules, setRules] = useState<ConditionRule[]>(
    initialRules || [{ field: availableFields[0].id, operator: ">", value: "" }]
  );

  const updateRule = (index: number, updates: Partial<ConditionRule>) => {
    const nextRules = [...rules];
    nextRules[index] = { ...nextRules[index], ...updates };
    setRules(nextRules);
    notifyChange(nextRules);
  };

  const addRule = () => {
    const nextRules: ConditionRule[] = [...rules, { field: availableFields[0].id, operator: ">", value: "" }];
    setRules(nextRules);
    notifyChange(nextRules);
  };

  const removeRule = (index: number) => {
    if (rules.length <= 1) return;
    const nextRules = rules.filter((_, i) => i !== index);
    setRules(nextRules);
    notifyChange(nextRules);
  };

  const notifyChange = (currentRules: ConditionRule[]) => {
    const str = currentRules
      .filter((r) => r.value.trim() !== "")
      .map((r) => `${r.field} ${r.operator} ${r.value}`)
      .join(" AND ");
    onChange(str);
  };

  return (
    <div className="condition-builder">
      <div className="condition-builder__list">
        {rules.map((rule, index) => (
          <div key={index} className="condition-rule motion-panel">
            <div className="condition-rule__inputs">
              <select
                className="tx-select"
                value={rule.field}
                onChange={(e) => updateRule(index, { field: e.target.value })}
              >
                {availableFields.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>

              <select
                className="tx-select tx-select--operator"
                value={rule.operator}
                onChange={(e) => updateRule(index, { operator: e.target.value as Operator })}
              >
                <option value=">">&gt;</option>
                <option value="<">&lt;</option>
                <option value="=">=</option>
                <option value=">=">&ge;</option>
                <option value="<=">&le;</option>
              </select>

              <input
                className="field__input condition-rule__value"
                type="number"
                placeholder="Value"
                value={rule.value}
                onChange={(e) => updateRule(index, { value: e.target.value })}
              />
            </div>

            <button
              className="tx-expand-btn condition-rule__remove"
              type="button"
              aria-label="Remove rule"
              disabled={rules.length <= 1}
              onClick={() => removeRule(index)}
            >
              <Icon name="close" size="sm" tone="warning" />
            </button>
          </div>
        ))}
      </div>

      <button className="cta-secondary condition-builder__add" type="button" onClick={addRule}>
        <Icon name="plus" size="sm" tone="accent" />
        Add Condition
      </button>

      <div className="condition-preview">
        <span className="metadata-label">Previewed Logic</span>
        <code className="condition-preview__code">
          {rules.filter((r) => r.value.trim() !== "").length > 0
            ? rules
                .filter((r) => r.value.trim() !== "")
                .map((r) => `${r.field} ${r.operator} ${r.value}`)
                .join(" AND ")
            : "No valid conditions set"}
        </code>
      </div>
    </div>
  );
}
