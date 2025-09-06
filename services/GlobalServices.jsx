import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
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

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

// Model configuration for Gemini 2.5 Flash
const MODEL_CONFIG = {
    model: "gemini-2.0-flash-exp",
    temperature: 0.7,
    topP: 0.9,
    maxOutputTokens: 400,
    enableStreaming: true
};

// Store conversation contexts
const conversationContexts = new Map();

// Enhanced topic-specific configurations with essential basic questions
const topicConfigurations = {
    // Frontend Technologies
    react: {
        category: "Frontend",
        systemPrompt: `You are a senior React developer conducting a technical interview/coaching session. 
        Focus on evaluating deep understanding of React's core concepts, best practices, and common pitfalls.
        Ask about real-world challenges, performance optimizations, and architecture decisions.
        Use a conversational, natural tone. Keep responses concise (5-6 lines) and focused.`,
        basicConcepts: ["Components", "JSX", "Props", "State", "Event Handling"],
        intermediateConcepts: ["Hooks (useState, useEffect, useContext)", "Context API", "Lifecycle", "State Management", "Forms and Validation"],
        advancedConcepts: ["Performance Optimization", "Custom Hooks", "Design Patterns", "Testing Strategies", "SSR/SSG Integration"],
        essentialQuestions: [
            "What is the Virtual DOM and how does it work in React?",
            "What are React Hooks and why are they used? Can you explain useState and useEffect?",
            "What's the difference between props and state in React?",
            "What are Higher-Order Components (HOCs) and how do they differ from React Hooks?",
            "What is the component lifecycle in React and how do you handle side effects?"
        ],
        keyTopics: [
            "Component lifecycle and hooks (useState, useEffect, useContext, useReducer, useMemo, useCallback)",
            "State management approaches (Context API, Redux, Zustand, React Query)",
            "Performance optimization techniques (memoization, code splitting, virtualization)",
            "React architecture patterns (composition vs inheritance, container/presentational)",
            "Modern React features (Suspense, concurrent mode, server components)"
        ]
    },
    
    nextjs: {
        category: "Frontend Framework",
        systemPrompt: `You are a senior Next.js developer conducting a technical interview/coaching session.
        Focus on evaluating deep understanding of Next.js rendering strategies, data fetching, routing, and optimization.
        Ask about real-world challenges, architecture decisions, and performance considerations.
        Use a conversational, natural tone. Keep responses concise (5-6 lines) and focused.`,
        basicConcepts: ["Pages", "Routing", "API Routes", "Static Assets", "Basic Deployment"],
        intermediateConcepts: ["SSR vs SSG vs ISR", "Data Fetching Methods", "Dynamic Routes", "Middleware", "Image Optimization"],
        advancedConcepts: ["App Router", "Server Components", "Edge Runtime", "Performance Optimization", "Advanced Deployment"],
        essentialQuestions: [
            "What's the difference between SSR, SSG, and ISR in Next.js?",
            "Explain getServerSideProps, getStaticProps, and getStaticPaths in Next.js.",
            "How does Next.js routing work and what are dynamic routes?",
            "What are API routes in Next.js and how do you create them?",
            "What is the App Router in Next.js 13+ and how does it differ from the Pages Router?"
        ],
        keyTopics: [
            "Rendering strategies (SSR, SSG, ISR, CSR) and their appropriate use cases",
            "Data fetching approaches (getServerSideProps, getStaticProps, SWR, React Query)",
            "Next.js routing system (pages directory, app directory, dynamic routes, middleware)",
            "Performance optimization techniques (image optimization, font optimization, code splitting)",
            "Deployment strategies and edge runtime considerations"
        ]
    },
    
    javascript: {
        category: "Programming Language",
        systemPrompt: `You are a senior JavaScript developer conducting a technical interview/coaching session.
        Focus on evaluating deep understanding of JavaScript fundamentals, advanced concepts, and modern practices.
        Ask about real-world challenges, architecture decisions, and performance considerations.
        Use a conversational, natural tone. Keep responses concise (5-6 lines) and focused.`,
        basicConcepts: ["Variables and Scope", "Data Types", "Functions", "Objects and Arrays", "Control Structures"],
        intermediateConcepts: ["Closures", "Prototypes", "Async/Await", "ES6+ Features", "Error Handling"],
        advancedConcepts: ["Design Patterns", "Performance Optimization", "Memory Management", "Advanced Async", "Module Systems"],
        essentialQuestions: [
            "What is the difference between var, let, and const in JavaScript?",
            "What is hoisting in JavaScript? How does it work with variables and functions?",
            "What are closures in JavaScript and can you provide a practical example?",
            "What are Promises and how do async/await work? What's the difference?",
            "What do map, filter, and reduce array methods do? Can you explain with examples?"
        ],
        keyTopics: [
            "JavaScript core concepts (closures, scope, this, prototypes, execution context)",
            "Asynchronous JavaScript (promises, async/await, event loop, microtasks)",
            "Modern JavaScript features (ES6+, modules, destructuring, spread/rest)",
            "Performance optimization and memory management",
            "TypeScript fundamentals and advanced types"
        ]
    },

    // Backend Technologies
    nodejs: {
        category: "Backend Runtime",
        systemPrompt: `You are a senior Node.js developer conducting a technical interview/coaching session.
        Focus on Node.js runtime, event loop, performance, and backend architecture.
        Ask about scalability, security, and production considerations.
        Use a conversational, natural tone. Keep responses concise (5-6 lines) and focused.`,
        basicConcepts: ["Event Loop", "Modules (CommonJS/ES6)", "File System", "HTTP Server", "NPM/Package Management"],
        intermediateConcepts: ["Express.js Framework", "Middleware", "REST APIs", "Database Integration", "Authentication"],
        advancedConcepts: ["Microservices", "Performance Tuning", "Security Best Practices", "Testing Strategies", "Production Deployment"],
        essentialQuestions: [
            "What is the Node.js event loop and how does it handle asynchronous operations?",
            "What's the difference between CommonJS and ES6 modules in Node.js?",
            "How do you create a basic HTTP server in Node.js?",
            "What are middleware functions in Express.js and how do they work?",
            "How do you handle errors in Node.js applications?"
        ],
        keyTopics: [
            "Node.js event loop and non-blocking I/O",
            "Module system and package management",
            "Building RESTful APIs and GraphQL endpoints",
            "Database integration and ORM usage",
            "Performance optimization and production deployment"
        ]
    },

    python: {
        category: "Programming Language",
        systemPrompt: `You are a senior Python developer conducting a technical interview/coaching session.
        Focus on Python fundamentals, web frameworks, and backend development.
        Ask about code quality, performance, and production considerations.
        Use a conversational, natural tone. Keep responses concise (5-6 lines) and focused.`,
        basicConcepts: ["Python Syntax", "Data Structures", "Functions", "OOP Concepts", "Modules and Packages"],
        intermediateConcepts: ["Django/Flask", "Database ORM", "API Development", "Error Handling", "Testing"],
        advancedConcepts: ["Async Programming", "Performance Optimization", "Design Patterns", "Microservices", "DevOps Integration"],
        essentialQuestions: [
            "What are the main data types in Python and how do lists differ from tuples?",
            "What is the difference between a function and a method in Python?",
            "What are Python decorators and how do you use them?",
            "What is list comprehension and how does it compare to regular loops?",
            "What are Python's *args and **kwargs and when do you use them?"
        ],
        keyTopics: [
            "Python core concepts and data structures",
            "Web frameworks (Django/Flask) and API development",
            "Database integration and ORM usage",
            "Testing strategies and code quality",
            "Deployment and production considerations"
        ]
    },

    java: {
        category: "Programming Language",
        systemPrompt: `You are a senior Java developer conducting a technical interview/coaching session.
        Focus on Java fundamentals, Spring Framework, and enterprise development.
        Ask about design patterns, performance, and scalable architectures.
        Use a conversational, natural tone. Keep responses concise (5-6 lines) and focused.`,
        basicConcepts: ["OOP Principles", "Collections Framework", "Exception Handling", "I/O Operations", "Basic Multithreading"],
        intermediateConcepts: ["Spring Framework", "JPA/Hibernate", "REST APIs", "Testing (JUnit)", "Build Tools (Maven/Gradle)"],
        advancedConcepts: ["Microservices Architecture", "Performance Tuning", "Security", "Design Patterns", "Enterprise Integration"],
        essentialQuestions: [
            "What are the main principles of Object-Oriented Programming in Java?",
            "What's the difference between abstract classes and interfaces in Java?",
            "What is the Java Collections Framework and what are the main interfaces?",
            "What is exception handling in Java and what's the difference between checked and unchecked exceptions?",
            "What are Java generics and why are they important?"
        ],
        keyTopics: [
            "Object-oriented programming and design patterns",
            "Spring Framework and dependency injection",
            "Database access with JPA/Hibernate",
            "RESTful web services and microservices",
            "Performance optimization and enterprise patterns"
        ]
    },

    // Database Technologies
    mongodb: {
        category: "NoSQL Database",
        systemPrompt: `You are a MongoDB expert conducting a technical interview/coaching session.
        Focus on document-based data modeling, queries, and performance optimization.
        Ask about schema design, indexing, and production considerations.
        Use a conversational, natural tone. Keep responses concise (5-6 lines) and focused.`,
        basicConcepts: ["Documents and Collections", "CRUD Operations", "Basic Queries", "Data Types", "MongoDB Shell"],
        intermediateConcepts: ["Aggregation Pipeline", "Indexing", "Schema Design", "Relationships", "Transactions"],
        advancedConcepts: ["Sharding", "Replication", "Performance Optimization", "Security", "Production Deployment"],
        essentialQuestions: [
            "What is a document in MongoDB and how does it differ from a row in SQL?",
            "What are MongoDB collections and how do you perform basic CRUD operations?",
            "What is the MongoDB aggregation pipeline and why is it used?",
            "How do you create and use indexes in MongoDB for query optimization?",
            "What are MongoDB's data types and how do you handle relationships between documents?"
        ],
        keyTopics: [
            "Document-based data modeling and schema design",
            "Query optimization and aggregation framework",
            "Indexing strategies and performance tuning",
            "Replication and sharding for scalability",
            "Security and production best practices"
        ]
    },

    mysql: {
        category: "Relational Database",
        systemPrompt: `You are a MySQL database expert conducting a technical interview/coaching session.
        Focus on SQL queries, database design, and performance optimization.
        Ask about normalization, indexing, and production database management.
        Use a conversational, natural tone. Keep responses concise (5-6 lines) and focused.`,
        basicConcepts: ["SQL Basics", "Tables and Relationships", "CRUD Operations", "Data Types", "Basic Joins"],
        intermediateConcepts: ["Complex Queries", "Stored Procedures", "Triggers", "Views", "Transactions"],
        advancedConcepts: ["Performance Optimization", "Replication", "Partitioning", "Security", "High Availability"],
        essentialQuestions: [
            "What are the different types of JOINs in MySQL and when do you use each?",
            "What is database normalization and what are the different normal forms?",
            "What are MySQL indexes and how do they improve query performance?",
            "What's the difference between DELETE, DROP, and TRUNCATE in MySQL?",
            "What are MySQL transactions and what are ACID properties?"
        ],
        keyTopics: [
            "SQL query optimization and complex joins",
            "Database design and normalization",
            "Indexing strategies and performance tuning",
            "Stored procedures and database programming",
            "Replication, backup, and recovery strategies"
        ]
    },

    // DevOps & Cloud
    docker: {
        category: "Containerization",
        systemPrompt: `You are a Docker and containerization expert conducting a technical interview/coaching session.
        Focus on container concepts, Docker workflows, and production deployment.
        Ask about best practices, security, and orchestration.
        Use a conversational, natural tone. Keep responses concise (5-6 lines) and focused.`,
        basicConcepts: ["Containers vs VMs", "Docker Images", "Dockerfile", "Basic Commands", "Container Lifecycle"],
        intermediateConcepts: ["Docker Compose", "Volumes and Networking", "Multi-stage Builds", "Container Registry", "Security Basics"],
        advancedConcepts: ["Orchestration (Kubernetes)", "Production Deployment", "Performance Optimization", "Security Hardening", "CI/CD Integration"],
        essentialQuestions: [
            "What is Docker and how do containers differ from virtual machines?",
            "What is a Dockerfile and what are the key instructions used in it?",
            "What are Docker images and layers, and how do they work?",
            "What is Docker Compose and when would you use it?",
            "How do you manage data persistence in Docker using volumes?"
        ],
        keyTopics: [
            "Container fundamentals and Docker architecture",
            "Dockerfile best practices and image optimization",
            "Docker Compose for multi-container applications",
            "Container orchestration and Kubernetes basics",
            "Security and production deployment strategies"
        ]
    },

    aws: {
        category: "Cloud Platform",
        systemPrompt: `You are an AWS cloud expert conducting a technical interview/coaching session.
        Focus on cloud architecture, AWS services, and best practices.
        Ask about scalability, security, and cost optimization.
        Use a conversational, natural tone. Keep responses concise (5-6 lines) and focused.`,
        basicConcepts: ["Core Services (EC2, S3, RDS)", "IAM Basics", "VPC Fundamentals", "Basic Deployment", "AWS Console"],
        intermediateConcepts: ["Lambda Functions", "API Gateway", "CloudFormation", "Load Balancing", "Monitoring (CloudWatch)"],
        advancedConcepts: ["Microservices Architecture", "Security Best Practices", "Cost Optimization", "Disaster Recovery", "Enterprise Patterns"],
        essentialQuestions: [
            "What are the core AWS services (EC2, S3, RDS) and what are they used for?",
            "What is AWS IAM and why is it important for security?",
            "What is AWS Lambda and what are the benefits of serverless computing?",
            "What is an AWS VPC and how does it work?",
            "What is AWS CloudFormation and why use Infrastructure as Code?"
        ],
        keyTopics: [
            "Core AWS services and cloud architecture patterns",
            "Serverless computing with Lambda and API Gateway",
            "Infrastructure as Code with CloudFormation",
            "Security, IAM, and compliance best practices",
            "Cost optimization and performance monitoring"
        ]
    },

    // AI/ML
    "machine learning": {
        category: "AI/ML",
        systemPrompt: `You are a Machine Learning expert conducting a technical interview/coaching session.
        Focus on ML algorithms, data preprocessing, and model deployment.
        Ask about practical experience, model evaluation, and production ML.
        Use a conversational, natural tone. Keep responses concise (5-6 lines) and focused.`,
        basicConcepts: ["Supervised vs Unsupervised Learning", "Data Preprocessing", "Basic Algorithms", "Model Training", "Evaluation Metrics"],
        intermediateConcepts: ["Feature Engineering", "Cross-validation", "Hyperparameter Tuning", "Ensemble Methods", "Model Selection"],
        advancedConcepts: ["Deep Learning", "MLOps", "Production Deployment", "Model Monitoring", "Advanced Algorithms"],
        essentialQuestions: [
            "What's the difference between supervised, unsupervised, and reinforcement learning?",
            "What are the main steps in a machine learning pipeline?",
            "What's the difference between classification and regression problems?",
            "What is overfitting and underfitting, and how do you prevent them?",
            "What are some common evaluation metrics for classification and regression?"
        ],
        keyTopics: [
            "Machine learning fundamentals and algorithm selection",
            "Data preprocessing and feature engineering",
            "Model evaluation and validation techniques",
            "Deep learning and neural networks",
            "MLOps and production deployment"
        ]
    },

    "data science": {
        category: "Data Science",
        systemPrompt: `You are a Data Science expert conducting a technical interview/coaching session.
        Focus on data analysis, statistical methods, and business insights.
        Ask about data pipeline, visualization, and communication of results.
        Use a conversational, natural tone. Keep responses concise (5-6 lines) and focused.`,
        basicConcepts: ["Statistics Fundamentals", "Data Analysis", "Python/R Basics", "Data Visualization", "Data Cleaning"],
        intermediateConcepts: ["Machine Learning", "A/B Testing", "SQL and Databases", "Big Data Tools", "Business Intelligence"],
        advancedConcepts: ["Advanced Analytics", "Production Data Systems", "MLOps", "Experiment Design", "Strategic Decision Making"],
        essentialQuestions: [
            "What are the main types of data (numerical, categorical, ordinal) and how do you handle each?",
            "What is exploratory data analysis (EDA) and why is it important?",
            "What's the difference between correlation and causation?",
            "What are some common data visualization techniques and when to use them?",
            "What is A/B testing and how do you design a proper experiment?"
        ],
        keyTopics: [
            "Statistical analysis and hypothesis testing",
            "Data visualization and storytelling",
            "Machine learning for business problems",
            "Big data tools and technologies",
            "A/B testing and experimental design"
        ]
    },

    // Mobile Development
    "react native": {
        category: "Mobile Development",
        systemPrompt: `You are a React Native expert conducting a technical interview/coaching session.
        Focus on mobile app development, cross-platform considerations, and native integration.
        Ask about performance, user experience, and app store deployment.
        Use a conversational, natural tone. Keep responses concise (5-6 lines) and focused.`,
        basicConcepts: ["React Native Basics", "Components", "Navigation", "State Management", "Platform APIs"],
        intermediateConcepts: ["Native Modules", "Performance Optimization", "Third-party Libraries", "Testing", "Debugging"],
        advancedConcepts: ["Custom Native Code", "Architecture Patterns", "CI/CD for Mobile", "App Store Optimization", "Cross-platform Strategy"],
        essentialQuestions: [
            "What is React Native and how does it differ from regular React?",
            "How do you handle navigation in React Native applications?",
            "What are the main differences between iOS and Android development in React Native?",
            "How do you access native device features in React Native?",
            "What are the performance considerations when building React Native apps?"
        ],
        keyTopics: [
            "React Native fundamentals and component architecture",
            "Navigation and state management in mobile apps",
            "Native module integration and platform APIs",
            "Performance optimization for mobile devices",
            "App deployment and distribution strategies"
        ]
    },

    flutter: {
        category: "Mobile Development",
        systemPrompt: `You are a Flutter expert conducting a technical interview/coaching session.
        Focus on Dart language, widget system, and cross-platform mobile development.
        Ask about UI/UX, performance, and native integration.
        Use a conversational, natural tone. Keep responses concise (5-6 lines) and focused.`,
        basicConcepts: ["Dart Language", "Widget System", "Layouts", "State Management", "Navigation"],
        intermediateConcepts: ["Custom Widgets", "Animations", "Networking", "Local Storage", "Platform Channels"],
        advancedConcepts: ["Custom Rendering", "Performance Optimization", "Architecture Patterns", "Testing", "Deployment"],
        essentialQuestions: [
            "What is Flutter and what are the advantages of using Dart language?",
            "What's the difference between StatelessWidget and StatefulWidget in Flutter?",
            "How does Flutter's widget tree work and what is the build method?",
            "What are the main layout widgets in Flutter and how do you use them?",
            "How do you manage state in Flutter applications?"
        ],
        keyTopics: [
            "Dart language and Flutter widget system",
            "State management patterns and navigation",
            "Custom widgets and animations",
            "Platform integration and native features",
            "Performance optimization and deployment"
        ]
    },

    // Full Stack
    "full stack": {
        category: "Full Stack Development",
        systemPrompt: `You are a Full Stack development expert conducting a technical interview/coaching session.
        Focus on end-to-end application development, architecture decisions, and integration.
        Ask about frontend, backend, database, and deployment considerations.
        Use a conversational, natural tone. Keep responses concise (5-6 lines) and focused.`,
        basicConcepts: ["Frontend Fundamentals", "Backend Basics", "Database Concepts", "API Development", "Version Control"],
        intermediateConcepts: ["Authentication & Authorization", "State Management", "Database Design", "API Integration", "Testing"],
        advancedConcepts: ["System Architecture", "Microservices", "Performance Optimization", "Security", "DevOps & Deployment"],
        essentialQuestions: [
            "What technologies would you use for a full-stack web application and why?",
            "How do you handle authentication and authorization in a full-stack application?",
            "What's the difference between REST and GraphQL APIs?",
            "How do you manage state between frontend and backend in your applications?",
            "What are the key considerations for deploying a full-stack application to production?"
        ],
        keyTopics: [
            "Frontend and backend technology integration",
            "API design and database architecture",
            "Authentication and security best practices",
            "System design and scalability considerations",
            "DevOps, testing, and deployment strategies"
        ]
    }
};

