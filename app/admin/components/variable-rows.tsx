"use client";

import { useState } from "react";

type Variable = { key: string; label: string; description: string | null; placeholder: string | null; default_value: string | null; required: boolean };
type Row = Variable & { id: string };

export function VariableRows({ initial }: { initial: Variable[] }) {
  const [rows, setRows] = useState<Row[]>(() => initial.map((row, index) => ({ ...row, id: `v${index}` })));
  function change(id: string, patch: Partial<Variable>) {
    setRows((current) => current.map((row) => row.id === id ? { ...row, ...patch } : row));
  }
  function move(index: number, direction: number) {
    const next = [...rows];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    setRows(next);
  }
  return <fieldset className="variable-rows"><legend>Variables</legend>
    {rows.map((row, index) => <div className="variable-row" key={row.id}>
      <strong>Variable {index + 1}</strong>
      <label>Key<input required name="variableKey" pattern="[a-z][a-z0-9_]*" value={row.key} onChange={(event) => change(row.id, { key: event.target.value })} /></label>
      <label>Label<input required name="variableLabel" value={row.label} onChange={(event) => change(row.id, { label: event.target.value })} /></label>
      <label>Description<input name="variableDescription" value={row.description ?? ""} onChange={(event) => change(row.id, { description: event.target.value })} /></label>
      <label>Example / placeholder<input name="variablePlaceholder" value={row.placeholder ?? ""} onChange={(event) => change(row.id, { placeholder: event.target.value })} /></label>
      <label>Default value<input name="variableDefault" value={row.default_value ?? ""} onChange={(event) => change(row.id, { default_value: event.target.value })} /></label>
      <input type="hidden" name="variableRequired" value={String(row.required)} />
      <label className="check"><input type="checkbox" checked={row.required} onChange={(event) => change(row.id, { required: event.target.checked })} /> Required</label>
      <div className="actions"><button type="button" className="button-secondary" disabled={index === 0} onClick={() => move(index, -1)}>Move up</button>
        <button type="button" className="button-secondary" disabled={index === rows.length - 1} onClick={() => move(index, 1)}>Move down</button>
        <button type="button" className="button-secondary" onClick={() => setRows(rows.filter(({ id }) => id !== row.id))}>Remove</button></div>
    </div>)}
    <button className="button-secondary" type="button" onClick={() => setRows([...rows, { id: crypto.randomUUID(), key: "", label: "", description: null, placeholder: null, default_value: null, required: false }])}>Add variable</button>
  </fieldset>;
}
