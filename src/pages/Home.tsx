import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Logo from '@/components/Logo';
import { ArrowRight, BookOpen, Search, User } from 'lucide-react';
import Testimonials from '@/components/Testimonials';
import NewsletterSignup from '@/components/NewsletterSignup';
import { useAuthContext } from '@/contexts/AuthContext';

const features = [
  {
    icon: <Search className="h-8 w-8 text-primary" />,
    title: 'Discover Knowledge',
    description: 'Search any topic and get information in a scrollable card format, making learning engaging and bite-sized.'
  },
  {
    icon: <BookOpen className="h-8 w-8 text-primary" />,
    title: 'Personalized Feed',
    description: 'Get content tailored to your interests and learning preferences, updated daily.'
  },
  {
    icon: <User className="h-8 w-8 text-primary" />,
    title: 'Track Progress',
    description: 'Save your favorite cards, create collections, and track your learning journey over time.'
  }
];

const Home: React.FC = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/feed', { state: { searchQuery: searchQuery.trim() } });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-background to-secondary/30 pt-16 pb-20 px-4">
        <div className="container mx-auto flex flex-col items-center text-center">
          <Logo size="lg" animated />
          
          <h1 className="mt-8 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Stay Updated Through <span className="text-primary">Scrolling</span>
          </h1>
          
          <p className="mt-6 text-xl text-muted-foreground max-w-2xl">
            Discover knowledge in a modern, engaging format. Search any topic and scroll through information cards, just like social media reels.
          </p>
          
          {/* Search Box */}
          <div className="mt-8 w-full max-w-md">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search for any topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 py-6 text-lg"
              />
              <Button 
                type="submit" 
                size="icon" 
                className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10"
                disabled={!searchQuery.trim()}
              >
                <Search className="h-5 w-5" />
              </Button>
            </form>
          </div>
          
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            {!user ? (
              <Link to="/register">
                <Button size="lg" className="text-lg">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Link to="/feed">
                <Button size="lg" className="text-lg">
                  Go to My Feed
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}
            
            <Link to="/explore">
              <Button size="lg" variant="outline" className="text-lg">
                Explore Topics
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-secondary/10 py-16 px-4">
        <Testimonials />
      </section>

      {/* Newsletter Section */}
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto">
          <NewsletterSignup />
        </div>
      </section>

      {/* CTA Section - Conditional based on auth status */}
      {!user ? (
        <section className="py-16 px-4 bg-primary/10">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Start Learning?</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              Join thousands of users who are transforming how they learn with Scrollpedia's innovative card-based format.
            </p>
            
            <Link to="/register">
              <Button size="lg" className="text-lg">
                Create Free Account
              </Button>
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default Home;