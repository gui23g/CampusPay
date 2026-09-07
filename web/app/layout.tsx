import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CampusPay",
  description:
    "Operacao de campanhas comerciais e tesouraria verificavel para organizacoes estudantis."
};

const themeScript = `
  try {
    const theme = localStorage.getItem("campuspay-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.dataset.theme = theme || (prefersDark ? "dark" : "light");
  } catch (_) {
    document.documentElement.dataset.theme = "light";
  }
`;

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
