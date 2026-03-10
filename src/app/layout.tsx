// Root layout — must include <html> and <body> for routes outside [locale]
// (e.g. /auth/callback). The [locale] layout overrides these for localized pages.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