// Function to get topic configuration with fallback
const getTopicConfig = (topic) => {
    const normalizedTopic = topic.toLowerCase().trim();
    
    // Direct match
    if (topicConfigurations[normalizedTopic]) {
        return topicConfigurations[normalizedTopic];
    }
    
    // Partial match
    for (const [key, config] of Object.entries(topicConfigurations)) {
        if (normalizedTopic.includes(key) || key.includes(normalizedTopic)) {
            return config;
        }
    }
    
    // Default configuration for unknown topics
    return {
        category: "Computer Science",
        systemPrompt: `You are a senior developer conducting a technical interview/coaching session about ${topic}.
        Focus on evaluating deep understanding of core concepts, best practices, and practical experience.
        Ask about real-world challenges and architecture decisions.
        Use a conversational, natural tone. Keep responses concise (5-6 lines) and focused.`,
        basicConcepts: ["Fundamentals", "Core Concepts", "Basic Implementation", "Common Patterns", "Basic Tools"],
        intermediateConcepts: ["Advanced Features", "Integration", "Performance", "Testing", "Real-world Applications"],
        advancedConcepts: ["Architecture", "Optimization", "Security", "Scalability", "Production Considerations"],
        essentialQuestions: [
            `What are the core concepts of ${topic}?`,
            `What are the main advantages of using ${topic}?`,
            `How do you handle common challenges in ${topic}?`,
            `What are the best practices when working with ${topic}?`,
            `How do you optimize performance in ${topic} applications?`
        ],
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
    if (!text) return true;
    
    // Check if response ends with a proper sentence terminator
    const lastChar = text.trim().slice(-1);
    const properTerminators = ['.', '!', '?', '"', ':', ')', '}'];
    const hasProperEnding = properTerminators.includes(lastChar);
    
    // Check for obviously truncated sentences
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
    if (!response || response.length < 50) return false;
    
    // Check for proper ending
    const lastChar = response.trim().slice(-1);
    const properTerminators = ['.', '!', '?', '"', ':', ')', '}'];
    const hasProperEnding = properTerminators.includes(lastChar);
    
    // Check for incomplete phrases
    const commonIncompleteEndings = [
        ' the', ' a', ' an', ' and', ' or', ' but', ' if', ' as', ' to', ' in', ' on',
        ' with', ' by', ' for', ' is', ' are', ' was', ' were'
    ];
    
    const endsWithIncompletePhrase = commonIncompleteEndings.some(ending => 
        response.trim().endsWith(ending)
    );
    
    // Check for topic relevance
    const hasTopicKeywords = checkTopicRelevance(response, topic);
    
    // Check conversational quality
    const isConversational = checkConversationalQuality(response, lastUserMessage);
    
    return hasProperEnding && 
           !endsWithIncompletePhrase && 
           hasTopicKeywords && 
           isConversational;
};

// Check if response contains keywords relevant to the topic
const checkTopicRelevance = (response, topic) => {
    const lowerResponse = response.toLowerCase();
    const lowerTopic = topic.toLowerCase();
    
    const topicKeywords = {
        'react': ['component', 'state', 'props', 'hook', 'effect', 'render', 'jsx', 'virtual dom'],
        'next': ['server', 'static', 'render', 'route', 'api', 'page', 'app directory', 'middleware'],
        'javascript': ['function', 'object', 'array', 'promise', 'async', 'variable', 'scope', 'closure'],
        'node': ['server', 'express', 'api', 'middleware', 'async', 'callback', 'event', 'module'],
        'python': ['function', 'class', 'module', 'framework', 'django', 'flask', 'data', 'library'],
        'java': ['class', 'object', 'method', 'spring', 'interface', 'inheritance', 'collection', 'thread'],
        'docker': ['container', 'image', 'dockerfile', 'volume', 'network', 'compose', 'registry', 'build'],
        'aws': ['cloud', 'service', 'instance', 'lambda', 'storage', 'database', 'security', 'scalability'],
        'machine learning': ['model', 'algorithm', 'training', 'data', 'feature', 'prediction', 'neural', 'classification'],
        'data science': ['data', 'analysis', 'visualization', 'statistics', 'model', 'insight', 'pipeline', 'metric']
    };
    
    let keywords = [];
    for (const [key, words] of Object.entries(topicKeywords)) {
        if (lowerTopic.includes(key) || key.includes(lowerTopic)) {
            keywords = words;
            break;
        }
    }
    
    if (keywords.length === 0) {
        keywords = ['concept', 'practice', 'technique', 'approach', 'implementation', 'pattern', 'standard'];
    }
    
    const matchCount = keywords.filter(keyword => lowerResponse.includes(keyword)).length;
    return matchCount >= 1;
};

// Check if response maintains conversational quality
const checkConversationalQuality = (response, lastUserMessage) => {
    const lowerResponse = response.toLowerCase();
    const lowerUserMessage = lastUserMessage.toLowerCase();
    
    // Extract key terms from user message
    const userKeyTerms = lowerUserMessage
        .split(/\s+/)
        .filter(word => word.length > 3)
        .filter(word => !['what', 'when', 'where', 'which', 'that', 'this', 'these', 'those'].includes(word));
    
    // Check if response references user's terms
    const termReferenceCount = userKeyTerms.filter(term => lowerResponse.includes(term)).length;
    const hasTermReferences = userKeyTerms.length === 0 || termReferenceCount > 0;
    
    // Check for conversational elements
    const hasConversationalElements = 
        response.includes('?') ||
        lowerResponse.includes('you mentioned') ||
        lowerResponse.includes('your question') ||
        lowerResponse.includes('as you') ||
        lowerResponse.includes('let me') ||
        lowerResponse.includes('great question') ||
        lowerResponse.includes('that\'s');
    
    return hasTermReferences || hasConversationalElements;
};

// Helper function to normalize response length
const normalizeResponseLength = (text, maxLines = 6) => {
    if (!text) return "";
    
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    if (lines.length <= maxLines) return text;
    
    return lines.slice(0, maxLines).join('\n');
};

// Function to generate AI response using Gemini with streaming support
const generateGeminiResponse = async (systemPrompt, conversationHistory = [], useStreaming = false, maxRetries = 3) => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const model = genAI.getGenerativeModel({ 
                model: MODEL_CONFIG.model,
                generationConfig: {
                    temperature: MODEL_CONFIG.temperature,
                    topP: MODEL_CONFIG.topP,
                    maxOutputTokens: MODEL_CONFIG.maxOutputTokens,
                }
            });

            // Prepare conversation with system prompt
            let fullPrompt = systemPrompt;
            
            if (conversationHistory.length > 0) {
                const conversationText = conversationHistory
                    .slice(-6) // Keep last 6 messages for context
                    .map(msg => `${msg.role}: ${msg.content}`)
                    .join('\n');
                fullPrompt += `\n\nConversation history:\n${conversationText}`;
            }
            
            if (useStreaming && MODEL_CONFIG.enableStreaming) {
                // Streaming response
                const result = await model.generateContentStream(fullPrompt);
                let fullResponse = "";
                
                for await (const chunk of result.stream) {
                    const chunkText = chunk.text();
                    fullResponse += chunkText;
                }
                
                return normalizeResponseLength(fullResponse);
            } else {
                // Regular response
                const result = await model.generateContent(fullPrompt);
                const response = await result.response;
                const text = response.text();
                
                // Quality check
                if (isResponseIncomplete(text) && attempt < maxRetries - 1) {
                    console.log(`Response quality check failed, retrying... (attempt ${attempt + 1})`);
                    continue;
                }
                
                return normalizeResponseLength(text);
            }
            
        } catch (error) {
            console.error(`Gemini API error (attempt ${attempt + 1}):`, error);
            
            if (attempt === maxRetries - 1) {
                return "I'm having trouble connecting right now. Let's continue our discussion in a moment.";
            }
            
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
    }
};

