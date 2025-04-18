import React from 'react';
import { CardContent } from "@/components/ui/card";

interface ContentCardBodyProps {
  content: string;
}

const ContentCardBody: React.FC<ContentCardBodyProps> = ({ content }) => {
  return (
    <CardContent className="pb-4 flex-grow overflow-y-auto">
      <p className="text-foreground/80 whitespace-pre-line">{content}</p>
    </CardContent>
  );
};

export default ContentCardBody;