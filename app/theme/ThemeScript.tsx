"use client";

export default function ThemeScript() {
  const code = `
    (function() {
      try {
        var ls = localStorage.getItem('theme');
        var mql = window.matchMedia('(prefers-color-scheme: dark)');
        var theme = ls || (mql.matches ? 'dark' : 'light');
        var root = document.documentElement;
        root.setAttribute('data-theme', theme);
        if (theme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
        // atualiza automaticamente quando o SO muda
        mql.addEventListener('change', function(e) {
          if (!localStorage.getItem('theme')) {
            var t = e.matches ? 'dark' : 'light';
            root.setAttribute('data-theme', t);
            root.classList.toggle('dark', t === 'dark');
          }
        });
      } catch (e) {}
    })();
  `.trim();

  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
