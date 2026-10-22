import Link from "next/link";

export default function ComplianceNote() {
  return (
    <div className="space-y-1 text-xs leading-relaxed">
      <p>
        Situs ini mematuhi UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP).
        Data demo bersifat fiktif.
      </p>
      <p>
        <Link href="/privasi" className="inline-flex min-h-[44px] items-center underline">
          Kebijakan Privasi
        </Link>
        <span aria-hidden="true"> · </span>
        <Link href="/syarat" className="inline-flex min-h-[44px] items-center underline">
          Syarat dan Ketentuan
        </Link>
      </p>
    </div>
  );
}