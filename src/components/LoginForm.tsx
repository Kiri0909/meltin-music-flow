
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/AuthContext';

export const LoginForm = () => {
  const [id, setId] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const { login, captchaQuestion, generateCaptcha } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(id, captchaAnswer);
      if (success) {
        // Successful login
        setCaptchaAnswer('');
      } else {
        // Failed login, clear the captcha answer field
        setCaptchaAnswer('');
      }
    } catch (error) {
      console.error('Login error:', error);
      // Generate new captcha on error
      generateCaptcha();
      setCaptchaAnswer('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateRandomId = () => {
    // Generate a random 7-digit ID in the format 2025XXX
    const randomDigits = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const generatedId = `2025${randomDigits}`;
    setId(generatedId);
  };

  const refreshCaptcha = () => {
    generateCaptcha();
    setCaptchaAnswer('');
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
      <Card className="w-full max-w-md glass-card bg-gradient-to-br from-meltin-purple/20 to-meltin-blue/10">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight bg-gradient-meltin bg-clip-text text-transparent">
            Welcome to MeltIn
          </CardTitle>
          <CardDescription className="text-gray-400">
            Your personal music streaming platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="id">User ID</Label>
              <div className="flex space-x-2">
                <Input 
                  id="id" 
                  placeholder="Enter ID (e.g. 2025231)" 
                  value={id} 
                  onChange={(e) => setId(e.target.value)}
                  className="flex-1"
                  required
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleGenerateRandomId}
                  className="whitespace-nowrap"
                >
                  Generate ID
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="captcha">CAPTCHA Verification</Label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={refreshCaptcha}
                  className="h-8 px-2 text-xs"
                >
                  New Question
                </Button>
              </div>
              
              <div className="p-3 bg-slate-800/50 rounded-md mb-2">
                <div 
                  className="text-sm font-medium"
                  dangerouslySetInnerHTML={{ __html: captchaQuestion }}
                />
              </div>
              
              <Input 
                id="captcha" 
                type="text" 
                placeholder="Enter your answer" 
                value={captchaAnswer} 
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-meltin-purple hover:bg-meltin-purple/90"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-xs text-center flex justify-center">
          <span className="text-muted-foreground">
            Use your ID to access your music library
          </span>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginForm;
