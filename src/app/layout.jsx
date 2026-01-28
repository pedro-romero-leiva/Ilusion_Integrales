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
        <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.1/p5.min.js" defer></script>
      </head>
      <body className={`${inter.variable} font-body antialiased`}>{children}</body>
    </html>
  );
}

    