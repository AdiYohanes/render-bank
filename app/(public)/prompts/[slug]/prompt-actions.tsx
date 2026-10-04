"use client";

import { useRef, useState } from "react";

import { composePrompt, defaultValues } from "@/lib/prompts/compose.mjs";

type Variable = {
  id: string;
  key: string;
  label: string;
  description: string | null;
  placeholder: string | null;
  default_value: string | null;
  required: boolean;
};

export function LockedLinkAction({ url }: { url: string }) {
  const [status, setStatus] = useState("");
  const [manual, setManual] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setManual(false);
      setStatus("Link copied");
    } catch {
      setManual(true);
      setStatus("Couldn’t copy automatically. Select the link and copy it manually.");
    }
  }

  return <div className="prompt-link-action">
    <button className="button-secondary" type="button" onClick={() => void copyLink()}>Copy Link</button>
    <p role="status" aria-live="polite">{status}</p>
    {manual && <textarea aria-label="Select link to copy manually" readOnly rows={2} value={url} onFocus={(event) => event.currentTarget.select()} />}
  </div>;
}

export function PromptActions({ template, variables, url }: {
  template: string;
  variables: Variable[];
  url: string;
}) {
  const [values, setValues] = useState<Record<string, string>>(() => defaultValues(variables));
  const [checked, setChecked] = useState(false);
  const [status, setStatus] = useState("");
  const [manual, setManual] = useState<"prompt" | "link" | null>(null);
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});
  const composed = composePrompt(template, variables, values) as {
    text: string;
    errors: Record<string, string>;
    unresolved: string[];
  };

  async function copy(kind: "prompt" | "link") {
    if (kind === "prompt" && (Object.keys(composed.errors).length || composed.unresolved.length)) {
      setChecked(true);
      setStatus(composed.unresolved.some((key) => !variables.some((variable) => variable.key === key))
        ? "The prompt contains an unknown placeholder. Correct the template before copying."
        : "Complete the required variables before copying.");
      const first = variables.find((variable) => composed.errors[variable.key] || composed.unresolved.includes(variable.key));
      if (first) inputs.current[first.key]?.focus();
      return;
    }
    try {
      await navigator.clipboard.writeText(kind === "prompt" ? composed.text : url);
      setManual(null);
      setStatus(kind === "prompt" ? "Copied" : "Link copied");
    } catch {
      setManual(kind);
      setStatus("Couldn’t copy automatically. Select the text and copy it manually.");
    }
  }

  return (
    <section className="prompt-editor" aria-label="Prompt and copy actions">
      <div className="actions"><button className="button-primary" type="button" onClick={() => void copy("prompt")}>Copy Prompt</button></div>
      {variables.length > 0 && (
        <div className="prompt-variables">
          <h2>Customize this prompt</h2>
          {variables.map((variable) => {
            const error = checked && (composed.errors[variable.key] || (composed.unresolved.includes(variable.key) ? `${variable.label} needs a value` : ""));
            return <div className="prompt-variable" key={variable.id}>
              <label htmlFor={`prompt-variable-${variable.id}`}>{variable.label} <span className="prompt-variable-key">{`{${variable.key}}`}</span>{variable.required && " · Required"}</label>
              {variable.description && <p id={`prompt-variable-description-${variable.id}`}>{variable.description}</p>}
              <input id={`prompt-variable-${variable.id}`} ref={(element) => { inputs.current[variable.key] = element; }}
                value={values[variable.key] ?? ""} placeholder={variable.placeholder ?? ""}
                aria-invalid={!!error} aria-describedby={[variable.description && `prompt-variable-description-${variable.id}`, error && `prompt-variable-error-${variable.id}`].filter(Boolean).join(" ") || undefined}
                onChange={(event) => { setValues({ ...values, [variable.key]: event.target.value }); setStatus(""); }} />
              {error && <p className="prompt-input-error" id={`prompt-variable-error-${variable.id}`}>{error}</p>}
            </div>;
          })}
          <button className="button-secondary" type="button" onClick={() => { setValues(defaultValues(variables)); setChecked(false); setStatus(""); }}>Reset to Defaults</button>
        </div>
      )}
      <h2>{variables.length ? "Composed prompt preview" : "Full prompt"}</h2>
      <div className="prompt-composed">{composed.text}</div>
      <div className="actions">
        <button className="button-primary" type="button" onClick={() => void copy("prompt")}>Copy Prompt</button>
        <button className="button-secondary" type="button" onClick={() => void copy("link")}>Copy Link</button>
      </div>
      <p role="status" aria-live="polite">{status}</p>
      {manual && <textarea aria-label={manual === "prompt" ? "Select prompt to copy manually" : "Select link to copy manually"} readOnly rows={manual === "prompt" ? 6 : 2} value={manual === "prompt" ? composed.text : url} onFocus={(event) => event.currentTarget.select()} />}
    </section>
  );
}
