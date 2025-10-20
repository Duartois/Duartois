"use client";

export default function ThemeScript() {
  const code = `
    (function() {
      try {
        var root = document.documentElement;
        var attr = root.getAttribute('data-theme');
        var theme = attr === 'dark' || attr === 'light' ? attr : 'light';
        root.setAttribute('data-theme', theme);
        root.classList.toggle('dark', theme === 'dark');
        document.body && document.body.classList.toggle('dark', theme === 'dark');
      } catch (e) {}
    })();
  `.trim();

  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
