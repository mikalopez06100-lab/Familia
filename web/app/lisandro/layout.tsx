import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Lisandro · Barkley",
  description: "Mes points, ma routine et mes règles — consultation seule",
  manifest: "/lisandro/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Lisandro · Barkley",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#5b21b6",
};

export default function LisandroLayout({ children }: { children: React.ReactNode }) {
  return children;
}
