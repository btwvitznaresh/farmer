/**
 * ArjunApiClient — Frontend API calls to the Arjun backend agent
 */

const BACKEND_URL = 'http://localhost:3001';

import type { AgentMemory } from './AgentMemory';
import type { ConversationMessage } from '@/lib/apiClient';

export interface ArjunChatRequest {
    message: string;
    language: string;
    agentMemory: AgentMemory;
    conversationHistory: ConversationMessage[];
    weatherContext?: { temp: number; humidity: number; condition: number } | null;
}

export interface ArjunChatResponse {
    success: boolean;
    response?: string;         // Clean text without action tags
    actions?: string[];        // e.g. ['BOOK_SERVICE', 'FETCH_MANDI']
    updatedMemory?: AgentMemory;
    error?: string;
}

/**
 * Send a message to Arjun and get a conversational response.
 */
export async function callArjunAgent(req: ArjunChatRequest): Promise<ArjunChatResponse> {
    try {
        const response = await fetch(`${BACKEND_URL}/agent/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req),
            signal: AbortSignal.timeout(35000)
        });

        const data = await response.json();

        if (!response.ok) {
            return { success: false, error: data.error || `Server error ${response.status}` };
        }

        return {
            success: true,
            response: data.response,
            actions: data.actions || [],
            updatedMemory: data.updatedMemory
        };
    } catch (error) {
        console.error('[ArjunApiClient] Error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Connection failed'
        };
    }
}

/**
 * Get Arjun's time-aware greeting.
 */
export async function fetchArjunGreeting(language: string): Promise<string> {
    const defaultGreetings: Record<string, string> = {
        en: "Hello! How are your crops doing today?",
        hi: "नमस्ते! आज खेत कैसा है?",
        ta: "வணக்கம்! இன்று பயிர் எப்படி இருக்கு?",
        te: "నమస్కారం! ఈరోజు పంట ఎలా ఉంది?",
        mr: "नमस्कार! आज पीक कसं आहे?"
    };

    try {
        const response = await fetch(`${BACKEND_URL}/agent/greeting?language=${language}`, {
            signal: AbortSignal.timeout(5000)
        });
        if (!response.ok) throw new Error('Non-OK');
        const data = await response.json();
        return data.greeting || defaultGreetings[language] || defaultGreetings.en;
    } catch {
        return defaultGreetings[language] || defaultGreetings.en;
    }
}
