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
  embedCode?: string; // Added embedCode field to store the generated embed HTML
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

// Function to generate embed code based on the URL
const generateEmbedCode = (url: string): string | undefined => {
  // For YouTube Music
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    let videoId = '';
    
    // Extract YouTube video ID
    if (url.includes('watch?v=')) {
      videoId = url.split('watch?v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('youtube.com/embed/')[1].split('?')[0];
    }
    
    if (videoId) {
      return `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    }
  }
  
  // For Spotify
  if (url.includes('spotify.com')) {
    let trackId = '';
    let embedType = 'track'; // Default to track
    
    // Extract Spotify ID based on content type
    if (url.includes('/track/')) {
      trackId = url.split('/track/')[1].split('?')[0];
      embedType = 'track';
    } else if (url.includes('/album/')) {
      trackId = url.split('/album/')[1].split('?')[0];
      embedType = 'album';
    } else if (url.includes('/playlist/')) {
      trackId = url.split('/playlist/')[1].split('?')[0];
      embedType = 'playlist';
    } else if (url.includes('/artist/')) {
      trackId = url.split('/artist/')[1].split('?')[0];
      embedType = 'artist';
    }
    
    if (trackId) {
      return `<iframe src="https://open.spotify.com/embed/${embedType}/${trackId}" width="100%" height="380" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>`;
    }
  }
  
  return undefined;
};

const generateMockData = (url: string): Partial<Track> & { embedCode?: string } => {
  // Identify the source
  const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
  const isSpotify = url.includes('spotify.com');
  
  if (!isYoutube && !isSpotify) {
    throw new Error('Only YouTube Music and Spotify links are supported');
  }
  
  // Generate embed code based on the URL
  const embedCode = generateEmbedCode(url);
  
  // Extract data from the URL if possible
  let extractedData: Partial<Track> = { source: isYoutube ? 'youtube' : 'spotify', embedCode };
  
  // Extract YouTube information
  if (isYoutube) {
    try {
      let videoId = '';
      let title = 'YouTube Track';
      let artist = 'YouTube Artist';
      
      // Extract video ID
      if (url.includes('watch?v=')) {
        videoId = url.split('watch?v=')[1].split('&')[0];
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
      }
      
      if (videoId) {
        // Use video ID to generate a title and artist
        // In a real implementation, you would call the YouTube API here
        const idFirstChars = videoId.substring(0, 3);
        title = `YouTube Track ${idFirstChars}`;
        artist = `Artist ${idFirstChars}`;
        
        extractedData = {
          ...extractedData,
          title,
          artist,
          coverUrl: `https://img.youtube.com/vi/${videoId}/0.jpg` // YouTube thumbnail
        };
      }
    } catch (e) {
      console.error('Failed to extract YouTube data', e);
    }
  }
  
  // Extract Spotify information
  if (isSpotify) {
    try {
      let trackId = '';
      let title = 'Spotify Track';
      let artist = 'Spotify Artist';
      
      // Extract track ID
      if (url.includes('/track/')) {
        trackId = url.split('/track/')[1].split('?')[0];
      } else if (url.includes('/album/')) {
        trackId = url.split('/album/')[1].split('?')[0];
        title = 'Spotify Album';
      } else if (url.includes('/playlist/')) {
        trackId = url.split('/playlist/')[1].split('?')[0];
        title = 'Spotify Playlist';
      }
      
      if (trackId) {
        // Use track ID to generate a title and artist
        // In a real implementation, you would call the Spotify API here
        const idFirstChars = trackId.substring(0, 3);
        title = `${title} ${idFirstChars}`;
        artist = `Artist ${idFirstChars}`;
        
        // Default Spotify album art
        const defaultCover = 'https://i.scdn.co/image/ab67616d0000b273608140c63299dfde25527028';
        
        extractedData = {
          ...extractedData,
          title,
          artist,
          coverUrl: defaultCover
        };
      }
    } catch (e) {
      console.error('Failed to extract Spotify data', e);
    }
  }
  
  // If we couldn't extract data or the extracted data is incomplete, use mock data
  if (!extractedData.title || !extractedData.artist || !extractedData.coverUrl) {
    // For demo purposes, we're generating mock metadata based on the URL patterns
    // In a real app, this would parse the actual metadata from the services' APIs
    
    // Mock data sets based on source
    const spotifyArtists = [
      'The Weeknd', 
      'Dua Lipa', 
      'Bad Bunny', 
      'Taylor Swift', 
      'Billie Eilish'
    ];
    
    const spotifyTitles = [
      'Blinding Lights', 
      'Don\'t Start Now', 
      'Dakiti', 
      'Cardigan', 
      'everything i wanted'
    ];
    
    const spotifyCoverImages = [
      'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36',
      'https://i.scdn.co/image/ab67616d0000b273bd26ede1ae69327010d49946',
      'https://i.scdn.co/image/ab67616d0000b27308fc2c7c9945a5d80258c2c5',
      'https://i.scdn.co/image/ab67616d0000b273ae461c2d5e42d88389ee7cc8'
    ];
    
    const youtubeArtists = [
      'Drake', 
      'Post Malone', 
      'Ed Sheeran', 
      'BTS', 
      'Ariana Grande'
    ];
    
    const youtubeTitles = [
      'God\'s Plan', 
      'Circles', 
      'Shape of You', 
      'Dynamite', 
      '7 rings'
    ];
    
    const youtubeCoverImages = [
      'https://i.scdn.co/image/ab67616d0000b27382b243023b937fd579a35533',
      'https://i.scdn.co/image/ab67616d0000b273800d7b017410db9263c69a18',
      'https://i.scdn.co/image/ab67616d0000b27333b8541201f1ef38941024be',
      'https://i.scdn.co/image/ab67616d0000b2731a63f7fd77bf6757c3edf448'
    ];
    
    // Random mock data based on source
    const artists = isYoutube ? youtubeArtists : spotifyArtists;
    const titles = isYoutube ? youtubeTitles : spotifyTitles;
    const coverImages = isYoutube ? youtubeCoverImages : spotifyCoverImages;
    
    const randomArtist = artists[Math.floor(Math.random() * artists.length)];
    const randomTitle = titles[Math.floor(Math.random() * titles.length)];
    const randomCover = coverImages[Math.floor(Math.random() * coverImages.length)];
    
    extractedData = {
      ...extractedData,
      title: extractedData.title || randomTitle,
      artist: extractedData.artist || randomArtist,
      coverUrl: extractedData.coverUrl || randomCover
    };
  }
  
  return extractedData;
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
      if (!url.trim()) {
        throw new Error('Please enter a URL');
      }
      
      // Validate URL format
      const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
      const isSpotify = url.includes('spotify.com');
      
      if (!isYoutube && !isSpotify) {
        throw new Error('Only YouTube Music and Spotify links are supported');
      }
      
      const mockData = generateMockData(url);
      const newTrack: Track = {
        id: `track_${Date.now()}`,
        url,
        title: mockData.title || 'Unknown Title',
        artist: mockData.artist || 'Unknown Artist',
        coverUrl: mockData.coverUrl || '',
        isFavorite: false,
        source: mockData.source || 'youtube',
        embedCode: mockData.embedCode
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
      throw error; // Re-throw to let the UI handle it
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
