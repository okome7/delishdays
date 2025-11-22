// indexedDB.js（シンプル版）
const DB_NAME = "DelishDaysDB";
const STORE_NAME = "posts";
const VERSION = 1;

let dbPromise = null;

export function openDB() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      db.onclose = () => {
        dbPromise = null;
      };
      db.onversionchange = () => {
        db.close();
        dbPromise = null;
      };
      resolve(db);
    };

    request.onerror = () => {
      dbPromise = null;
      reject(request.error);
    };

    request.onblocked = () => {
      // ブロックは無視
    };
  });

  return dbPromise;
}

function safeImagesArray(post) {
  try {
    return post.images?.filter((img) => typeof img === "string") || [];
  } catch {
    return [];
  }
}

export async function savePost(post) {
  const db = await openDB();
  const clonePost = { ...post, images: safeImagesArray(post) };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(clonePost);

    req.onsuccess = () => {};
    req.onerror = (e) => reject(req.error || e);

    tx.oncomplete = () => resolve(clonePost);
    tx.onerror = (e) => reject(tx.error || e);
    tx.onabort = (e) => reject(e);
  });
}

export async function getAllPosts() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();

    req.onsuccess = () => resolve(req.result);
    req.onerror = (e) => reject(req.error || e);

    tx.oncomplete = () => {};
    tx.onerror = () => {};
  });
}

export async function clearPosts() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.clear();

    req.onsuccess = () => {};
    req.onerror = (e) => reject(req.error || e);

    tx.oncomplete = () => resolve();
    tx.onerror = (e) => reject(tx.error || e);
  });
}

export async function deletePost(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);

    req.onsuccess = () => {};
    req.onerror = (e) => reject(req.error || e);

    tx.oncomplete = () => resolve();
    tx.onerror = (e) => reject(tx.error || e);
  });
}

export async function updatePost(updatedPost) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(updatedPost);

    req.onsuccess = () => {};
    req.onerror = (e) => reject(req.error || e);

    tx.oncomplete = () => resolve(updatedPost);
    tx.onerror = (e) => reject(tx.error || e);
  });
}
