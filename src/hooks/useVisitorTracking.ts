import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

function getSessionId(): string {
  let sid = sessionStorage.getItem("visitor_session_id");
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem("visitor_session_id", sid);
  }
  return sid;
}

function detectTrafficSource(referrer: string, utmSource?: string | null): string {
  if (utmSource) {
    const src = utmSource.toLowerCase();
    if (src.includes("instagram")) return "instagram";
    if (src.includes("facebook") || src.includes("fb")) return "facebook";
    if (src.includes("youtube") || src.includes("yt")) return "youtube";
    if (src.includes("twitter") || src.includes("x.com")) return "twitter";
    if (src.includes("linkedin")) return "linkedin";
    if (src.includes("whatsapp")) return "whatsapp";
    if (src.includes("telegram")) return "telegram";
    if (src.includes("google")) return "google";
    return src;
  }

  if (!referrer) return "direct";

  const ref = referrer.toLowerCase();
  if (ref.includes("instagram.com") || ref.includes("l.instagram.com")) return "instagram";
  if (ref.includes("facebook.com") || ref.includes("l.facebook.com") || ref.includes("fb.com")) return "facebook";
  if (ref.includes("youtube.com") || ref.includes("youtu.be")) return "youtube";
  if (ref.includes("twitter.com") || ref.includes("t.co") || ref.includes("x.com")) return "twitter";
  if (ref.includes("linkedin.com")) return "linkedin";
  if (ref.includes("whatsapp.com") || ref.includes("wa.me")) return "whatsapp";
  if (ref.includes("telegram.org") || ref.includes("t.me")) return "telegram";
  if (ref.includes("google.com") || ref.includes("google.co")) return "google";
  if (ref.includes("bing.com")) return "bing";
  return "other";
}

function getDeviceType(): string {
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

function getBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes("Chrome") && !ua.includes("Edg")) return "Chrome";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("Opera") || ua.includes("OPR")) return "Opera";
  return "Other";
}

export function useVisitorTracking() {
  const location = useLocation();

  useEffect(() => {
    const trackVisit = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const utmSource = params.get("utm_source");
        const utmMedium = params.get("utm_medium");
        const utmCampaign = params.get("utm_campaign");
        const referrer = document.referrer || "";

        const trafficSource = detectTrafficSource(referrer, utmSource);

        await supabase.from("page_visits").insert({
          page_path: location.pathname,
          referrer_url: referrer || null,
          traffic_source: trafficSource,
          utm_source: utmSource || null,
          utm_medium: utmMedium || null,
          utm_campaign: utmCampaign || null,
          device_type: getDeviceType(),
          browser: getBrowser(),
          screen_width: window.innerWidth,
          user_agent: navigator.userAgent.substring(0, 500),
          session_id: getSessionId(),
        });
      } catch (e) {
        // Silent fail - don't disrupt UX for analytics
        console.debug("Visit tracking failed:", e);
      }
    };

    trackVisit();
  }, [location.pathname]);
}
