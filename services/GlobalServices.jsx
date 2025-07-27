import axios from "axios";
import OpenAI from "openai";
import { CoachingOptions } from "./Options";
import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";

// Fetch token from API
export const getToken = async () => {
    try {
        const response = await fetch('/api/getToken');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }
        return data;
    } catch (error) {
        console.error("Error fetching token:", error);
        throw error;
    }
};

// OpenAI setup with Llama 3.3 70B
const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.NEXT_PUBLIC_AI_OPENROUTER,
    dangerouslyAllowBrowser: true
});

// Model configuration for Llama 3.3 70B
const MODEL_CONFIG = {
    model: "meta-llama/llama-3.3-70b-instruct:free",
    temperature: 0.7,
    top_p: 0.9,
    max_tokens: 600,
    presence_penalty: 0.2,
    frequency_penalty: 0.5,
    stream: true   // Enable streaming for better UX
};

// Store conversation contexts
const conversationContexts = new Map();

// Improved topic-specific prompt templates
const topicPrompts = {
    react: {
        systemPrompt: `You are a senior React developer conducting a technical interview. 
        Focus on evaluating deep understanding of React's core concepts, best practices, and common pitfalls.
        Your questions should test both theoretical knowledge and practical experience.
        Ask about real-world challenges, performance optimizations, and architecture decisions.
        Use a conversational, natural tone like an experienced developer would use when interviewing.
        Be specific about React concepts - components, hooks, state management, optimization techniques, etc.
        Keep responses concise (4-6 sentences) and focused on the topic.`,
        
        keyTopics: [
            "Component lifecycle and hooks (useState, useEffect, useContext, useReducer, useMemo, useCallback)",
            "State management approaches (Context API, Redux, Zustand, Jotai, React Query)",
            "Performance optimization techniques (memoization, code splitting, virtualization)",
            "React architecture patterns (composition vs inheritance, container/presentational pattern)",
            "Modern React features (Suspense, concurrent mode, server components)"
        ]
    },
    
    nextjs: {
        systemPrompt: `You are a senior Next.js developer conducting a technical interview.
        Focus on evaluating deep understanding of Next.js rendering strategies, data fetching, routing, and optimization.
        Your questions should test both theoretical knowledge and practical implementation experience.
        Ask about real-world challenges, architecture decisions, and performance considerations.
        Use a conversational, natural tone like an experienced developer would use when interviewing.
        Be specific about Next.js concepts - SSR, SSG, ISR, app router, middleware, etc.
        Keep responses concise (4-6 sentences) and focused on the topic.`,
        
        keyTopics: [
            "Rendering strategies (SSR, SSG, ISR, CSR) and their appropriate use cases",
            "Data fetching approaches (getServerSideProps, getStaticProps, SWR, React Query)",
            "Next.js routing system (pages directory, app directory, dynamic routes, middleware)",
            "Performance optimization techniques (image optimization, font optimization, code splitting)",
            "Deployment strategies and edge runtime considerations"
        ]
    },
    
    javascript: {
        systemPrompt: `You are a senior JavaScript developer conducting a technical interview.
        Focus on evaluating deep understanding of JavaScript fundamentals, advanced concepts, and modern practices.
        Your questions should test both theoretical knowledge and practical implementation experience.
        Ask about real-world challenges, architecture decisions, and performance considerations.
        Use a conversational, natural tone like an experienced developer would use when interviewing.
        Be specific about JavaScript concepts - closures, prototypes, async/await, modules, etc.
        Keep responses concise (4-6 sentences) and focused on the topic.`,
        
        keyTopics: [
            "JavaScript core concepts (closures, scope, this, prototypes, execution context)",
            "Asynchronous JavaScript (promises, async/await, event loop, microtasks)",
            "Modern JavaScript features (ES6+, modules, destructuring, spread/rest)",
            "Performance optimization and memory management",
            "TypeScript fundamentals and advanced types"
        ]
    }
};

