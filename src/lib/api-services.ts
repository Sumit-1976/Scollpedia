import { supabase } from "@/integrations/supabase/client";

interface ApiParams {
  query?: string;
  category?: string;
  limit?: number;
}

export interface ContentCard {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  source: string;
  sourceUrl: string;
  category: string;
  topic?: string;
  sharedBy?: string;
}

// Check if content is already in cache
async function checkCache(apiName: string, query: string) {
  const { data, error } = await supabase
    .from('api_cache')
    .select('*')
    .eq('api_name', apiName)
    .eq('query', query)
    .gte('expires_at', new Date().toISOString())
    .single();
  
  if (error || !data) return null;
  return data.response;
}

// Store API response in cache
async function storeInCache(apiName: string, query: string, response: any) {
  // Cache for 24 hours
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  await supabase
    .from('api_cache')
    .upsert({
      api_name: apiName,
      query: query,
      response,
      expires_at: expiresAt.toISOString()
    }, { onConflict: 'api_name,query' });
}

// Function to get user's preferred topics based on likes/saves
async function getUserPreferredTopics() {
  const { error: userError, data: userData } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return [];
  }
  
  const userId = userData.user.id;
  
  // Get interactions that were liked or saved
  const { data, error } = await supabase
    .from('user_interactions')
    .select('card_id')
    .eq('user_id', userId)
    .or('liked.eq.true,saved.eq.true');
    
  if (error || !data || data.length === 0) {
    return [];
  }
  
  // Extract topics from card IDs (format: provider-id)
  // For this example, we'll use the first part of the ID (e.g., "nasa", "wikipedia")
  const topics = data.map(item => {
    const [provider] = item.card_id.split('-', 1);
    return provider;
  });
  
  // Count frequency of each topic
  const topicCount: Record<string, number> = topics.reduce((acc: Record<string, number>, topic: string) => {
    acc[topic] = (acc[topic] || 0) + 1;
    return acc;
  }, {});
  
  // Sort by frequency and return top 3
  return Object.entries(topicCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([topic]) => topic);
}

// Format Wikipedia API response into ContentCard format
function formatWikipediaContent(response: any): ContentCard[] {
  const { query } = response;
  if (!query || !query.pages) return [];

  return Object.values(query.pages).map((page: any) => {
    const pageId = page.pageid;
    const thumbnail = page.thumbnail?.source;
    const extract = page.extract || '';
    
    return {
      id: `wikipedia-${pageId}`,
      title: page.title || 'Wikipedia Article',
      content: extract,
      imageUrl: thumbnail,
      source: 'Wikipedia',
      sourceUrl: `https://en.wikipedia.org/?curid=${pageId}`,
      category: 'knowledge',
      topic: 'wikipedia'
    };
  });
}

// Format NASA API response into ContentCard format
function formatNasaContent(response: any): ContentCard[] {
  if (!response || !Array.isArray(response.collection?.items)) return [];
  
  return response.collection.items
    .filter((item: any) => item.links && item.data)
    .map((item: any) => {
      const data = item.data[0] || {};
      const imageLink = item.links?.find((link: any) => link.render === 'image');
      
      return {
        id: `nasa-${data.nasa_id || Math.random().toString(36).substring(7)}`,
        title: data.title || 'NASA Content',
        content: data.description || '',
        imageUrl: imageLink?.href,
        source: 'NASA',
        sourceUrl: data.nasa_id ? `https://images.nasa.gov/details-${data.nasa_id}` : '',
        category: 'science',
        topic: 'nasa'
      };
    });
}

// Format News API response into ContentCard format
function formatNewsContent(response: any): ContentCard[] {
  if (!response || !Array.isArray(response.articles)) return [];
  
  return response.articles.map((article: any) => {
    return {
      id: `news-${Math.random().toString(36).substring(7)}`,
      title: article.title || 'News Article',
      content: article.description || '',
      imageUrl: article.urlToImage,
      source: article.source?.name || 'News Source',
      sourceUrl: article.url || '',
      category: 'news',
      topic: 'news'
    };
  });
}

