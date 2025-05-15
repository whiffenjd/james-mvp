import NodeCache from "node-cache";

// Default TTL = 60 seconds (you can configure per key too)
const cache = new NodeCache({ stdTTL: 300, checkperiod: 300 });

export const setCache = <T>(key: string, value: T, ttl?: number) => {
  if (ttl !== undefined) {
    cache.set(key, value, ttl);
  } else {
    cache.set(key, value);
  }
};

export const getCache = <T>(key: string): T | undefined => {
  return cache.get(key);
};

export const deleteCache = (key: string) => {
  cache.del(key);
};

export const clearCache = () => {
  cache.flushAll();
};

export default cache;
