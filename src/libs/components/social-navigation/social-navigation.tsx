import { Facebook, Github, Linkedin } from 'lucide-react';
import Link from 'next/link';

interface SocialNavigationProps {
  variant?: 'mobile' | 'desktop';
  className?: string;
}

export const SocialNavigation = ({ variant = 'desktop', className = '' }: SocialNavigationProps) => {
  const linkWidth = variant === 'mobile' ? 'w-10' : 'w-20';

  return (
    <nav className={`flex items-center ${className}`}>
      <Link
        href="https://github.com/mioriaty"
        target="_blank"
        rel="noopener noreferrer"
        className={`bd bd-right bd-bottom bd-left p-2.5 ${linkWidth} block text-center hover:bg-green-signature transition-colors`}
      >
        <Github size={16} className="mx-auto" />
      </Link>
      <Link
        href="https://www.linkedin.com/in/duongwtoo"
        target="_blank"
        rel="noopener noreferrer"
        className={`bd bd-bottom bd-right p-2.5 ${linkWidth} block text-center hover:bg-green-signature transition-colors`}
      >
        <Linkedin size={16} className="mx-auto" />
      </Link>
      <Link
        href="https://www.facebook.com/jin.beo.5"
        target="_blank"
        rel="noopener noreferrer"
        className={`bd bd-bottom bd-right p-2.5 ${linkWidth} block text-center hover:bg-green-signature transition-colors`}
      >
        <Facebook size={16} className="mx-auto" />
      </Link>
    </nav>
  );
};
