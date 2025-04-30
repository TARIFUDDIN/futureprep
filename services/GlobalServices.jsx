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

// OpenAI setup
const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.NEXT_PUBLIC_AI_OPENROUTER,
    dangerouslyAllowBrowser: true
});

const conversationContexts = new Map();

// Helper function to check if a response appears incomplete
const isResponseIncomplete = (text) => {
    // Check for abrupt endings or incomplete sentences
    if (!text) return true;
    
    // Check if response ends with a proper sentence terminator
    const lastChar = text.trim().slice(-1);
    const properTerminators = ['.', '!', '?', '"', ':', ')'];
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

// Helper function to normalize response length
const normalizeResponseLength = (text, isLecture = false) => {
    if (!text) return "";
    
    // For lecture mode, aim for 10-12 lines
    // For standard responses, aim for 7-8 lines
    const targetLines = isLecture ? 12 : 8;
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    // If already within limits, return as is
    if (lines.length <= targetLines) return text;
    
    // If too long, condense by selecting most important lines
    // For now, simply take the first N lines to keep it simple
    return lines.slice(0, targetLines).join('\n');
};

export const AIModel = async (topic, coachingOption, conversation) => {
    if (!coachingOption) {
        return {
            role: 'assistant',
            content: "Let's focus on your session. What topic would you like to explore today?"
        };
    }

    try {
        const option = CoachingOptions.find((item) => item.name === coachingOption);
        if (!option) {
            return {
                role: 'assistant',
                content: "Let's begin our session. What would you like to focus on?"
            };
        }

        // Get the latest user message
        const userMessages = conversation
            .filter(msg => msg.role === 'user')
            .map(msg => msg.content);
        
        const lastUserMessage = userMessages[userMessages.length - 1] || '';
        const isUserMidResponse = lastUserMessage.length < 30 && !lastUserMessage.endsWith('.');

        // If user is still typing, don't respond yet
        if (isUserMidResponse) {
            return null;
        }

        // Retrieve conversation context
        const contextKey = `${topic}_${coachingOption}`;
        let conversationContext = conversationContexts.get(contextKey) || {
            stage: 'initial',
            askedQuestion: false,
            lastQuestion: "",
            currentPoint: 0,
            keyPoints: []
        };

        // Avoid repeating the same question
        if (conversationContext.askedQuestion && !lastUserMessage.trim()) {
            return null;
        }

        // Define response strategies with improved prompts for comprehensive explanations
        const responseStrategies = {
            'Mock Interview': {
                initial: {
                    systemPrompt: `Conduct a professional mock interview about ${topic}. 
                    Ask ONE question at a time. Avoid markdown (#, *, -). 
                    Speak naturally, like a human interviewer.
                    Keep your response to 7-8 lines and ensure it's complete.`,
                    maxTokens: 150,
                    temperature: 0.5
                },
                follow_up: {
                    systemPrompt: `Continue the interview naturally. 
                    Respond to the candidate's answer with either:
                    - A follow-up question (1 max)
                    - Brief feedback (1 sentence)
                    Never use symbols or lists. Keep it conversational.
                    Limit your response to 7-8 complete lines.`,
                    maxTokens: 200,
                    temperature: 0.5
                }
            },
            'Topic Lecture': {
                initial: {
                    systemPrompt: `You are teaching ${topic} with in-depth explanations.
                    Provide a comprehensive introduction that includes:
                    1. What ${topic} is (2-3 detailed sentences)
                    2. Why it's important and relevant (2-3 sentences with practical applications)
                    3. Core concepts overview (3-4 sentences highlighting key aspects)
                    
                    Make your explanation accessible but thorough (10-12 lines maximum).
                    End with a question to check understanding. Use natural, engaging language.
                    IMPORTANT: Ensure your response is COMPLETE and not cut off mid-thought.`,
                    maxTokens: 800,
                    temperature: 0.4
                },
                overview: {
                    systemPrompt: `Provide a detailed overview of ${topic} that includes:
                    1. Historical context or background (2-3 sentences)
                    2. Primary use cases and benefits (3-4 examples with explanations)
                    3. Technical foundations (2-3 sentences on how it actually works)
                    4. Common misconceptions (1-2 important clarifications)
                    
                    Limit your response to 10-12 complete lines.
                    End by asking if they'd like to explore specific aspects in more detail.
                    IMPORTANT: Make sure your response is COMPLETE and not cut off mid-sentence.`,
                    maxTokens: 800,
                    temperature: 0.5
                },
                keypoints: {
                    systemPrompt: `Explain each key aspect of ${topic} in depth.
                    For the current key point:
                    1. Clearly define it (2-3 sentences)
                    2. Explain why it matters (2-3 sentences)
                    3. Show how it works with a brief practical illustration
                    4. Address common challenges or edge cases (1-2 sentences)
                    
                    Limit your response to 10-12 complete lines.
                    End by checking understanding and inviting questions.
                    IMPORTANT: Ensure your response is COMPLETE and not cut off mid-thought.`,
                    maxTokens: 800,
                    temperature: 0.5
                },
                discussion: {
                    systemPrompt: `Provide a comprehensive answer to the user's question about ${topic}.
                    Your response should:
                    1. Directly address their specific question (3-4 sentences)
                    2. Provide supporting examples or evidence (1-2 concrete examples)
                    3. Connect to broader concepts when relevant (1 sentence)
                    4. Offer practical takeaways (1 actionable insight)
                    
                    Limit your response to 10-12 complete lines.
                    End with a follow-up question to continue the discussion.
                    IMPORTANT: Make sure your response is COMPLETE and not cut off mid-sentence.`,
                    maxTokens: 800,
                    temperature: 0.6
                }
            },
            'Ques Ans Prep': {
                initial: {
                    systemPrompt: `Teach ${topic} in a Q&A style. 
                    Ask ONE clear question, then wait for an answer. 
                    Use plain text only (no formatting).
                    Keep your response to 7-8 complete lines.`,
                    maxTokens: 150,
                    temperature: 0.6
                },
                follow_up: {
                    systemPrompt: `Continue the lesson based on the student's response. 
                    Give concise feedback or ask ONE follow-up question. 
                    Keep responses short, natural, and complete within 7-8 lines.`,
                    maxTokens: 200,
                    temperature: 0.5
                }
            },
            'default': {
                initial: {
                    systemPrompt: `Discuss ${topic} professionally. 
                    Ask one question per response. 
                    Speak naturally, without symbols.
                    Limit your response to 7-8 complete lines.`,
                    maxTokens: 150,
                    temperature: 0.6
                },
                follow_up: {
                    systemPrompt: `Continue the conversation naturally. 
                    Respond to the user's last message with a single question or comment. 
                    Avoid markdown or lists.
                    Keep your response to 7-8 complete lines.`,
                    maxTokens: 200,
                    temperature: 0.6
                }
            }
        };

        let response;
        let attemptCount = 0;
        const MAX_ATTEMPTS = 2;
        const isTopicLecture = coachingOption === 'Topic Lecture';

        // Function to generate response with retry logic for incomplete responses
        const generateCompleteResponse = async (messages, maxTokens, temp) => {
            let responseText = "";
            let attempts = 0;
            
            while (attempts < MAX_ATTEMPTS) {
                const completion = await openai.chat.completions.create({
                    model: "google/gemini-2.5-pro-preview-03-25",
                    messages,
                    temperature: temp,
                    max_tokens: maxTokens
                });
                
                responseText = completion?.choices?.[0]?.message?.content || "";
                
                // If response seems complete, break the loop
                if (!isResponseIncomplete(responseText)) {
                    break;
                }
                
                // If incomplete, try again with more specific instructions
                messages.push({
                    role: 'system',
                    content: "Your previous response was incomplete. Please provide a COMPLETE response that ends with a complete sentence or thought. Ensure it fits within the requested length parameters."
                });
                
                // Increase max tokens for retry
                maxTokens += 100;
                attempts++;
            }
            
            return responseText;
        };

        // Special handling for Topic Lecture flow with improved content
        if (isTopicLecture) {
            switch (conversationContext.stage) {
                case 'initial':
                    // Generate a comprehensive introduction using the AI
                    const introResponse = await generateCompleteResponse(
                        [{ 
                            role: 'system', 
                            content: responseStrategies['Topic Lecture'].initial.systemPrompt 
                        }],
                        responseStrategies['Topic Lecture'].initial.maxTokens,
                        responseStrategies['Topic Lecture'].initial.temperature
                    );
                    
                    response = introResponse || 
                        `Welcome to our lesson on ${topic}! This is a fundamental concept that's essential to understand. Let me walk you through what ${topic} is, why it matters, and how you can apply it in real-world scenarios. Would you like me to start with the core principles or dive into some practical examples?`;
                    
                    conversationContext.stage = 'overview';
                    break;

                case 'overview':
                    // Generate a detailed overview using the AI
                    const overviewResponse = await generateCompleteResponse(
                        [{ 
                            role: 'system', 
                            content: responseStrategies['Topic Lecture'].overview.systemPrompt 
                        }],
                        responseStrategies['Topic Lecture'].overview.maxTokens,
                        responseStrategies['Topic Lecture'].overview.temperature
                    );
                    
                    response = overviewResponse || 
                        `Let me provide a comprehensive overview of ${topic}. It emerged as a solution to specific challenges in programming and has evolved significantly over time. When implemented correctly, it can dramatically improve performance, user experience, and code maintainability. Would you like me to break down the key concepts in more detail?`;
                    
                    conversationContext.stage = 'keypoints';
                    
                    // Generate key points
                    const keyPointsResponse = await generateCompleteResponse(
                        [{ 
                            role: 'system', 
                            content: `Generate 3-4 detailed key points about ${topic}. Each point should have:
                            1. A clear title (e.g., "Event Propagation in Debouncing")
                            2. A comprehensive explanation
                            3. Real-world applications
                            Format as "Title: Brief summary"` 
                        }],
                        400,
                        0.5
                    );
                    
                    const keyPointsContent = keyPointsResponse || "";
                    conversationContext.keyPoints = keyPointsContent
                        .split('\n')
                        .filter(line => line.trim().length > 0 && line.includes(':'));
                    
                    if (conversationContext.keyPoints.length === 0) {
                        // Fallback if no key points generated
                        conversationContext.keyPoints = [
                            `Core Principles: The fundamental mechanisms of ${topic}`,
                            `Implementation Strategies: Different approaches to implementing ${topic}`,
                            `Performance Considerations: How ${topic} affects application performance`,
                            `Advanced Techniques: Taking ${topic} to the next level`
                        ];
                    }
                    break;

                case 'keypoints':
                    if (conversationContext.currentPoint < conversationContext.keyPoints.length) {
                        const currentKeyPoint = conversationContext.keyPoints[conversationContext.currentPoint];
                        const keyPointTitle = currentKeyPoint.split(':')[0].trim();
                        
                        // Generate detailed explanation for this key point
                        const keyPointDetailResponse = await generateCompleteResponse(
                            [{ 
                                role: 'system', 
                                content: `Provide a detailed explanation of "${keyPointTitle}" as it relates to ${topic}.
                                Include:
                                1. Clear definition and importance (2-3 sentences)
                                2. How it works in practice (2-3 sentences with technical details)
                                3. A brief practical illustration when applicable
                                4. Common pitfalls or best practices (1-2 tips)
                                Limit your response to 10-12 complete lines total.` 
                            }],
                            responseStrategies['Topic Lecture'].keypoints.maxTokens,
                            responseStrategies['Topic Lecture'].keypoints.temperature
                        );
                        
                        response = keyPointDetailResponse || 
                            `Let's explore ${keyPointTitle} in depth. This is a crucial aspect of ${topic} that involves several important concepts and techniques. When implemented properly, it can significantly improve your application's performance and user experience. Do you have any questions about this before we continue?`;
                        
                        conversationContext.currentPoint++;
                    } else {
                        response = `We've covered all the key points of ${topic}! Is there a specific aspect you'd like me to elaborate on further?`;
                        conversationContext.stage = 'discussion';
                    }
                    break;

                case 'discussion':
                    if (lastUserMessage.includes('?') || 
                       lastUserMessage.toLowerCase().includes('explain') || 
                       lastUserMessage.toLowerCase().includes('tell me more')) {
                        
                        // Generate a detailed response to the user's question
                        const questionResponse = await generateCompleteResponse(
                            [{ 
                                role: 'system', 
                                content: responseStrategies['Topic Lecture'].discussion.systemPrompt 
                            },
                            {
                                role: 'user',
                                content: lastUserMessage
                            }],
                            responseStrategies['Topic Lecture'].discussion.maxTokens,
                            responseStrategies['Topic Lecture'].discussion.temperature
                        );
                        
                        response = questionResponse || 
                            `That's an excellent question about ${topic}. Let me explain in detail. ${topic} works by managing the flow of data and execution in your application. This is particularly important when dealing with asynchronous operations and event handling. Would you like me to provide a specific example?`;
                    } else {
                        // Check if we should move on or recap
                        if (lastUserMessage.toLowerCase().includes('next') || 
                            lastUserMessage.toLowerCase().includes('continue')) {
                            
                            // Generate a conclusion or next steps
                            const conclusionResponse = await generateCompleteResponse(
                                [{ 
                                    role: 'system', 
                                    content: `Provide a comprehensive summary of what we've learned about ${topic}.
                                    Include:
                                    1. A recap of key concepts (2-3 sentences)
                                    2. Practical takeaways (1-2 points)
                                    3. Suggestions for further learning (1 resource or topic)
                                    Limit your response to 10-12 complete lines.` 
                                }],
                                400,
                                0.5
                            );
                            
                            response = conclusionResponse || 
                                `To summarize what we've learned about ${topic}: it's a crucial technique that improves performance and user experience by managing how events are processed. The key is understanding when and how to implement it in your code. Are there any other aspects of ${topic} or related concepts you'd like to explore?`;
                        } else {
                            // Otherwise offer to explore other aspects
                            response = `Would you like me to go deeper into any particular aspect of ${topic} we've discussed, or shall we explore a related concept?`;
                        }
                    }
                    break;
            }
        } else {
            // Standard approach for other coaching options
            const currentStrategy = responseStrategies[coachingOption] || responseStrategies['default'];
            const strategyStage = conversationContext.askedQuestion ? 'follow_up' : 'initial';
            const strategyConfig = currentStrategy[strategyStage];

            // Prepare messages for AI (clean markdown)
            const messages = [
                { 
                    role: 'system', 
                    content: strategyConfig.systemPrompt 
                },
                ...conversation.slice(-4).map(msg => ({
                    role: msg.role,
                    content: msg.content.replace(/[#*\-_]/g, '') // Remove formatting
                }))
            ];

            // Generate response with retry logic for incomplete responses
            response = await generateCompleteResponse(
                messages,
                strategyConfig.maxTokens,
                strategyConfig.temperature
            );
            
            // Clean the response
            response = response
                .replace(/[#*\-_]/g, '') // Remove symbols
                .trim();

            // If empty, fallback to a neutral prompt
            if (!response) {
                response = "Interesting. Could you elaborate on that?";
            }
        }

        // Normalize response length based on coaching option
        response = normalizeResponseLength(response, isTopicLecture);

        // Update context
        conversationContext.askedQuestion = response.endsWith('?');
        conversationContext.lastQuestion = response.endsWith('?') ? response : "";
        conversationContexts.set(contextKey, conversationContext);

        return {
            role: 'assistant',
            content: response
        };

    } catch (error) {
        console.error('AI Error:', error);
        return {
            role: 'assistant',
            content: "I apologize for the technical issue. Let's continue our discussion. Could you please repeat your last question or statement?"
        };
    }
};

// Reset conversation context if needed
export const resetConversationContext = (topic, coachingOption) => {
    const contextKey = `${topic}_${coachingOption}`;
    conversationContexts.delete(contextKey);
};

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

        // Comprehensive conversation analysis
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

        // Refined summary generation prompt
        const summaryPrompt = `
        Analyze the entire conversation comprehensively. 
        Your summary should:
        - Capture the key learning objectives
        - Highlight the most important insights
        - Provide concise, actionable recommendations
        - Maintain a professional and constructive tone
        - Be structured and easy to read
        - Focus on the core learnings and progress made

        Conversation Context:
        - Coaching Option: ${coachingOption}
        - Total Messages: ${filteredConvo.length}

        Summary Guidelines:
        1. Keep the summary between 250-400 words
        2. Use clear, professional language
        3. Break down insights into clear sections
        4. Provide specific, actionable feedback
        5. IMPORTANT: Ensure your summary is COMPLETE and not cut off mid-thought
        `;

        // Generate summary with retry logic
        let summaryResponse = "";
        let summaryAttempts = 0;
        
        while (summaryAttempts < 2) {
            const completion = await openai.chat.completions.create({
                model: "google/gemini-2.5-pro-preview-03-25",
                messages: [
                    {
                        role: 'system',
                        content: summaryPrompt
                    },
                    {
                        role: 'user',
                        content: JSON.stringify(filteredConvo)
                    }
                ],
                max_tokens: 600,  // Increased for complete summary
                temperature: 0.5,
                top_p: 0.8
            });

            summaryResponse = completion?.choices?.[0]?.message?.content || "";
            
            if (!isResponseIncomplete(summaryResponse)) {
                break;
            }
            
            summaryAttempts++;
        }
        
        // Fallback if no content is generated
        if (!summaryResponse) {
            return {
                role: 'assistant',
                content: `## Conversation Summary

### Key Insights
1. Comprehensive review of the discussion
2. Identification of primary learning objectives
3. Recommendations for future improvement

### Next Steps
- Reflect on the discussed topics
- Apply the learned insights
- Continue exploring the subject matter`
            };
        }

        // Format the response with markdown for better readability
        const formattedResponse = `## Conversation Summary

${summaryResponse.split('\n').map(line => 
    line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.') 
    ? `### ${line}` 
    : line
).join('\n')}

### Recommendations
- Review the key points
- Practice and apply the insights
- Seek further clarification if needed`;

        return {
            role: 'assistant',
            content: formattedResponse
        };

    } catch (error) {
        console.error('Feedback Generation Error:', error);
        return {
            role: 'assistant',
            content: `## Conversation Summary

### Overview
Unable to generate a detailed summary due to processing issues.

### Key Points
1. Conversation explored various aspects of the topic
2. Meaningful dialogue was maintained
3. Learning objectives were addressed

### Recommendation
- Review the conversation manually
- Identify key takeaways
- Reflect on the discussion's main points`
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