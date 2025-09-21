import Link from 'next/link';
import { Logo } from '@/components/icons/logo';
import { Twitter, Linkedin, Facebook } from 'lucide-react';

const navLinks = [
  { href: '/features', label: 'Features' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/compliance', label: 'Compliance' },
];

const socialLinks = [
  { href: '#', icon: Twitter },
  { href: '#', icon: Linkedin },
  { href: '#', icon: Facebook },
];

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border/60">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 font-headline text-xl font-bold text-foreground">
              <Logo className="h-8 w-8 text-primary" />
              VentureLens
            </Link>
            <p className="text-muted-foreground text-sm">Unlock the Future of Startup Investing</p>
            <div className="flex gap-4 mt-2">
              {socialLinks.map((link, index) => (
                <Link key={index} href={link.href} className="text-muted-foreground hover:text-foreground">
                  <link.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 col-span-2 gap-8">
            <div>
              <h3 className="font-headline font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                {navLinks.map(link => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
             <div>
              <h3 className="font-headline font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground">About Us</Link></li>
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Careers</Link></li>
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
             <div>
              <h3 className="font-headline font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-border/60 mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} VentureLens. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
