
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/LoginForm';
import Navbar from '@/components/Navbar';
import MusicPlayer from '@/components/MusicPlayer';
import FeedbackButton from '@/components/FeedbackButton';
import SilverwolfBot from '@/components/SilverwolfBot';

const Index = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-dark flex flex-col">
        <div className="container mx-auto px-4 py-8 flex-grow flex flex-col">
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-meltin animate-gradient-shift">
            Meltine
          </h1>
          <div className="flex-grow flex items-center justify-center">
            <LoginForm />
          </div>
        </div>
        <footer className="text-center py-4 text-sm text-gray-500 flex justify-between items-center container mx-auto px-4">
          <div className="text-left">
            <p>Developed By: KiriKaslana</p>
          </div>
          <div>
            <p>© 2025 Meltine Music</p>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <MusicPlayer />
      </main>
      <FeedbackButton />
      <SilverwolfBot />
      <footer className="text-center py-4 text-sm text-gray-500 flex justify-between items-center container mx-auto px-4">
        <div className="text-left">
          <p>Developed By: KiriKaslana</p>
        </div>
        <div>
          <p>© 2025 Meltine Music</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
