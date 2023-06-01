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
    <html lang="en" className="h-full bg-gray-200" >
      <body className="h-full overflow-hidden">
        <div className="flex h-full flex-col">
          {children}
        </div>
      </body>
    </html>
  )
}