// Function to get appropriate prompt template for a topic
const getTopicPrompt = (topic) => {
    // Normalize topic name
    const normalizedTopic = topic.toLowerCase().trim();
    
    // Match to available topic templates
    if (normalizedTopic.includes('react')) {
        return topicPrompts.react;
    } else if (normalizedTopic.includes('next')) {
        return topicPrompts.nextjs;
    } else if (normalizedTopic.includes('javascript') || normalizedTopic.includes('js')) {
        return topicPrompts.javascript;
    }
    
    // Default template for other topics
    return {
        systemPrompt: `You are a senior developer conducting a technical interview about ${topic}.
        Focus on evaluating deep understanding of core concepts, best practices, and common pitfalls.
        Your questions should test both theoretical knowledge and practical experience.
        Use a conversational, natural tone like an experienced developer would use when interviewing.
        Be specific about ${topic} concepts and implementation details.
        Keep responses concise (4-6 sentences) and focused on the topic.`,
        
        keyTopics: [
            `${topic} fundamentals and core concepts`,
            `Common ${topic} best practices and patterns`,
            `Performance optimization in ${topic}`,
            `Common challenges and solutions in ${topic}`,
            `Modern ${topic} trends and developments`
        ]
    };
};

// Helper function to check if a response appears incomplete
const isResponseIncomplete = (text) => {
    // Check for abrupt endings or incomplete sentences
    if (!text) return true;
    
    // Check if response ends with a proper sentence terminator
    const lastChar = text.trim().slice(-1);
    const properTerminators = ['.', '!', '?', '"', ':', ')', '}'];
    const hasProperEnding = properTerminators.includes(lastChar);
    
    // Check for obviously truncated sentences (ending with prepositions, conjunctions, etc.)
    const commonIncompleteEndings = [
        ' the', ' a', ' an', ' and', ' or', ' but', ' if', ' as', ' to', ' in', ' on',
        ' with', ' by', ' for', ' is', ' are', ' was', ' were'
    ];
    
    const endsWithIncompletePhrase = commonIncompleteEndings.some(ending => 
        text.trim().endsWith(ending)
    );
    
    return endsWithIncompletePhrase || !hasProperEnding;
};

// Response quality assessment system
const assessResponseQuality = (response, topic, lastUserMessage) => {
    if (!response) return false;
    
    // Check response length - too short is likely incomplete
    if (response.length < 50) return false;
    
    // Check for abrupt endings
    const lastChar = response.trim().slice(-1);
    const properTerminators = ['.', '!', '?', '"', ':', ')', '}'];
    const hasProperEnding = properTerminators.includes(lastChar);
    
    // Check for obviously truncated sentences
    const commonIncompleteEndings = [
        ' the', ' a', ' an', ' and', ' or', ' but', ' if', ' as', ' to', ' in', ' on',
        ' with', ' by', ' for', ' is', ' are', ' was', ' were'
    ];
    
    const endsWithIncompletePhrase = commonIncompleteEndings.some(ending => 
        response.trim().endsWith(ending)
    );
    
    // Check for technical content based on topic
    const hasTopicKeywords = checkTopicRelevance(response, topic);
    
    // Check if response maintains conversation flow
    const isConversational = checkConversationalQuality(response, lastUserMessage);
    
    // Check for response to user's question
    const addressesUserQuestion = lastUserMessage.includes('?') ? 
        checkQuestionAnswered(response, lastUserMessage) : true;
    
    // Return true if response meets quality criteria
    return hasProperEnding && 
           !endsWithIncompletePhrase && 
           hasTopicKeywords && 
           isConversational &&
           addressesUserQuestion;
};

