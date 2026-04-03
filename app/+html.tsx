import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />

        {/* PWA / Home screen */}
        <meta name="theme-color" content="#0a0e17" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CardCount" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="CardCount" />

        {/* Prevent text size adjustment on orientation change */}
        <meta name="format-detection" content="telephone=no" />

        <title>CardCount</title>

        <ScrollViewStyleReset />

        {/* Additional global styles for mobile */}
        <style dangerouslySetInnerHTML={{ __html: `
          html, body {
            overscroll-behavior: none;
            -webkit-overflow-scrolling: touch;
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
          }
          body {
            background-color: #0a0e17;
          }
          /* Safe area padding for notched devices when in standalone mode */
          @supports (padding: env(safe-area-inset-top)) {
            body {
              padding-top: env(safe-area-inset-top);
              padding-bottom: env(safe-area-inset-bottom);
              padding-left: env(safe-area-inset-left);
              padding-right: env(safe-area-inset-right);
            }
          }
          /* Prevent horizontal overflow */
          #root {
            max-width: 100vw;
            overflow-x: hidden;
          }
        `}} />
      </head>
      <body>{children}</body>
    </html>
  );
}
