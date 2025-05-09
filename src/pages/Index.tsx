
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/LoginForm';
import Navbar from '@/components/Navbar';
import MusicPlayer from '@/components/MusicPlayer';

const Index = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-dark flex flex-col">
        <div className="container mx-auto px-4 py-8 flex-grow flex flex-col">
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-meltin animate-gradient-shift">
            MeltIn
          </h1>
          <div className="flex-grow flex items-center justify-center">
            <LoginForm />
          </div>
        </div>
        <footer className="text-center py-4 text-sm text-gray-500">
          <p>© 2025 MeltIn Music</p>
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
      <footer className="text-center py-4 text-sm text-gray-500">
        <p>© 2025 MeltIn Music</p>
      </footer>
    </div>
  );
};

export default Index;
