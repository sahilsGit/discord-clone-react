import React, { useState } from "react";
import { DropdownMenuSeparator } from "@/components/ui/dropdownMenu";
import MembersScrollArea from "./membersScrollArea";
import MembersSearchBar from "./membersSearchBar";

const MembersWrapper = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState("");
  const handleSearchTermChange = (term) => {
    setSearchTerm(term);
  };
  const handlePurgeResults = () => {
    setResults([]);
  };

  return (
    <div className="flex flex-col gap-y-3">
      <MembersSearchBar
        onSearchTermChange={handleSearchTermChange}
        purgeResults={handlePurgeResults}
      />
      <MembersScrollArea
        searchTerm={searchTerm}
        results={results}
        setResults={setResults}
      />
      <div>
        <DropdownMenuSeparator className="bg-zinc-300/50 m-0 mb-[1px]" />
        <p className="text-xxxs text-zinc-500">
          Tip: Scroll down to load more.
        </p>
      </div>
    </div>
  );
};

export default MembersWrapper;
