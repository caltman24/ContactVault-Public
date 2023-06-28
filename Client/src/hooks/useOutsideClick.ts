import { useEffect, useRef } from "react";

interface OutSideClickOptions {
  setState: () => void;
}

export default function useOutsideClick<T extends HTMLElement>({
  setState,
}: OutSideClickOptions) {
  const TRef = useRef<T>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (TRef.current && !TRef.current.contains(e.target as Node)) {
        setState();
      }
    };

    document.addEventListener("click", handleOutsideClick, true);

    return () => {
      document.removeEventListener("click", handleOutsideClick, true);
    };
  }, [setState]);

  return TRef;
}