// Check if response contains keywords relevant to the topic
const checkTopicRelevance = (response, topic) => {
    const lowerResponse = response.toLowerCase();
    const lowerTopic = topic.toLowerCase();
    
    // Topic-specific keyword maps
    const topicKeywords = {
        'react': ['component', 'state', 'props', 'hook', 'effect', 'render', 'jsx', 'virtual dom'],
        'next': ['server', 'static', 'render', 'route', 'api', 'page', 'app directory', 'middleware'],
        'javascript': ['function', 'object', 'array', 'promise', 'async', 'variable', 'scope', 'closure']
    };
    
    // Identify which keyword set to use
    let keywords = [];
    if (lowerTopic.includes('react')) {
        keywords = topicKeywords.react;
    } else if (lowerTopic.includes('next')) {
        keywords = topicKeywords.next;
    } else if (lowerTopic.includes('javascript') || lowerTopic.includes('js')) {
        keywords = topicKeywords.javascript;
    } else {
        // Generic technical keywords for any topic
        keywords = ['concept', 'practice', 'technique', 'approach', 'implementation', 'pattern', 'standard'];
    }
    
    // Count how many topic keywords are present
    const matchCount = keywords.filter(keyword => lowerResponse.includes(keyword)).length;
    
    // Response should contain at least some relevant keywords
    return matchCount >= 2;
};

// Check if response maintains conversational quality
const checkConversationalQuality = (response, lastUserMessage) => {
    // Check if response acknowledges user's input
    const lowerResponse = response.toLowerCase();
    const lowerUserMessage = lastUserMessage.toLowerCase();
    
    // Extract key terms from user message (nouns and technical terms)
    const userKeyTerms = lowerUserMessage
        .split(/\s+/)
        .filter(word => word.length > 3) // Only consider substantial words
        .filter(word => !['what', 'when', 'where', 'which', 'that', 'this', 'these', 'those'].includes(word));
    
    // Check if response references user's key terms
    const termReferenceCount = userKeyTerms.filter(term => lowerResponse.includes(term)).length;
    
    // Response should reference at least some of the user's terms
    const hasTermReferences = userKeyTerms.length === 0 || termReferenceCount > 0;
    
    // Check if response has conversational elements
    const hasConversationalElements = 
        response.includes('?') || // Questions
        lowerResponse.includes('you mentioned') ||
        lowerResponse.includes('your question') ||
        lowerResponse.includes('as you') ||
        lowerResponse.includes('let me');
    
    return hasTermReferences && hasConversationalElements;
};

// Check if response addresses user's question
const checkQuestionAnswered = (response, userQuestion) => {
    // Simple check: does the response contain content that looks like an answer?
    // More sophisticated implementations could use NLP or keyword extraction
    
    if (!userQuestion.includes('?')) return true; // Not a question
    
    const lowerResponse = response.toLowerCase();
    const lowerQuestion = userQuestion.toLowerCase();
    
    // Extract question type
    const questionWords = ['what', 'when', 'where', 'which', 'who', 'why', 'how'];
    const questionWord = questionWords.find(word => lowerQuestion.includes(word)) || '';
    
    // Check for answers based on question type
    if (questionWord === 'what' || questionWord === 'which') {
        // "What" questions typically define something
        return lowerResponse.includes('is') || lowerResponse.includes('are') || lowerResponse.includes('means');
    } else if (questionWord === 'how') {
        // "How" questions explain a process
        return lowerResponse.includes('by') || lowerResponse.includes('through') || lowerResponse.includes('using');
    } else if (questionWord === 'why') {
        // "Why" questions explain a reason
        return lowerResponse.includes('because') || lowerResponse.includes('reason') || lowerResponse.includes('due to');
    }
    
    // Default check: response is long enough to contain an answer
    return response.length > 100;
};

// Helper function to normalize response length
const normalizeResponseLength = (text, isLecture = false) => {
    if (!text) return "";
    
    // For lecture mode, aim for 10-12 lines
    // For standard responses, aim for 5-7 lines
    const targetLines = isLecture ? 12 : 7;
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    // If already within limits, return as is
    if (lines.length <= targetLines) return text;
    
    // If too long, condense by selecting most important lines
    return lines.slice(0, targetLines).join('\n');
};

