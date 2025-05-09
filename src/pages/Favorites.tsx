
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { Button } from "@/components/ui/button";
import { Heart, Play, Trash2 } from "lucide-react";
import Navbar from '@/components/Navbar';

const Favorites = () => {
  const { tracks, playTrack, removeTrack, toggleFavorite } = useMusicPlayer();
  
  const favoriteTracks = tracks.filter(track => track.isFavorite);

  return (
    <div className="min-h-screen bg-gradient-dark flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="w-full max-w-3xl mx-auto animate-fade-in">
          <div className="flex items-center mb-6">
            <Heart className="mr-2 text-meltin-pink" size={24} />
            <h1 className="text-3xl font-bold">Favorites</h1>
          </div>
          
          <Card className="glass-card">
            <CardContent className="p-4">
              {favoriteTracks.length === 0 ? (
                <div className="text-center py-10">
                  <Heart className="mx-auto mb-4 text-gray-400" size={40} />
                  <h2 className="text-xl font-medium mb-2">No favorite tracks yet</h2>
                  <p className="text-muted-foreground">
                    Add songs to your favorites by clicking the heart icon
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {favoriteTracks.map((track) => {
                    const trackIndex = tracks.findIndex(t => t.id === track.id);
                    
                    return (
                      <div 
                        key={track.id}
                        className="flex items-center p-3 rounded-lg hover:bg-white/5 transition-all"
                      >
                        <div 
                          className="w-14 h-14 rounded bg-cover bg-center shrink-0"
                          style={{ backgroundImage: `url(${track.coverUrl})` }}
                        />
                        <div className="ml-3 flex-grow">
                          <h3 className="font-medium">{track.title}</h3>
                          <p className="text-sm text-gray-400">{track.artist}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => playTrack(trackIndex)}
                            className="rounded-full h-9 w-9 hover:bg-meltin-purple/20"
                          >
                            <Play size={18} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => toggleFavorite(track.id)}
                            className="rounded-full h-9 w-9 hover:bg-pink-500/20"
                          >
                            <Heart 
                              size={18} 
                              className="fill-meltin-pink text-meltin-pink" 
                            />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => removeTrack(track.id)}
                            className="rounded-full h-9 w-9 hover:bg-red-500/20"
                          >
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Favorites;
