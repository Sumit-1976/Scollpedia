import React from 'react';

interface EmptyContentProps {
  tabType: 'saved' | 'shared' | 'default';
}

const EmptyContent: React.FC<EmptyContentProps> = ({ tabType }) => {
  let message = "No content available at the moment.";
  
  if (tabType === 'saved') {
    message = "You haven't saved any content yet.";
  } else if (tabType === 'shared') {
    message = "No one has shared any content with you yet.";
  }
  
  return (
    <div className="text-center py-16">
      <p className="text-lg text-muted-foreground">{message}</p>
    </div>
  );
};

export default EmptyContent;