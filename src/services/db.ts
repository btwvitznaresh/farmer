import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Booking } from '../types/services';

interface AgroTalkDB extends DBSchema {
    bookings: {
        key: string;
        value: Booking;
        indexes: { 'by-status': string, 'by-date': string };
    };
    market_data: {
        key: string;
        value: {
            id: string; // state_district_market_commodity
            state: string;
            district: string;
            market: string;
            commodity: string;
            modal_price: string;
            min_price: string;
            max_price: string;
            arrival_date: string;
            timestamp: number;
        };
        indexes: { 'by-commodity': string };
    };
    chat_history: {
        key: string;
        value: {
            id: string;
            conversationId: string;
            role: 'user' | 'assistant';
            content: string;
            timestamp: number; // Stored as timestamp for easier sorting
            type: 'text' | 'voice';
            condition?: string;
        };
        indexes: { 'by-conversation': string, 'by-timestamp': number };
    };
    library_items: {
        key: string;
        value: {
            id: string;
            diseaseName: string;
            diseaseNameHi: string;
            cropType: string;
            cropTypeHi: string;
            confidence: number;
            severity: string;
            timestamp: string;
            thumbnail: string; // Base64 or Blob URL
            summary: string;
            summaryHi: string;
            synced: boolean; // True if synced with backend
        };
        indexes: { 'by-timestamp': string };
    };
    recent_queries: {
        key: string;
        value: {
            id: string;
            query: string;
            response: string;
            timestamp: number;
            conversationId?: string;
        };
        indexes: { 'by-timestamp': number };
    };
    weather_cache: {
        key: string;
        value: {
            id: 'current';
            data: any;
            lastUpdated: number;
        };
    };
    ai_cache: {
        key: string; // hash of query
        value: {
            key: string; // Required for keyPath
            query: string;
            response: string;
            timestamp: number;
        };
    };
    agent_orders: {
        key: string;
        value: {
            id: string;
            crop: string;
            quantity: string;
            location: string;
            price_estimate: string;
            status: string;
            buyer_name: string;
            timestamp: number;
        };
        indexes: { 'by-timestamp': number };
    };
}

const DB_NAME = 'agrotalk-db';
const DB_VERSION = 4; // bumped: adds bookings store

export const dbService = {
    dbPromise: null as Promise<IDBPDatabase<AgroTalkDB>> | null,

    async getDB() {
        if (!this.dbPromise) {
            this.dbPromise = openDB<AgroTalkDB>(DB_NAME, DB_VERSION, {
                upgrade(db) {
                    // Market Data Store
                    if (!db.objectStoreNames.contains('market_data')) {
                        const marketStore = db.createObjectStore('market_data', { keyPath: 'id' });
                        marketStore.createIndex('by-commodity', 'commodity');
                    }

                    // Chat History Store
                    if (!db.objectStoreNames.contains('chat_history')) {
                        const chatStore = db.createObjectStore('chat_history', { keyPath: 'id' });
                        chatStore.createIndex('by-conversation', 'conversationId');
                        chatStore.createIndex('by-timestamp', 'timestamp');
                    }

                    // Library Store
                    if (!db.objectStoreNames.contains('library_items')) {
                        const libraryStore = db.createObjectStore('library_items', { keyPath: 'id' });
                        libraryStore.createIndex('by-timestamp', 'timestamp');
                    }

                    // Recent Queries Store
                    if (!db.objectStoreNames.contains('recent_queries')) {
                        const queryStore = db.createObjectStore('recent_queries', { keyPath: 'id' });
                        queryStore.createIndex('by-timestamp', 'timestamp');
                    }

                    // Weather Cache Store
                    if (!db.objectStoreNames.contains('weather_cache')) {
                        db.createObjectStore('weather_cache', { keyPath: 'id' });
                    }

                    // AI Cache Store
                    if (!db.objectStoreNames.contains('ai_cache')) {
                        db.createObjectStore('ai_cache', { keyPath: 'key' });
                    }

                    // Agent Orders Store
                    if (!db.objectStoreNames.contains('agent_orders')) {
                        const ordersStore = db.createObjectStore('agent_orders', { keyPath: 'id' });
                        ordersStore.createIndex('by-timestamp', 'timestamp');
                    }

                    // Bookings Store
                    if (!db.objectStoreNames.contains('bookings')) {
                        const bookingsStore = db.createObjectStore('bookings', { keyPath: 'id' });
                        bookingsStore.createIndex('by-status', 'status');
                        bookingsStore.createIndex('by-date', 'scheduledDate');
                    }
                },
            });
        }
        return this.dbPromise;
    },

    // --- Generic Helpers ---

    async put<StoreName extends keyof AgroTalkDB>(storeName: StoreName, value: AgroTalkDB[StoreName]['value']) {
        const db = await this.getDB();
        return db.put(storeName, value);
    },

    async get<StoreName extends keyof AgroTalkDB>(storeName: StoreName, key: AgroTalkDB[StoreName]['key']) {
        const db = await this.getDB();
        return db.get(storeName, key);
    },

    async getAll<StoreName extends keyof AgroTalkDB>(storeName: StoreName) {
        const db = await this.getDB();
        return db.getAll(storeName);
    },

    async getAllFromIndex<StoreName extends keyof AgroTalkDB>(
        storeName: StoreName,
        indexName: keyof AgroTalkDB[StoreName]['indexes'],
        query?: IDBValidKey | IDBKeyRange
    ) {
        const db = await this.getDB();
        return db.getAllFromIndex(storeName, indexName as any, query);
    },

    async delete<StoreName extends keyof AgroTalkDB>(storeName: StoreName, key: AgroTalkDB[StoreName]['key']) {
        const db = await this.getDB();
        return db.delete(storeName, key);
    },

    async clear(storeName: keyof AgroTalkDB) {
        const db = await this.getDB();
        return db.clear(storeName);
    }
};

// --- Booking Wrappers ---

export async function saveBooking(booking: Booking): Promise<void> {
    await dbService.put('bookings', booking);
}

export async function getBookings(): Promise<Booking[]> {
    return await dbService.getAll('bookings');
}

export async function getBookingById(id: string): Promise<Booking | undefined> {
    return await dbService.get('bookings', id);
}

export async function updateBookingStatus(id: string, status: Booking['status']): Promise<void> {
    const booking = await getBookingById(id);
    if (booking) {
        booking.status = status;
        await saveBooking(booking);
    }
}

export async function deleteBooking(id: string): Promise<void> {
    await dbService.delete('bookings', id);
}
