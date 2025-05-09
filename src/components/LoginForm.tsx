
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/AuthContext';

export const LoginForm = () => {
  const [id, setId] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [captchaQuestion, setCaptchaQuestion] = useState('');

  // Generate a simple math captcha on component mount
  React.useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10);
    const num2 = Math.floor(Math.random() * 10);
    setCaptchaQuestion(`What is ${num1} + ${num2}?`);
    // We don't need to store the answer here anymore, it's calculated in AuthContext
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(id, captchaAnswer);
    } catch (error) {
      console.error('Login error:', error);
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
              <Label htmlFor="captcha">{captchaQuestion}</Label>
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
