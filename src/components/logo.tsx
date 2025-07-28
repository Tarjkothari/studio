import { Briefcase } from 'lucide-react';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="SmartHire Home">
      <Briefcase className="h-7 w-7 text-primary animate-float" />
      <h1 className="text-xl font-bold text-foreground">SmartHire</h1>
    </Link>
  );
}