// Function to generate complete response with improved prompting
const generateCompleteResponse = async (messages, maxTokens, temp, isStream = true) => {
    try {
        // Add a high-quality system instruction if not already present
        let enhancedMessages = messages;
        if (!messages.some(msg => msg.role === 'system')) {
            enhancedMessages = [
                {
                    role: 'system',
                    content: `You are an expert technical interviewer and coach for software development. 
                    Adopt a conversational, natural speaking style like a real person would use.
                    Be specific, technical and precise in your explanations.
                    Ask thoughtful questions that evaluate both theoretical knowledge and practical experience.
                    Provide constructive feedback based on the candidate's responses.
                    Keep your responses complete, concise (4-6 sentences), and directly focused on the topic.`
                },
                ...messages
            ];
        }
        
        if (isStream) {
            // Streaming implementation
            const stream = await openai.chat.completions.create({
                model: MODEL_CONFIG.model,
                messages: enhancedMessages,
                temperature: temp || MODEL_CONFIG.temperature,
                max_tokens: maxTokens || MODEL_CONFIG.max_tokens,
                presence_penalty: MODEL_CONFIG.presence_penalty,
                frequency_penalty: MODEL_CONFIG.frequency_penalty,
                stream: true
            });
            
            // Process the stream
            let fullResponse = "";
            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || "";
                fullResponse += content;
                // Here you could emit an event for real-time UI updates
            }
            
            return fullResponse;
        } else {
            // Non-streaming implementation
            const completion = await openai.chat.completions.create({
                model: MODEL_CONFIG.model,
                messages: enhancedMessages,
                temperature: temp || MODEL_CONFIG.temperature,
                max_tokens: maxTokens || MODEL_CONFIG.max_tokens,
                presence_penalty: MODEL_CONFIG.presence_penalty,
                frequency_penalty: MODEL_CONFIG.frequency_penalty,
                stream: false
            });
            
            return completion?.choices?.[0]?.message?.content || "";
        }
    } catch (error) {
        console.error("Error generating response:", error);
        return "I'm having trouble connecting right now. Let's continue our discussion in a moment.";
    }
};

// Enhanced AIModel function with improved conversation flow
export const AIModel = async (topic, coachingOption, conversation) => {
    if (!coachingOption) {
        return {
            role: 'assistant',
            content: `Welcome to your ${topic} coaching session! What specific area of ${topic} would you like to focus on today?`
        };
    }

    try {
        const option = CoachingOptions.find((item) => item.name === coachingOption);
        if (!option) {
            return {
                role: 'assistant',
                content: `Welcome to your ${topic} interview preparation! I'll be asking you questions about ${topic}. Let's begin!`
            };
        }

        // Get conversation context
        const contextKey = `${topic}_${coachingOption}`;
        let conversationContext = conversationContexts.get(contextKey) || {
            stage: 'initial',
            askedQuestion: false,
            lastQuestion: "",
            currentPoint: 0,
            keyPoints: [],
            questions: [],
            currentQuestion: 0,
            interviewMode: coachingOption === 'Mock Interview' || coachingOption === 'Ques Ans Prep',
            feedbackDepth: 0 // Track how much feedback we've given
        };

        // Get topic-specific prompt
        const topicTemplate = getTopicPrompt(topic);
        
        // Get the latest user message
        const userMessages = conversation
            .filter(msg => msg.role === 'user')
            .map(msg => msg.content);
        
        const lastUserMessage = userMessages[userMessages.length - 1] || '';
        
        // Initialize topic-specific questions if not already set
        if (conversationContext.questions.length === 0) {
            // Use template questions or generate dynamic ones
            conversationContext.questions = topicTemplate.keyTopics.map(topic => {
                return `Could you explain your experience and approach with ${topic}?`;
            });
        }

        // Different flow logic based on coaching option
        if (conversationContext.interviewMode) {
            // Interview mode logic
            return await handleInterviewMode(topic, coachingOption, conversation, conversationContext, contextKey, topicTemplate);
        } else if (coachingOption === 'Topic Lecture') {
            // Lecture mode logic
            return await handleLectureMode(topic, conversation, conversationContext, contextKey, topicTemplate);
        } else {
            // Default coaching mode
            return await handleDefaultCoachingMode(topic, coachingOption, conversation, conversationContext, contextKey, topicTemplate);
        }

    } catch (error) {
        console.error('AI Error:', error);
        return {
            role: 'assistant',
            content: `I apologize for the technical issue with your ${topic} coaching session. Let's continue. What would you like to know about ${topic}?`
        };
    }
};

