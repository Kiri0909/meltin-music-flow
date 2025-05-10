
import React, { useEffect, useRef } from 'react';

interface TrackEmbedProps {
  embedCode: string | undefined;
  coverUrl: string;
  isPlaying: boolean;
  onReady?: () => void;
  onEnd?: () => void;
}

const TrackEmbed: React.FC<TrackEmbedProps> = ({ 
  embedCode, 
  coverUrl, 
  isPlaying, 
  onReady, 
  onEnd 
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
      <div 
        className="w-40 h-40 md:w-48 md:h-48 rounded-lg bg-cover bg-center mb-6 shadow-xl animate-float mx-auto"
        style={{ backgroundImage: `url(${coverUrl})` }}
      />
    );
  }

  // Determine if this is a Spotify embed to apply proper styling
  const isSpotify = embedCode.includes('spotify.com');

  return (
    <div className="w-full mb-6">
      <div
        ref={embedRef}
        className={`w-full rounded-lg overflow-hidden ${isSpotify ? 'aspect-[16/9] md:aspect-[16/8]' : 'aspect-video'}`}
        dangerouslySetInnerHTML={{ __html: embedCode }}
      />
    </div>
  );
};

export default TrackEmbed;
