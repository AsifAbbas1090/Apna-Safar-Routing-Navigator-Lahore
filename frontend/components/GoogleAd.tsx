"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";

interface GoogleAdProps {
  adUnitId?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Google AdSense Component
 * Only shows ads for free (non-premium) users
 */
export default function GoogleAd({ adUnitId, className = "", style }: GoogleAdProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, user } = useAuthStore();
  const isPremium = user?.isPremium || false;

  useEffect(() => {
    // Only show ads for free users
    if (isPremium || !isAuthenticated) {
      return;
    }

    // Don't load AdSense if publisher ID is not configured
    const publisherId = "ca-pub-YOUR_PUBLISHER_ID";
    if (publisherId.includes("YOUR_PUBLISHER_ID")) {
      // Publisher ID not configured, skip loading ads
      return;
    }

    // Load Google AdSense script only once
    if (!(window as any).adsbygoogle && adRef.current && !document.querySelector(`script[src*="adsbygoogle"]`)) {
      const script = document.createElement("script");
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
      script.async = true;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);

      script.onload = () => {
        if (adRef.current && (window as any).adsbygoogle) {
          try {
            // Only push if this specific ad element hasn't been initialized
            if (!adRef.current.dataset.adsbygoogleStatus) {
              ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
              adRef.current.dataset.adsbygoogleStatus = "initialized";
            }
          } catch (err) {
            console.error("AdSense error:", err);
          }
        }
      };
    } else if (adRef.current && (window as any).adsbygoogle && !adRef.current.dataset.adsbygoogleStatus) {
      // Script already loaded, just initialize this ad
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        adRef.current.dataset.adsbygoogleStatus = "initialized";
      } catch (err) {
        console.error("AdSense error:", err);
      }
    }
  }, [isPremium, isAuthenticated]);

  // Don't render ads for premium users or if not authenticated
  if (isPremium || !isAuthenticated) {
    return null;
  }

  // Don't render if publisher ID is not configured
  const publisherId = "ca-pub-YOUR_PUBLISHER_ID";
  if (publisherId.includes("YOUR_PUBLISHER_ID")) {
    return null; // Publisher ID not configured
  }

  return (
    <div className={className} style={style}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={publisherId}
        data-ad-slot={adUnitId || "YOUR_AD_SLOT_ID"}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

