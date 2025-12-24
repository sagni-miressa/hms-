/**
 * reCAPTCHA Component
 * Supports both v2 (checkbox) and v3 (invisible)
 * React 18 + StrictMode safe
 */

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (
        siteKey: string,
        options: { action: string }
      ) => Promise<string>;
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
        }
      ) => number;
      reset: (widgetId?: number) => void;
    };
  }
}

interface RecaptchaProps {
  siteKey: string;
  onChange: (token: string | null) => void;
  onError?: (error: string) => void;
  version?: "v2" | "v3";
  action?: string; // For v3
  className?: string;
}

export const Recaptcha = ({
  siteKey,
  onChange,
  onError,
  version = "v2",
  action = "register",
  className = "",
}: RecaptchaProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  /* -------------------------------------------------------
   * Load reCAPTCHA script ONCE (never remove it)
   * ----------------------------------------------------- */
  useEffect(() => {
    if (window.grecaptcha) {
      setIsLoaded(true);
      return;
    }

    if (document.querySelector("script[src*='recaptcha/api.js']")) {
      return;
    }

    const script = document.createElement("script");
    script.src =
      version === "v3"
        ? `https://www.google.com/recaptcha/api.js?render=${siteKey}`
        : "https://www.google.com/recaptcha/api.js";
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => onError?.("Failed to load reCAPTCHA script");

    document.head.appendChild(script);
  }, [siteKey, version, onError]);

  /* -------------------------------------------------------
   * Initialize reCAPTCHA v2 (render ONCE)
   * ----------------------------------------------------- */
  useEffect(() => {
    if (
      !isLoaded ||
      version !== "v2" ||
      !containerRef.current ||
      widgetIdRef.current !== null
    ) {
      return;
    }

    window.grecaptcha.ready(() => {
      widgetIdRef.current = window.grecaptcha.render(
        containerRef.current!,
        {
          sitekey: siteKey,
          callback: (token: string) => onChange(token),
          "error-callback": () => {
            onChange(null);
            onError?.("reCAPTCHA verification failed");
          },
        }
      );
    });
  }, [isLoaded, version, siteKey, onChange, onError]);

  /* -------------------------------------------------------
   * Execute reCAPTCHA v3 (invisible)
   * ----------------------------------------------------- */
  useEffect(() => {
    if (!isLoaded || version !== "v3") return;

    window.grecaptcha.ready(async () => {
      try {
        const token = await window.grecaptcha.execute(siteKey, { action });
        onChange(token);
      } catch (error) {
        onChange(null);
        onError?.(
          `reCAPTCHA v3 execution failed: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    });
  }, [isLoaded, version, siteKey, action, onChange, onError]);

  /* -------------------------------------------------------
   * Render
   * ----------------------------------------------------- */
  if (version === "v2") {
    return <div ref={containerRef} className={className} />;
  }

  // v3 is invisible
  return null;
};
