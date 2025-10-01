function getSubdomain(hostname: string): string | null {
  // e.g. "alpha.localhost" → ["alpha", "localhost"]
  const parts = hostname.split(".");

  // Local dev case → subdomain.localhost
  if (parts.length >= 2 && parts[parts.length - 1] === "localhost") {
    return parts[0]; // "alpha"
  }

  // Production case → alpha.example.com
  if (parts.length > 2) {
    return parts[0]; // "alpha"
  }

  return null;
}

export default getSubdomain;
