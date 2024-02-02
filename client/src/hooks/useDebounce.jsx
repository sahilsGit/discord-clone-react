import { useState, useEffect } from "react";

const useDebounce = (searchTerm, delay = 1000) => {
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length < 3) {
        setError("The search term must include at least 3 characters");
        return;
      }

      setDebouncedTerm(searchTerm);
    }, delay);

    return () => clearTimeout(timer);
  }, [searchTerm, delay, error]);

  return { debouncedTerm, error };
};

export default useDebounce;
