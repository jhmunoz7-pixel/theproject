import "./globals.css";

export const metadata = {
  title: "The Project · Tu espacio",
  description:
    "Tu día, tu mente y tu trabajo — en un solo lugar. El espacio diario contra el burnout.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Gloock&family=Crimson+Pro:ital,wght@0,400..600;1,400..600&family=Work+Sans:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
