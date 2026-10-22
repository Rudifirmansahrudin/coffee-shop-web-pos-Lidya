import type { Metadata } from "next";
import { TrackClient } from "@/components/track/TrackClient";

export const metadata: Metadata = {
  title: "Lacak Pesanan | Space Coffee and Matcha",
};

export default function TrackPage({ params }: { params: { code: string } }) {
  const code = decodeURIComponent(params.code).toUpperCase();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 pb-28 lg:py-10">
      <TrackClient code={code} />
    </div>
  );
}