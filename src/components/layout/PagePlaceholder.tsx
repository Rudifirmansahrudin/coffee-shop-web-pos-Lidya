import { EmptyState } from "@/components/space/EmptyState";
import { OrbitDivider } from "@/components/space/OrbitDivider";

type Props = { title: string; description?: string };

// Temporary page body until each feature prompt replaces it
export function PagePlaceholder({ title, description }: Props) {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-6 md:py-12">
      <h1 className="font-heading text-2xl font-bold text-space-navy md:text-3xl">{title}</h1>
      <OrbitDivider className="mt-3 max-w-xs" />
      <EmptyState
        className="mt-8"
        title="Halaman ini sedang dibangun"
        description={description ?? "Segera hadir di misi berikutnya."}
      />
    </div>
  );
}