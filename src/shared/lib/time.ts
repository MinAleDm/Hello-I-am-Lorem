export function formatDateTime(iso: string) {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "Только что";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatConfidence(value: number) {
  return `${Math.round(value * 100)}%`;
}
