"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Only the admin panel stays light in dark mode. Public pages (menu, checkout, track) follow the theme.
const LIGHT_PATTERN = "^/(admin)(/|$)";

function surfaceFor(pathname: string) {
  return new RegExp(LIGHT_PATTERN).test(pathname) ? "light" : "brand";
}

export function SurfaceSetter() {
  const pathname = usePathname();

  // Keep body[data-surface] in sync on client-side navigation
  useEffect(() => {
    document.body.dataset.surface = surfaceFor(pathname);
  }, [pathname]);

  // Runs before first paint on a hard load, so there is no flash
  const script = `(function(){var l=new RegExp(${JSON.stringify(
    LIGHT_PATTERN
  )}).test(location.pathname);document.body.dataset.surface=l?"light":"brand"})()`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}