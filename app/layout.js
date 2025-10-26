import { Inter } from "next/font/google";
import "./globals.css";
import "./prism.css";
import { ClerkProvider } from "@clerk/nextjs";
import { AppContextProvider } from "@/context/AppContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "Nexachat - AI Assistant",
  description: "Intelligent AI Chat Application",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <AppContextProvider>
        <html lang="en">
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
          </head>
          <body className={`${inter.className} antialiased overflow-hidden`}>
            <Toaster 
              position="top-center"
              toastOptions={{
                success: {style: { background: "black", color: "white", fontSize: "14px"}},
                error: {style: { background: "black", color: "white", fontSize: "14px"}},
                duration: 3000,
              }}
            />
            {children}
          </body>
        </html>
      </AppContextProvider>
    </ClerkProvider>
  );
}
