"use client"
import React from "react";
import useSearchFormSubmit from "@/hooks/use-search-form-submit";
import { useSearchParams } from 'next/navigation';

const SearchForm = () => {
  const searchParams = useSearchParams();
  const { handleSubmit, setSearchText } = useSearchFormSubmit();
  const [inputValue, setInputValue] = React.useState('');

  // Set initial value from URL on mount and when URL changes
  React.useEffect(() => {
    const searchQuery = searchParams.get('q') || '';
    console.log('SearchForm: URL query param:', searchQuery);
    setInputValue(searchQuery);
    setSearchText(searchQuery);
  }, [searchParams, setSearchText]);

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log('SearchForm: Input changed:', newValue);
    setInputValue(newValue);
    setSearchText(newValue);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('SearchForm: Submitting search with value:', inputValue);
    handleSubmit(e);
  };

  return (
    <div className="d-flex bg-white rounded-4 overflow-hidden">
      <div className="flex-grow-1 p-3">
        <div style={{ 
          color: '#999', 
          fontSize: '14px',
          marginBottom: '4px',
          marginLeft: '4px'
        }}>
          Your job title, keyword and location
        </div>
        <input 
          onChange={handleSearchInput} 
          type="text" 
          placeholder="Construction Jobs in Toronto" 
          className="border-0 w-100"
          style={{ 
            outline: 'none', 
            color: '#666',
            fontSize: '16px',
            paddingLeft: '4px'
          }}
          value={inputValue}
        />
      </div>
      <button 
        onClick={onSubmit}
        className="border-0 d-flex align-items-center justify-content-center" 
        style={{ 
          backgroundColor: '#87B441',
          color: 'white',
          fontSize: '16px',
          minWidth: '180px'
        }}
      >
        SEARCH
      </button>
    </div>
  );
};

export default SearchForm;
