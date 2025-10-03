"use client";

export default function ThemeScript() {
  const code = `
    (function() {
      try {
        var root = document.documentElement;
        var stored = localStorage.getItem('theme');
        var attr = root.getAttribute('data-theme');
        var system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        var theme = attr === 'dark' || attr === 'light' ? attr : stored;
        if (theme !== 'dark' && theme !== 'light') {
          theme = system;
        }
        root.setAttribute('data-theme', theme);
        root.classList.toggle('dark', theme === 'dark');
        document.body && document.body.classList.toggle('dark', theme === 'dark');
      } catch (e) {}
    })();
  `.trim();

  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
