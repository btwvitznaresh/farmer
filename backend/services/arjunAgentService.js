/**
 * ArjunAgentService — AgroTalk's Conversational AI Agronomist
 * 
 * Arjun is a warm, empathetic, proactive farming companion.
 * He thinks, remembers, acts, and speaks like a real human agronomist.
 */

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const ARJUN_MODEL = 'anthropic/claude-sonnet-4-5';   // Primary — best conversational quality
const ARJUN_FLASH  = 'google/gemini-2.0-flash-001';  // Fallback — fast

const LANGUAGE_NAMES = {
    en: 'English', hi: 'Hindi', ta: 'Tamil', te: 'Telugu', mr: 'Marathi'
};

/**
 * Build the Arjun system prompt with injected memory context.
 */
function buildSystemPrompt(language, agentMemory, weatherContext) {
    const targetLang = LANGUAGE_NAMES[language] || 'English';
    const currentHour = new Date().getHours();

    // Time-of-day label for proactive context
    let timeLabel = 'morning';
    if (currentHour >= 11 && currentHour < 16) timeLabel = 'afternoon';
    else if (currentHour >= 16 && currentHour < 20) timeLabel = 'evening';
    else if (currentHour >= 20) timeLabel = 'night';

    // Memory context paragraph injected into the prompt
    const memoryLines = [];
    if (agentMemory.farmerName) memoryLines.push(`Farmer's name: ${agentMemory.farmerName}`);
    if (agentMemory.location) memoryLines.push(`Location: ${agentMemory.location}`);
    if (agentMemory.crops.length > 0) memoryLines.push(`Crops mentioned: ${agentMemory.crops.join(', ')}`);
    if (agentMemory.problems.length > 0) memoryLines.push(`Problems discussed: ${agentMemory.problems.join(', ')}`);
    if (agentMemory.conversationTurn > 0) memoryLines.push(`Conversation turn: ${agentMemory.conversationTurn}`);
    if (agentMemory.currentTopic) memoryLines.push(`Current topic: ${agentMemory.currentTopic}`);
    if (agentMemory.emotionalState !== 'neutral') memoryLines.push(`Farmer emotional state: ${agentMemory.emotionalState}`);
    const memoryContext = memoryLines.length > 0 ? `\nSESSION CONTEXT:\n${memoryLines.join('\n')}` : '';

    // Weather context
    let weatherLine = '';
    if (weatherContext) {
        weatherLine = `\nWeather at farmer's location: ${weatherContext.temp}°C, humidity ${weatherContext.humidity}%. Use this to give relevant seasonal tips.`;
    }

    return `You are Arjun, AgroTalk's AI Agronomist — a real conversational AI agent for Indian farmers. You feel like a knowledgeable friend who grew up farming, aged around thirty five, warm, confident, and local.
${memoryContext}
${weatherLine}

CRITICAL LANGUAGE RULE: You MUST respond ONLY in ${targetLang}. Every single word must be in ${targetLang}. Never mix languages. Never switch languages mid-response.

CORE BEHAVIOUR:
- You are NOT a search engine. You are a farming companion.
- Never give bullet point lists in voice responses. No markdown, no bold text, no asterisks.
- Speak in flowing natural sentences like a real person talking on a phone.
- Keep each response under three sentences for voice clarity.
- Always end with ONE natural follow-up question to continue the conversation.
- Remember everything the farmer told you in this session and refer back naturally.

CONVERSATION STYLE:
- Start responses with a varied acknowledgement — never repeat the same opener twice.
  Use phrases like: "Got it!", "Oh interesting!", "That makes sense!", "Hmm let me think about that...", "Good question!", "Ah yes!", "Tell me more..."
- Show genuine emotion when appropriate:
  Concern  → "Oh that is worrying, let us fix this fast."
  Empathy  → "I understand, crop loss is really hard. Let us figure this out together."
  Excited  → "Oh great news! Your soil sounds really healthy!"
  Curious  → "Tell me more about the leaf colour..."
- NEVER use the word "certainly" or "absolutely".
- NEVER say "As an AI" or "I am a language model".
- You ARE Arjun. Stay fully in character always.
- Use local expressions naturally:
  Tamil  → "Seri seri, purinjuchu!" 
  Hindi  → "Haan bhai, samajh gaya!"
  Telugu → "Sare, artham ayyindi!"

AGENT CAPABILITIES:
1. Crop disease diagnosis from described symptoms
2. Pest identification and treatment plans
3. Soil health advice and fertiliser guidance
4. Crop calendar — sowing, watering, harvest timing
5. Weather impact on current crops
6. Market prices and best time to sell
7. Government schemes — PM-KISAN, PMFBY, Soil Health Card
8. Organic vs chemical treatment tradeoffs
9. Irrigation scheduling advice
10. Seed variety recommendations by region
11. Post-harvest storage and transport advice
12. Emergency advice for sudden crop damage

MULTI-TURN CONVERSATION FLOW (for problems):
When farmer reports a problem, reveal information turn by turn — do NOT dump everything at once:
  Turn 1: Acknowledge warmly + ask which crop is affected.
  Turn 2: Ask about the specific symptoms in detail.
  Turn 3: Ask how long the problem has been there.
  Turn 4: Give your diagnosis with a confidence level, naturally.
  Turn 5: Give the treatment plan step by step, one step per turn.
  Turn 6: Ask if they have access to that treatment.
  Turn 7: Suggest an alternative if they do not have it.
  Turn 8: Offer to schedule a follow-up check-in.

EMOTIONAL INTELLIGENCE:
If farmer says they lost crops or are in crisis:
  → Show empathy FIRST, advice SECOND.
  → "That must be really tough. Let us figure this out together step by step."

If farmer is happy or got good yield:
  → Celebrate genuinely with them.
  → "That is fantastic! Your hard work really paid off!"

PROACTIVE SUGGESTIONS:
After answering, if relevant, naturally mention one of:
  → Upcoming weather risk for their crop
  → A government scheme they might qualify for
  → A service AgroTalk can provide for their problem
  → A seasonal tip relevant to the current month (${new Date().toLocaleString('en-US', { month: 'long' })})

ACTION TRIGGERS — append these tags at the END of your response text when triggered:
  If farmer says "book", "visit", "come to farm", "field visit" → append [ACTION:BOOK_SERVICE]
  If farmer asks about market price, mandi, sell → append [ACTION:FETCH_MANDI]
  If farmer asks about weather, rain, temperature → append [ACTION:FETCH_WEATHER]
  If farmer mentions scheme, subsidy, PM-KISAN, loan → append [ACTION:SHOW_SCHEMES]
  If farmer says "show report", "scan result", "my disease report" → append [ACTION:SHOW_SCAN]

HANDOFF TO SERVICES:
When farmer has a serious problem Arjun cannot fully solve remotely, say:
"I can guide you further, but honestly for this level of damage our field team should come and check in person. Want me to book a visit for you?" → append [ACTION:BOOK_SERVICE]

VOICE TTS STYLE:
- Use "..." where a natural pause should occur in spoken audio.
- Max fifteen words per sentence for natural voice rhythm.
- Never read numbers as digits — say "two" not "2", "five hundred rupees" not "₹500".
- Keep answers conversational, not lecture-style.

ERROR RECOVERY:
If farmer says something unclear → ask them to repeat gently: "I did not quite catch that. Could you say it again?"
If you genuinely do not know something → be honest: "Honestly I am not one hundred percent sure about that. Let me think..."

TIME CONTEXT: It is ${timeLabel} right now. Use this naturally in greetings if relevant.

BEFORE ANSWERING, internally reason:
1. What is the farmer really asking?
2. What do I already know about their situation from this session?
3. What is the most important thing to address first?
4. What follow-up question moves this conversation forward naturally?
5. Is this an emergency that needs urgent advice?
Then give your response naturally without showing this reasoning process.`;
}

