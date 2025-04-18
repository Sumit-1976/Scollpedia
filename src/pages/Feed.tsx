import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  fetchMixedContent, 
  fetchTrendingContent, 
  getSavedContent, 
  getSharedContent,
  ContentCard as ContentCardType 
} from '@/lib/api-services';
import { useAuthContext } from '@/contexts/AuthContext';
import { useToast } from "@/components/ui/use-toast";
import ContentSkeleton from '@/components/feed/ContentSkeleton';
import ContentCarousel from '@/components/feed/ContentCarousel';
import AuthRequiredAlert from '@/components/feed/AuthRequiredAlert';
import SearchResultsHeader from '@/components/feed/SearchResultsHeader';

const Feed: React.FC = () => {
  const location = useLocation();
  const [content, setContent] = useState<ContentCardType[]>([]);
  const [savedContent, setSavedContent] = useState<ContentCardType[]>([]);
  const [sharedContent, setSharedContent] = useState<ContentCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('for-you');
  const { user } = useAuthContext();
  const { toast } = useToast();
  
  const searchQuery = location.state?.searchQuery || '';

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      
      try {
        let fetchedData: ContentCardType[] = [];
        
        if (activeTab === 'for-you') {
          // Fetch more content for "For You" tab
          fetchedData = await fetchMixedContent({ query: searchQuery, limit: 15 });
          
          // Increase the number of items for better experience - fetch multiple batches
          if (fetchedData.length < 20) {
            const topics = ['space', 'science', 'technology', 'nature', 'history', 'art'];
            
            // Fetch extra content with different topics for variety
            for (const topic of topics) {
              if (fetchedData.length >= 40) break; // Stop if we already have enough
              
              const extraItems = await fetchMixedContent({ query: topic, limit: 10 });
              fetchedData = [...fetchedData, ...extraItems.filter(item => 
                !fetchedData.some(existing => existing.id === item.id)
              )];
            }
            
            // Add trending content as final backup
            if (fetchedData.length < 40) {
              const trendingItems = await fetchTrendingContent();
              fetchedData = [...fetchedData, ...trendingItems.filter(item => 
                !fetchedData.some(existing => existing.id === item.id)
              )];
            }
          }
          
          // Ensure unique content
          const uniqueIds = new Set();
          fetchedData = fetchedData.filter(item => {
            // Extract base ID (without any batch prefixes)
            const baseId = item.id.replace(/^(batch\d+-|dup\d+-)/g, '');
            if (uniqueIds.has(baseId)) return false;
            uniqueIds.add(baseId);
            return true;
          });
          
          setContent(fetchedData);
        } else if (activeTab === 'trending') {
          // Enhanced trending section with more content and variety
          // Fetch from more trending categories to ensure 40-50 items
          const trendingTopics = [
            'Artificial Intelligence', 'Space Exploration', 
            'Climate Change', 'Quantum Computing',
            'Renewable Energy', 'Biotechnology',
            'Robotics', 'Virtual Reality',
            'Machine Learning', 'Cybersecurity',
            'Neuroscience', 'Astronomy',
            'Physics', 'Nanotechnology',
            'Genetics', 'Blockchain',
            'Nuclear Fusion', 'Sustainable Development',
            'Digital Art', 'Internet of Things'
          ];
          
          // Fetch content for each trending topic with higher limit per topic
          for (const topic of trendingTopics) {
            if (fetchedData.length >= 50) break; // Stop if we have enough content
            
            const topicContent = await fetchMixedContent({ query: topic, limit: 5 });
            // Add batch identifier to distinguish between topic batches
            const batchContent = topicContent.map((item, index) => ({
              ...item,
              id: `batch${trendingTopics.indexOf(topic)}-${index}-${item.id}`
            }));
            
            fetchedData = [...fetchedData, ...batchContent];
          }
          
          // If we still don't have enough content, try different queries
          if (fetchedData.length < 40) {
            const backupQueries = ['latest discoveries', 'breakthrough technology', 'scientific advancements', 'future technology'];
            
            for (const query of backupQueries) {
              if (fetchedData.length >= 50) break;
              
              const backupContent = await fetchMixedContent({ query, limit: 10 });
              const batchContent = backupContent.map((item, index) => ({
                ...item,
                id: `backup-${backupQueries.indexOf(query)}-${index}-${item.id}`
              }));
              
              fetchedData = [...fetchedData, ...batchContent];
            }
          }
          
          // Ensure at least 40 items by duplicating if needed (as a last resort)
          if (fetchedData.length < 40) {
            const originalLength = fetchedData.length;
            for (let i = 0; i < originalLength && fetchedData.length < 50; i++) {
              fetchedData.push({
                ...fetchedData[i],
                id: `dup-${fetchedData.length}-${fetchedData[i].id}`
              });
            }
          }
          
          // Shuffle to ensure variety in order
          fetchedData = fetchedData.sort(() => Math.random() - 0.5);
          
          setContent(fetchedData);
        } else if (activeTab === 'saved' && user) {
          const { error, data } = await getSavedContent();
          if (!error && data) {
            setSavedContent(data.length > 0 ? data : []);
          }
        } else if (activeTab === 'shared' && user) {
          const { error, data } = await getSharedContent();
          if (!error && data) {
            setSharedContent(data.length > 0 ? data : []);
          }
        }
        
        if (fetchedData.length === 0 && (activeTab === 'for-you' || activeTab === 'trending')) {
          toast({
            title: "Limited content available",
            description: "We're still building our content library. Check back soon for more updates!",
            duration: 5000,
          });
        }
      } catch (error) {
        console.error('Error fetching content:', error);
        toast({
          variant: "destructive",
          title: "Error loading content",
          description: "Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [searchQuery, activeTab, user, toast]);

  const renderTabContent = (tabName: string) => {
    if (loading) {
      return <ContentSkeleton />;
    }

    if ((tabName === 'saved' || tabName === 'shared') && !user) {
      return <AuthRequiredAlert tabType={tabName as 'saved' | 'shared'} />;
    }

    const contentToRender = 
      tabName === 'saved' 
        ? savedContent 
        : tabName === 'shared' 
          ? sharedContent 
          : content;

    return (
      <ContentCarousel 
        items={contentToRender} 
        activeTab={tabName}
      />
    );
  };

  return (
    <div className="container mx-auto pb-16">
      <div className="py-4">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-center mb-6">
            <TabsList>
              <TabsTrigger value="for-you">For You</TabsTrigger>
              <TabsTrigger value="trending">Trending</TabsTrigger>
              <TabsTrigger value="saved">Saved</TabsTrigger>
              <TabsTrigger value="shared">Shared</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="for-you" className="m-0">
            <SearchResultsHeader searchQuery={searchQuery} resultCount={content.length} />
            {renderTabContent('for-you')}
          </TabsContent>
          
          <TabsContent value="trending" className="m-0">
            <SearchResultsHeader 
              searchQuery={""}
              title="Trending Topics" 
              description="Explore what's popular right now"
            />
            {renderTabContent('trending')}
          </TabsContent>
          
          <TabsContent value="saved" className="m-0">
            {renderTabContent('saved')}
          </TabsContent>
          
          <TabsContent value="shared" className="m-0">
            {renderTabContent('shared')}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Feed;