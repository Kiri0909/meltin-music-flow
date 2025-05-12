
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
  embedCode?: string;
  contentType?: 'track' | 'album' | 'playlist' | 'artist'; // Added content type field
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

// Function to determine content type from URL
const getContentTypeFromUrl = (url: string): 'track' | 'album' | 'playlist' | 'artist' => {
  // YouTube Music URLs
  if (url.includes('music.youtube.com')) {
    if (url.includes('/playlist?list=')) return 'playlist';
    if (url.includes('/album?list=')) return 'album';
    if (url.includes('/channel/')) return 'artist';
    return 'track'; // Default for YouTube Music
  }
  
  // Regular YouTube URLs
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    if (url.includes('list=')) return 'playlist';
    return 'track'; // Default for YouTube is track
  }
  
  // Spotify URLs
  if (url.includes('spotify.com')) {
    if (url.includes('/track/')) return 'track';
    if (url.includes('/album/')) return 'album';
    if (url.includes('/playlist/')) return 'playlist';
    if (url.includes('/artist/')) return 'artist';
  }
  
  return 'track'; // Default is track
};

// Function to generate embed code based on the URL
const generateEmbedCode = (url: string): string | undefined => {
  // For YouTube Music or regular YouTube
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    let videoId = '';
    let playlistId = '';
    let embedUrl = '';
    
    // Check if URL contains a playlist
    const playlistMatch = url.match(/[?&]list=([^&]+)/);
    if (playlistMatch) {
      playlistId = playlistMatch[1];
    }
    
    // Extract YouTube video ID from different URL formats
    if (url.includes('watch?v=')) {
      videoId = url.split('watch?v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('youtube.com/embed/')[1].split('?')[0];
    }
    
    // Construct the embed URL - ensure full playlist support for YouTube Music
    if (playlistId) {
      // Embed a playlist (with optional starting video)
      embedUrl = videoId
        ? `https://www.youtube.com/embed/${videoId}?list=${playlistId}&enablejsapi=1&origin=${window.location.origin}`
        : `https://www.youtube.com/embed/videoseries?list=${playlistId}&enablejsapi=1&origin=${window.location.origin}`;
    } else if (videoId) {
      // Embed a single video
      embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}`;
    }
    
    if (embedUrl) {
      return `<iframe width="100%" height="315" src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    }
  }
  
  // For Spotify
  if (url.includes('spotify.com')) {
    let contentId = '';
    let embedType = 'track'; // Default to track
    
    // Extract Spotify ID based on content type
    if (url.includes('/track/')) {
      contentId = url.split('/track/')[1].split('?')[0];
      embedType = 'track';
    } else if (url.includes('/album/')) {
      contentId = url.split('/album/')[1].split('?')[0];
      embedType = 'album';
    } else if (url.includes('/playlist/')) {
      contentId = url.split('/playlist/')[1].split('?')[0];
      embedType = 'playlist';
    } else if (url.includes('/artist/')) {
      contentId = url.split('/artist/')[1].split('?')[0];
      embedType = 'artist';
    }
    
    if (contentId) {
      // Set appropriate height based on content type
      let height = "152"; // Default for tracks
      
      if (embedType === 'album' || embedType === 'playlist') {
        height = "380";
      } else if (embedType === 'artist') {
        height = "380";
      }
      
      // Create the Spotify embed with compact=0 to allow full playback
      return `<iframe src="https://open.spotify.com/embed/${embedType}/${contentId}?utm_source=generator&theme=0&compact=0" width="100%" height="${height}" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
    }
  }
  
  return undefined;
};

// Function to generate mock data based on the URL
const generateMockData = (url: string): Partial<Track> & { embedCode?: string } => {
  // Identify the source
  const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
  const isSpotify = url.includes('spotify.com');
  
  if (!isYoutube && !isSpotify) {
    throw new Error('Only YouTube Music and Spotify links are supported');
  }
  
  // Determine content type
  const contentType = getContentTypeFromUrl(url);
  
  // Generate embed code based on the URL
  const embedCode = generateEmbedCode(url);
  
  // Extract data from the URL if possible
  let extractedData: Partial<Track> = { 
    source: isYoutube ? 'youtube' : 'spotify', 
    embedCode,
    contentType
  };

  // Extract YouTube information
  if (isYoutube) {
    try {
      let videoId = '';
      let playlistId = '';
      
      // Extract video and playlist IDs
      if (url.includes('watch?v=')) {
        videoId = url.split('watch?v=')[1].split('&')[0];
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
      }
      
      // Extract playlist ID if present
      const playlistMatch = url.match(/[?&]list=([^&]+)/);
      if (playlistMatch) {
        playlistId = playlistMatch[1];
      }
      
      // Generate identifier for title
      const idFirstChars = playlistId ? playlistId.substring(0, 5) : (videoId ? videoId.substring(0, 5) : '');
      
      let title, artist;
      
      if (contentType === 'playlist') {
        title = url.includes('music.youtube.com') ? `YouTube Music Playlist ${idFirstChars}` : `YouTube Playlist ${idFirstChars}`;
        artist = `Various Artists`;
      } else if (contentType === 'album') {
        title = `YouTube Music Album ${idFirstChars}`;
        artist = `Album Artist ${idFirstChars}`;
      } else if (contentType === 'artist') {
        title = `YouTube Music Artist ${idFirstChars}`;
        artist = title;
      } else {
        title = `YouTube Track ${idFirstChars}`;
        artist = `Artist ${idFirstChars}`;
      }
      
      extractedData = {
        ...extractedData,
        title,
        artist,
        coverUrl: videoId 
          ? `https://img.youtube.com/vi/${videoId}/0.jpg` 
          : 'https://i.ytimg.com/vi/default/hqdefault.jpg' // Default YouTube thumbnail
      };
    } catch (e) {
      console.error('Failed to extract YouTube data', e);
    }
  }
  
  // Extract Spotify information
  if (isSpotify) {
    try {
      let contentId = '';
      
      // Extract appropriate ID based on content type
      if (url.includes('/track/')) {
        contentId = url.split('/track/')[1].split('?')[0];
      } else if (url.includes('/album/')) {
        contentId = url.split('/album/')[1].split('?')[0];
        title = 'Spotify Album';
      } else if (url.includes('/playlist/')) {
        contentId = url.split('/playlist/')[1].split('?')[0];
        title = 'Spotify Playlist';
        artist = 'Various Artists';
      } else if (url.includes('/artist/')) {
        contentId = url.split('/artist/')[1].split('?')[0];
        title = 'Artist Profile';
        artist = title;
      }
      
      if (contentId) {
        // Use content ID to generate a title and artist
        const idFirstChars = contentId.substring(0, 3);
        
        if (contentType === 'track') {
          title = `Spotify Track ${idFirstChars}`;
          artist = `Artist ${idFirstChars}`;
        } else if (contentType === 'album') {
          title = `Spotify Album ${idFirstChars}`;
          artist = `Album Artist ${idFirstChars}`;
        } else if (contentType === 'playlist') {
          title = `Spotify Playlist ${idFirstChars}`;
          artist = `Various Artists`;
        } else if (contentType === 'artist') {
          title = `Spotify Artist ${idFirstChars}`;
          artist = title;
        }
        
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
      const contentType = getContentTypeFromUrl(url);
      
      const newTrack: Track = {
        id: `track_${Date.now()}`,
        url,
        title: mockData.title || 'Unknown Title',
        artist: mockData.artist || 'Unknown Artist',
        coverUrl: mockData.coverUrl || '',
        isFavorite: false,
        source: mockData.source || 'youtube',
        embedCode: mockData.embedCode,
        contentType: contentType
      };
      
      setTracks(prev => [newTrack, ...prev]);
      toast({
        title: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} Added`,
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
