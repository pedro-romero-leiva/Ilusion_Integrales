import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'Ilusión Integral',
  description: 'Una aplicación interactiva para visualizar métodos de integración numérica.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="dark">
      <head>
      </head>
      <body className={`${inter.variable} font-body antialiased`}>{children}</body>
    </html>
  );
}
