import './globals.css'

export const metadata = {
  title: 'Q-viz',
  description: '',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-screen bg-gray-200" >
      <body className="h-screen overflow-hidden">
        <div className="flex h-screen flex-col">
          {children}
        </div>
      </body>
    </html>
  )
}
