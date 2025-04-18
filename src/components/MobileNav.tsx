import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, User, BookOpen } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const MobileNav: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthContext();
  const isActive = (path: string) => location.pathname === path;

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user) return "U";
    const email = user.email || "";
    return email.charAt(0).toUpperCase();
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-40">
      <div className="flex justify-around">
        <Link 
          to="/" 
          className={`flex flex-col items-center py-2 px-4 ${isActive('/') ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        
        <Link 
          to="/explore" 
          className={`flex flex-col items-center py-2 px-4 ${isActive('/explore') ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <Compass className="h-6 w-6" />
          <span className="text-xs mt-1">Explore</span>
        </Link>
        
        {user && (
          <Link 
            to="/feed" 
            className={`flex flex-col items-center py-2 px-4 ${isActive('/feed') ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <BookOpen className="h-6 w-6" />
            <span className="text-xs mt-1">Feed</span>
          </Link>
        )}
        
        <Link 
          to={user ? "/profile" : "/login"} 
          className={`flex flex-col items-center py-2 px-4 ${
            isActive('/profile') || isActive('/login') ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          {user ? (
            <Avatar className="h-6 w-6">
              <AvatarImage src={user.user_metadata?.avatar_url || ""} alt="Profile" />
              <AvatarFallback>{getUserInitials()}</AvatarFallback>
            </Avatar>
          ) : (
            <User className="h-6 w-6" />
          )}
          <span className="text-xs mt-1">{user ? 'Profile' : 'Login'}</span>
        </Link>
      </div>
    </div>
  );
};

export default MobileNav;