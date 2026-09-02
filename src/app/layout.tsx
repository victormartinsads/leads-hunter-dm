import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Buscando 1 Milhão — Sistema Comercial Autônomo',
  description: 'Prospecção comercial inteligente no Instagram com Google Gemini e Chrome Real',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col antialiased selection:bg-purple-500 selection:text-white">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-slate-850 py-6 text-center text-xs text-slate-500 bg-[#0d1322]">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>Buscando 1 Milhão • Sistema Comercial Autônomo com Google Gemini</span>
            <span>Roda 100% Local • Regras Estritas de Claims Ativas</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
