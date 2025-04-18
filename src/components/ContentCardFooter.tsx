import React from 'react';
import { ExternalLink } from 'lucide-react';
import { CardFooter } from "@/components/ui/card";
import ContentCardActions from './ContentCardActions';

interface ContentCardFooterProps {
  source: string;
  sourceUrl: string;
  liked: boolean;
  saved: boolean;
  onLike: () => void;
  onSave: () => void;
  onShare: () => void;
}

const ContentCardFooter: React.FC<ContentCardFooterProps> = ({
  source,
  sourceUrl,
  liked,
  saved,
  onLike,
  onSave,
  onShare
}) => {
  return (
    <CardFooter className="flex justify-between pt-2 border-t flex-shrink-0">
      <ContentCardActions 
        liked={liked}
        saved={saved}
        onLike={onLike}
        onSave={onSave}
        onShare={onShare}
      />
      
      <a 
        href={sourceUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
      >
        Source: {source}
        <ExternalLink className="h-3 w-3" />
      </a>
    </CardFooter>
  );
};

export default ContentCardFooter;