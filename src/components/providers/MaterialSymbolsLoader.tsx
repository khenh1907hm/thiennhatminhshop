"use client";

import { useEffect } from "react";

const fontUrl = "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap";

export default function MaterialSymbolsLoader() {
  useEffect(() => {
    if (document.querySelector(`link[href="${fontUrl}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = fontUrl;
    document.head.appendChild(link);
  }, []);

  return null;
}