// Enhanced system prompts for different interview stages
const getInterviewPrompt = (topic, stage, topicConfig, currentQuestionIndex = 0) => {
    const baseInstruction = `Keep responses conversational and concise (5-6 lines maximum). Be specific and technical.`;
    
    switch (stage) {
        case 'initial':
            return `${topicConfig.systemPrompt} Start by briefly introducing yourself as a senior ${topic} developer. 
            Welcome them professionally and explain that you'll start with 5 essential ${topic} questions before moving to project discussion. 
            Ask the first essential question: "${topicConfig.essentialQuestions[0]}" ${baseInstruction}`;
        
        case 'essential_questions':
            const questionNumber = currentQuestionIndex + 1;
            const currentQuestion = topicConfig.essentialQuestions[currentQuestionIndex];
            return `You are conducting a ${topic} technical interview. You're asking essential basic questions (${questionNumber}/5).
            The candidate just answered your previous question. Provide brief feedback on their answer (positive and encouraging).
            Then ask the next essential question: "${currentQuestion}"
            Keep it focused and encouraging. ${baseInstruction}`;
        
        case 'essential_feedback':
            return `You are conducting a ${topic} technical interview. The candidate just answered the last essential question.
            Provide brief, positive feedback on their answer and transition to project discussion.
            Say something like "Great! Now let's talk about your project experience with ${topic}. What kind of projects have you built?"
            ${baseInstruction}`;
        
        case 'projects':
            return `You are interviewing for a ${topic} position. Ask follow-up questions about their project experience.
            Focus on: technical decisions they made, challenges they faced, how they solved problems, their specific contributions.
            Be interested in their architecture choices and problem-solving approach. ${baseInstruction}`;
        
        case 'intermediate':
            return `You are conducting a ${topic} technical interview. Ask ONE intermediate-level question about: ${topicConfig.intermediateConcepts.join(', ')}.
            Focus on practical application and problem-solving. Ask about real-world scenarios they might have encountered.
            Test their ability to apply concepts in practice. ${baseInstruction}`;
        
        case 'advanced':
            return `You are conducting a ${topic} technical interview. Ask ONE advanced question about: ${topicConfig.advancedConcepts.join(', ')}.
            Focus on system design, architecture decisions, or complex problem-solving.
            Evaluate their senior-level thinking and experience with complex scenarios. ${baseInstruction}`;
        
        case 'feedback':
            return `You are a senior ${topic} interviewer. The candidate just answered your question.
            Provide brief, constructive feedback on their answer. Highlight what they did well and suggest improvements if needed.
            Then ask your next question based on the interview progression. ${baseInstruction}`;
        
        default:
            return topicConfig.systemPrompt;
    }
};

