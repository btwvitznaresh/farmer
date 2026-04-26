/**
 * AgentMemory — Arjun's session memory manager
 * 
 * Tracks everything Arjun knows about this farmer in this session.
 * Persists across page refreshes via sessionStorage.
 */

export interface AgentMemory {
    farmerName: string | null;
    location: string | null;
    crops: string[];
    problems: string[];
    conversationTurn: number;
    currentTopic: string | null;
    emotionalState: 'neutral' | 'happy' | 'worried' | 'frustrated' | 'distressed';
    language: string;
    lastFollowUpQuestion: string | null;
    sessionStartTime: number;
}

const STORAGE_KEY = 'arjun_agent_memory';

export const defaultMemory = (): AgentMemory => ({
    farmerName: null,
    location: null,
    crops: [],
    problems: [],
    conversationTurn: 0,
    currentTopic: null,
    emotionalState: 'neutral',
    language: 'en',
    lastFollowUpQuestion: null,
    sessionStartTime: Date.now()
});

/**
 * Save memory to sessionStorage (survives hot reload, resets on tab close)
 */
export function saveMemory(memory: AgentMemory): void {
    try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
    } catch (e) {
        console.warn('[AgentMemory] Could not save to sessionStorage:', e);
    }
}

/**
 * Load memory from sessionStorage. Returns fresh memory if not found.
 */
export function loadMemory(): AgentMemory {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            // Validate session — restart if older than 2 hours
            const age = Date.now() - (parsed.sessionStartTime || 0);
            if (age < 2 * 60 * 60 * 1000) {
                return parsed as AgentMemory;
            }
        }
    } catch (e) {
        console.warn('[AgentMemory] Could not load from sessionStorage:', e);
    }
    return defaultMemory();
}

/**
 * Clear memory for a fresh session.
 */
export function clearMemory(): void {
    try {
        sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) { /* ignore */ }
}

/**
 * Get a human-readable summary of what Arjun knows.
 * Used for debugging / display.
 */
export function getMemorySummary(memory: AgentMemory): string {
    const parts: string[] = [];
    if (memory.farmerName) parts.push(`Name: ${memory.farmerName}`);
    if (memory.location) parts.push(`Location: ${memory.location}`);
    if (memory.crops.length > 0) parts.push(`Crops: ${memory.crops.join(', ')}`);
    if (memory.problems.length > 0) parts.push(`Issues: ${memory.problems.join(', ')}`);
    if (memory.currentTopic) parts.push(`Topic: ${memory.currentTopic}`);
    return parts.join(' | ') || 'Fresh session';
}
