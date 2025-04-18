import React from 'react';

interface ContentCardImageProps {
  imageUrl?: string;
  title: string;
}

const ContentCardImage: React.FC<ContentCardImageProps> = ({ imageUrl, title }) => {
  if (!imageUrl) return null;
  
  return (
    <div className="px-6 pb-4 flex-shrink-0">
      <img 
        src={imageUrl} 
        alt={title} 
        className="w-full h-48 object-cover rounded-md"
        onError={(e) => {
          // Replace broken images with a placeholder
          e.currentTarget.src = 'https://placehold.co/400x300?text=No+Image';
        }}
      />
    </div>
  );
};

export default ContentCardImage;