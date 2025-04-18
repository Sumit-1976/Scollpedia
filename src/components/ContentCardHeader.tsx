import React from 'react';
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserCircle } from "lucide-react";

interface ContentCardHeaderProps {
  title: string;
  sharedBy?: string;
}

const ContentCardHeader: React.FC<ContentCardHeaderProps> = ({ title, sharedBy }) => {
  return (
    <CardHeader>
      <CardTitle className="line-clamp-2">{title}</CardTitle>
      {sharedBy && (
        <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
          <UserCircle className="h-4 w-4" />
          <span>Shared by: {sharedBy}</span>
        </div>
      )}
    </CardHeader>
  );
};

export default ContentCardHeader;