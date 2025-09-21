'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X } from 'lucide-react';
import { Logo } from '@/components/icons/logo';
import { useAuth } from '@/contexts/auth-context';

const navLinks = [
  { href: '/features', label: 'Features' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/compliance', label: 'Compliance' },
  { href: '/dashboard', label: 'Dashboard' },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/80 backdrop-blur-sm border-b' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-headline text-xl font-bold text-foreground">
            <Logo className="h-8 w-8 text-primary" />
            VentureLens
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-foreground/80 hover:text-foreground transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {/* {isAuthenticated ? (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button onClick={logout}>Logout</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )} */}
          </div>

          <div className="md:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-background">
                <div className="p-4">
                <div className="flex items-center justify-between mb-8">
                  <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 font-headline text-xl font-bold text-foreground">
                      <Logo className="h-8 w-8 text-primary" />
                      VentureLens
                  </Link>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <X className="h-6 w-6" />
                      <span className="sr-only">Close menu</span>
                    </Button>
                  </SheetTrigger>
                </div>
                  <div className="flex flex-col gap-4">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="text-lg font-medium text-foreground/80 hover:text-foreground transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                    {/* <div className="border-t pt-4 mt-4 flex flex-col gap-2">
                      {isAuthenticated ? (
                         <>
                          <Button variant="outline" asChild>
                            <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                          </Button>
                          <Button onClick={() => { logout(); setIsMenuOpen(false); }}>Logout</Button>
                         </>
                      ) : (
                        <>
                          <Button variant="outline" asChild>
                            <Link href="/login" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                          </Button>
                          <Button asChild>
                            <Link href="/signup" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
                          </Button>
                        </>
                      )}
                    </div> */}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
