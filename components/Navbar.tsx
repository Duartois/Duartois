"use client";

import Link from 'next/link';
import { useVariantStore } from '../store/variants';

/**
 * A simple navigation bar that links to the four sections of the site.
 * Clicking a link triggers a route change handled by the Next.js App
 * Router.  Because each page sets the variant on mount, the shapes
 * animate to their new positions accordingly.  The current page is
 * highlighted with an underline.
 */
export default function Navbar() {
  const current = useVariantStore((state) => state.variantName);
  const items: { name: string; href: string; key: typeof current }[] = [
    { name: 'home', href: '/', key: 'home' },
    { name: 'about', href: '/about', key: 'about' },
    { name: 'work', href: '/work', key: 'work' },
    { name: 'contact', href: '/contact', key: 'contact' },
  ];
  return (
    <nav className="absolute top-4 left-1/2 z-10 -translate-x-1/2 flex gap-6 text-sm uppercase tracking-wider select-none">
      {items.map(({ name, href, key }) => (
        <Link
          key={key}
          href={href}
          className={
            current === key
              ? 'text-white underline underline-offset-4'
              : 'text-gray-400 hover:text-white transition-colors'
          }
        >
          {name}
        </Link>
      ))}
    </nav>
  );
}