// Enhanced system prompts for lecture mode
const getLecturePrompt = (topic, stage, topicConfig, currentConcept = null) => {
    const baseInstruction = `Keep explanations clear and concise (5-6 lines). Use examples and ask engaging questions.`;
    
    switch (stage) {
        case 'initial':
            return `You are an expert ${topic} educator starting a comprehensive lecture.
            Provide a brief, engaging introduction to ${topic}: what it is, why it's important in modern development.
            Mention you'll cover key concepts from basic to advanced level.
            Ask if they're ready to start with the fundamentals or have specific questions. ${baseInstruction}`;
        
        case 'teaching_basic':
            return `You are teaching ${topic} fundamentals. Explain this concept clearly: ${currentConcept || topicConfig.basicConcepts[0]}.
            Include: what it is, why it's important, a simple example, and one common use case.
            Make it accessible for beginners. End by asking if they understand or have questions. ${baseInstruction}`;
        
        case 'teaching_intermediate':
            return `You are teaching intermediate ${topic} concepts. Explain: ${currentConcept || topicConfig.intermediateConcepts[0]}.
            Include: how it works, practical implementation, a real-world example, and best practices.
            Build on the fundamentals they've learned. Ask if they're ready for the next concept. ${baseInstruction}`;
        
        case 'teaching_advanced':
            return `You are teaching advanced ${topic} concepts. Explain: ${currentConcept || topicConfig.advancedConcepts[0]}.
            Include: complex implementation, architecture considerations, performance implications, and expert tips.
            This is senior-level content. Ask if they want to dive deeper or have questions. ${baseInstruction}`;
        
        case 'qa':
            return `You are in a Q&A session after teaching ${topic}. The student asked a specific question.
            Provide a clear, technical answer with examples. If it relates to concepts you've taught, reference them.
            Keep it focused and ask if they have more questions or want to explore related topics. ${baseInstruction}`;
        
        default:
            return topicConfig.systemPrompt + ` ${baseInstruction}`;
    }
};

