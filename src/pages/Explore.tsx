import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Expanded trending topics list
const trendingTopics = [
  // Science & Technology
  'Artificial Intelligence', 'Machine Learning', 'Quantum Computing', 'Space Exploration', 
  'Robotics', 'Biotechnology', 'Neuroscience', 'Climate Change', 'Renewable Energy',
  'Nanotechnology', 'Genetic Engineering', 'Blockchain', 'Cryptocurrency', 'Virtual Reality',
  'Augmented Reality', 'Internet of Things', 'Cybersecurity', '5G Technology',
  'Sustainable Technology', 'Cloud Computing',
  
  // Health & Medicine
  'Immunology', 'Nutrition Science', 'Mental Health', 'Vaccines', 'Epidemiology',
  'Medical Breakthroughs', 'Human Genome', 'Telemedicine', 'Personalized Medicine',
  'Public Health', 'Disease Prevention', 'Longevity Research', 'Stem Cell Research',
  
  // Humanities & Social Sciences
  'World History', 'Ancient Civilizations', 'Political Science', 'Economics', 'Psychology',
  'Sociology', 'Anthropology', 'Archaeology', 'Philosophy', 'Ethics', 'Literature',
  'Classical Music', 'Modern Art', 'Film Studies', 'Cultural Studies', 'Linguistics',
  
  // Environment & Earth Sciences
  'Biodiversity', 'Oceanography', 'Meteorology', 'Geology', 'Conservation',
  'Sustainable Development', 'Ecology', 'Climate Models', 'Environmental Policy',
  'Renewable Resources', 'Wildlife Conservation',
  
  // Space & Physics
  'Black Holes', 'Cosmology', 'Astrophysics', 'Planetary Science', 'Dark Matter',
  'String Theory', 'Particle Physics', 'Relativity', 'Quantum Mechanics', 'Exoplanets',
  'Space Telescopes', 'Mars Exploration', 'Solar System',
  
  // Business & Economics
  'Entrepreneurship', 'Start-up Culture', 'Global Markets', 'Macroeconomics',
  'Financial Technology', 'Digital Currency', 'Supply Chain Innovation',
  'Sustainable Business', 'Remote Work', 'Future of Work',
  
  // Contemporary Issues
  'Global Governance', 'Digital Privacy', 'Media Literacy', 'Education Innovation',
  'Future Cities', 'Urban Planning', 'Transportation Revolution', 'Energy Transition',
  'Food Security', 'Water Conservation'
];

