import type { Metadata } from "next";

// Dashboard is a private studio owner area — should not be indexed.
export const metadata: Metadata = {
  title: "Owner Portal",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
