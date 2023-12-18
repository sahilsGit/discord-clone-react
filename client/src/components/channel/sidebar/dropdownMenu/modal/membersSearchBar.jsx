import { Input } from "@/components/ui/input";
import React from "react";

const MembersSearchBar = ({ onSearchTermChange, purgeResults }) => {
  const handleInputChange = (e) => {
    const term = e.target.value;
    onSearchTermChange(term);
    purgeResults();
  };

  return (
    <Input
      className="rounded-sm h-8 bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
      placeholder="Search member"
      onChange={handleInputChange}
    ></Input>
  );
};

export default MembersSearchBar;
