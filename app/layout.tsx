import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

// Function to load Google Fonts dynamically
const loadGoogleFont = (fontFamily: string) => {
  const fontMap: Record<string, string> = {
    Amiri: "Amiri:wght@400;700",
    Cairo: "Cairo:wght@200;300;400;500;600;700;800;900",
    Tajawal: "Tajawal:wght@200;300;400;500;700;800;900",
    Almarai: "Almarai:wght@300;400;700;800",
    Changa: "Changa:wght@200;300;400;500;600;700;800",
    "El Messiri": "El+Messiri:wght@400;500;600;700",
    Harmattan: "Harmattan:wght@400;500;600;700",
    Katibeh: "Katibeh",
    Lalezar: "Lalezar",
    Lateef: "Lateef:wght@200;300;400;500;600;700;800",
    Lemonada: "Lemonada:wght@300;400;500;600;700",
    Mada: "Mada:wght@200;300;400;500;600;700;900",
    "Markazi Text": "Markazi+Text:wght@400;500;600;700",
    Mirza: "Mirza:wght@400;500;600;700",
    Rakkas: "Rakkas",
    "Reem Kufi": "Reem+Kufi:wght@400;500;600;700",
    Scheherazade: "Scheherazade+New:wght@400;500;600;700",
    Vibes: "Vibes",
    "Noto Sans Arabic": "Noto+Sans+Arabic:wght@100;200;300;400;500;600;700;800;900",
    "Noto Kufi Arabic": "Noto+Kufi+Arabic:wght@100;200;300;400;500;600;700;800;900",
    "Noto Naskh Arabic": "Noto+Naskh+Arabic:wght@400;500;600;700",
  }

  const fontQuery = fontMap[fontFamily]
  if (!fontQuery) return

  // Check if font is already loaded
  const existingLink = document.querySelector(`link[href*="${fontQuery}"]`)
  if (existingLink) return

  // Create and append font link
  const link = document.createElement("link")
  link.rel = "stylesheet"
  link.href = `https://fonts.googleapis.com/css2?family=${fontQuery}&display=swap`
  document.head.appendChild(link)
}

// Make loadGoogleFont available globally
if (typeof window !== "undefined") {
  ;(window as any).loadGoogleFont = loadGoogleFont
}

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
