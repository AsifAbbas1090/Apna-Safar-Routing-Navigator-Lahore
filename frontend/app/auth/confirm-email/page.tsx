"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ConfirmEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid confirmation link. Please check your email and try again.');
      return;
    }

    // Confirm email
    const confirmEmail = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/confirm-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to confirm email');
        }

        setStatus('success');
        setMessage('Your email has been confirmed successfully! You can now log in.');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } catch (err) {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Failed to confirm email. Please try again.');
      }
    };

    confirmEmail();
  }, [token, router]);

  return (
    <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="text-center">
            <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
              status === 'success' ? 'bg-green-100' : status === 'error' ? 'bg-red-100' : 'bg-primary/10'
            }`}>
              {status === 'loading' && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
              {status === 'success' && <CheckCircle2 className="h-6 w-6 text-green-600" />}
              {status === 'error' && <AlertCircle className="h-6 w-6 text-red-600" />}
              {status === 'loading' && status !== 'success' && status !== 'error' && (
                <MapPin className="h-6 w-6 text-primary" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {status === 'loading' && 'Confirming Email...'}
              {status === 'success' && 'Email Confirmed!'}
              {status === 'error' && 'Confirmation Failed'}
            </CardTitle>
            <CardDescription>
              {status === 'loading' && 'Please wait while we confirm your email address'}
              {status === 'success' && 'Your account is now verified'}
              {status === 'error' && 'We couldn\'t confirm your email address'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className={`text-center ${
              status === 'success' ? 'text-green-600' : 
              status === 'error' ? 'text-red-600' : 
              'text-muted-foreground'
            }`}>
              {message || 'Processing...'}
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            {status === 'success' && (
              <p className="text-sm text-muted-foreground">
                Redirecting to login page...
              </p>
            )}
            {status === 'error' && (
              <div className="flex flex-col items-center space-y-2">
                <Link href="/login">
                  <Button variant="outline">Go to Login</Button>
                </Link>
                <Link href="/signup" className="text-sm text-primary hover:underline">
                  Sign up again
                </Link>
              </div>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

