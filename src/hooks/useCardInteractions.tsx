import { useState, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast";
import { saveInteraction } from '@/lib/api-services';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from "@/integrations/supabase/client";

interface UseCardInteractionsProps {
  cardId: string;
}

export const useCardInteractions = ({ cardId }: UseCardInteractionsProps) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const { user } = useAuthContext();

  // Fetch user's interaction with this card
  useEffect(() => {
    if (!user) return;

    const fetchInteraction = async () => {
      const { data, error } = await supabase
        .from('user_interactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('card_id', cardId)
        .maybeSingle();

      if (!error && data) {
        setLiked(data.liked || false);
        setSaved(data.saved || false);
      }
    };

    fetchInteraction();
  }, [cardId, user]);

  // Handle liking a card
  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "You need to log in to like content.",
        variant: "destructive",
      });
      return;
    }

    const newLiked = !liked;
    setLiked(newLiked);
    
    const { error } = await saveInteraction(cardId, { liked: newLiked });
    
    if (error) {
      setLiked(!newLiked); // Revert state if error
      toast({
        title: "Error",
        description: "Failed to save your like. Please try again.",
        variant: "destructive",
      });
    } else if (newLiked) {
      toast({
        description: "Added to your liked content",
      });
    }
  };

  // Handle saving a card
  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "You need to log in to save content.",
        variant: "destructive",
      });
      return;
    }

    const newSaved = !saved;
    setSaved(newSaved);
    
    const { error } = await saveInteraction(cardId, { saved: newSaved });
    
    if (error) {
      setSaved(!newSaved); // Revert state if error
      toast({
        title: "Error",
        description: "Failed to save content. Please try again.",
        variant: "destructive",
      });
    } else if (newSaved) {
      toast({
        description: "Content saved to your collection",
      });
    } else {
      toast({
        description: "Content removed from your collection",
      });
    }
  };

  // Handle sharing a card
  const handleShare = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "You need to log in to share content.",
        variant: "destructive",
      });
      return;
    }
    
    setShowShareDialog(true);
  };

  // Toggle share dialog
  const toggleShareDialog = () => {
    setShowShareDialog(!showShareDialog);
  };

  // Track that this card was viewed
  useEffect(() => {
    if (user) {
      // We don't need to wait for this to complete
      saveInteraction(cardId, { viewed: true });
    }
  }, [cardId, user]);

  return {
    liked,
    saved,
    showShareDialog,
    handleLike,
    handleSave,
    handleShare,
    toggleShareDialog
  };
};