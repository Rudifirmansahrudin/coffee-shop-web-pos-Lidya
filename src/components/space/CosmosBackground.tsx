// Fixed dark cosmos background. Styling lives in globals.css (.cosmos); visible only in dark mode
// on brand pages, hidden on light-surface pages (menu, checkout, track).
export function CosmosBackground() {
  return <div className="cosmos" aria-hidden="true" />;
}