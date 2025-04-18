import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from '@/components/ui/use-toast';
import { History, BookOpen, Heart, Trash2, Upload, AlertTriangle } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

interface UserStats {
  viewed: number;
  saved: number;
  liked: number;
}

interface UserProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats>({ viewed: 0, saved: 0, liked: 0 });
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, signOut } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("Fetching profile for user:", user.id);
        
        // First try to fetch from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          
          // If no profile found, try to create a profile
          if (profileError.code === 'PGRST116') {
            console.log("Profile not found, creating a new one");
            
            // Create a new profile for the user
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                full_name: user.user_metadata?.full_name || null,
                avatar_url: user.user_metadata?.avatar_url || null
              });
              
            if (insertError) {
              console.error('Error creating profile:', insertError);
              throw insertError;
            }
            
            // Fetch the newly created profile
            const { data: newProfile, error: newProfileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();
              
            if (newProfileError) {
              console.error('Error fetching new profile:', newProfileError);
              throw newProfileError;
            }
            
            console.log("New profile created:", newProfile);
            setProfile(newProfile);
          } else {
            throw profileError;
          }
        } else {
          console.log("Profile data retrieved:", profileData);
          setProfile(profileData);
        }
        
        // If we have a profile picture from metadata, use that
        if (user.user_metadata?.avatar_url) {
          setAvatarPreview(user.user_metadata.avatar_url);
        }

        // Try to fetch user interactions if table exists
        try {
          const { data: viewedData, error: viewedError } = await supabase
            .from('user_interactions')
            .select('count', { count: 'exact' })
            .eq('user_id', user.id)
            .eq('viewed', true);

          const { data: savedData, error: savedError } = await supabase
            .from('user_interactions')
            .select('count', { count: 'exact' })
            .eq('user_id', user.id)
            .eq('saved', true);

          const { data: likedData, error: likedError } = await supabase
            .from('user_interactions')
            .select('count', { count: 'exact' })
            .eq('user_id', user.id)
            .eq('liked', true);

          // If any of these succeed, update stats
          if (!viewedError && viewedData) {
            setStats(prevStats => ({ 
              ...prevStats, 
              viewed: (viewedData as any)[0]?.count || 0 
            }));
          }
          
          if (!savedError && savedData) {
            setStats(prevStats => ({ 
              ...prevStats, 
              saved: (savedData as any)[0]?.count || 0 
            }));
          }
          
          if (!likedError && likedData) {
            setStats(prevStats => ({ 
              ...prevStats, 
              liked: (likedData as any)[0]?.count || 0 
            }));
          }
        } catch (err) {
          console.warn('Error fetching user stats, might be because tables do not exist yet:', err);
          // Continue anyway, just keep defaults
        }
      } catch (err: any) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user profile. Please try again.');
        toast({
          title: "Error",
          description: "Failed to load user data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleLogout = async () => {
    const { error } = await signOut();
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      navigate('/');
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile || !user) return;
    
    try {
      setUploadingAvatar(true);
      
      // Generate a unique file name
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Upload avatar to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const avatarUrl = data.publicUrl;
      
      // Update user metadata with avatar URL
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          avatar_url: avatarUrl,
        },
      });
      
      if (updateError) throw updateError;
      
      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been successfully updated.",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Avatar upload failed",
        description: "We couldn't upload your profile picture. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
      setAvatarFile(null);
    }
  };

  const cancelAvatarUpload = () => {
    setAvatarFile(null);
    setAvatarPreview(user?.user_metadata?.avatar_url || null);
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    try {
      // Delete the user from Supabase Auth
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      
      if (error) throw error;
      
      // Sign out after deleting the account
      await signOut();
      
      toast({
        title: "Account deleted",
        description: "Your account has been successfully deleted. We're sorry to see you go.",
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Failed to delete account",
        description: "There was an error deleting your account. Please try again or contact support.",
        variant: "destructive",
      });
    }
  };

  const getUserInitials = () => {
    if (!user) return "U";
    
    if (user.user_metadata?.full_name) {
      const names = user.user_metadata.full_name.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return names[0][0].toUpperCase();
    }
    
    const email = user.email || "";
    return email.charAt(0).toUpperCase();
  };

  return (
    <div className="container mx-auto px-4 py-8 mb-16">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold">Profile</h1>
          <Button variant="outline" onClick={handleLogout}>Logout</Button>
        </div>
        
        {error && (
          <div className="bg-destructive/15 text-destructive p-4 rounded-md mb-6 animate-content-fade">
            <p className="font-medium">{error}</p>
            <p className="text-sm mt-1">
              This might be because the required database tables haven't been set up yet.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        )}
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>User Information</CardTitle>
                <CardDescription>Your account details and preferences</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {loading ? (
                  <>
                    <Skeleton className="h-24 w-24 rounded-full mx-auto mb-4" />
                    <Skeleton className="h-6 w-1/3 mb-2" />
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-6 w-2/3" />
                  </>
                ) : (
                  <>
                    <div className="flex flex-col items-center mb-6">
                      <div className="relative">
                        <Avatar className="h-24 w-24">
                          <AvatarImage 
                            src={avatarPreview || user?.user_metadata?.avatar_url || ""} 
                            alt="Profile" 
                          />
                          <AvatarFallback>{getUserInitials()}</AvatarFallback>
                        </Avatar>
                        
                        <Button 
                          type="button" 
                          size="icon" 
                          variant="outline" 
                          className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                          onClick={() => document.getElementById('profile-avatar-upload')?.click()}
                        >
                          <Upload className="h-4 w-4" />
                          <span className="sr-only">Change avatar</span>
                        </Button>
                        
                        <Input 
                          id="profile-avatar-upload" 
                          type="file" 
                          accept="image/*" 
                          onChange={handleAvatarChange} 
                          className="hidden" 
                        />
                      </div>
                      
                      {avatarFile && (
                        <div className="flex gap-2 mt-4">
                          <Button 
                            onClick={uploadAvatar} 
                            disabled={uploadingAvatar}
                            size="sm"
                          >
                            {uploadingAvatar ? 'Uploading...' : 'Save Avatar'}
                          </Button>
                          <Button 
                            onClick={cancelAvatarUpload} 
                            variant="outline"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-medium">{user?.user_metadata?.full_name || user?.email}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{user?.email}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Member Since</p>
                      <p className="font-medium">{user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown'}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4">
                      <div className="bg-secondary rounded-lg p-4 text-center">
                        <BookOpen className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <p className="text-2xl font-bold">{stats.viewed}</p>
                        <p className="text-sm text-muted-foreground">Cards Viewed</p>
                      </div>
                      
                      <div className="bg-secondary rounded-lg p-4 text-center">
                        <Heart className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <p className="text-2xl font-bold">{stats.liked}</p>
                        <p className="text-sm text-muted-foreground">Liked</p>
                      </div>
                      
                      <div className="bg-secondary rounded-lg p-4 text-center">
                        <BookOpen className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <p className="text-2xl font-bold">{stats.saved}</p>
                        <p className="text-sm text-muted-foreground">Saved</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
              
              <CardFooter className="flex justify-center border-t pt-6">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground">
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Viewing History</CardTitle>
                <CardDescription>Cards you've recently viewed</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="text-center py-12">
                  <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {loading ? 'Loading your history...' : (stats.viewed > 0 ? `You've viewed ${stats.viewed} cards. View details coming soon.` : 'Your viewing history will appear here.')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="saved" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Saved Cards</CardTitle>
                <CardDescription>Content you've saved for later</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {loading ? 'Loading your saved content...' : (stats.saved > 0 ? 'Go to the Saved tab in the Feed to view your saved content.' : 'Your saved cards will appear here.')}
                  </p>
                  {stats.saved > 0 && !loading && (
                    <Button 
                      onClick={() => navigate('/feed', { state: { activeTab: 'saved' } })}
                      variant="outline" 
                      className="mt-4"
                    >
                      View Saved Content
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;