// Enhanced AIModel function with improved conversation flow
export const AIModel = async (topic, coachingOption, conversation) => {
    if (!coachingOption) {
        return {
            role: 'assistant',
            content: `Welcome to your ${topic} coaching session! What specific area would you like to focus on today?`
        };
    }

    try {
        const option = CoachingOptions.find((item) => item.name === coachingOption);
        if (!option) {
            return {
                role: 'assistant',
                content: `Welcome to your ${topic} session! Let's begin exploring this topic together.`
            };
        }

        // Get topic configuration
        const topicConfig = getTopicConfig(topic);
        
        // Get conversation context
        const contextKey = `${topic}_${coachingOption}`;
        let conversationContext = conversationContexts.get(contextKey) || {
            stage: 'initial',
            currentLevel: 'essential',
            questionCount: 0,
            conceptIndex: 0,
            essentialQuestionIndex: 0,
            projectsDiscussed: false,
            essentialQuestionsCompleted: false,
            topicConfig: topicConfig,
            interviewMode: coachingOption === 'Mock Interview' || coachingOption === 'Ques Ans Prep',
            lectureMode: coachingOption === 'Topic Lecture',
            lastQuestion: "",
            feedbackGiven: false
        };

        // Get the latest user message
        const userMessages = conversation.filter(msg => msg.role === 'user');
        const lastUserMessage = userMessages[userMessages.length - 1]?.content || '';
        const isFirstMessage = conversation.length <= 2;

        // Different flow logic based on coaching option
        if (conversationContext.interviewMode) {
            return await handleInterviewMode(topic, conversation, conversationContext, contextKey, lastUserMessage, isFirstMessage, topicConfig);
        } else if (conversationContext.lectureMode) {
            return await handleLectureMode(topic, conversation, conversationContext, contextKey, lastUserMessage, isFirstMessage, topicConfig);
        } else {
            return await handleCoachingMode(topic, conversation, conversationContext, contextKey, lastUserMessage, isFirstMessage, topicConfig);
        }

    } catch (error) {
        console.error('AI Error:', error);
        return {
            role: 'assistant',
            content: `I apologize for the technical issue. Let's continue with your ${topic} session. What would you like to explore?`
        };
    }
};

