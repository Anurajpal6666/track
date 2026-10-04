// Notification Engine: Service Worker registration, Web Push & Audio Chimes

export class NotificationEngine {
  private static audioCtx: AudioContext | null = null;

  public static async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return null;
    }

    try {
      const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      return reg;
    } catch (err) {
      console.warn("Service worker registration failed:", err);
      return null;
    }
  }

  public static async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "denied";
    }

    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (err) {
      console.error("Error requesting notification permission:", err);
      return "denied";
    }
  }

  public static playChime(): void {
    if (typeof window === "undefined") return;

    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioCtxClass();
      }

      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = "sine";
      // Subtle, luxury two-tone chime (520Hz -> 659.25Hz harmonic)
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12); // E5

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch (err) {
      // Audio playback silent fallback
    }
  }

  public static showSystemNotification(title: string, body: string, icon = "/icon-192.png"): void {
    if (typeof window === "undefined") return;

    this.playChime();

    if ("Notification" in window && Notification.permission === "granted") {
      try {
        if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: "TRIGGER_NOTIFICATION",
            title,
            body,
            icon,
          });
        } else {
          new Notification(title, {
            body,
            icon,
            badge: icon,
          });
        }
      } catch (err) {
        console.warn("Could not dispatch system notification:", err);
      }
    }
  }
}