// Fetch content from Wikipedia API
export async function fetchWikipediaContent(params: ApiParams = {}): Promise<ContentCard[]> {
  const query = params.query || '';
  const cacheKey = `wikipedia-${query}`;
  
  // Check cache first
  const cachedData = await checkCache('wikipedia', cacheKey);
  if (cachedData) return formatWikipediaContent(cachedData);
  
  try {
    const searchParams = new URLSearchParams({
      action: 'query',
      format: 'json',
      prop: 'extracts|pageimages',
      exintro: '1',
      explaintext: '1',
      pithumbsize: '400',
      generator: 'search',
      gsrlimit: String(params.limit || 5),
      gsrsearch: query || 'featured',
      origin: '*'
    });

    const response = await fetch(`https://en.wikipedia.org/w/api.php?${searchParams}`);
    const data = await response.json();
    
    // Store in cache
    await storeInCache('wikipedia', cacheKey, data);
    
    return formatWikipediaContent(data);
  } catch (error) {
    console.error('Error fetching from Wikipedia:', error);
    return [];
  }
}

// Fetch content from NASA Image API
export async function fetchNasaContent(params: ApiParams = {}): Promise<ContentCard[]> {
  const query = params.query || 'space';
  const cacheKey = `nasa-${query}`;
  
  // Check cache first
  const cachedData = await checkCache('nasa', cacheKey);
  if (cachedData) return formatNasaContent(cachedData);
  
  try {
    const searchParams = new URLSearchParams({
      q: query,
      media_type: 'image',
      year_start: '2010',
      page_size: String(params.limit || 5)
    });

    const response = await fetch(`https://images-api.nasa.gov/search?${searchParams}`);
    const data = await response.json();
    
    // Store in cache
    await storeInCache('nasa', cacheKey, data);
    
    return formatNasaContent(data);
  } catch (error) {
    console.error('Error fetching from NASA:', error);
    return [];
  }
}

// Fetch content from multiple sources with user preferences
export async function fetchMixedContent(params: ApiParams = {}): Promise<ContentCard[]> {
  try {
    // Get user's preferred topics based on likes/saves
    const preferredTopics = await getUserPreferredTopics();
    let wikipediaLimit = 3;
    let nasaLimit = 3;
    
    // Adjust content ratios based on preferences
    if (preferredTopics.includes('wikipedia')) {
      wikipediaLimit = 5;
      nasaLimit = 2;
    } else if (preferredTopics.includes('nasa')) {
      wikipediaLimit = 2;
      nasaLimit = 5;
    }
    
    // If the user has specific search query, use it for all sources
    if (params.query) {
      const [wikipediaContent, nasaContent] = await Promise.all([
        fetchWikipediaContent({ ...params, limit: wikipediaLimit }),
        fetchNasaContent({ ...params, limit: nasaLimit })
      ]);
      
      // Combine content from different sources
      const allContent = [...wikipediaContent, ...nasaContent];
      return allContent.sort(() => Math.random() - 0.5);
    }
    
    // Otherwise, prioritize preferred topics
    const contentPromises = [];
    
    // Add queries for preferred topics with higher limits
    for (const topic of preferredTopics) {
      if (topic === 'wikipedia') {
        contentPromises.push(fetchWikipediaContent({ query: 'featured', limit: 3 }));
      } else if (topic === 'nasa') {
        contentPromises.push(fetchNasaContent({ query: 'space', limit: 3 }));
      }
    }
    
    // Add general content with lower limits
    contentPromises.push(fetchWikipediaContent({ query: 'featured', limit: 2 }));
    contentPromises.push(fetchNasaContent({ query: 'space', limit: 2 }));
    
    const results = await Promise.all(contentPromises);
    
    // Flatten and deduplicate results
    const combinedResults = results.flat();
    const uniqueIds = new Set();
    const uniqueContent = combinedResults.filter(item => {
      if (uniqueIds.has(item.id)) return false;
      uniqueIds.add(item.id);
      return true;
    });
    
    return uniqueContent.sort(() => Math.random() - 0.5);
  } catch (error) {
    console.error('Error fetching mixed content:', error);
    return [];
  }
}

