interface WowConstructor {
  new (options?: { live: boolean }): {
    init(): void;
  };
}

declare global {
  interface Window {
    WOW: any;
  }
}

export const wowInit = () => {
  if (typeof window !== "undefined") {
    require('wowjs');
    if (window.WOW) {
      new window.WOW({
        live: false
      }).init();
    }
  }
};

// Alias for backward compatibility
export const animationCreate = wowInit;