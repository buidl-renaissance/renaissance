export const metadata = {
  title: 'Renaissance Event Polling Service',
  description: 'Background polling service for event ingestion',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
