export function toLines(value: string) {
  return value
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function toText(value: string[]) {
  return value.join("\n");
}

export function buildSessionId() {
  return `session-${Date.now()}`;
}
