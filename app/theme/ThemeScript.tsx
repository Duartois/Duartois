/**
 * ThemeScript — Server Component (sem "use client").
 *
 * Injeta um script inline bloqueante no <head> para aplicar o tema correto
 * (dark/light) antes do primeiro paint, eliminando o flash de tema errado e
 * o hydration mismatch React #418 causado pela diferença entre o HTML
 * renderizado no servidor e o que o cliente esperaria.
 *
 * Não usa nenhuma API de browser nem estado React — é puro HTML/JS estático.
 */
export default function ThemeScript() {
  const code = `(function(){try{var r=document.documentElement;var s=window.localStorage&&window.localStorage.getItem('theme');var h=new Date().getHours();var t=h>=18||h<5?'dark':'light';var theme=s==='dark'||s==='light'?(s===t?s:t):t;if(window.localStorage){window.localStorage.setItem('theme',theme);}r.setAttribute('data-theme',theme);r.classList.toggle('dark',theme==='dark');document.body&&document.body.classList.toggle('dark',theme==='dark');}catch(e){}})();`;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: code }}
      suppressHydrationWarning
    />
  );
}
