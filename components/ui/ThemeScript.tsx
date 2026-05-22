/** Runs before paint — follows saved preference or OS/browser theme */
export function ThemeScript() {
  const script = `
(function () {
  try {
    var root = document.documentElement;
    // Force dark mode unconditionally
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } catch (e) {}
})();
`;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
