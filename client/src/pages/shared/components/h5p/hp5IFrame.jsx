import React from 'react';

const VideoIframe = ({ videoUrl, width = '100%', height = '400px', className = '' }) => {
  return (
    <div className={`w-full mx-auto ${className}`}>
      <div className="relative overflow-hidden rounded-lg shadow-lg bg-gray-100">
        <iframe
          src={videoUrl}
          width={width}
          height={height}
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="w-full h-auto aspect-video"
          title="Video Player"
        />
      </div>
    </div>
  );
};
export default VideoIframe;
