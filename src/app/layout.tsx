import "./globals.css";

export const metadata = { title: "Mossy Paws Grooming" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <div className="w-[1100px] mx-auto">{children}</div>
      </body>
    </html>
  );
}
