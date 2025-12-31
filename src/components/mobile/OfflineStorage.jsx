// Offline storage utilities using IndexedDB
const DB_NAME = 'InformMeOfflineDB';
const DB_VERSION = 1;

const STORES = {
    FORMS: 'forms',
    CHECKLISTS: 'checklists',
    TASKS: 'tasks',
    SUBMISSIONS: 'submissions',
    SYNC_QUEUE: 'syncQueue'
};

class OfflineStorage {
    constructor() {
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create stores if they don't exist
                if (!db.objectStoreNames.contains(STORES.FORMS)) {
                    db.createObjectStore(STORES.FORMS, { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains(STORES.CHECKLISTS)) {
                    db.createObjectStore(STORES.CHECKLISTS, { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains(STORES.TASKS)) {
                    db.createObjectStore(STORES.TASKS, { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains(STORES.SUBMISSIONS)) {
                    const store = db.createObjectStore(STORES.SUBMISSIONS, { keyPath: 'tempId', autoIncrement: true });
                    store.createIndex('synced', 'synced', { unique: false });
                }
                if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
                    db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id', autoIncrement: true });
                }
            };
        });
    }

    async saveData(storeName, data) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async saveMany(storeName, dataArray) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            
            dataArray.forEach(data => store.put(data));
            
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }

    async getData(storeName, id) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllData(storeName) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteData(storeName, id) {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async addToSyncQueue(action, entity, data) {
        return this.saveData(STORES.SYNC_QUEUE, {
            action,
            entity,
            data,
            timestamp: Date.now(),
            synced: false
        });
    }

    async getSyncQueue() {
        return this.getAllData(STORES.SYNC_QUEUE);
    }

    async clearSyncQueue() {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORES.SYNC_QUEUE], 'readwrite');
            const store = transaction.objectStore(STORES.SYNC_QUEUE);
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}

export const offlineStorage = new OfflineStorage();

// Hook for using offline storage
export function useOfflineStorage(storeName) {
    const [data, setData] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        loadData();
    }, [storeName]);

    const loadData = async () => {
        try {
            const result = await offlineStorage.getAllData(storeName);
            setData(result);
        } catch (error) {
            console.error('Failed to load offline data:', error);
        } finally {
            setLoading(false);
        }
    };

    const save = async (item) => {
        await offlineStorage.saveData(storeName, item);
        await loadData();
    };

    const saveMany = async (items) => {
        await offlineStorage.saveMany(storeName, items);
        await loadData();
    };

    const remove = async (id) => {
        await offlineStorage.deleteData(storeName, id);
        await loadData();
    };

    return { data, loading, save, saveMany, remove, refresh: loadData };
}