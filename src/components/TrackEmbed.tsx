
import React from 'react';

interface TrackEmbedProps {
  embedCode: string | undefined;
  coverUrl: string;
}

const TrackEmbed: React.FC<TrackEmbedProps> = ({ embedCode, coverUrl }) => {
  if (!embedCode) {
    return (
      <div 
        className="w-40 h-40 md:w-48 md:h-48 rounded-lg bg-cover bg-center mb-6 shadow-xl animate-float mx-auto"
        style={{ backgroundImage: `url(${coverUrl})` }}
      />
    );
  }

  // Use a more responsive wrapper for embeds
  return (
    <div className="w-full mb-6">
      <div
        className="w-full rounded-lg overflow-hidden aspect-video"
        dangerouslySetInnerHTML={{ __html: embedCode }}
      />
    </div>
  );
};

export default TrackEmbed;