// Expanded categories list
const categories = [
  // Natural Sciences
  { name: 'Astronomy', icon: '🌌' },
  { name: 'Physics', icon: '⚛️' },
  { name: 'Chemistry', icon: '🧪' },
  { name: 'Biology', icon: '🧬' },
  { name: 'Earth Science', icon: '🌍' },
  { name: 'Ecology', icon: '🌱' },
  { name: 'Meteorology', icon: '🌦️' },
  { name: 'Oceanography', icon: '🌊' },
  { name: 'Geology', icon: '🪨' },
  
  // Technology
  { name: 'Computer Science', icon: '💻' },
  { name: 'Artificial Intelligence', icon: '🤖' },
  { name: 'Robotics', icon: '🦾' },
  { name: 'Biotechnology', icon: '🔬' },
  { name: 'Nanotechnology', icon: '🔍' },
  { name: 'Information Technology', icon: '📡' },
  { name: 'Cybersecurity', icon: '🔐' },
  { name: 'Data Science', icon: '📊' },
  
  // Mathematics
  { name: 'Algebra', icon: '🔢' },
  { name: 'Geometry', icon: '📐' },
  { name: 'Calculus', icon: '📉' },
  { name: 'Statistics', icon: '📈' },
  { name: 'Number Theory', icon: '🧮' },
  
  // Medicine & Health
  { name: 'Anatomy', icon: '🫀' },
  { name: 'Immunology', icon: '🦠' },
  { name: 'Neurology', icon: '🧠' },
  { name: 'Public Health', icon: '🏥' },
  { name: 'Nutrition', icon: '🥗' },
  { name: 'Genetics', icon: '🧬' },
  { name: 'Pharmacology', icon: '💊' },
  
  // Social Sciences
  { name: 'Psychology', icon: '🧠' },
  { name: 'Sociology', icon: '👥' },
  { name: 'Anthropology', icon: '🏺' },
  { name: 'Archaeology', icon: '🗿' },
  { name: 'Economics', icon: '💰' },
  { name: 'Political Science', icon: '🏛️' },
  { name: 'Geography', icon: '🗺️' },
  
  // Humanities
  { name: 'History', icon: '📜' },
  { name: 'Philosophy', icon: '🤔' },
  { name: 'Literature', icon: '📚' },
  { name: 'Religious Studies', icon: '🕌' },
  { name: 'Cultural Studies', icon: '🎭' },
  { name: 'Ethics', icon: '⚖️' },
  
  // Languages
  { name: 'Linguistics', icon: '🗣️' },
  { name: 'English', icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { name: 'French', icon: '🇫🇷' },
  { name: 'Spanish', icon: '🇪🇸' },
  { name: 'Chinese', icon: '🇨🇳' },
  { name: 'Arabic', icon: '🇸🇦' },
  { name: 'Japanese', icon: '🇯🇵' },
  
  // Arts
  { name: 'Visual Arts', icon: '🎨' },
  { name: 'Music', icon: '🎵' },
  { name: 'Film Studies', icon: '🎬' },
  { name: 'Theater', icon: '🎭' },
  { name: 'Dance', icon: '💃' },
  { name: 'Architecture', icon: '🏛️' },
  { name: 'Photography', icon: '📷' },
  
  // Engineering
  { name: 'Mechanical Engineering', icon: '⚙️' },
  { name: 'Electrical Engineering', icon: '⚡' },
  { name: 'Civil Engineering', icon: '🏗️' },
  { name: 'Aerospace Engineering', icon: '🚀' },
  { name: 'Chemical Engineering', icon: '🧪' },
  { name: 'Environmental Engineering', icon: '♻️' },
  
  // Business & Economics
  { name: 'Finance', icon: '💵' },
  { name: 'Marketing', icon: '📢' },
  { name: 'Management', icon: '📋' },
  { name: 'Entrepreneurship', icon: '🚀' },
  { name: 'Accounting', icon: '📒' },
  
  // Contemporary Topics
  { name: 'Climate Action', icon: '🌡️' },
  { name: 'Space Exploration', icon: '🚀' },
  { name: 'Sustainable Development', icon: '♻️' },
  { name: 'Digital Transformation', icon: '📱' },
  { name: 'Future of Work', icon: '💼' }
];

const Explore: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    // Navigate to the feed with search query
    navigate('/feed', { state: { searchQuery } });
    setIsSearching(false);
  };

  const handleTopicClick = (topic: string) => {
    setSearchQuery(topic);
    navigate('/feed', { state: { searchQuery: topic } });
  };

  return (
    <div className="container mx-auto px-4 py-8 mb-16">
      <h1 className="text-3xl font-bold mb-8">Explore Knowledge</h1>
      
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-12">
        <div className="relative max-w-2xl mx-auto">
          <Input
            type="text"
            placeholder="Search any topic to learn about..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-16 py-6 text-lg"
          />
          <Button 
            type="submit" 
            className="absolute right-0 top-0 h-full rounded-l-none"
            disabled={isSearching}
          >
            {isSearching ? 'Searching...' : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search
              </>
            )}
          </Button>
        </div>
      </form>
      
      {/* Trending Topics */}
      <section className="mb-12">
        <div className="flex items-center mb-4">
          <TrendingUp className="text-primary mr-2 h-5 w-5" />
          <h2 className="text-xl font-semibold">Trending Topics</h2>
        </div>
        
        <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto pb-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
          {trendingTopics.map((topic, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleTopicClick(topic)}
              className="hover:bg-primary/10"
            >
              {topic}
            </Button>
          ))}
        </div>
      </section>
      
      {/* Categories */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Explore by Category</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-[800px] overflow-y-auto pb-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
          {categories.map((category, index) => (
            <Card 
              key={index} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleTopicClick(category.name)}
            >
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <span className="text-4xl mb-2">{category.icon}</span>
                <span className="font-medium">{category.name}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Explore;