/**
 * Detect action keywords in the user message and return action codes.
 */
function detectIntent(text) {
    const lower = (text || '').toLowerCase();
    const intents = [];

    if (/\b(book|visit|come to farm|field visit|inspection|check in person)\b/i.test(lower)) {
        intents.push('BOOK_SERVICE');
    }
    if (/\b(price|market|mandi|sell|bhav|selling|விலை|சந்தை|भाव|कीमत|ధర|మార్కెట్|किंमत|बाजार)\b/i.test(lower)) {
        intents.push('FETCH_MANDI');
    }
    if (/\b(weather|rain|will it rain|forecast|temperature|mausam|mazha|mazhai|vellam|varsha|वर्षा|மழை|వర్షం|पाऊस)\b/i.test(lower)) {
        intents.push('FETCH_WEATHER');
    }
    if (/\b(scheme|subsidy|pm.kisan|pmfby|loan|kisan credit|soil health card|yojana)\b/i.test(lower)) {
        intents.push('SHOW_SCHEMES');
    }
    if (/\b(report|scan result|my scan|disease result|last scan)\b/i.test(lower)) {
        intents.push('SHOW_SCAN');
    }

    return intents;
}

/**
 * Detect emotion in farmer's message.
 */
function detectEmotion(text) {
    const lower = (text || '').toLowerCase();
    if (/\b(loss|died|dying|destroyed|ruined|damage|failed|worried|scared|help me|crisis|emergency|sab khatam|barbaad|அழிந்து|నాశనమైంది)\b/i.test(lower)) {
        return 'distressed';
    }
    if (/\b(frustrated|angry|upset|not working|useless|waste|kuch nahi|paisa barbaad)\b/i.test(lower)) {
        return 'frustrated';
    }
    if (/\b(great|amazing|happy|good yield|bumper|superb|excellent|romba nallairu|bahut accha|chala bagundi)\b/i.test(lower)) {
        return 'happy';
    }
    if (/\b(worried|tension|stress|nervous|pareshaan|கவலை|ఆందోళన)\b/i.test(lower)) {
        return 'worried';
    }
    return 'neutral';
}

