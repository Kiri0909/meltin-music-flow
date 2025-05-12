
import React, { useState, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { Button } from "@/components/ui/button";
import { Heart, Play, Trash2, Image, FileImage, X } from "lucide-react";
import Navbar from '@/components/Navbar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const Favorites = () => {
  const { tracks, playTrack, removeTrack, toggleFavorite, updateCoverImage } = useMusicPlayer();
  const { toast } = useToast();
  const [isChangeCoverDialogOpen, setIsChangeCoverDialogOpen] = useState(false);
  const [currentCoverTrack, setCurrentCoverTrack] = useState<{id: string, currentCover: string} | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const favoriteTracks = tracks.filter(track => track.isFavorite);
  
  const openChangeCoverDialog = (track: typeof tracks[0]) => {
    setCurrentCoverTrack({
      id: track.id,
      currentCover: track.coverUrl
    });
    setSelectedImageFile(null);
    setSelectedImagePreview(null);
    setIsChangeCoverDialogOpen(true);
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file (JPEG, PNG, GIF, etc.)",
        variant: "destructive"
      });
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Image file must be less than 5MB",
        variant: "destructive"
      });
      return;
    }
    
    // Create a preview
    const objectUrl = URL.createObjectURL(file);
    setSelectedImageFile(file);
    setSelectedImagePreview(objectUrl);
    
    // Clean up object URL when component unmounts
    return () => URL.revokeObjectURL(objectUrl);
  };

  const handleChangeCover = () => {
    if (!currentCoverTrack || !selectedImageFile) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        // Use the data URL as the cover image
        updateCoverImage(currentCoverTrack.id, e.target.result as string);
        setIsChangeCoverDialogOpen(false);
        setCurrentCoverTrack(null);
        setSelectedImageFile(null);
        setSelectedImagePreview(null);
      }
    };
    reader.readAsDataURL(selectedImageFile);
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
          setSelectedImageFile(null);
          setSelectedImagePreview(null);
        }
      }}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>Change Cover Image</DialogTitle>
            <DialogDescription>
              Select an image from your device to use as cover art
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
            
            <div className="space-y-4">
              {/* Hidden file input */}
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
              />
              
              {/* Custom upload button */}
              <div className="flex flex-col items-center gap-3">
                <Button 
                  variant="outline"
                  onClick={triggerFileInput}
                  className="w-full h-20 border-dashed border-2 flex flex-col items-center justify-center gap-2"
                >
                  <FileImage size={24} className="text-primary/70" />
                  <span className="text-sm">Click to browse for an image</span>
                </Button>
                
                <p className="text-xs text-muted-foreground text-center">
                  Supported formats: JPEG, PNG, GIF, WebP<br />
                  Max file size: 5MB
                </p>
              </div>
              
              {/* Preview of selected image */}
              {selectedImagePreview && (
                <div className="flex flex-col items-center gap-2 mt-4">
                  <div className="relative">
                    <img 
                      src={selectedImagePreview} 
                      alt="Selected Cover" 
                      className="w-40 h-40 object-cover rounded-lg shadow-md"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 bg-black/60 border-none text-white hover:bg-black/80 rounded-full"
                      onClick={() => {
                        setSelectedImageFile(null);
                        setSelectedImagePreview(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                  <p className="text-sm font-medium">New Cover</p>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsChangeCoverDialogOpen(false);
              setSelectedImageFile(null);
              setSelectedImagePreview(null);
            }}>Cancel</Button>
            <Button 
              onClick={handleChangeCover}
              disabled={!selectedImageFile}
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

export default Favorites;
