import type { Metadata } from "next";

// Studio owner sign-in — private utility page, keep it out of search results.
export const metadata: Metadata = {
  title: "Studio Owner Login",
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
