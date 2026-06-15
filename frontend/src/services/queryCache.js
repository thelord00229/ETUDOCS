const PREFIX = "etudocs_query_cache:";
const memory = new Map();

const now = () => Date.now();

const storageKey = (key) => `${PREFIX}${key}`;

const readStored = (key) => {
  try {
    const raw = sessionStorage.getItem(storageKey(key));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeStored = (key, entry) => {
  try {
    sessionStorage.setItem(storageKey(key), JSON.stringify(entry));
  } catch {
    // Le cache est un confort UI; l'application doit continuer si le storage est indisponible.
  }
};

export const getCachedQuery = (key) => {
  const entry = memory.get(key) || readStored(key);
  return entry ? entry.data : undefined;
};

export const setCachedQuery = (key, data) => {
  const entry = { data, updatedAt: now() };
  memory.set(key, entry);
  writeStored(key, entry);
  return data;
};

export const fetchCachedQuery = async (
  key,
  fetcher,
  { ttl = 45000, force = false } = {}
) => {
  const entry = memory.get(key) || readStored(key);
  if (!force && entry && now() - Number(entry.updatedAt || 0) < ttl) {
    memory.set(key, entry);
    return entry.data;
  }

  const data = await fetcher();
  return setCachedQuery(key, data);
};

export const invalidateQuery = (key) => {
  memory.delete(key);
  try {
    sessionStorage.removeItem(storageKey(key));
  } catch {
    // Rien a faire.
  }
};

export const clearQueryCache = () => {
  memory.clear();
  try {
    Object.keys(sessionStorage)
      .filter((key) => key.startsWith(PREFIX))
      .forEach((key) => sessionStorage.removeItem(key));
  } catch {
    // Rien a faire.
  }
};