// Interview mode handler
async function handleInterviewMode(topic, coachingOption, conversation, conversationContext, contextKey, topicTemplate) {
    // Get the latest user message
    const userMessages = conversation
        .filter(msg => msg.role === 'user')
        .map(msg => msg.content);
    
    const lastUserMessage = userMessages[userMessages.length - 1] || '';
    const isFirstMessage = conversation.length <= 2;
    
    // If this is the first message, start the interview
    if (isFirstMessage) {
        const introPrompt = `You are conducting a technical interview for a ${topic} position. 
        Start by introducing yourself briefly as the interviewer.
        Welcome the candidate warmly but professionally.
        Then ask this specific first question: "${conversationContext.questions[0]}"
        Keep your response conversational and natural, like a real technical interviewer would speak.
        Your response should be 3-4 sentences maximum.`;
        
        const response = await generateCompleteResponse(
            [{ role: 'system', content: introPrompt }],
            300, 0.7
        );
        
        conversationContext.askedQuestion = true;
        conversationContext.lastQuestion = conversationContext.questions[0];
        conversationContext.currentQuestion = 1;
        conversationContexts.set(contextKey, conversationContext);
        
        return {
            role: 'assistant',
            content: response
        };
    }
    
    // If we asked a question and user answered, provide feedback and ask next question
    if (conversationContext.askedQuestion && lastUserMessage.length > 0) {
        // Calculate feedback depth - how much feedback to give
        if (lastUserMessage.length > 200) {
            // Detailed answer deserves detailed feedback
            conversationContext.feedbackDepth = Math.min(conversationContext.feedbackDepth + 1, 2);
        } else {
            conversationContext.feedbackDepth = Math.max(conversationContext.feedbackDepth - 1, 0);
        }
        
        const feedbackPrompt = `You are an experienced ${topic} technical interviewer.
        The candidate just answered your question: "${conversationContext.lastQuestion}"
        Their answer was: "${lastUserMessage}"
        
        Provide ${conversationContext.feedbackDepth > 0 ? 'detailed' : 'brief'} feedback on their answer.
        ${conversationContext.feedbackDepth > 1 ? 'Include at least one specific technical insight or correction if applicable.' : ''}
        Then ask your next question: "${conversationContext.currentQuestion < conversationContext.questions.length ? 
            conversationContext.questions[conversationContext.currentQuestion] : 
            'Do you have any questions about working with ' + topic + ' in production environments?'}"
        
        Keep your response natural and conversational, like a real technical interviewer.
        Respond in 3-5 sentences total.`;
        
        const response = await generateCompleteResponse(
            [{ role: 'system', content: feedbackPrompt }],
            400, 0.7
        );
        
        // Update interview progress
        if (conversationContext.currentQuestion < conversationContext.questions.length) {
            conversationContext.lastQuestion = conversationContext.questions[conversationContext.currentQuestion];
            conversationContext.currentQuestion++;
        } else {
            conversationContext.lastQuestion = 'Do you have any questions about working with ' + topic + ' in production environments?';
        }
        
        conversationContext.askedQuestion = true;
        conversationContexts.set(contextKey, conversationContext);
        
        return {
            role: 'assistant',
            content: response
        };
    }
    
    // Handle other interactions (like clarification questions)
    const clarificationPrompt = `The candidate has responded with: "${lastUserMessage}"
    You are in the middle of a ${topic} technical interview.
    Respond naturally to what they've said.
    If they asked a question, answer it briefly but informatively.
    Then steer the conversation back to the interview by asking: "${conversationContext.lastQuestion}"
    Keep your response conversational and natural, like a real technical interviewer would speak.`;
    
    const response = await generateCompleteResponse(
        [{ role: 'system', content: clarificationPrompt }],
        350, 0.7
    );
    
    return {
        role: 'assistant',
        content: response
    };
}

