import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Signing you in",
  robots: { index: false, follow: false },
};

export default function AuthConfirmLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
