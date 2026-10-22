import { Coffee, HelpCircle, Home, Info, MapPin, type LucideIcon } from "lucide-react";

export type NavLink = { href: string; label: string; icon: LucideIcon };

// 4 tabs used by the mobile bottom nav
export const MAIN_LINKS: NavLink[] = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/menu", label: "Menu", icon: Coffee },
  { href: "/lokasi", label: "Lokasi", icon: MapPin },
  { href: "/tentang", label: "Tentang", icon: Info },
];

// Desktop top nav and footer also show FAQ
export const DESKTOP_LINKS: NavLink[] = [
  ...MAIN_LINKS,
  { href: "/faq", label: "FAQ", icon: HelpCircle },
];

export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
