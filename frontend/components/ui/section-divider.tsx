/**
 * Decorative section divider in Anthropic's warm minimal style.
 * A subtle gradient line with an accent dot.
 */
export function SectionDivider() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="h-px w-24 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </div>
  );
}
