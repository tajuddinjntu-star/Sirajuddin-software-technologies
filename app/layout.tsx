import type { ReactNode } from "react";
export const metadata = {
  title: "Sirajuddin Software Technologies",
  description: "WeldWise Assistant Software Platform",
};
export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
<header>
  <h1>SST</h1>
  <nav>
    <a href="/">Home</a>
    <a href="/admin">Admin</a>
  </nav>
</header>
