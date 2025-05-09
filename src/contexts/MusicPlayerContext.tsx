
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useToast } from "@/hooks/use-toast";

type Track = {
  id: string;
  url: string;
  title: string;
  artist: string;
  coverUrl: string;
  isFavorite: boolean;
  source: 'youtube' | 'spotify';
};

type MusicPlayerContextType = {
  tracks: Track[];
  currentTrackIndex: number | null;
  isPlaying: boolean;
  isLooping: boolean;
  isShuffle: boolean;
  addTrack: (url: string) => Promise<void>;
  updateTrack: (id: string, updates: Partial<Track>) => void;
  removeTrack: (id: string) => void;
  playTrack: (index: number) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  toggleFavorite: (id: string) => void;
  toggleLoop: () => void;
  toggleShuffle: () => void;
};

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

const generateMockData = (url: string): Partial<Track> => {
  const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
  const isSpotify = url.includes('spotify.com');
  
  if (!isYoutube && !isSpotify) {
    throw new Error('Only YouTube Music and Spotify links are supported');
  }
  
  // For demo purposes, we're generating mock metadata
  // In a real app, this would parse the actual metadata from the services
  const artists = [
    'The Weeknd', 
    'Taylor Swift', 
    'Drake', 
    'Billie Eilish', 
    'Post Malone'
  ];
  
  const titles = [
    'Blinding Lights', 
    'Anti-Hero', 
    'God\'s Plan', 
    'bad guy', 
    'Circles'
  ];
  
  const coverImages = [
    'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36',
    'https://i.scdn.co/image/ab67616d0000b273bb54dde68cd23e2a268ae0f5',
    'https://i.scdn.co/image/ab67616d0000b27382b243023b937fd579a35533',
    'https://i.scdn.co/image/ab67616d0000b273800d7b017410db9263c69a18'
  ];
  
  const randomArtist = artists[Math.floor(Math.random() * artists.length)];
  const randomTitle = titles[Math.floor(Math.random() * titles.length)];
  const randomCover = coverImages[Math.floor(Math.random() * coverImages.length)];
  
  return {
    title: randomTitle,
    artist: randomArtist,
    coverUrl: randomCover,
    source: isYoutube ? 'youtube' : 'spotify'
  };
};

export const MusicPlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load tracks from localStorage
    const savedTracks = localStorage.getItem('meltin_tracks');
    if (savedTracks) {
      try {
        setTracks(JSON.parse(savedTracks));
      } catch (e) {
        console.error('Failed to load saved tracks');
      }
    }
  }, []);

  useEffect(() => {
    // Save tracks to localStorage whenever they change
    localStorage.setItem('meltin_tracks', JSON.stringify(tracks));
  }, [tracks]);

  const addTrack = async (url: string): Promise<void> => {
    try {
      const mockData = generateMockData(url);
      const newTrack: Track = {
        id: `track_${Date.now()}`,
        url,
        title: mockData.title || 'Unknown Title',
        artist: mockData.artist || 'Unknown Artist',
        coverUrl: mockData.coverUrl || '',
        isFavorite: false,
        source: mockData.source || 'youtube'
      };
      
      setTracks(prev => [newTrack, ...prev]);
      toast({
        title: "Track Added",
        description: `${newTrack.title} by ${newTrack.artist} added to your playlist`,
      });
      
      // Play the newly added track
      setCurrentTrackIndex(0);
      setIsPlaying(true);
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Error Adding Track",
          description: error.message,
          variant: "destructive"
        });
      }
    }
  };

  const updateTrack = (id: string, updates: Partial<Track>) => {
    setTracks(prev => 
      prev.map(track => 
        track.id === id ? { ...track, ...updates } : track
      )
    );
    toast({
      title: "Track Updated",
      description: "Track details have been updated",
    });
  };

  const removeTrack = (id: string) => {
    const trackToRemove = tracks.find(track => track.id === id);
    const trackIndex = tracks.findIndex(track => track.id === id);
    
    setTracks(prev => prev.filter(track => track.id !== id));
    
    if (trackIndex === currentTrackIndex) {
      // If the removed track is currently playing
      if (tracks.length > 1) {
        // Play the next track or previous if it's the last one
        if (trackIndex < tracks.length - 1) {
          setCurrentTrackIndex(trackIndex);
        } else {
          setCurrentTrackIndex(trackIndex - 1);
        }
      } else {
        setCurrentTrackIndex(null);
        setIsPlaying(false);
      }
    } else if (trackIndex < currentTrackIndex!) {
      // If the removed track is before the current one, adjust the index
      setCurrentTrackIndex(currentTrackIndex! - 1);
    }
    
    if (trackToRemove) {
      toast({
        title: "Track Removed",
        description: `${trackToRemove.title} has been removed from your playlist`,
      });
    }
  };

  const playTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  };

  const pauseTrack = () => {
    setIsPlaying(false);
  };

  const resumeTrack = () => {
    setIsPlaying(true);
  };

  const nextTrack = () => {
    if (tracks.length === 0) return;
    
    if (isShuffle) {
      // Play a random track
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * tracks.length);
      } while (tracks.length > 1 && randomIndex === currentTrackIndex);
      
      setCurrentTrackIndex(randomIndex);
    } else {
      // Play the next track or loop to the first one
      setCurrentTrackIndex(prev => 
        prev === null ? 0 : (prev + 1) % tracks.length
      );
    }
    setIsPlaying(true);
  };

  const prevTrack = () => {
    if (tracks.length === 0) return;
    
    if (isShuffle) {
      // Play a random track
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * tracks.length);
      } while (tracks.length > 1 && randomIndex === currentTrackIndex);
      
      setCurrentTrackIndex(randomIndex);
    } else {
      // Play the previous track or loop to the last one
      setCurrentTrackIndex(prev => 
        prev === null ? tracks.length - 1 : (prev - 1 + tracks.length) % tracks.length
      );
    }
    setIsPlaying(true);
  };

  const toggleFavorite = (id: string) => {
    setTracks(prev => 
      prev.map(track => 
        track.id === id ? { ...track, isFavorite: !track.isFavorite } : track
      )
    );
  };

  const toggleLoop = () => {
    setIsLooping(prev => !prev);
  };

  const toggleShuffle = () => {
    setIsShuffle(prev => !prev);
  };

  return (
    <MusicPlayerContext.Provider value={{
      tracks,
      currentTrackIndex,
      isPlaying,
      isLooping,
      isShuffle,
      addTrack,
      updateTrack,
      removeTrack,
      playTrack,
      pauseTrack,
      resumeTrack,
      nextTrack,
      prevTrack,
      toggleFavorite,
      toggleLoop,
      toggleShuffle
    }}>
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (context === undefined) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
};
