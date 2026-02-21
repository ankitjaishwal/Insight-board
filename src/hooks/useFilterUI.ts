import { useState } from "react";

interface UseFilterUIReturn {
  isAdvancedExpanded: boolean;
  setIsAdvancedExpanded: (expanded: boolean) => void;
  shouldShowAdvanced: (hasAdvancedFilters: boolean) => boolean;
}

export const useFilterUI = (): UseFilterUIReturn => {
  const [isAdvancedExpanded, setIsAdvancedExpanded] = useState(false);

  const shouldShowAdvanced = (hasAdvancedFilters: boolean): boolean => {
    return isAdvancedExpanded || hasAdvancedFilters;
  };

  return {
    isAdvancedExpanded,
    setIsAdvancedExpanded,
    shouldShowAdvanced,
  };
};
