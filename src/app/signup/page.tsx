
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import Link from "next/link";
import { ArrowRight, Briefcase, UserSearch } from "lucide-react";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8">
        <Logo />
      </div>
      <div className="w-full max-w-3xl text-center">
        <h1 className="text-3xl font-bold tracking-tight">Join SmartHire</h1>
        <p className="mt-2 text-muted-foreground">
          Choose your path to get started. Are you looking to hire or get hired?
        </p>
      </div>
      <div className="mt-10 grid w-full max-w-2xl grid-cols-1 gap-8 md:grid-cols-2">
        <Link href="/signup/job-provider">
          <Card className="group transform cursor-pointer p-6 text-center transition-all duration-300 hover:scale-105 hover:bg-primary/5 hover:shadow-xl">
            <CardHeader>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Briefcase className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="mt-4 text-xl font-semibold">I'm a Job Provider</CardTitle>
              <CardDescription className="mt-2">
                Find, rank, and manage top talent with powerful AI tools.
              </CardDescription>
            </CardHeader>
            <div className="mt-4 flex items-center justify-center font-semibold text-primary">
              Sign Up Now <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Card>
        </Link>
        <Link href="/signup/job-seeker">
          <Card className="group transform cursor-pointer p-6 text-center transition-all duration-300 hover:scale-105 hover:bg-primary/5 hover:shadow-xl">
            <CardHeader>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <UserSearch className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="mt-4 text-xl font-semibold">I'm a Job Seeker</CardTitle>
              <CardDescription className="mt-2">
                Improve your resume and increase your chances of getting hired.
              </CardDescription>
            </CardHeader>
            <div className="mt-4 flex items-center justify-center font-semibold text-primary">
              Get Started <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Card>
        </Link>
      </div>
       <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
