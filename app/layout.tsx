import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import '@/app/ui/global.css'
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <header>
          
           
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}

