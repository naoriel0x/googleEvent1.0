/** Runs before paint — follows saved preference or OS/browser theme */
export function ThemeScript() {
  const script = `
(function () {
  try {
    var saved = localStorage.getItem('wc_theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var dark = saved === 'dark' || (saved !== 'light' && prefersDark);
    var root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  } catch (e) {}
})();
`;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
