import "./globals.css";
import { Providers } from "../components/Providers";

export const metadata = {
  title: "Grow Fasal - Intelligent Farming",
  description: "Data-driven decisions for modern farmers using live weather data and AI.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
