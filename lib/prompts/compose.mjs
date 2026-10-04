const placeholder = /\{\{([a-z][a-z0-9_]*)\}\}|\{([a-z][a-z0-9_]*)\}/g;

export function composePrompt(template, variables, values) {
  const errors = {};
  const available = new Map(variables.map((variable) => [variable.key, variable]));
  for (const variable of variables) {
    if (variable.required && !(values[variable.key] ?? "").trim())
      errors[variable.key] = `${variable.label} is required`;
  }
  const unresolved = new Set();
  const text = template.replace(placeholder, (match, wrapped, plain) => {
    const key = wrapped ?? plain;
    if (!available.has(key) || !(values[key] ?? "").trim()) {
      unresolved.add(key);
      return match;
    }
    return values[key].trim();
  });
  for (const match of template.matchAll(/\{\{?([^{}]+)\}\}?/g)) {
    if (!available.has(match[1])) unresolved.add(match[1]);
  }
  return { text, errors, unresolved: [...unresolved] };
}

export function defaultValues(variables) {
  return Object.fromEntries(variables.map(({ key, default_value }) => [key, default_value ?? ""]));
}
