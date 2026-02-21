export const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";

  let date: Date;

  if (dateStr.includes("T")) {
    date = new Date(dateStr);
  } else {
    const [year, month, day] = dateStr.split("-").map(Number);
    date = new Date(year, month - 1, day);
  }

  if (Number.isNaN(date.getTime())) return "-";

  const dayNum = date.getDate();
  const monthName = date.toLocaleString("en-US", { month: "short" });
  const yearNum = date.getFullYear();

  return `${dayNum} ${monthName} ${yearNum}`;
};

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}
