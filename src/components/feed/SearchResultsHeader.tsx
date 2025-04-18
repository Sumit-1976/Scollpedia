import React from 'react';

interface SearchResultsHeaderProps {
  searchQuery: string;
  resultCount?: number;
  title?: string;
  description?: string;
}

const SearchResultsHeader: React.FC<SearchResultsHeaderProps> = ({ 
  searchQuery, 
  resultCount,
  title,
  description
}) => {
  // If we have a specific title/description, use those, regardless of searchQuery
  if (title) {
    return (
      <div className="mb-6 px-4">
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-muted-foreground">
          {description}{resultCount !== undefined ? ` (${resultCount} items)` : ''}
        </p>
      </div>
    );
  }
  
  // Otherwise only show if we have a search query
  if (!searchQuery) return null;
  
  return (
    <div className="mb-6 px-4">
      <h2 className="text-xl font-semibold mb-2">Search Results</h2>
      <p className="text-muted-foreground">
        Showing {resultCount !== undefined ? resultCount : ''} results for: <span className="font-medium text-primary">{searchQuery}</span>
      </p>
    </div>
  );
};

export default SearchResultsHeader;