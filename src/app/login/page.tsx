
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/icons/logo";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] py-12">
      <Card className="mx-auto max-w-sm w-full bg-card border-border/60">
        <CardHeader className="text-center">
          <Logo className="h-12 w-12 text-primary mx-auto" />
          <CardTitle className="text-2xl font-headline mt-4">Login Temporarily Disabled</CardTitle>
          <CardDescription>
            The sign-in and sign-up features are temporarily disabled while we work on other parts of the application.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <p className="text-sm text-center text-muted-foreground">We will re-enable this functionality soon. Thank you for your patience.</p>
        </CardContent>
      </Card>
    </div>
  );
}
