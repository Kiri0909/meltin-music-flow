import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Repeat, 
  Shuffle, 
  Heart, 
  Plus, 
  Music2, 
  Trash2, 
  Pencil, 
  Link,
  Music,
  Album,
  Headphones,
  FileImage,
  DiscAlbum,
  Image
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { Badge } from "@/components/ui/badge";
import TrackEmbed from './TrackEmbed';

// Function to extract a potential cover image from YouTube URL
const getPreviewCoverForUrl = (url: string): string | null => {
  // If not a valid URL, return null
  if (!url || (!url.includes('youtube') && !url.includes('spotify'))) {
    return null;
  }
  
  // For YouTube, try to extract video ID for thumbnail
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    let videoId = '';
    
    // Extract YouTube video ID
    if (url.includes('watch?v=')) {
      videoId = url.split('watch?v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    }
    
    if (videoId) {
      return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    }
    
    // For playlists without a video ID, return a music-themed image
    if (url.includes('list=')) {
      return 'https://i.ytimg.com/vi_webp/qOOqQ3m_awA/maxresdefault.webp';
    }
  }
  
  // For Spotify links, return a generic Spotify cover based on content type
  if (url.includes('spotify.com')) {
    if (url.includes('/track/')) {
      return 'https://i.scdn.co/image/ab67616d0000b273608140c63299dfde25527028';
    } else if (url.includes('/album/')) {
      return 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36';
    } else if (url.includes('/playlist/')) {
      return 'https://i.scdn.co/image/ab67706f000000033f861d7f7b4fccd5a186f7bb';
    } else if (url.includes('/artist/')) {
      return 'https://i.scdn.co/image/ab6761610000e5ebb894ef9fa437b0389c5567cc';
    }
  }
  
  return null;
};

export const MusicPlayer = () => {
  const { 
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
    toggleShuffle,
    updateCoverImage
  } = useMusicPlayer();

  const [progress, setProgress] = useState(0);
  const [inputUrl, setInputUrl] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isChangeCoverDialogOpen, setIsChangeCoverDialogOpen] = useState(false);
  const [currentEditTrack, setCurrentEditTrack] = useState<{id: string, title: string, artist: string} | null>(null);
  const [currentCoverTrack, setCurrentCoverTrack] = useState<{id: string, currentCover: string} | null>(null);
  const [newCoverUrl, setNewCoverUrl] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [previewCover, setPreviewCover] = useState<string | null>(null);
  const [coverUrlError, setCoverUrlError] = useState<string | null>(null);

  // Simulate progress bar
  useEffect(() => {
    let interval: number | undefined;
    
    if (isPlaying) {
      interval = window.setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            nextTrack();
            return 0;
          }
          return prev + 0.5;
        });
      }, 500);
    }
    
    return () => clearInterval(interval);
  }, [isPlaying, nextTrack]);

  // Update preview cover whenever URL changes
  useEffect(() => {
    if (inputUrl) {
      const cover = getPreviewCoverForUrl(inputUrl);
      setPreviewCover(cover);
    } else {
      setPreviewCover(null);
    }
  }, [inputUrl]);

  const handlePlayPause = () => {
    if (tracks.length === 0) return;
    
    if (currentTrackIndex === null) {
      playTrack(0);
    } else {
      isPlaying ? pauseTrack() : resumeTrack();
    }
  };

  const validateMusicUrl = (url: string): boolean => {
    // Check for YouTube Music or Spotify URLs
    const ytMusicRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch|youtu\.be\/|music\.youtube\.com)/i;
    const spotifyRegex = /^(https?:\/\/)?(open\.spotify\.com|spotify\.com)/i;
    
    return ytMusicRegex.test(url) || spotifyRegex.test(url);
  };

  const validateImageUrl = (url: string): boolean => {
    if (!url) return false;
    return url.match(/\.(jpeg|jpg|gif|png|webp)$/) !== null || 
           url.includes('images.unsplash.com') ||
           url.includes('scdn.co/image') ||
           url.includes('i.ytimg.com');
  };

  const handleAddTrack = async () => {
    if (!inputUrl) {
      setUrlError("Please enter a URL");
      return;
    }
    
    if (!validateMusicUrl(inputUrl)) {
      setUrlError("Please enter a valid YouTube or Spotify URL");
      return;
    }
    
    setUrlError(null);
    try {
      await addTrack(inputUrl);
      setInputUrl('');
      setPreviewCover(null);
      setIsAddDialogOpen(false);
    } catch (error) {
      // Error is already handled in the context with toast
    }
  };

  const handleEditTrack = () => {
    if (!currentEditTrack) return;
    
    updateTrack(currentEditTrack.id, {
      title: currentEditTrack.title,
      artist: currentEditTrack.artist
    });
    
    setIsEditDialogOpen(false);
    setCurrentEditTrack(null);
  };

  const openEditDialog = (track: typeof tracks[0]) => {
    setCurrentEditTrack({
      id: track.id,
      title: track.title,
      artist: track.artist
    });
    setIsEditDialogOpen(true);
  };

  const openChangeCoverDialog = (track: typeof tracks[0]) => {
    setCurrentCoverTrack({
      id: track.id,
      currentCover: track.coverUrl
    });
    setNewCoverUrl('');
    setIsChangeCoverDialogOpen(true);
  };

  const handleChangeCover = () => {
    if (!currentCoverTrack || !newCoverUrl) return;
    
    if (!validateImageUrl(newCoverUrl)) {
      setCoverUrlError("Please enter a valid image URL");
      return;
    }
    
    updateCoverImage(currentCoverTrack.id, newCoverUrl);
    setIsChangeCoverDialogOpen(false);
    setCurrentCoverTrack(null);
    setNewCoverUrl('');
  };

  const getSourceIcon = (source: 'youtube' | 'spotify') => {
    return (
      <Badge variant="outline" className={`text-xs ${source === 'youtube' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
        {source === 'youtube' ? (
          <>
            <Headphones size={12} className="mr-1" />
            YouTube
          </>
        ) : (
          <>
            <Music size={12} className="mr-1" />
            Spotify
          </>
        )}
      </Badge>
    );
  };
  
  const getContentTypeIcon = (contentType?: 'track' | 'album' | 'playlist' | 'artist') => {
    switch (contentType) {
      case 'album':
        return <Album size={16} className="mr-1" />;
      case 'playlist':
        return <Music2 size={16} className="mr-1" />;
      case 'artist':
        return <Headphones size={16} className="mr-1" />;
      default:
        return <Music size={16} className="mr-1" />;
    }
  };

  const currentTrack = currentTrackIndex !== null ? tracks[currentTrackIndex] : null;

  return (
    <div className="w-full music-player-container min-h-[80vh] rounded-xl overflow-hidden animate-fade-in">
      <div className="player-content p-4 md:p-6 h-full flex flex-col">
        {/* Player Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-meltin animate-gradient-shift">
            Your Music Collection
          </h2>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="glass-card flex items-center gap-2" 
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus size={18} />
              <span>Add Music</span>
            </Button>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
          {/* Playlist Section */}
          <Card className="glass-card overflow-hidden">
            <CardContent className="p-4 h-full">
              {tracks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-float">
                  <Music2 size={48} className="mb-4 text-meltin-purple opacity-70" />
                  <h3 className="text-xl font-medium">No music in collection</h3>
                  <p className="text-sm text-gray-400 mt-2">
                    Add YouTube or Spotify links to create your collection
                  </p>
                </div>
              ) : (
                <div className="space-y-2 overflow-y-auto pr-2 max-h-[50vh]">
                  {tracks.map((track, index) => (
                    <div 
                      key={track.id}
                      className={`flex items-center p-2 rounded-lg transition-all duration-300 gap-3
                        ${currentTrackIndex === index ? 
                          'bg-meltin-purple/20 shadow-md animate-pulse-glow' : 
                          'hover:bg-white/5'
                        }`}
                    >
                      <div 
                        className="w-12 h-12 rounded bg-cover bg-center shrink-0 relative group cursor-pointer"
                        style={{ backgroundImage: `url(${track.coverUrl})` }}
                        onClick={() => openChangeCoverDialog(track)}
                      >
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded">
                          <Image size={16} className="text-white" />
                        </div>
                      </div>
                      <div className="flex-grow min-w-0" onClick={() => playTrack(index)}>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium truncate">{track.title}</h3>
                          {getSourceIcon(track.source)}
                        </div>
                        <div className="flex items-center text-sm text-gray-400">
                          {track.contentType && (
                            <Badge variant="outline" className="mr-2 text-[10px] flex items-center">
                              {getContentTypeIcon(track.contentType)}
                              {track.contentType.charAt(0).toUpperCase() + track.contentType.slice(1)}
                            </Badge>
                          )}
                          <span className="truncate">{track.artist}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => toggleFavorite(track.id)}
                          className="h-8 w-8"
                        >
                          <Heart 
                            size={18} 
                            className={track.isFavorite ? 'fill-meltin-pink text-meltin-pink' : ''} 
                          />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openEditDialog(track)}
                          className="h-8 w-8"
                        >
                          <Pencil size={18} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeTrack(track.id)}
                          className="h-8 w-8"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Now Playing Section */}
          <Card className="glass-card overflow-hidden flex flex-col">
            <CardContent className="p-4 flex-grow flex flex-col">
              {currentTrack ? (
                <>
                  <div className="relative">
                    <TrackEmbed 
                      embedCode={currentTrack.embedCode} 
                      coverUrl={currentTrack.coverUrl}
                      isPlaying={isPlaying}
                      onEnd={nextTrack}
                      onReady={() => console.log("Player ready")}
                      onChangeCover={() => openChangeCoverDialog(currentTrack)}
                    />
                    
                    {!currentTrack.embedCode && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 text-white border-white/20 hover:bg-black/70"
                        onClick={() => openChangeCoverDialog(currentTrack)}
                      >
                        <Image size={14} />
                        <span className="text-xs">Change Cover</span>
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-center gap-2 mb-1">
                    <div className="flex items-center gap-2 justify-center">
                      <h3 className="font-bold text-xl text-center">{currentTrack.title}</h3>
                      {getSourceIcon(currentTrack.source)}
                    </div>
                    <div className="flex items-center gap-2">
                      {currentTrack.contentType && (
                        <Badge variant="outline" className="flex items-center">
                          {getContentTypeIcon(currentTrack.contentType)}
                          {currentTrack.contentType.charAt(0).toUpperCase() + currentTrack.contentType.slice(1)}
                        </Badge>
                      )}
                      <p className="text-gray-400">{currentTrack.artist}</p>
                    </div>
                  </div>
                  
                  {!currentTrack.embedCode && (
                    <div className="w-full mb-6">
                      <Slider
                        value={[progress]}
                        max={100}
                        step={0.1}
                        className="mb-2"
                      />
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>0:00</span>
                        <span>3:45</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-8 animate-float">
                  <Music2 size={48} className="mb-4 text-meltin-purple opacity-70" />
                  <h3 className="text-xl font-medium">No music playing</h3>
                  <p className="text-sm text-gray-400 mt-2">
                    Select a track, album, playlist, or artist from your collection to start listening
                  </p>
                </div>
              )}

              {/* Player Controls */}
              <div className="flex items-center justify-center gap-2 mt-auto">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleShuffle}
                  className={`control-button ${isShuffle ? 'bg-meltin-purple/30 text-meltin-purple' : ''}`}
                >
                  <Shuffle size={20} />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevTrack}
                  disabled={tracks.length === 0}
                  className="control-button"
                >
                  <SkipBack size={24} />
                </Button>
                
                <Button
                  variant={isPlaying ? "outline" : "default"}
                  size="icon"
                  onClick={handlePlayPause}
                  disabled={tracks.length === 0}
                  className={`control-button ${isPlaying ? '' : 'play-button'} w-12 h-12`}
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextTrack}
                  disabled={tracks.length === 0}
                  className="control-button"
                >
                  <SkipForward size={24} />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleLoop}
                  className={`control-button ${isLooping ? 'bg-meltin-purple/30 text-meltin-purple' : ''}`}
                >
                  <Repeat size={20} />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Music Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        setIsAddDialogOpen(open);
        if (!open) {
          setUrlError(null);
          setInputUrl('');
          setPreviewCover(null);
        }
      }}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>Add Music</DialogTitle>
            <DialogDescription>
              Paste a YouTube Music or Spotify link to add tracks, albums, playlists, or artists
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                {inputUrl && validateMusicUrl(inputUrl) ? (
                  inputUrl.includes('youtube') ? (
                    <Headphones size={18} className="text-red-500" />
                  ) : (
                    <Music size={18} className="text-green-500" />
                  )
                ) : (
                  <Link size={18} className="text-muted-foreground" />
                )}
              </div>
              <Input
                placeholder="Paste YouTube or Spotify URL"
                value={inputUrl}
                onChange={(e) => {
                  setInputUrl(e.target.value);
                  if (e.target.value && !validateMusicUrl(e.target.value)) {
                    setUrlError("Please enter a valid YouTube or Spotify URL");
                  } else {
                    setUrlError(null);
                  }
                }}
                className="pl-10"
              />
            </div>
            
            {/* Preview Cover Image */}
            {previewCover && validateMusicUrl(inputUrl) && (
              <div className="flex justify-center py-2">
                <div className="relative group">
                  <img 
                    src={previewCover} 
                    alt="Preview" 
                    className="w-24 h-24 object-cover rounded-md shadow-md"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center transition-all rounded-md">
                    <DiscAlbum className="text-white opacity-0 group-hover:opacity-80 w-8 h-8" />
                  </div>
                </div>
              </div>
            )}
            
            {urlError && (
              <p className="text-xs text-destructive">
                {urlError}
              </p>
            )}
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-medium">Supported formats:</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-red-500/10 text-red-500">
                  <Headphones size={12} className="mr-1" />
                  YouTube
                </Badge>
                <div className="flex flex-col">
                  <span className="text-xs truncate">Track: https://www.youtube.com/watch?v=dQw4w9WgXcQ</span>
                  <span className="text-xs truncate">Playlist: https://music.youtube.com/playlist?list=PLAYLIST_ID</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-500/10 text-green-500">
                  <Music size={12} className="mr-1" />
                  Spotify
                </Badge>
                <div className="flex flex-col">
                  <span className="text-xs truncate">Track/Album: https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT</span>
                  <span className="text-xs truncate">Artist/Playlist: https://open.spotify.com/artist/ARTIST_ID</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              setUrlError(null);
              setInputUrl('');
              setPreviewCover(null);
            }}>Cancel</Button>
            <Button 
              onClick={handleAddTrack}
              disabled={!inputUrl || !!urlError}
              className="flex items-center gap-2"
            >
              <FileImage size={16} />
              Add Music
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Track Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>Edit Music Details</DialogTitle>
            <DialogDescription>
              Customize the music details
            </DialogDescription>
          </DialogHeader>
          {currentEditTrack && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={currentEditTrack.title}
                  onChange={(e) => setCurrentEditTrack({...currentEditTrack, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Artist</label>
                <Input
                  value={currentEditTrack.artist}
                  onChange={(e) => setCurrentEditTrack({...currentEditTrack, artist: e.target.value})}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditTrack}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Cover Image Dialog */}
      <Dialog open={isChangeCoverDialogOpen} onOpenChange={(open) => {
        setIsChangeCoverDialogOpen(open);
        if (!open) {
          setCoverUrlError(null);
          setNewCoverUrl('');
        }
      }}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>Change Cover Image</DialogTitle>
            <DialogDescription>
              Enter a URL for the new cover image
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {currentCoverTrack && (
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <img 
                    src={currentCoverTrack.currentCover} 
                    alt="Current Cover" 
                    className="w-32 h-32 object-cover rounded-md shadow-md"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-all rounded-md">
                    <p className="text-white text-xs">Current Cover</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium">New Cover URL</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Image size={18} className="text-muted-foreground" />
                </div>
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={newCoverUrl}
                  onChange={(e) => {
                    setNewCoverUrl(e.target.value);
                    setCoverUrlError(null);
                  }}
                  className="pl-10"
                />
              </div>
              
              {coverUrlError && (
                <p className="text-xs text-destructive">
                  {coverUrlError}
                </p>
              )}
              
              {newCoverUrl && validateImageUrl(newCoverUrl) && (
                <div className="flex justify-center py-2">
                  <div className="relative">
                    <img 
                      src={newCoverUrl} 
                      alt="New Cover"
                      className="w-32 h-32 object-cover rounded-md shadow-md"
                      onError={() => setCoverUrlError("Invalid image URL or image cannot be loaded")}
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-all rounded-md">
                      <p className="text-white text-xs">New Cover</p>
                    </div>
                  </div>
                </div>
              )}
              
              <p className="text-xs text-muted-foreground">
                Enter the URL of an image to use as the new cover. Supported formats: JPEG, PNG, GIF, WEBP.
              </p>
              
              <div className="grid grid-cols-3 gap-2 mt-4">
                <Button 
                  variant="outline" 
                  className="h-16 p-0 overflow-hidden" 
                  onClick={() => setNewCoverUrl("https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05")}
                >
                  <img 
                    src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=100&h=100&auto=format&fit=crop&crop=center" 
                    alt="Foggy mountains"
                    className="w-full h-full object-cover"
                  />
                </Button>
                <Button 
                  variant="outline" 
                  className="h-16 p-0 overflow-hidden" 
                  onClick={() => setNewCoverUrl("https://images.unsplash.com/photo-1493962853295-0fd70327578a")}
                >
                  <img 
                    src="https://images.unsplash.com/photo-1493962853295-0fd70327578a?w=100&h=100&auto=format&fit=crop&crop=center" 
                    alt="Brown ox on mountain"
                    className="w-full h-full object-cover"
                  />
                </Button>
                <Button 
                  variant="outline" 
                  className="h-16 p-0 overflow-hidden" 
                  onClick={() => setNewCoverUrl("https://images.unsplash.com/photo-1486718448742-163732cd1544")}
                >
                  <img 
                    src="https://images.unsplash.com/photo-1486718448742-163732cd1544?w=100&h=100&auto=format&fit=crop&crop=center" 
                    alt="Abstract structure"
                    className="w-full h-full object-cover"
                  />
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsChangeCoverDialogOpen(false);
              setCoverUrlError(null);
              setNewCoverUrl('');
            }}>Cancel</Button>
            <Button 
              onClick={handleChangeCover}
              disabled={!newCoverUrl}
              className="flex items-center gap-2"
            >
              <FileImage size={16} />
              Update Cover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MusicPlayer;