// Enhanced interview mode handler with essential questions first
async function handleInterviewMode(topic, conversation, conversationContext, contextKey, lastUserMessage, isFirstMessage, topicConfig) {
    let response = "";
    let systemPrompt = "";
    
    if (isFirstMessage) {
        // Start with introduction and first essential question
        systemPrompt = getInterviewPrompt(topic, 'initial', topicConfig);
        response = await generateGeminiResponse(systemPrompt, conversation.slice(-3));
        conversationContext.stage = 'essential_questions';
        conversationContext.essentialQuestionIndex = 1; // Next question index
        
    } else if (conversationContext.stage === 'essential_questions' && !conversationContext.essentialQuestionsCompleted) {
        // Handle essential questions (5 total)
        if (conversationContext.essentialQuestionIndex < topicConfig.essentialQuestions.length) {
            // Continue with essential questions
            systemPrompt = getInterviewPrompt(topic, 'essential_questions', topicConfig, conversationContext.essentialQuestionIndex);
            response = await generateGeminiResponse(systemPrompt, conversation.slice(-4));
            conversationContext.essentialQuestionIndex++;
        } else {
            // All essential questions completed, transition to projects
            systemPrompt = getInterviewPrompt(topic, 'essential_feedback', topicConfig);
            response = await generateGeminiResponse(systemPrompt, conversation.slice(-4));
            conversationContext.stage = 'projects';
            conversationContext.essentialQuestionsCompleted = true;
            conversationContext.questionCount = 0;
        }
        
    } else if (conversationContext.stage === 'projects' && !conversationContext.projectsDiscussed) {
        // Continue discussing projects
        if (lastUserMessage.length > 100 && conversationContext.questionCount >= 1) {
            // Good project discussion, move to intermediate technical questions
            conversationContext.projectsDiscussed = true;
            conversationContext.stage = 'intermediate';
            conversationContext.questionCount = 0;
            conversationContext.feedbackGiven = false;
            systemPrompt = getInterviewPrompt(topic, 'intermediate', topicConfig);
        } else {
            // Continue project discussion
            systemPrompt = getInterviewPrompt(topic, 'projects', topicConfig);
            conversationContext.questionCount++;
        }
        
        response = await generateGeminiResponse(systemPrompt, conversation.slice(-4));
        
    } else if (conversationContext.stage === 'intermediate') {
        // Handle intermediate level questions
        if (conversationContext.feedbackGiven) {
            // Asked feedback, now ask next question or move to advanced
            if (conversationContext.questionCount >= 2) {
                conversationContext.stage = 'advanced';
                conversationContext.questionCount = 0;
                conversationContext.feedbackGiven = false;
                systemPrompt = getInterviewPrompt(topic, 'advanced', topicConfig);
            } else {
                systemPrompt = getInterviewPrompt(topic, 'intermediate', topicConfig);
                conversationContext.questionCount++;
            }
        } else {
            // Give feedback on their answer
            systemPrompt = getInterviewPrompt(topic, 'feedback', topicConfig);
            conversationContext.feedbackGiven = true;
        }
        
        response = await generateGeminiResponse(systemPrompt, conversation.slice(-4));
        
    } else if (conversationContext.stage === 'advanced') {
        // Handle advanced level questions
        if (conversationContext.feedbackGiven) {
            if (conversationContext.questionCount >= 2) {
                // Interview completion
                systemPrompt = `You are concluding a ${topic} technical interview. 
                Provide a brief, positive closing statement. Thank them for their time and mention next steps.
                Keep it professional and encouraging. 3-4 lines maximum.`;
                conversationContext.stage = 'completed';
            } else {
                systemPrompt = getInterviewPrompt(topic, 'advanced', topicConfig);
                conversationContext.questionCount++;
            }
        } else {
            systemPrompt = getInterviewPrompt(topic, 'feedback', topicConfig);
            conversationContext.feedbackGiven = true;
        }
        
        response = await generateGeminiResponse(systemPrompt, conversation.slice(-4));
        
    } else {
        // Default or completed interview
        systemPrompt = `You have completed a ${topic} technical interview. 
        Answer any follow-up questions they might have professionally and briefly.
        If they ask about their performance, be encouraging and constructive.`;
        
        response = await generateGeminiResponse(systemPrompt, conversation.slice(-3));
    }
    
    conversationContexts.set(contextKey, conversationContext);
    
    return {
        role: 'assistant',
        content: response
    };
}

