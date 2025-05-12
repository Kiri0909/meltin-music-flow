
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { Button } from "@/components/ui/button";
import { Heart, Play, Trash2, Image } from "lucide-react";
import Navbar from '@/components/Navbar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const Favorites = () => {
  const { tracks, playTrack, removeTrack, toggleFavorite, updateCoverImage } = useMusicPlayer();
  const [isChangeCoverDialogOpen, setIsChangeCoverDialogOpen] = useState(false);
  const [currentCoverTrack, setCurrentCoverTrack] = useState<{id: string, currentCover: string} | null>(null);
  const [newCoverUrl, setNewCoverUrl] = useState('');
  const [coverUrlError, setCoverUrlError] = useState<string | null>(null);
  
  const favoriteTracks = tracks.filter(track => track.isFavorite);
  
  const validateImageUrl = (url: string): boolean => {
    if (!url) return false;
    return url.match(/\.(jpeg|jpg|gif|png|webp)$/) !== null || 
           url.includes('images.unsplash.com') ||
           url.includes('scdn.co/image') ||
           url.includes('i.ytimg.com');
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
                          className="w-14 h-14 rounded bg-cover bg-center shrink-0 relative group cursor-pointer"
                          style={{ backgroundImage: `url(${track.coverUrl})` }}
                          onClick={() => openChangeCoverDialog(track)}
                        >
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded">
                            <Image size={16} className="text-white" />
                          </div>
                        </div>
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
                            onClick={() => openChangeCoverDialog(track)}
                            className="rounded-full h-9 w-9 hover:bg-blue-500/20"
                          >
                            <Image size={18} />
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
              <Image size={16} />
              Update Cover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Favorites;
