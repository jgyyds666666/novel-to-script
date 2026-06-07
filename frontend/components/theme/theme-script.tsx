/**
 * Inline script to prevent FOUC (Flash of Unstyled Content) on theme switch.
 * Runs before React hydrates — reads localStorage and applies the `dark` class.
 */
export function ThemeScript() {
  // Using dangerouslySetInnerHTML to inject raw script into <head>
  const script = `
    (function() {
      try {
        var stored = localStorage.getItem('theme');
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (stored === 'dark' || (!stored && prefersDark)) {
          document.documentElement.classList.add('dark');
        }
      } catch(e) {}
    })();
  `.replace(/\s+/g, " ");

  return (
    <script
      dangerouslySetInnerHTML={{ __html: script }}
    />
  );
}