// Fetch trending content
export async function fetchTrendingContent(): Promise<ContentCard[]> {
  // For trending, we'll use predefined trending topics
  const trendingTopics = [
    'Artificial Intelligence',
    'Climate Change', 
    'Space Exploration',
    'Quantum Computing'
  ];
  
  const randomTopic = trendingTopics[Math.floor(Math.random() * trendingTopics.length)];
  return fetchMixedContent({ query: randomTopic, limit: 10 });
}

export async function saveInteraction(
  cardId: string,
  interaction: { liked?: boolean; saved?: boolean; viewed?: boolean }
): Promise<{ error: string | null }> {
  try {
    // 1. Get fresh session (more reliable than getUser)
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      console.error('Auth error:', authError);
      return { error: 'Authentication failed' };
    }

    // 2. Prepare the upsert data
    const upsertData = {
      user_id: session.user.id,
      card_id: cardId,
      liked: interaction.liked ?? false,
      saved: interaction.saved ?? false,
      viewed: interaction.viewed ?? true, // Default to true
      updated_at: new Date().toISOString()
    };

    // 3. Execute upsert with debug logging
    const { error } = await supabase
      .from('user_interactions')
      .upsert(upsertData, { onConflict: 'user_id,card_id' });

    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        code: error.code,
        details: error.details
      });
      return { error: 'Database update failed' };
    }

    // 4. Only proceed to preferences if the main update succeeded
    if (interaction.liked || interaction.saved) {
      try {
        const [topic] = cardId.split('-');
        if (topic) {
          await supabase.rpc('increment_topic_preference', {
            user_id: session.user.id,
            topic_name: topic
          });
        }
      } catch (prefError) {
        console.warn('Preferences update failed (non-critical):', prefError);
      }
    }

    return { error: null };

  } catch (err) {
    console.error('System error:', err);
    return { error: 'System error occurred' };
  }
}

async function updateUserPreferences(userId: string, cardId: string) {
  try {
    const [topic] = cardId.split('-', 1);
    if (!topic) return;

    // Get current preferences
    const { data: userPrefs, error: fetchError } = await supabase
      .from('user_preferences')
      .select('topic_preferences')
      .eq('user_id', userId)
      .maybeSingle();

    const currentPrefs = userPrefs?.topic_preferences || {};
    const updatedPrefs = {
      ...currentPrefs,
      [topic]: (currentPrefs[topic] || 0) + 1
    };

    // Upsert preferences
    const { error: upsertError } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        topic_preferences: updatedPrefs
      }, {
        onConflict: 'user_id'
      });

    if (upsertError) {
      console.error('Preferences update error:', upsertError);
    }
  } catch (err) {
    console.error('Error updating preferences:', err);
  }
}

