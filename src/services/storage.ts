// A generic wrapper around localStorage to simulate async API calls

export const storage = {
  get: async <T>(key: string, defaultValue: T): Promise<T> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const item = localStorage.getItem(key);
        if (item) {
          try {
            resolve(JSON.parse(item) as T);
          } catch (e) {
            resolve(defaultValue);
          }
        } else {
          resolve(defaultValue);
        }
      }, 100); // 100ms simulated delay
    });
  },

  set: async <T>(key: string, value: T): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.setItem(key, JSON.stringify(value));
        resolve();
      }, 100);
    });
  },
  
  remove: async (key: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.removeItem(key);
        resolve();
      }, 100);
    });
  }
};
