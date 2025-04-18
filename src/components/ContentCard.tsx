import React from 'react';
import { Card } from "@/components/ui/card";
import ContentCardHeader from './ContentCardHeader';
import ContentCardImage from './ContentCardImage';
import ContentCardBody from './ContentCardBody';
import ContentCardFooter from './ContentCardFooter';
import ShareDialog from './ShareDialog';
import { useCardInteractions } from '@/hooks/useCardInteractions';

type ContentCardProps = {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  source: string;
  sourceUrl: string;
  sharedBy?: string; // This should match the interface in api-services.ts
};

const ContentCard: React.FC<ContentCardProps> = ({
  id,
  title,
  content,
  imageUrl,
  source,
  sourceUrl,
  sharedBy,
}) => {
  const { 
    liked, 
    saved, 
    showShareDialog,
    handleLike, 
    handleSave, 
    handleShare,
    toggleShareDialog
  } = useCardInteractions({ cardId: id });

  return (
    <Card className="w-full max-w-xl mx-auto h-[calc(100vh-12rem)] overflow-y-auto flex flex-col shadow-lg rounded-xl">
      <ContentCardHeader title={title} sharedBy={sharedBy} />
      <ContentCardImage imageUrl={imageUrl} title={title} />
      <ContentCardBody content={content} />
      <ContentCardFooter 
        source={source}
        sourceUrl={sourceUrl}
        liked={liked}
        saved={saved}
        onLike={handleLike}
        onSave={handleSave}
        onShare={handleShare}
      />
      
      <ShareDialog 
        cardId={id}
        open={showShareDialog}
        onOpenChange={toggleShareDialog}
      />
    </Card>
  );
};

export default ContentCard;