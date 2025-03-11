import type { Metadata } from "next";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ModeToggle } from "@/components/ModeToggle";
import { Button } from "@/components/ui/button";
import GitHubButton from "@/components/GitHubButton";
import { PostHogProvider } from "@/app/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Text Embedding Visualizer - Reinis Šestakovskis",
  description: "Learn how computers understand the meaning behind text",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <PostHogProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <header className="flex h-16 items-center justify-end gap-2 p-4">
                <ModeToggle />
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button variant="outline" size="default">
                      Sign in
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button variant="outline" size="default">
                      Sign up
                    </Button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </header>
              <div className="mx-auto max-w-4xl">{children}</div>
              <footer className="my-6 flex flex-col items-center justify-center gap-6">
                <GitHubButton />
                <div className="text-sm">
                  <div>
                    &copy; {new Date().getFullYear()} • Text Embedding Visualizer -{" "}
                    <a
                      className="underline"
                      href="https://www.linkedin.com/in/reinis-sestakovskis"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Reinis Šestakovskis
                    </a>
                  </div>
                </div>
              </footer>
            </ThemeProvider>
          </PostHogProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
