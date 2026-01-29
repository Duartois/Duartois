"use client";

export default function ThemeScript() {
  const code = `
    (function() {
      try {
        var root = document.documentElement;
        var stored = window.localStorage && window.localStorage.getItem('theme');
        var theme = stored === 'dark' || stored === 'light'
          ? stored
          : (new Date().getHours() >= 18 ? 'dark' : 'light');
        root.setAttribute('data-theme', theme);
        root.classList.toggle('dark', theme === 'dark');
        document.body && document.body.classList.toggle('dark', theme === 'dark');
      } catch (e) {}
    })();
  `.trim();

  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
