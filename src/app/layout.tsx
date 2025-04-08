import "./globals.scss";
import { Metadata } from "next";
import localFont from 'next/font/local';
import { EB_Garamond } from "next/font/google";
import BackToTopCom from "./components/common/back-to-top-com";
import ChatWidget from "./components/common/chat-widget";
import { Providers } from "@/redux/provider";
import { AuthProvider } from '@/contexts/AuthContext';
import { ChatProvider } from '@/context/ChatContext';

const gordita = localFont({
  src: [
    {
      path: '../../public/assets/fonts/gordita/gordita_medium-webfont.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/assets/fonts/gordita/gordita_medium-webfont.woff',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/assets/fonts/gordita/gordita_regular-webfont.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/assets/fonts/gordita/gordita_regular-webfont.woff',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--gorditas-font'
})

const garamond = EB_Garamond({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--eb_garamond-font",
});

export const metadata: Metadata = {
  title: 'Clutch Jobs',
  description: 'AI-Powered Job Search & Hiring Platform',
  icons: {
    icon: '/icons/favicon.ico',
    shortcut: '/icons/favicon.ico',
    apple: '/apple-touch-icon.png',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/apple-touch-icon-precomposed.png',
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/font/bootstrap-icons.css"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning={true} className={`${gordita.variable} ${garamond.variable}`}>
        <AuthProvider>
          <Providers>
            <ChatProvider>
              {children}
              <BackToTopCom />
              <ChatWidget />
            </ChatProvider>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
