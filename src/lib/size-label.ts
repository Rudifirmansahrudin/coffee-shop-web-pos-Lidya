export type CartSize = "REG" | "LRG";

// Display text only. The internal value stays "REG" / "LRG" (DB, zod, cart key).
const SIZE_LABEL: Record<CartSize, string> = {
  REG: "Regular",
  LRG: "Big Boy",
};

export function sizeLabel(size: string | null | undefined): string {
  if (size === "REG" || size === "LRG") return SIZE_LABEL[size];
  return size ?? "";
}