import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import '@/app/ui/global.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen bg-gray-50">
          <header className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                {/* Brand/Logo */}
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold text-gray-900">Car Referral System</h1>
                </div>
                
                {/* Navigation */}
                <nav className="hidden md:flex items-center space-x-8">
                  <a href="#overview" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
                    Overview
                  </a>
                  <a href="#features" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
                    Features
                  </a>
                  <a href="#pricing" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
                    Pricing
                  </a>
                  <a href="#contact" className="text-gray-700 hover:text-gray-900 font-medium transition-colors">
                    Contact
                  </a>
                </nav>

                {/* Auth Buttons */}
                <div className="flex items-center space-x-4">
                  <SignedOut>
                    <a href="/sign-up" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                      Sign Up
                    </a>
                    <a href="/sign-in" className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                      Log In
                    </a>
                  </SignedOut>
                  <SignedIn>
                    <UserButton afterSignOutUrl="/" />
                  </SignedIn>
                </div>
              </div>
            </div>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}