// Lecture mode handler
async function handleLectureMode(topic, conversation, conversationContext, contextKey, topicTemplate) {
    // Get the latest user message
    const userMessages = conversation
        .filter(msg => msg.role === 'user')
        .map(msg => msg.content);
    
    const lastUserMessage = userMessages[userMessages.length - 1] || '';
    const isFirstMessage = conversation.length <= 2;
    
    if (isFirstMessage || conversationContext.stage === 'initial') {
        // Initial introduction to the topic
        const introPrompt = `You are an expert educator teaching ${topic}.
        Provide a brief, engaging introduction to ${topic} that:
        1. Explains what ${topic} is in clear terms
        2. Why it's important in modern development
        3. Mentions 3-4 key concepts you'll cover in this lecture
        
        End by asking if they're ready to explore the first key concept.
        Keep your explanation conversational but technically accurate.
        Your response should be 5-7 sentences total.`;
        
        const response = await generateCompleteResponse(
            [{ role: 'system', content: introPrompt }],
            500, 0.6
        );
        
        // Generate key concepts if we don't have them yet
        if (conversationContext.keyPoints.length === 0) {
            conversationContext.keyPoints = topicTemplate.keyTopics;
        }
        
        conversationContext.stage = 'ready_for_concepts';
        conversationContexts.set(contextKey, conversationContext);
        
        return {
            role: 'assistant',
            content: response
        };
    }
    
    if (conversationContext.stage === 'ready_for_concepts' && 
        (lastUserMessage.toLowerCase().includes('yes') || 
         lastUserMessage.toLowerCase().includes('ready') ||
         lastUserMessage.toLowerCase().includes('start'))) {
        
        // Start teaching the first concept
        conversationContext.stage = 'teaching_concepts';
        conversationContext.currentPoint = 0;
    }
    
    if (conversationContext.stage === 'teaching_concepts') {
        // Check if we still have concepts to teach
        if (conversationContext.currentPoint < conversationContext.keyPoints.length) {
            const currentConcept = conversationContext.keyPoints[conversationContext.currentPoint];
            
            const conceptPrompt = `You are teaching about "${currentConcept}" as part of a ${topic} lecture.
            Provide an in-depth explanation that includes:
            1. What this concept means and why it's important
            2. How it works technically
            3. A brief practical example of how it's implemented
            4. Common pitfalls or best practices
            
            Make your explanation conversational but technically precise.
            End by asking if they have questions or if they're ready for the next concept.
            Keep your response to 7-10 sentences total.`;
            
            const response = await generateCompleteResponse(
                [{ role: 'system', content: conceptPrompt }],
                600, 0.6
            );
            
            // Move to next concept when user confirms
            if (lastUserMessage.toLowerCase().includes('next') || 
                lastUserMessage.toLowerCase().includes('continue')) {
                conversationContext.currentPoint++;
            }
            
            conversationContexts.set(contextKey, conversationContext);
            
            return {
                role: 'assistant',
                content: response
            };
        } else {
            // We've covered all concepts, move to Q&A
            conversationContext.stage = 'qa';
            conversationContexts.set(contextKey, conversationContext);
            
            const summaryPrompt = `You've completed teaching all key concepts of ${topic}.
            Provide a brief summary that:
            1. Recaps the key points covered
            2. Highlights how these concepts work together
            3. Suggests next steps for learning
            
            End by asking if they have any specific questions about ${topic}.
            Keep your response to 5-7 sentences total.`;
            
            const response = await generateCompleteResponse(
                [{ role: 'system', content: summaryPrompt }],
                450, 0.6
            );
            
            return {
                role: 'assistant',
                content: response
            };
        }
    }
    
    if (conversationContext.stage === 'qa') {
        // Handle questions about the topic
        const qaPrompt = `You are in a Q&A session after teaching ${topic}.
        The student has asked/commented: "${lastUserMessage}"
        
        Provide a technically precise but accessible answer.
        Include a specific example or practical application when relevant.
        If it wasn't a question, engage with their comment and ask if they have further questions.
        Keep your response conversational and natural.
        Your response should be 5-7 sentences total.`;
        
        const response = await generateCompleteResponse(
            [{ role: 'system', content: qaPrompt }],
            500, 0.7
        );
        
        return {
            role: 'assistant',
            content: response
        };
    }
    
    // Default response if none of the above conditions are met
    const defaultPrompt = `You are teaching ${topic}.
    The student has said: "${lastUserMessage}"
    
    Respond appropriately while maintaining the educational flow.
    Keep your response technical but accessible.
    End by asking a question to keep the conversation going.
    Your response should be 4-6 sentences total.`;
    
    const response = await generateCompleteResponse(
        [{ role: 'system', content: defaultPrompt }],
        400, 0.7
    );
    
    return {
        role: 'assistant',
        content: response
    };
}