// Lecture mode handler with Q&A format
async function handleLectureMode(topic, conversation, conversationContext, contextKey, lastUserMessage, isFirstMessage, topicConfig) {
    let response = "";
    let systemPrompt = "";
    
    if (isFirstMessage) {
        systemPrompt = getLecturePrompt(topic, 'initial', topicConfig);
        response = await generateGeminiResponse(systemPrompt, conversation.slice(-2));
        conversationContext.stage = 'teaching_basic';
        conversationContext.conceptIndex = 0;
        
    } else {
        // Check if user is asking a specific question
        if (lastUserMessage.includes('?') && !lastUserMessage.toLowerCase().includes('ready') && !lastUserMessage.toLowerCase().includes('next')) {
            systemPrompt = getLecturePrompt(topic, 'qa', topicConfig);
            response = await generateGeminiResponse(systemPrompt, conversation.slice(-3));
        } else {
            // Continue structured teaching
            if (conversationContext.stage === 'teaching_basic') {
                if (conversationContext.conceptIndex < topicConfig.basicConcepts.length) {
                    const currentConcept = topicConfig.basicConcepts[conversationContext.conceptIndex];
                    systemPrompt = getLecturePrompt(topic, 'teaching_basic', topicConfig, currentConcept);
                    conversationContext.conceptIndex++;
                } else {
                    // Move to intermediate
                    conversationContext.stage = 'teaching_intermediate';
                    conversationContext.conceptIndex = 0;
                    const currentConcept = topicConfig.intermediateConcepts[0];
                    systemPrompt = getLecturePrompt(topic, 'teaching_intermediate', topicConfig, currentConcept);
                }
                
            } else if (conversationContext.stage === 'teaching_intermediate') {
                if (conversationContext.conceptIndex < topicConfig.intermediateConcepts.length) {
                    const currentConcept = topicConfig.intermediateConcepts[conversationContext.conceptIndex];
                    systemPrompt = getLecturePrompt(topic, 'teaching_intermediate', topicConfig, currentConcept);
                    conversationContext.conceptIndex++;
                } else {
                    // Move to advanced
                    conversationContext.stage = 'teaching_advanced';
                    conversationContext.conceptIndex = 0;
                    const currentConcept = topicConfig.advancedConcepts[0];
                    systemPrompt = getLecturePrompt(topic, 'teaching_advanced', topicConfig, currentConcept);
                }
                
            } else if (conversationContext.stage === 'teaching_advanced') {
                if (conversationContext.conceptIndex < topicConfig.advancedConcepts.length) {
                    const currentConcept = topicConfig.advancedConcepts[conversationContext.conceptIndex];
                    systemPrompt = getLecturePrompt(topic, 'teaching_advanced', topicConfig, currentConcept);
                    conversationContext.conceptIndex++;
                } else {
                    // Lecture completed, move to open Q&A
                    conversationContext.stage = 'qa';
                    systemPrompt = `You've completed teaching all ${topic} concepts from basic to advanced.
                    Provide a brief summary of what was covered and ask if they have any specific questions.
                    Encourage them to ask about anything they'd like to explore deeper. Keep it encouraging and open-ended.`;
                }
                
            } else {
                // Open Q&A mode
                systemPrompt = getLecturePrompt(topic, 'qa', topicConfig);
            }
            
            response = await generateGeminiResponse(systemPrompt, conversation.slice(-4));
        }
    }
    
    conversationContexts.set(contextKey, conversationContext);
    
    return {
        role: 'assistant',
        content: response
    };
}

