
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  FileText,
  FlaskConical,
  Scale,
  ScanSearch,
} from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/logo';

export default function Home() {
  const features = [
    {
      icon: <ScanSearch className="h-8 w-8 text-primary" />,
      title: 'AI Resume Parsing',
      description: 'Effortlessly extract skills, experience, and education from any resume PDF.',
      href: '/dashboard/ranker'
    },
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: 'Job Description Analysis',
      description: 'Instantly identify key requirements and qualifications from job descriptions.',
      href: '/dashboard/bias-checker'
    },
    {
      icon: <BarChart className="h-8 w-8 text-primary" />,
      title: 'Intelligent Candidate Ranking',
      description: 'Score and rank candidates based on their relevance to your job opening.',
      href: '/dashboard/ranker'
    },
    {
      icon: <FlaskConical className="h-8 w-8 text-primary" />,
      title: 'Resume Improvement',
      description: 'Get AI-powered suggestions to tailor your resume for any job.',
      href: '/seeker/improve-resume'
    },
    {
      icon: <Scale className="h-8 w-8 text-primary" />,
      title: 'Bias Detection',
      description: 'Promote fair hiring by identifying and removing potential bias from job posts.',
      href: '/dashboard/bias-checker'
    },
  ];

  const headline = "Hire Smarter, Not Harder";
  const subheadline = "Unlock your hiring potential with AI-powered resume analysis. SmartHire helps you find the perfect candidate, faster.";
  const featuresHeadline = "Everything You Need for Modern Recruitment";
  const featuresSubheadline = "From parsing and ranking to bias detection, our suite of tools is designed to streamline your hiring process.";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-fade-in-down" style={{animationDuration: '1.5s'}}>
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
            {headline.split("").map((letter, index) => (
                <span
                    key={index}
                    className="inline-block animate-text-3d"
                    style={{ animationDelay: `${index * 50}ms`, whiteSpace: 'pre' }}
                >
                    {letter}
                </span>
            ))}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
             {subheadline.split("").map((letter, index) => (
                <span
                    key={index}
                    className="inline-block animate-text-3d"
                    style={{ animationDelay: `${(headline.length + index) * 25}ms`, whiteSpace: 'pre' }}
                >
                    {letter}
                </span>
            ))}
          </p>
          <div className="mt-8 flex justify-center gap-4 animate-fade-in-up animation-delay-600">
            <Button size="lg" asChild>
              <Link href="/signup/job-provider">Get Started as a Job Provider</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/signup/job-seeker">Improve Your Resume</Link>
            </Button>
          </div>
        </section>

        <section id="features" className="container mx-auto px-4 py-16 sm:py-24">
          <div className="text-center animate-fade-in-up">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {featuresHeadline.split("").map((letter, index) => (
                  <span
                      key={index}
                      className="inline-block animate-text-3d"
                      style={{ animationDelay: `${index * 25}ms`, whiteSpace: 'pre' }}
                  >
                      {letter}
                  </span>
              ))}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              {featuresSubheadline.split("").map((letter, index) => (
                  <span
                      key={index}
                      className="inline-block animate-text-3d"
                      style={{ animationDelay: `${(featuresHeadline.length + index) * 20}ms`, whiteSpace: 'pre' }}
                  >
                      {letter}
                  </span>
              ))}
            </p>
          </div>
           <div className="group mt-12 w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
            <div className="flex items-center justify-center md:justify-start [&_li]:mx-4 animate-marquee group-hover:[animation-play-state:paused]">
                <ul className="flex items-center justify-center [&_li]:mx-4">
                    {features.map((feature, index) => (
                    <li key={feature.title + '-1'} className="flex-shrink-0">
                        <Link href={feature.href}>
                            <Card 
                            className="flex h-full w-80 flex-col items-center p-6 text-center transition-transform duration-300 hover:scale-105 hover:shadow-xl active:scale-100 active:shadow-lg transition-shadow"
                            >
                            <CardHeader className="p-0">
                                {feature.icon}
                                <CardTitle className="mt-4">{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 mt-2">
                                <p className="text-muted-foreground">{feature.description}</p>
                            </CardContent>
                            </Card>
                        </Link>
                    </li>
                    ))}
                </ul>
                <ul className="flex items-center justify-center [&_li]:mx-4" aria-hidden="true">
                    {features.map((feature, index) => (
                    <li key={feature.title + '-2'} className="flex-shrink-0">
                        <Link href={feature.href}>
                            <Card 
                            className="flex h-full w-80 flex-col items-center p-6 text-center transition-transform duration-300 hover:scale-105 hover:shadow-xl active:scale-100 active:shadow-lg transition-shadow"
                            >
                            <CardHeader className="p-0">
                                {feature.icon}
                                <CardTitle className="mt-4">{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 mt-2">
                                <p className="text-muted-foreground">{feature.description}</p>
                            </CardContent>
                            </Card>
                        </Link>
                    </li>
                    ))}
                </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 animate-fade-in">
        <div className="container mx-auto flex flex-col items-center justify-between px-4 md:flex-row">
          <Logo />
          <p className="mt-4 text-sm text-muted-foreground md:mt-0">
            © {new Date().getFullYear()} SmartHire. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