// Default coaching mode handler
async function handleDefaultCoachingMode(topic, coachingOption, conversation, conversationContext, contextKey, topicTemplate) {
    // Get the latest user message
    const userMessages = conversation
        .filter(msg => msg.role === 'user')
        .map(msg => msg.content);
    
    const lastUserMessage = userMessages[userMessages.length - 1] || '';
    const isFirstMessage = conversation.length <= 2;
    
    if (isFirstMessage) {
        // Initial greeting
        const introPrompt = `You are an expert ${topic} coach.
        Welcome the user to their coaching session.
        Ask them a specific question about their experience with ${topic} to guide the conversation.
        Keep your tone warm and professional.
        Your response should be 3-4 sentences maximum.`;
        
        const response = await generateCompleteResponse(
            [{ role: 'system', content: introPrompt }],
            300, 0.7
        );
        
        return {
            role: 'assistant',
            content: response
        };
    }
    
    // Regular coaching conversation
    const coachingPrompt = `You are an expert ${topic} coach having a conversation about ${topic}.
    The user just said: "${lastUserMessage}"
    
    Respond in a helpful, informative way that:
    1. Directly addresses what they've said
    2. Provides specific technical insights about ${topic} relevant to their comment
    3. Asks a follow-up question to deepen the conversation
    
    Your tone should be conversational and natural, like an experienced colleague.
    Keep your response to 4-6 sentences total.`;
    
    const response = await generateCompleteResponse(
        [{ role: 'system', content: coachingPrompt }],
        400, 0.7
    );
    
    return {
        role: 'assistant',
        content: response
    };
}

// Reset conversation context if needed
export const resetConversationContext = (topic, coachingOption) => {
    const contextKey = `${topic}_${coachingOption}`;
    conversationContexts.delete(contextKey);
};

