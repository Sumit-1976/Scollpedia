import React from 'react';
import { ContentCard as ContentCardType } from '@/lib/api-services';
import ContentCard from '@/components/ContentCard';
import EmptyContent from './EmptyContent';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";

interface ContentCarouselProps {
  items: ContentCardType[];
  activeTab: string;
}

const ContentCarousel: React.FC<ContentCarouselProps> = ({ items, activeTab }) => {
  if (items.length === 0) {
    return (
      <EmptyContent 
        tabType={
          activeTab === 'saved' 
            ? 'saved' 
            : activeTab === 'shared' 
              ? 'shared'
              : 'default'
        }
      />
    );
  }
  
  return (
    <Carousel 
      className="w-full h-[calc(100vh-10rem)]" 
      opts={{ 
        loop: true, 
        align: "center",
      }} 
      orientation="horizontal"
    >
      <CarouselContent className="h-full space-x-8">
        {items.map((item) => (
          <CarouselItem 
            key={item.id} 
            className="h-full flex items-center justify-center basis-full px-4 transition-all duration-700 transform animate-content-slide"
          >
            <div className="w-full max-w-xl mx-auto transition-transform duration-700 transform animate-content-fade">
              <ContentCard 
                id={item.id}
                title={item.title}
                content={item.content}
                imageUrl={item.imageUrl}
                source={item.source}
                sourceUrl={item.sourceUrl}
                sharedBy={item.sharedBy}
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious 
        className="left-4 opacity-70 hover:opacity-100 h-12 w-12 transition-transform duration-300 hover:scale-110" 
        size="lg"
        aria-label="View previous content"
      />
      <CarouselNext 
        className="right-4 opacity-70 hover:opacity-100 h-12 w-12 transition-transform duration-300 hover:scale-110" 
        size="lg"
        aria-label="View next content"
      />
    </Carousel>
  );
};

export default ContentCarousel;