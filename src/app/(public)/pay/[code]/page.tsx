import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export default function PayPage({ params }: { params: { code: string } }) {
  return <PagePlaceholder title="Pembayaran" description={`Kode pesanan: ${params.code}`} />;
}