// Get user's saved content
export async function getSavedContent() {
  const { error: userError, data: userData } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { error: 'User must be logged in to get saved content', data: [] };
  }
  
  const userId = userData.user.id;
  
  // Get all saved interactions
  const { data: interactions, error: fetchError } = await supabase
    .from('user_interactions')
    .select('*')
    .eq('user_id', userId)
    .eq('saved', true);
    
  if (fetchError) {
    console.error('Error fetching saved content:', fetchError);
    return { error: fetchError.message, data: [] };
  }
  
  // For each saved card, fetch full content from respective APIs
  const savedCards: ContentCard[] = [];
  
  for (const interaction of interactions) {
    const cardId = interaction.card_id;
    const [provider, id] = cardId.split('-', 2);
    
    if (provider === 'wikipedia') {
      try {
        const response = await fetch(`https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|pageimages&exintro=1&explaintext=1&pithumbsize=400&pageids=${id}&origin=*`);
        const data = await response.json();
        const formattedData = formatWikipediaContent(data);
        if (formattedData.length > 0) {
          savedCards.push(formattedData[0]);
        }
      } catch (error) {
        console.error(`Error fetching Wikipedia content for ${cardId}:`, error);
      }
    } else if (provider === 'nasa') {
      try {
        const response = await fetch(`https://images-api.nasa.gov/search?nasa_id=${id}`);
        const data = await response.json();
        const formattedData = formatNasaContent(data);
        if (formattedData.length > 0) {
          savedCards.push(formattedData[0]);
        }
      } catch (error) {
        console.error(`Error fetching NASA content for ${cardId}:`, error);
      }
    }
  }
  
  return { error: null, data: savedCards };
}

// New function to share content with another user
export async function shareContentWithUser(cardId: string, recipientUserId: string) {
  const { error: userError, data: userData } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { error: 'User must be logged in to share content' };
  }
  
  const senderId = userData.user.id;
  
  // Create a new shared content record
  const { error } = await supabase
    .from('shared_content')
    .insert([{
      sender_id: senderId,
      recipient_id: recipientUserId,
      card_id: cardId,
      shared_at: new Date().toISOString(),
      is_read: false
    }]);
    
  if (error) {
    console.error('Error sharing content:', error);
    return { error: error.message };
  }
  
  return { error: null };
}

// Get content shared with current user
export async function getSharedContent() {
  const { error: userError, data: userData } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { error: 'User must be logged in to view shared content', data: [] };
  }
  
  const userId = userData.user.id;
  
  // Get all content shared with this user
  const { data: sharedItems, error: fetchError } = await supabase
    .from('shared_content')
    .select('*, sender:sender_id(id, email)')
    .eq('recipient_id', userId)
    .order('shared_at', { ascending: false });
    
  if (fetchError) {
    console.error('Error fetching shared content:', fetchError);
    return { error: fetchError.message, data: [] };
  }
  
  // Mark all as read
  await supabase
    .from('shared_content')
    .update({ is_read: true })
    .eq('recipient_id', userId)
    .eq('is_read', false);
  
  // Fetch the actual content for each shared item
  const contentItems: ContentCard[] = [];
  
  for (const item of sharedItems) {
    const cardId = item.card_id;
    const [provider, id] = cardId.split('-', 2);
    
    if (provider === 'wikipedia') {
      try {
        const response = await fetch(`https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts|pageimages&exintro=1&explaintext=1&pithumbsize=400&pageids=${id}&origin=*`);
        const data = await response.json();
        const formattedData = formatWikipediaContent(data);
        if (formattedData.length > 0) {
          contentItems.push({
            ...formattedData[0],
            sharedBy: item.sender?.email
          });
        }
      } catch (error) {
        console.error(`Error fetching Wikipedia content for ${cardId}:`, error);
      }
    } else if (provider === 'nasa') {
      try {
        const response = await fetch(`https://images-api.nasa.gov/search?nasa_id=${id}`);
        const data = await response.json();
        const formattedData = formatNasaContent(data);
        if (formattedData.length > 0) {
          contentItems.push({
            ...formattedData[0],
            sharedBy: item.sender?.email
          });
        }
      } catch (error) {
        console.error(`Error fetching NASA content for ${cardId}:`, error);
      }
    }
  }
  
  return { error: null, data: contentItems };
}

// Get list of users for sharing
export async function getUsers() {
  const { error: userError, data: userData } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return { error: 'User must be logged in to view users', data: [] };
  }
  
  const currentUserId = userData.user.id;
  
  // Get all users except current user
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, email')
    .neq('id', currentUserId);
    
  if (error) {
    console.error('Error fetching users:', error);
    return { error: error.message, data: [] };
  }
  
  return { error: null, data: data || [] };
}

