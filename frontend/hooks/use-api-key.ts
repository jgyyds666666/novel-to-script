"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "novel-to-script:api-key";

export function useApiKey() {
  const [apiKey, setApiKeyState] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setApiKeyState(localStorage.getItem(STORAGE_KEY) || "");
    setLoaded(true);
  }, []);

  const setApiKey = (key: string) => {
    const trimmed = key.trim();
    if (trimmed) {
      localStorage.setItem(STORAGE_KEY, trimmed);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setApiKeyState(trimmed);
  };

  const clearApiKey = () => {
    localStorage.removeItem(STORAGE_KEY);
    setApiKeyState("");
  };

  return {
    apiKey,
    setApiKey,
    clearApiKey,
    loaded,
    hasKey: loaded && !!apiKey,
  };
}
