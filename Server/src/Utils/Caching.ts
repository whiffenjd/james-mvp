import NodeCache from "node-cache";
export type Role = "admin" | "investor" | "fundManager";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};
// Configure cache with longer TTL
const cache = new NodeCache({
  stdTTL: 300, // 5 minutes default TTL
  checkperiod: 60, // Check for expired keys every minute
  useClones: false, // Disable cloning for better performance
});

// Enhanced cache utilities with performance monitoring
export const setCache = <T>(key: string, value: T, ttl?: number) => {
  const result =
    ttl !== undefined ? cache.set(key, value, ttl) : cache.set(key, value);
  return result;
};

export const getCache = <T>(key: string): T | undefined => {
  const value = cache.get<T>(key);

  return value;
};

export const deleteCache = (key: string) => {
  return cache.del(key);
};

export const clearCache = () => {
  return cache.flushAll();
};

export default cache;
