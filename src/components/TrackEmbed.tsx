
import React, { useEffect, useRef } from 'react';
import { DiscAlbum, Image } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TrackEmbedProps {
  embedCode: string | undefined;
  coverUrl: string;
  isPlaying: boolean;
  onReady?: () => void;
  onEnd?: () => void;
  onChangeCover?: () => void; // New prop for handling cover change
}

const TrackEmbed: React.FC<TrackEmbedProps> = ({ 
  embedCode, 
  coverUrl, 
  isPlaying, 
  onReady, 
  onEnd,
  onChangeCover
}) => {
  const embedRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  
  useEffect(() => {
    // Handle message events from embedded iframes (for player controls)
    const handleMessage = (event: MessageEvent) => {
      // Only handle messages from YouTube or Spotify embeds
      if (
        event.origin !== "https://www.youtube.com" && 
        !event.origin.includes("spotify.com")
      ) {
        return;
      }
      
      // Process message data from players
      if (event.data && typeof event.data === 'object') {
        // YouTube player events
        if (event.data.event === 'onStateChange' && event.data.info === 0) {
          // Video ended (state 0)
          onEnd && onEnd();
        } else if (event.data.event === 'onReady') {
          // Player is ready
          onReady && onReady();
        }
        
        // Spotify specific events would be handled here
        // Spotify doesn't send the same events, but would use a different pattern
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onEnd, onReady]);
  
  useEffect(() => {
    // Control playback based on isPlaying prop
    if (embedRef.current && playerRef.current) {
      try {
        if (isPlaying) {
          playerRef.current.playVideo && playerRef.current.playVideo();
        } else {
          playerRef.current.pauseVideo && playerRef.current.pauseVideo();
        }
      } catch (error) {
        console.log("Cannot control player directly:", error);
      }
    }
  }, [isPlaying]);

  if (!embedCode) {
    return (
      <div className="relative flex flex-col items-center justify-center">
        <div 
          className="w-40 h-40 md:w-48 md:h-48 rounded-lg bg-cover bg-center mb-6 shadow-xl animate-float mx-auto relative overflow-hidden"
          style={{ backgroundImage: `url(${coverUrl})` }}
        >
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <DiscAlbum className="w-12 h-12 text-white opacity-80" />
          </div>
          
          {/* Add image attachment button */}
          {onChangeCover && (
            <Button
              variant="outline"
              size="icon"
              onClick={onChangeCover}
              className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 border border-white/20"
            >
              <Image size={16} className="text-white" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Determine if this is a Spotify embed and what type (track, album, playlist, artist)
  const isSpotify = embedCode.includes('spotify.com');
  const isSpotifyArtist = isSpotify && embedCode.includes('/artist/');
  const isSpotifyPlaylist = isSpotify && embedCode.includes('/playlist/');
  const isSpotifyAlbum = isSpotify && embedCode.includes('/album/');
  
  // Determine if this is a YouTube embed and what type
  const isYouTubePlaylist = embedCode.includes('youtube.com') && embedCode.includes('list=');

  // Apply different aspect ratios based on content type
  let aspectRatioClass = 'aspect-video'; // default for tracks
  
  if (isSpotifyArtist || isSpotifyPlaylist || isSpotifyAlbum) {
    aspectRatioClass = 'aspect-[16/12] md:aspect-[16/10]'; // taller for collections
  }
  
  if (isYouTubePlaylist) {
    aspectRatioClass = 'aspect-[16/10] md:aspect-[16/9]'; // properly sized for YT playlists
  }

  return (
    <div className="w-full mb-6">
      <div
        ref={embedRef}
        className={`w-full rounded-lg overflow-hidden shadow-lg ${aspectRatioClass}`}
        dangerouslySetInnerHTML={{ __html: embedCode }}
      />
    </div>
  );
};

export default TrackEmbed;
