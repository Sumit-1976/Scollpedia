import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, SendHorizonal, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { getUsers, shareContentWithUser } from '@/lib/api-services';

interface ShareDialogProps {
  cardId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type User = {
  id: string;
  email: string;
  selected?: boolean;
};

const ShareDialog: React.FC<ShareDialogProps> = ({
  cardId,
  open,
  onOpenChange
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const { error, data } = await getUsers();
      if (!error) {
        setUsers(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load users. Please try again.",
          variant: "destructive",
        });
      }
      setLoading(false);
    };

    if (open) {
      fetchUsers();
    }
  }, [open]);

  const toggleUserSelection = (userId: string) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId ? { ...user, selected: !user.selected } : user
      )
    );
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleShare = async () => {
    const selectedUsers = users.filter(user => user.selected);
    
    if (selectedUsers.length === 0) {
      toast({
        description: "Please select at least one user to share with",
      });
      return;
    }
    
    setSending(true);
    
    try {
      // Share with each selected user
      const sharePromises = selectedUsers.map(user => 
        shareContentWithUser(cardId, user.id)
      );
      
      await Promise.all(sharePromises);
      
      toast({
        description: `Shared with ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''}`,
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share content</DialogTitle>
          <DialogDescription>
            Select users to share this content with
          </DialogDescription>
        </DialogHeader>
        
        <Command className="rounded-lg border shadow-md">
          <CommandInput 
            placeholder="Search users..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>No users found.</CommandEmpty>
            <CommandGroup>
              {loading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ScrollArea className="h-60">
                  {filteredUsers.map((user) => (
                    <CommandItem
                      key={user.id}
                      value={user.id}
                      onSelect={() => toggleUserSelection(user.id)}
                      className="flex items-center gap-2 px-4 py-2 cursor-pointer"
                    >
                      <div className={`flex items-center justify-center w-5 h-5 rounded-sm border ${user.selected ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                        {user.selected && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                      <span>{user.email}</span>
                    </CommandItem>
                  ))}
                </ScrollArea>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleShare} 
            disabled={sending || loading}
            className="flex items-center gap-1"
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Sharing...</span>
              </>
            ) : (
              <>
                <SendHorizonal className="h-4 w-4" />
                <span>Share</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;