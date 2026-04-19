import { GeistSans } from 'geist/font/sans';
import './globals.css';
import InstallPrompt from '@/components/pwa/InstallPrompt';

export const metadata = {
  title: 'Silah — صلة | Quran Accountability Circle',
  description: 'Stay connected to the Quran year-round with your circle of family and friends.',
  icons: { 
    icon: '/logo.png',
    apple: '/logo.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'Silah — The Quran Accountability Circle',
    description: 'Small groups. Shared streaks. Lasting connection.',
    type: 'website',
  },
};

export const viewport = {
  themeColor: '#1D9E75',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Playfair+Display:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        
        {/* PWA Meta Tags */}
        <meta name="theme-color" content="#1D9E75" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Silah" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={GeistSans.className}>
        {children}
        <InstallPrompt />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
