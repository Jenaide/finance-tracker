import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const ZAR_FORMATTER = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function currencyFormatter(amount: number): string {
  if (!Number.isFinite(amount)) {
    return ZAR_FORMATTER.format(0);
  }

  return ZAR_FORMATTER.format(amount);
};

export const formatDate = (createdAt: any) => {
  if (!createdAt) return "N/A";

  if (createdAt.toDate) {
    // Firestore Timestamp
    return createdAt.toDate().toISOString();
  } else if (createdAt instanceof Date) {
    // JS Date
    return createdAt.toISOString();
  } else if (typeof createdAt === "number") {
    // Unix timestamp
    return new Date(createdAt).toISOString();
  }
  return "Invalid date";
};