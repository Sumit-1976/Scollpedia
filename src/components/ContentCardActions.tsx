import React from 'react';
import { Heart, Share2, Bookmark } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface ContentCardActionsProps {
  liked: boolean;
  saved: boolean;
  onLike: () => void;
  onSave: () => void;
  onShare: () => void;
}

const ContentCardActions: React.FC<ContentCardActionsProps> = ({
  liked,
  saved,
  onLike,
  onSave,
  onShare
}) => {
  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="ghost" 
        size="icon" 
        className={`like-button ${liked ? 'active' : ''}`} 
        onClick={onLike}
      >
        <Heart className="h-5 w-5" fill={liked ? "currentColor" : "none"} />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className={`save-button ${saved ? 'active' : ''}`} 
        onClick={onSave}
      >
        <Bookmark className="h-5 w-5" fill={saved ? "currentColor" : "none"} />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="share-button" 
        onClick={onShare}
      >
        <Share2 className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default ContentCardActions;