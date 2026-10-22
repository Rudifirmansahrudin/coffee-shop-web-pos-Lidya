import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export default function TrackPage({ params }: { params: { code: string } }) {
  return <PagePlaceholder title="Lacak Pesanan" description={`Kode pesanan: ${params.code}`} />;
}