"use client";
import { useEffect } from "react";
export function InteractionMode() {
  useEffect(() => {
    const keyboard = () => { document.documentElement.dataset.input = "keyboard"; };
    const pointer = () => { document.documentElement.dataset.input = "pointer"; };
    document.addEventListener("keydown", keyboard, true);
    document.addEventListener("pointerdown", pointer, true);
    document.addEventListener("pointermove", pointer, { passive: true });
    return () => { document.removeEventListener("keydown", keyboard, true); document.removeEventListener("pointerdown", pointer, true); document.removeEventListener("pointermove", pointer); };
  }, []);
  return null;
}