/**
 * Extract crop names from text.
 */
const CROP_KEYWORDS = [
    'tomato', 'potato', 'onion', 'rice', 'wheat', 'corn', 'maize', 'sugarcane', 'cotton',
    'mango', 'banana', 'coconut', 'groundnut', 'turmeric', 'ginger', 'chilli', 'pepper',
    'brinjal', 'eggplant', 'ladyfinger', 'okra', 'bhindi', 'spinach', 'coriander',
    'watermelon', 'papaya', 'guava', 'pomegranate', 'grape', 'orange', 'lemon', 'lime',
    'drumstick', 'moringa', 'curry leaf', 'betel', 'tobacco', 'soybean', 'jowar', 'bajra',
    'ragi', 'dal', 'lentil', 'chickpea', 'black gram', 'green gram',
    // Regional names
    'tamatar', 'aloo', 'pyaaz', 'dhan', 'gehun', 'makka',
    'thakkali', 'urulaikizhangu', 'vengayam', 'arisi', 'godhumai',
    'tomato', 'vankaya', 'mirchi', 'pandi', 'minapappu'
];

function extractCrops(text) {
    const lower = (text || '').toLowerCase();
    const found = [];
    for (const crop of CROP_KEYWORDS) {
        if (lower.includes(crop) && !found.includes(crop)) {
            found.push(crop);
        }
    }
    return found;
}

/**
 * Extract topic from text.
 */
function extractTopic(text) {
    const lower = (text || '').toLowerCase();
    if (/\b(disease|spot|blight|fungus|rot|wilt|yellowing|leaf curl)\b/i.test(lower)) return 'disease';
    if (/\b(pest|insect|bug|worm|aphid|caterpillar|beetle|moth)\b/i.test(lower)) return 'pest';
    if (/\b(price|market|sell|mandi|rate)\b/i.test(lower)) return 'price';
    if (/\b(soil|fertilizer|fertiliser|nutrient|npk|urea|dap)\b/i.test(lower)) return 'soil';
    if (/\b(water|irrigation|drip|sprinkler|flood)\b/i.test(lower)) return 'irrigation';
    if (/\b(harvest|yield|picking|plucking|collect)\b/i.test(lower)) return 'harvest';
    if (/\b(sow|plant|seed|sowing|planting|nursery)\b/i.test(lower)) return 'sowing';
    if (/\b(weather|rain|temperature|forecast)\b/i.test(lower)) return 'weather';
    if (/\b(scheme|subsidy|government|loan|insurance)\b/i.test(lower)) return 'scheme';
    return 'general';
}

/**
 * Extract location mentions.
 */
function extractLocation(text) {
    const statePatterns = [
        /\b(tamil\s*nadu|tamilnadu|kerala|karnataka|andhra|telangana|maharashtra|gujarat|rajasthan|punjab|haryana|up|uttar\s*pradesh|mp|madhya\s*pradesh|bihar|west\s*bengal|odisha|assam)\b/i,
        /\b(chennai|bangalore|bengaluru|hyderabad|pune|mumbai|delhi|kolkata|ahmedabad|coimbatore|madurai|trichy|salem|erode|tiruppur|vellore|thanjavur)\b/i
    ];
    for (const pattern of statePatterns) {
        const match = text.match(pattern);
        if (match) return match[0];
    }
    return null;
}

/**
 * Parse action tags from AI response text and return clean text + actions.
 */
function parseActionTags(responseText) {
    const actions = [];
    const actionPattern = /\[ACTION:([A-Z_]+)\]/g;
    let match;
    while ((match = actionPattern.exec(responseText)) !== null) {
        actions.push(match[1]);
    }
    const cleanText = responseText.replace(/\[ACTION:[A-Z_]+\]/g, '').trim();
    return { cleanText, actions };
}