// Default coaching mode handler
async function handleCoachingMode(topic, conversation, conversationContext, contextKey, lastUserMessage, isFirstMessage, topicConfig) {
    let systemPrompt = "";
    
    if (isFirstMessage) {
        systemPrompt = `You are an expert ${topic} mentor starting a coaching session. 
        Welcome them warmly and ask what specific aspect of ${topic} they'd like to work on.
        Are they preparing for interviews, learning new concepts, or working on a project?
        Keep it friendly and focused (4-5 lines).`;
    } else {
        systemPrompt = `You are mentoring someone in ${topic}. They said: "${lastUserMessage}". 
        Provide helpful, specific guidance based on their needs. Share practical insights and ask follow-up questions 
        to understand their goals better. Keep the conversation engaging and educational (5-6 lines).`;
    }
    
    const response = await generateGeminiResponse(systemPrompt, conversation.slice(-4));
    
    return {
        role: 'assistant',
        content: response
    };
}

// Enhanced feedback generation for session summary
export const AIModelToGenerateFeedbackAndNotes = async (coachingOption, conversation) => {
    try {
        if (!conversation?.length) {
            throw new Error('Conversation is empty');
        }

        const filteredConvo = conversation
            .filter(msg => msg.role !== 'system' && msg.content?.trim())
            .map(msg => ({ role: msg.role, content: msg.content }));

        if (filteredConvo.length === 0) {
            throw new Error('No valid messages to analyze');
        }

        // Identify topic from conversation
        let topic = "technical skills";
        const conversationText = filteredConvo.map(msg => msg.content).join(' ').toLowerCase();
        
        for (const [key] of Object.entries(topicConfigurations)) {
            if (conversationText.includes(key)) {
                topic = key;
                break;
            }
        }

        const topicConfig = getTopicConfig(topic);

        const feedbackPrompt = `You are an expert ${topic} interviewer/coach analyzing this ${coachingOption} session.
        
        Provide a comprehensive session summary with these sections:

        ## ${topic.toUpperCase()} SESSION SUMMARY

        ### KEY CONCEPTS COVERED
        List 3-4 specific ${topic} concepts that were discussed, noting the candidate's understanding level for each.

        ### STRENGTHS
        Highlight 2-3 areas where the candidate showed strong knowledge or good problem-solving approach.

        ### GROWTH OPPORTUNITIES  
        Identify 2-3 specific areas for improvement with actionable advice for each.

        ### RECOMMENDED RESOURCES
        Suggest 2-3 specific learning resources (documentation, tutorials, practice projects) that address their needs.

        ### NEXT STEPS
        Provide 2-3 concrete action items for continued learning.

        Keep it constructive, specific, and actionable. Use clear formatting with bullet points.
        Total response should be 350-450 words.

        Session type: ${coachingOption}
        Topic focus: ${topic}
        Conversation data: ${JSON.stringify(filteredConvo.slice(-10))}`;

        const feedback = await generateGeminiResponse(feedbackPrompt, [], false, 2);

        return {
            role: 'assistant',
            content: feedback || generateDefaultFeedback(topic, coachingOption)
        };

    } catch (error) {
        console.error('Feedback Generation Error:', error);
        return {
            role: 'assistant',
            content: generateDefaultFeedback("technical skills", coachingOption)
        };
    }
};

// Generate default feedback when AI fails
const generateDefaultFeedback = (topic, coachingOption) => {
    return `## ${topic.toUpperCase()} SESSION SUMMARY

### Key Concepts Covered
- Core ${topic} principles and fundamentals
- Practical implementation approaches  
- Best practices and common patterns
- Real-world application scenarios

### Strengths
- Good engagement with the material and thoughtful responses
- Demonstrated understanding of basic concepts
- Asked relevant questions showing curiosity to learn

### Growth Opportunities
- Deepen understanding of advanced ${topic} concepts
- Practice more hands-on implementation and coding
- Explore production-level considerations and optimization

### Recommended Resources
- Official ${topic} documentation and getting started guides
- Interactive coding tutorials and practice platforms
- Open source projects for hands-on experience

### Next Steps
- Build a practical project using ${topic}
- Review and practice the concepts discussed today
- Join ${topic} community forums for continued learning`;
};

// Reset conversation context
export const resetConversationContext = (topic, coachingOption) => {
    const contextKey = `${topic}_${coachingOption}`;
    conversationContexts.delete(contextKey);
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
        VoiceId: "Joanna"
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