export class SimpleDB {
  private dbName: string;
  private version: number;
  private db: IDBDatabase | null = null;
  private storeName = "kv";

  constructor(dbName = "appDB", version = 1) {
    this.dbName = dbName;
    this.version = version;
  }

  async open(): Promise<void> {
    if (this.db) return;
    this.db = await new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: "key" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private tx(mode: IDBTransactionMode = "readonly"): IDBObjectStore {
    if (!this.db) throw new Error("DB not opened");
    const t = this.db.transaction(this.storeName, mode);
    return t.objectStore(this.storeName);
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    await this.open();
    return new Promise((resolve, reject) => {
      const req = this.tx("readonly").get(key);
      req.onsuccess = () => resolve((req.result?.value as T) ?? null);
      req.onerror = () => reject(req.error);
    });
  }

  async set<T = unknown>(key: string, value: T): Promise<void> {
    await this.open();
    return new Promise((resolve, reject) => {
      const req = this.tx("readwrite").put({ key, value });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async delete(key: string): Promise<void> {
    await this.open();
    return new Promise((resolve, reject) => {
      const req = this.tx("readwrite").delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }
}