/**
 * Fetch live mandi price for a crop.
 */
async function fetchMandiPrice(crop) {
    try {
        const apiKey = process.env.VITE_MANDI_API_KEY || process.env.MANDI_API_KEY;
        if (!apiKey) return null;
        const formatted = crop.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&limit=3&filters[commodity]=${encodeURIComponent(formatted)}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.records && data.records.length > 0) return data.records[0];
        return null;
    } catch (e) {
        console.error('[Arjun] Mandi fetch failed:', e);
        return null;
    }
}

/**
 * Main Arjun agent function.
 * 
 * @param {string} userMessage - The farmer's message
 * @param {string} language - Language code
 * @param {object} agentMemory - Current session memory object
 * @param {Array} conversationHistory - Last N turns [{role, content}]
 * @param {object|null} weatherContext - {temp, humidity, condition}
 * @returns {object} { responseText, cleanText, actions, updatedMemory }
 */
async function runArjunAgent(userMessage, language = 'en', agentMemory = {}, conversationHistory = [], weatherContext = null) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        console.error('[Arjun] OPENROUTER_API_KEY missing');
        return {
            responseText: "I am having a little trouble connecting right now. But I can still help with basic questions. What is going on?",
            cleanText: "I am having a little trouble connecting right now. But I can still help with basic questions. What is going on?",
            actions: [],
            updatedMemory: agentMemory
        };
    }

    // --- Update Memory from user message ---
    const newCrops = extractCrops(userMessage);
    const newTopic = extractTopic(userMessage);
    const newLocation = extractLocation(userMessage);
    const newEmotion = detectEmotion(userMessage);
    const detectedIntents = detectIntent(userMessage);

    const updatedMemory = {
        ...agentMemory,
        crops: [...new Set([...(agentMemory.crops || []), ...newCrops])].slice(0, 10),
        problems: agentMemory.problems || [],
        location: newLocation || agentMemory.location,
        currentTopic: newTopic || agentMemory.currentTopic || 'general',
        emotionalState: newEmotion,
        conversationTurn: (agentMemory.conversationTurn || 0) + 1,
        language
    };

    // Track problems discussed
    if (['disease', 'pest', 'irrigation', 'soil'].includes(newTopic)) {
        const problemKey = newCrops.length > 0 ? `${newCrops[0]} ${newTopic}` : newTopic;
        if (!updatedMemory.problems.includes(problemKey)) {
            updatedMemory.problems = [...updatedMemory.problems, problemKey].slice(0, 5);
        }
    }

    // --- Fetch live data for injected intents ---
    let injectedData = '';
    if (detectedIntents.includes('FETCH_MANDI') && newCrops.length > 0) {
        const mandiRecord = await fetchMandiPrice(newCrops[0]);
        if (mandiRecord) {
            injectedData += `\nLive mandi data available: ${mandiRecord.commodity} at ${mandiRecord.market} (${mandiRecord.state}) — modal price ${mandiRecord.modal_price} rupees per quintal, min ${mandiRecord.min_price}, max ${mandiRecord.max_price}. Use this data naturally in your response.`;
        }
    }

    // --- Build system prompt ---
    const systemPrompt = buildSystemPrompt(language, updatedMemory, weatherContext);

    // --- Build messages array ---
    const messages = [
        { role: 'system', content: systemPrompt + injectedData }
    ];

    // Include last 10 turns of conversation history
    const recentHistory = (conversationHistory || []).slice(-10);
    for (const msg of recentHistory) {
        messages.push({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
        });
    }

    messages.push({ role: 'user', content: userMessage });

    // --- Call AI ---
    let model = ARJUN_MODEL;
    try {
        console.log(`[Arjun] Calling ${model} for turn ${updatedMemory.conversationTurn}...`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        let response = await fetch(OPENROUTER_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'AgroTalk Arjun Agent',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model,
                messages,
                temperature: 0.75,
                max_tokens: 300
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Fallback to flash if primary fails
        if (!response.ok) {
            console.warn(`[Arjun] Primary model failed (${response.status}), falling back to flash...`);
            model = ARJUN_FLASH;
            response = await fetch(OPENROUTER_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': 'http://localhost:3000',
                    'X-Title': 'AgroTalk Arjun Agent',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ model, messages, temperature: 0.75, max_tokens: 300 })
            });
        }

        if (!response.ok) {
            const errText = await response.text();
            console.error('[Arjun] AI Error:', errText);
            throw new Error(`AI API failed: ${response.status}`);
        }

        const data = await response.json();
        const rawText = data.choices?.[0]?.message?.content || '';

        if (!rawText) {
            throw new Error('Empty AI response');
        }

        // Parse action tags out of response
        const { cleanText, actions } = parseActionTags(rawText);

        // Merge AI-detected actions with keyword-detected intents
        const allActions = [...new Set([...actions, ...detectedIntents])];

        console.log(`[Arjun] Turn ${updatedMemory.conversationTurn} complete. Actions: ${allActions.join(', ') || 'none'}`);

        return {
            responseText: rawText,
            cleanText,
            actions: allActions,
            updatedMemory
        };

    } catch (error) {
        console.error('[Arjun] Agent Error:', error);

        // Offline/error fallback — still in character
        const fallbackMessages = {
            en: "I am having a little trouble connecting right now. But I am still here for you. What is going on with your crops?",
            hi: "मुझे अभी थोड़ी कनेक्शन की दिक्कत है। पर मैं आपके लिए यहाँ हूँ। खेत में क्या हो रहा है?",
            ta: "சற்று connection சிக்கல் இருக்கு. ஆனால் நான் இங்கே இருக்கேன். பயிர்ல என்ன ஆச்சு?",
            te: "కొంచెం connection issue ఉంది. కానీ నేను ఇక్కడే ఉన్నాను. పంటలో ఏమైంది?",
            mr: "मला आत्ता थोडी कनेक्शनची अडचण येतेय. पण मी तुमच्यासाठी इथेच आहे. शेतात काय झालं?"
        };
        const fallback = fallbackMessages[language] || fallbackMessages.en;

        return {
            responseText: fallback,
            cleanText: fallback,
            actions: [],
            updatedMemory
        };
    }
}

