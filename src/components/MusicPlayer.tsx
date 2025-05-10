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
  Bot,
  Music
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { Badge } from "@/components/ui/badge";
import TrackEmbed from './TrackEmbed';

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
    toggleShuffle
  } = useMusicPlayer();

  const [progress, setProgress] = useState(0);
  const [inputUrl, setInputUrl] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentEditTrack, setCurrentEditTrack] = useState<{id: string, title: string, artist: string} | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isBotConnected, setIsBotConnected] = useState(false);

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

  const handlePlayPause = () => {
    if (tracks.length === 0) return;
    
    if (currentTrackIndex === null) {
      playTrack(0);
    } else {
      isPlaying ? pauseTrack() : resumeTrack();
    }
  };

  const validateMusicUrl = (url: string): boolean => {
    // Check for YouTube Music, Spotify URLs, or Discord bot links
    const ytMusicRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch|youtu\.be\/|music\.youtube\.com)/i;
    const spotifyRegex = /^(https?:\/\/)?(open\.spotify\.com|spotify\.com)/i;
    const discordRegex = /^(https?:\/\/)?(discord\.gg\/|discord\.com\/invite\/)/i;
    
    return ytMusicRegex.test(url) || spotifyRegex.test(url) || discordRegex.test(url);
  };

  const handleAddTrack = async () => {
    if (!inputUrl) {
      setUrlError("Please enter a URL");
      return;
    }
    
    if (!validateMusicUrl(inputUrl)) {
      setUrlError("Please enter a valid YouTube Music, Spotify URL, or Discord bot invite");
      return;
    }
    
    setUrlError(null);
    try {
      await addTrack(inputUrl);
      setInputUrl('');
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

  const connectBot = () => {
    setIsBotConnected(true);
    // In a real implementation, this would establish a connection to the bot
  };

  const getSourceIcon = (source: 'youtube' | 'spotify') => {
    return (
      <Badge variant="outline" className={`text-xs ${source === 'youtube' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
        {source === 'youtube' ? 'YouTube' : 'Spotify'}
      </Badge>
    );
  };

  const currentTrack = currentTrackIndex !== null ? tracks[currentTrackIndex] : null;
  const isDiscordBot = currentTrack?.title === 'Discord Music Bot';

  return (
    <div className="w-full music-player-container min-h-[80vh] rounded-xl overflow-hidden animate-fade-in">
      <div className="player-content p-4 md:p-6 h-full flex flex-col">
        {/* Player Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-meltin animate-gradient-shift">
            Your Playlist
          </h2>
          <div className="flex gap-2">
            {isBotConnected && (
              <Badge variant="outline" className="bg-purple-500/20 text-purple-400 flex items-center gap-1">
                <Bot size={12} />
                <span>Bot Active</span>
              </Badge>
            )}
            <Button 
              variant="outline" 
              className="glass-card flex items-center gap-2" 
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus size={18} />
              <span>Link</span>
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
                  <h3 className="text-xl font-medium">No playlist linked</h3>
                  <p className="text-sm text-gray-400 mt-2">
                    Add YouTube Music, Spotify links, or a Discord bot to create your playlist
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
                        className="w-12 h-12 rounded bg-cover bg-center shrink-0"
                        style={{ backgroundImage: `url(${track.coverUrl})` }}
                      />
                      <div className="flex-grow min-w-0" onClick={() => playTrack(index)}>
                        <div className="flex items-center gap-2">
                          {track.title === 'Discord Music Bot' ? (
                            <div className="flex items-center gap-1">
                              <Bot size={16} />
                              <h3 className="font-medium truncate">{track.title}</h3>
                            </div>
                          ) : (
                            <>
                              <h3 className="font-medium truncate">{track.title}</h3>
                              {getSourceIcon(track.source)}
                            </>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {track.title !== 'Discord Music Bot' && (
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
                        )}
                        {track.title === 'Discord Music Bot' ? (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={connectBot}
                            className="h-8 w-8"
                            title="Connect to Discord Bot"
                          >
                            <Bot size={18} />
                          </Button>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => openEditDialog(track)}
                            className="h-8 w-8"
                          >
                            <Pencil size={18} />
                          </Button>
                        )}
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
                  <TrackEmbed 
                    embedCode={currentTrack.embedCode} 
                    coverUrl={currentTrack.coverUrl}
                    isPlaying={isPlaying}
                    onEnd={nextTrack}
                    onReady={() => console.log("Player ready")}
                  />
                  
                  <div className="flex items-center gap-2 mb-1 justify-center">
                    <h3 className="font-bold text-xl text-center">{currentTrack.title}</h3>
                    {currentTrack.title !== 'Discord Music Bot' && getSourceIcon(currentTrack.source)}
                    {currentTrack.title === 'Discord Music Bot' && (
                      <Badge variant="outline" className="bg-purple-500/20 text-purple-400">
                        <Bot size={12} className="mr-1" />
                        Bot
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-400 text-center mb-6">{currentTrack.artist}</p>
                  
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
                  <h3 className="text-xl font-medium">No track playing</h3>
                  <p className="text-sm text-gray-400 mt-2">
                    Select a track from your playlist to start listening
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

      {/* Add Track Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        setIsAddDialogOpen(open);
        if (!open) {
          setUrlError(null);
          setInputUrl('');
        }
      }}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>Add New Track or Bot</DialogTitle>
            <DialogDescription>
              Paste a YouTube Music, Spotify link, or Discord bot invite to add it to your playlist
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                {inputUrl && validateMusicUrl(inputUrl) ? (
                  inputUrl.includes('youtube') ? (
                    <Music size={18} className="text-red-500" />
                  ) : inputUrl.includes('spotify') ? (
                    <Music size={18} className="text-green-500" />
                  ) : inputUrl.includes('discord') ? (
                    <Bot size={18} className="text-purple-500" />
                  ) : (
                    <Link size={18} className="text-muted-foreground" />
                  )
                ) : (
                  <Link size={18} className="text-muted-foreground" />
                )}
              </div>
              <Input
                placeholder="Paste YouTube Music, Spotify URL, or Discord bot invite"
                value={inputUrl}
                onChange={(e) => {
                  setInputUrl(e.target.value);
                  if (e.target.value && !validateMusicUrl(e.target.value)) {
                    setUrlError("Please enter a valid YouTube Music, Spotify URL, or Discord bot invite");
                  } else {
                    setUrlError(null);
                  }
                }}
                className="pl-10"
              />
            </div>
            {urlError && (
              <p className="text-xs text-destructive">
                {urlError}
              </p>
            )}
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-medium">Supported formats:</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-red-500/10 text-red-500">YouTube</Badge>
                <span className="text-xs truncate">https://www.youtube.com/watch?v=dQw4w9WgXcQ</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-500/10 text-green-500">Spotify</Badge>
                <span className="text-xs truncate">https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-purple-500/10 text-purple-500">Discord Bot</Badge>
                <span className="text-xs truncate">https://discord.gg/ba35vUk</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              setUrlError(null);
              setInputUrl('');
            }}>Cancel</Button>
            <Button 
              onClick={handleAddTrack}
              disabled={!inputUrl || !!urlError}
            >
              Add Track
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Track Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>Edit Track</DialogTitle>
            <DialogDescription>
              Customize the track details
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
    </div>
  );
};

export default MusicPlayer;
