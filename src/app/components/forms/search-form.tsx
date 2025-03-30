import React from "react";
import useSearchFormSubmit from "@/hooks/use-search-form-submit";

const SearchForm = () => {
  const { handleSubmit, setSearchText } = useSearchFormSubmit();

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
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
        />
      </div>
      <button 
        onClick={handleSubmit}
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
