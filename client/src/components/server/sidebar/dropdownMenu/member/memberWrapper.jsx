import React, { useState } from "react";
import { DropdownMenuSeparator } from "@/components/ui/dropdownMenu";
import MemberScrollArea from "./memberScrollArea";
import MemberSearchBar from "./memberSearchBar";

const MemberWrapper = () => {
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
      <MemberSearchBar
        onSearchTermChange={handleSearchTermChange}
        purgeResults={handlePurgeResults}
      />
      <MemberScrollArea
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

export default MemberWrapper;
