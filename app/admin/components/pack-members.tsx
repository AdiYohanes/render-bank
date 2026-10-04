"use client";

import { useState } from "react";

type Prompt = { id: string; title: string; status: string };

export function PackMembers({ prompts, initial }: { prompts: Prompt[]; initial: string[] }) {
  const [selected, setSelected] = useState(initial);
  const [query, setQuery] = useState("");
  const available = prompts.filter((prompt) => !selected.includes(prompt.id) && prompt.title.toLowerCase().includes(query.toLowerCase()));
  function move(index: number, direction: number) {
    const next = [...selected];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    setSelected(next);
  }
  return <fieldset className="pack-members"><legend>Prompt selection and order</legend>
    <label>Find Premium prompts<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
    <ul>{available.map((prompt) => <li key={prompt.id}>{prompt.title} · {prompt.status} <button className="button-secondary" type="button" onClick={() => setSelected([...selected, prompt.id])}>Add</button></li>)}</ul>
    <h3>Selected prompts</h3>
    <ol>{selected.map((id, index) => <li key={id}>
      <input name="promptIds" type="hidden" value={id} />
      {prompts.find((prompt) => prompt.id === id)?.title ?? "Unavailable prompt"}
      <div className="actions"><button className="button-secondary" type="button" disabled={index === 0} onClick={() => move(index, -1)}>Move up</button>
        <button className="button-secondary" type="button" disabled={index === selected.length - 1} onClick={() => move(index, 1)}>Move down</button>
        <button className="button-secondary" type="button" onClick={() => setSelected(selected.filter((item) => item !== id))}>Remove</button></div>
    </li>)}</ol>
  </fieldset>;
}