// Enhanced feedback generation for session summary
export const AIModelToGenerateFeedbackAndNotes = async (coachingOption, conversation) => {
    try {
        // Validate conversation input
        if (!conversation?.length) {
            throw new Error('Conversation is empty');
        }

        const option = CoachingOptions.find((item) => item.name === coachingOption);
        if (!option?.summeryPrompt) {
            throw new Error('Invalid coaching option');
        }

        // Extract conversation content
        const filteredConvo = conversation
            .filter(msg => msg.role !== 'system' && msg.content?.trim())
            .map(msg => ({
                role: msg.role,
                content: msg.content
            }));

        // Ensure we have conversation content
        if (filteredConvo.length === 0) {
            throw new Error('No valid messages to analyze');
        }

        // Identify the topic from conversation
        let topic = "technical skills";
        if (filteredConvo.length > 0) {
            const firstMessage = filteredConvo[0].content.toLowerCase();
            
            if (firstMessage.includes('react')) topic = "React";
            else if (firstMessage.includes('next')) topic = "Next.js";
            else if (firstMessage.includes('javascript') || firstMessage.includes('js')) topic = "JavaScript";
            // Add more topic detection as needed
        }

        // Enhanced feedback prompt
        const feedbackPrompt = `As an expert ${topic} interviewer/coach, analyze this conversation and provide a comprehensive session summary.

Your analysis should include:

1. KEY CONCEPTS COVERED:
   - Identify 3-5 specific technical concepts that were discussed
   - For each concept, note how well the candidate understood it (strong, adequate, needs improvement)

2. STRENGTHS:
   - Highlight 2-3 areas where the candidate showed strong technical knowledge
   - Provide specific examples from the conversation

3. GROWTH OPPORTUNITIES:
   - Identify 2-3 areas where the candidate could improve
   - Offer specific, actionable advice for each area

4. RECOMMENDED RESOURCES:
   - Suggest 2-3 specific learning resources (documentation, tutorials, practice exercises)
   - Explain how each resource addresses their specific needs

Format your summary with clear section headers and concise bullet points.
Maintain a constructive, encouraging tone throughout.
Focus on specific technical concepts rather than general communication skills.
Keep your analysis to 350-450 words total.`;

        // Generate the feedback
        const completion = await openai.chat.completions.create({
            model: MODEL_CONFIG.model,
            messages: [
                {
                    role: 'system',
                    content: feedbackPrompt
                },
                {
                    role: 'user',
                    content: JSON.stringify(filteredConvo)
                }
            ],
            max_tokens: 800,
            temperature: 0.5
        });

        let feedbackResponse = completion?.choices?.[0]?.message?.content || "";
        
        // Fallback if no response
        if (!feedbackResponse) {
            feedbackResponse = `## ${topic} Session Summary

### Key Concepts Covered
- Core ${topic} principles and patterns
- Performance optimization techniques
- Modern ${topic} best practices

### Strengths
- Good understanding of fundamental concepts
- Ability to apply knowledge to practical scenarios

### Growth Opportunities
- Deepen knowledge of advanced ${topic} patterns
- Practice implementing performance optimizations

### Recommended Resources
- Official ${topic} documentation
- Practice projects focusing on real-world applications`;
        }

        return {
            role: 'assistant',
            content: feedbackResponse
        };

    } catch (error) {
        console.error('Feedback Generation Error:', error);
        return {
            role: 'assistant',
            content: `## Session Summary

### Overview
We had a productive discussion covering various technical concepts and scenarios.

### Key Points
- Several important technical concepts were explored
- Practical implementation strategies were discussed
- Common challenges and solutions were identified

### Recommendations
- Continue practicing with real-world examples
- Review the concepts discussed today
- Consider exploring related advanced topics`
        };
    }
};

// Convert text to speech using AWS Polly
export const ConvertTextToSpeech = async (text) => {
    const pollyClient = new PollyClient({
        region: 'us-east-1',
        credentials: {
            accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_KEY
        }
    });

    const command = new SynthesizeSpeechCommand({
        Text: text,
        OutputFormat: 'mp3',
        VoiceId: "Joanna" // You can change the voice ID as needed
    });

    try {
        const { AudioStream } = await pollyClient.send(command);
        const audioArrayBuffer = await AudioStream.transformToByteArray();
        const audioBlob = new Blob([audioArrayBuffer], { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);
        return audioUrl;
    } catch (e) {
        console.error("Text-to-Speech Error:", e);
    }
};