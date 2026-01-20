import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ik-cream via-white to-ik-beige dark:from-gray-900 dark:via-gray-800 dark:to-black">
      <div className="text-center space-y-8 px-4 max-w-2xl">
        <div className="space-y-4">
          <h1 className="text-9xl font-light text-ik-gold dark:text-ik-gold animate-pulse">
            404
          </h1>
          <h2 className="text-3xl md:text-4xl font-light text-ik-charcoal dark:text-white">
            Pagina Niet Gevonden
          </h2>
          <p className="text-lg text-ik-charcoal/80 dark:text-gray-300 font-light">
            Sorry, de pagina die je zoekt bestaat niet of is verplaatst.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Link href="/nl">
            <Button size="lg" className="gap-2">
              <Home className="h-5 w-5" />
              Naar Homepage
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => window.history.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Ga Terug
          </Button>
        </div>
      </div>
    </div>
  );
}
