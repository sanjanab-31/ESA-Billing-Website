// Simple theme loader for Syncfusion accumulation charts
// Exports loadAccumulationChartTheme(args) which sets a theme based on document body class or defaults
export function loadAccumulationChartTheme(args) {
  // Determine theme from document or fallback to 'Material'
  try {
    const dark =
      typeof document !== "undefined" &&
      document.body &&
      document.body.classList.contains("dark");
    const theme = dark ? "Fabric" : "Material";
    // Map to Syncfusion theme names if needed
    args.accumulation.theme = theme;
  } catch (e) {
    // no-op fallback
    args.accumulation.theme = "Material";
  }
}

export default loadAccumulationChartTheme;
