
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

type User = {
  id: string;
  loginTime: string;
  device: string;
}

type AuthContextType = {
  user: User | null;
  login: (id: string, captchaAnswer: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  const [captchaQuestion, setCaptchaQuestion] = useState<{question: string, answer: string}>({ 
    question: '', 
    answer: ''
  });
  
  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('meltin_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user data');
      }
    }
    
    // Generate new captcha on initial load
    generateCaptcha();
  }, []);
  
  // Generate a new captcha question and store its answer
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10);
    const num2 = Math.floor(Math.random() * 10);
    const question = `What is ${num1} + ${num2}?`;
    const answer = String(num1 + num2);
    
    setCaptchaQuestion({ question, answer });
    return { question, answer };
  };

  const login = async (id: string, captchaAnswer: string): Promise<boolean> => {
    // Simple validation for demo purposes
    if (id.trim() === '' || captchaAnswer.trim() === '') {
      toast({
        title: "Error",
        description: "ID and captcha answer are required",
        variant: "destructive"
      });
      return false;
    }
    
    // Compare the provided answer with the stored correct answer
    if (captchaAnswer !== captchaQuestion.answer) {
      toast({
        title: "CAPTCHA Failed",
        description: "Incorrect answer to verification question",
        variant: "destructive"
      });
      return false;
    }

    // Get device info
    const deviceInfo = navigator.userAgent;
    const loginTime = new Date().toISOString();
    
    const newUser = {
      id,
      loginTime,
      device: deviceInfo
    };
    
    setUser(newUser);
    localStorage.setItem('meltin_user', JSON.stringify(newUser));
    
    toast({
      title: "Login Successful",
      description: `Welcome, User ${id}!`,
    });
    
    return true;
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem('meltin_user');
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    
    // Generate new captcha after logout
    generateCaptcha();
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useCaptcha = () => {
  const context = useContext(AuthContext) as any;
  if (context === undefined) {
    throw new Error('useCaptcha must be used within an AuthProvider');
  }
  
  return {
    generateCaptcha: context.generateCaptcha,
    captchaQuestion: context.captchaQuestion?.question
  };
};
