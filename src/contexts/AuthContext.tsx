
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
  }, []);

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
    
    // Simple math captcha validation
    const correctAnswer = getCorrectCaptchaAnswer();
    
    if (captchaAnswer !== correctAnswer) {
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
  };

  // Helper function to get correct captcha answer (for demo purposes)
  const getCorrectCaptchaAnswer = (): string => {
    // This would normally be dynamically generated and checked against a server
    return "8"; // Simple math answer for demo
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
