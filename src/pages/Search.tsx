
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search as SearchIcon } from "lucide-react";
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import Navbar from '@/components/Navbar';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { tracks, playTrack } = useMusicPlayer();
  
  const filteredTracks = tracks.filter(track => {
    const query = searchQuery.toLowerCase();
    return (
      track.title.toLowerCase().includes(query) || 
      track.artist.toLowerCase().includes(query)
    );
  });

  const genres = ["Pop", "Rock", "Hip-Hop", "Electronic", "R&B", "Classical"];
  
  return (
    <div className="min-h-screen bg-gradient-dark flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="w-full max-w-3xl mx-auto animate-fade-in">
          <h1 className="text-3xl font-bold mb-6">Search</h1>
          
          <div className="relative mb-8">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input 
              className="pl-10" 
              placeholder="Search tracks, artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="mb-8">
            <h2 className="text-lg font-medium mb-3">Filter by Genre</h2>
            <div className="flex flex-wrap gap-2">
              {genres.map(genre => (
                <Badge 
                  key={genre} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-meltin-purple/20"
                  onClick={() => setSearchQuery(genre)}
                >
                  {genre}
                </Badge>
              ))}
            </div>
          </div>
          
          <Card className="glass-card">
            <CardContent className="p-4">
              <h2 className="text-lg font-medium mb-4">Search Results</h2>
              
              {searchQuery.trim() === '' ? (
                <p className="text-muted-foreground text-center py-8">
                  Enter a search query to find tracks
                </p>
              ) : filteredTracks.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No results found for "{searchQuery}"
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredTracks.map((track, index) => (
                    <div 
                      key={track.id}
                      className="flex items-center p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => {
                        const trackIndex = tracks.findIndex(t => t.id === track.id);
                        if (trackIndex !== -1) {
                          playTrack(trackIndex);
                        }
                      }}
                    >
                      <div 
                        className="w-12 h-12 rounded bg-cover bg-center shrink-0"
                        style={{ backgroundImage: `url(${track.coverUrl})` }}
                      />
                      <div className="ml-3 flex-grow">
                        <h3 className="font-medium">{track.title}</h3>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-400">{track.artist}</p>
                          <Badge variant="outline" className="text-[10px]">
                            {track.source === 'youtube' ? 'YouTube' : 'Spotify'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Search;
