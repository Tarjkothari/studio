import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  FileText,
  FlaskConical,
  Scale,
  ScanSearch,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/logo';

export default function Home() {
  const features = [
    {
      icon: <ScanSearch className="h-8 w-8 text-primary" />,
      title: 'AI Resume Parsing',
      description: 'Effortlessly extract skills, experience, and education from any resume PDF.',
    },
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: 'Job Description Analysis',
      description: 'Instantly identify key requirements and qualifications from job descriptions.',
    },
    {
      icon: <BarChart className="h-8 w-8 text-primary" />,
      title: 'Intelligent Candidate Ranking',
      description: 'Score and rank candidates based on their relevance to your job opening.',
    },
    {
      icon: <FlaskConical className="h-8 w-8 text-primary" />,
      title: 'Resume Improvement',
      description: 'Get AI-powered suggestions to tailor your resume for any job.',
    },
    {
      icon: <Scale className="h-8 w-8 text-primary" />,
      title: 'Bias Detection',
      description: 'Promote fair hiring by identifying and removing potential bias from job posts.',
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: 'Admin & User Management',
      description: 'Full control over users and system settings with a dedicated admin panel.',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 text-center sm:py-32">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Hire Smarter, Not Harder
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Unlock your hiring potential with AI-powered resume analysis. ResumeRank AI helps you find the perfect candidate, faster.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/signup/job-provider">Get Started as a Job Provider</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/signup/job-seeker">Improve Your Resume</Link>
            </Button>
          </div>
        </section>

        <section id="features" className="container mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything You Need for Modern Recruitment
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              From parsing and ranking to bias detection, our suite of tools is designed to streamline your hiring process.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="flex flex-col items-center p-6 text-center transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                <CardHeader className="p-0">
                  {feature.icon}
                  <CardTitle className="mt-4">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-0 mt-2">
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto flex flex-col items-center justify-between px-4 md:flex-row">
          <Logo />
          <p className="mt-4 text-sm text-muted-foreground md:mt-0">
            © {new Date().getFullYear()} ResumeRank AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