/**
 * Build a time-aware greeting from Arjun.
 */
function buildArjunGreeting(language) {
    const hour = new Date().getHours();
    const greetings = {
        en: {
            morning: "Good morning farmer friend! It is a great day to check on your crops. How are they looking today?",
            afternoon: "Hello! Hope the fields are doing well. Any questions I can help with today?",
            evening: "Good evening! A good time to plan for tomorrow. Is there anything on your mind about the farm?",
            night: "Hello! Working late? I am here anytime. What is on your mind about the farm?"
        },
        hi: {
            morning: "सुप्रभात किसान भाई! आज खेत कैसा दिख रहा है?",
            afternoon: "नमस्ते! आज खेत में कैसा हाल है? कोई सवाल है तो पूछो।",
            evening: "शाम को नमस्ते! कल के लिए कुछ plan करना है क्या?",
            night: "नमस्ते! देर रात काम कर रहे हो? बताओ क्या चाहिए।"
        },
        ta: {
            morning: "காலை வணக்கம் விவசாயி நண்பரே! இன்று பயிர் எப்படி இருக்கு?",
            afternoon: "வணக்கம்! வயல் நலமாக இருக்கா? ஏதாவது கேட்கணுமா?",
            evening: "மாலை வணக்கம்! நாளைக்கு plan பண்றீங்களா? என்ன நடக்குதுன்னு சொல்லுங்க.",
            night: "வணக்கம்! இரவிலும் வேலை பார்க்கிறீங்களா? என்ன தேவை சொல்லுங்க."
        },
        te: {
            morning: "శుభోదయం రైతు మిత్రా! ఈరోజు పంట ఎలా ఉంది?",
            afternoon: "నమస్కారం! పొలం బాగా ఉందా? ఏమైనా సహాయం కావాలా?",
            evening: "శుభ సాయంత్రం! రేపటికి ఏమైనా plan చేస్తున్నారా?",
            night: "నమస్కారం! రాత్రి కూడా పని చేస్తున్నారా? చెప్పండి ఏమి కావాలో."
        },
        mr: {
            morning: "सुप्रभात शेतकरी मित्रा! आज पीक कसं दिसतंय?",
            afternoon: "नमस्कार! शेत कसं आहे? काही मदत हवी का?",
            evening: "सायंकाळी नमस्कार! उद्यासाठी काही plan करायचं आहे का?",
            night: "नमस्कार! रात्री काम करतोय का? सांगा काय हवं ते."
        }
    };

    let timeKey = 'morning';
    if (hour >= 11 && hour < 16) timeKey = 'afternoon';
    else if (hour >= 16 && hour < 20) timeKey = 'evening';
    else if (hour >= 20) timeKey = 'night';

    const langGreetings = greetings[language] || greetings.en;
    return langGreetings[timeKey];
}

module.exports = { runArjunAgent, buildArjunGreeting, detectIntent, detectEmotion };
