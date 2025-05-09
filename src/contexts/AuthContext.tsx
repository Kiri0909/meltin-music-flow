
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
  generateCaptcha: () => { question: string, answer: string };
  captchaQuestion: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define different types of CAPTCHA challenges
type CaptchaType = 'math' | 'color' | 'animal' | 'reverse' | 'capital';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  const [captchaQuestion, setCaptchaQuestion] = useState<{question: string, answer: string, type: CaptchaType}>({ 
    question: '', 
    answer: '',
    type: 'math'
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
  
  // Generate a random captcha from different methods
  const generateCaptcha = () => {
    const captchaTypes: CaptchaType[] = ['math', 'color', 'animal', 'reverse', 'capital'];
    const randomType = captchaTypes[Math.floor(Math.random() * captchaTypes.length)];
    
    let question = '';
    let answer = '';
    
    switch (randomType) {
      case 'math':
        // Simple math problem
        const operation = ['+', '-', '*'][Math.floor(Math.random() * 2)]; // Using just + and - for simplicity
        const num1 = Math.floor(Math.random() * 10);
        const num2 = Math.floor(Math.random() * (operation === '-' ? num1 : 10));
        
        question = `What is ${num1} ${operation} ${num2}?`;
        
        switch (operation) {
          case '+': answer = String(num1 + num2); break;
          case '-': answer = String(num1 - num2); break;
          case '*': answer = String(num1 * num2); break;
          default: answer = String(num1 + num2);
        }
        break;
        
      case 'color':
        // Color identification
        const colors = [
          { name: 'red', hex: '#FF0000' },
          { name: 'blue', hex: '#0000FF' },
          { name: 'green', hex: '#00FF00' },
          { name: 'yellow', hex: '#FFFF00' },
          { name: 'purple', hex: '#800080' },
          { name: 'orange', hex: '#FFA500' }
        ];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        question = `What color is this? <span style="color:${randomColor.hex}">■■■■</span>`;
        answer = randomColor.name;
        break;
        
      case 'animal':
        // Animal sound matching
        const animals = [
          { name: 'dog', sound: 'bark' },
          { name: 'cat', sound: 'meow' },
          { name: 'cow', sound: 'moo' },
          { name: 'duck', sound: 'quack' },
          { name: 'sheep', sound: 'baa' }
        ];
        const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
        question = `What animal makes the sound "${randomAnimal.sound}"?`;
        answer = randomAnimal.name;
        break;
        
      case 'reverse':
        // Word reversal
        const words = ['music', 'play', 'song', 'tune', 'beat', 'note'];
        const randomWord = words[Math.floor(Math.random() * words.length)];
        question = `Spell "${randomWord}" backwards:`;
        answer = randomWord.split('').reverse().join('');
        break;
        
      case 'capital':
        // Capital city questions
        const countries = [
          { country: 'France', capital: 'Paris' },
          { country: 'Japan', capital: 'Tokyo' },
          { country: 'Egypt', capital: 'Cairo' },
          { country: 'Brazil', capital: 'Brasilia' },
          { country: 'Australia', capital: 'Canberra' }
        ];
        const randomCountry = countries[Math.floor(Math.random() * countries.length)];
        question = `What is the capital of ${randomCountry.country}?`;
        answer = randomCountry.capital;
        break;
        
      default:
        // Fallback to math
        const n1 = Math.floor(Math.random() * 10);
        const n2 = Math.floor(Math.random() * 10);
        question = `What is ${n1} + ${n2}?`;
        answer = String(n1 + n2);
    }
    
    setCaptchaQuestion({ question, answer, type: randomType });
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
    
    // Compare the provided answer with the stored correct answer (case insensitive)
    if (captchaAnswer.toLowerCase() !== captchaQuestion.answer.toLowerCase()) {
      toast({
        title: "CAPTCHA Failed",
        description: "Incorrect answer to verification question",
        variant: "destructive"
      });
      
      // Generate a new captcha for retry
      generateCaptcha();
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
      isAuthenticated: !!user,
      generateCaptcha,
      captchaQuestion: captchaQuestion.question
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
