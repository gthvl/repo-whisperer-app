// TikTok Pixel is now loaded inline in index.html for earliest possible initialization.
// This file only exports the tracking helper.

export function trackTikTokEvent(eventName: string, params?: Record<string, any>) {
  const ttq = (window as any).ttq;
  if (ttq) {
    ttq.track(eventName, params || {});
  }
}
