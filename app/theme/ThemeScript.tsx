"use client";

export default function ThemeScript() {
  const code = `
    (function() {
      try {
        var root = document.documentElement;
        var stored = window.localStorage && window.localStorage.getItem('theme');
        var hour = new Date().getHours();
        var timeTheme = hour >= 18 || hour < 5 ? 'dark' : 'light';
        var theme = stored === 'dark' || stored === 'light'
          ? (stored === timeTheme ? stored : timeTheme)
          : timeTheme;
        if (window.localStorage) {
          window.localStorage.setItem('theme', theme);
        }
        root.setAttribute('data-theme', theme);
        root.classList.toggle('dark', theme === 'dark');
        document.body && document.body.classList.toggle('dark', theme === 'dark');
      } catch (e) {}
    })();
  `.trim();

  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
