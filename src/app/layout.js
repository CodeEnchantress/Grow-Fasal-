import "./globals.css";

export const metadata = {
  title: "Grow Fasal - Intelligent Farming",
  description: "Data-driven decisions for modern farmers using live weather data and AI.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
