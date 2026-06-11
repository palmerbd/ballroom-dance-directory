"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/studios",      label: "Browse Studios" },
  { href: "/competitions", label: "Competitions" },
  { href: "/styles",       label: "By Style" },
  { href: "/cities",       label: "By City" },
  { href: "/dance-wear",   label: "Dance Wear" },
  { href: "/blog",         label: "Tips & Guides" },
];

export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24 md:h-28">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center shrink-0"
            onClick={() => setOpen(false)}
          >
            <Image
              src="/logo.png"
              alt="Ballroom Dance Directory — The Elite Resource"
              width={480}
              height={190}
              priority
              className="h-20 md:h-24 w-auto object-contain"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? "bg-amber-50 text-amber-800"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
            <Link
              href="/claim"
              className="ml-3 inline-flex items-center px-4 py-2 rounded-md bg-amber-700 text-white text-sm font-semibold hover:bg-amber-800 transition-colors shadow-sm"
            >
              List Your Studio
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            {open ? (
              /* X icon */
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              /* Hamburger icon */
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white shadow-lg">
          <nav className="flex flex-col px-4 py-3 gap-1">
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? "bg-amber-50 text-amber-800"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
            <Link
              href="/claim"
              onClick={() => setOpen(false)}
              className="mt-2 px-4 py-3 rounded-md bg-amber-700 text-white text-sm font-semibold text-center hover:bg-amber-800 transition-colors"
            >
              List Your Studio
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
