import asyncHandler from "../middleware/asyncHandler";
import { Request, Response } from "express";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { Index, Pinecone, RecordMetadata } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "langchain/document";
import {
  NAMESPACE_KEYWORDS,
  GENERAL_ACADEMIC_TERMS,
  DEPARTMENT_CODES,
  ASSISTANT_TERMS,
  USEFUL_INFO,
} from "../constants/promptKeywords";
import { CHATBOT_MEMORY_THRESHOLD, codeToYear } from "../constants/constants";
import { namespaceToMinResults } from "../constants/constants";
import OpenAI from "openai";

const openai = createOpenAI({
  baseURL: process.env.OPENAI_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY,
});

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const index: Index<RecordMetadata> = pinecone.Index(
  process.env.PINECONE_INDEX_NAME!,
);

console.log("Connected to OpenAI API");

// Analyze query contents and pick out relavent namespaces to search.
function analyzeQuery(query: string): {
  requiresSearch: boolean;
  relevantNamespaces: string[];
} {
  const lowerQuery = query.toLowerCase();

  // Check for course codes (typically 3 letters followed by numbers)
  const courseCodeRegex = /\b[a-zA-Z]{3}[a-zA-Z]?\d{2,3}[a-zA-Z]?\b/i;
  const containsCourseCode = courseCodeRegex.test(query);

  const relevantNamespaces: string[] = [];

  // Check each namespace's keywords
  Object.entries(NAMESPACE_KEYWORDS).forEach(([namespace, keywords]) => {
    if (keywords.some((keyword) => lowerQuery.includes(keyword))) {
      relevantNamespaces.push(namespace);
    }
  });

  // If a course code is detected, add tehse namespaces
  if (containsCourseCode) {
    if (!relevantNamespaces.includes("courses_v2"))
      relevantNamespaces.push("courses_v2");
    if (!relevantNamespaces.includes("offerings"))
      relevantNamespaces.push("offerings");
    if (!relevantNamespaces.includes("prerequisites"))
      relevantNamespaces.push("prerequisites");
  }

  // Check for dept codes
  if (DEPARTMENT_CODES.some((code) => lowerQuery.includes(code))) {
    if (!relevantNamespaces.includes("departments"))
      relevantNamespaces.push("departments");
    if (!relevantNamespaces.includes("courses_v2"))
      relevantNamespaces.push("courses_v2");
  }

  // If search is required at all
  const requiresSearch =
    relevantNamespaces.length > 0 ||
    GENERAL_ACADEMIC_TERMS.some((term) => lowerQuery.includes(term)) ||
    containsCourseCode;

  // If no specific namespaces identified & search required, then search all
  if (requiresSearch && relevantNamespaces.length === 0) {
    relevantNamespaces.push(
      "courses_v2",
      "offerings",
      "prerequisites",
      "corequisites",
      "departments",
      "programs",
    );
  }

  if (
    ASSISTANT_TERMS.some((term) => lowerQuery.includes(term)) &&
    relevantNamespaces.length === 0
  ) {
    return { requiresSearch: false, relevantNamespaces: [] };
  }

  return { requiresSearch, relevantNamespaces };
}

async function searchSelectedNamespaces(
  query: string,
  k: number,
  namespaces: string[],
): Promise<Document[]> {
  let allResults: Document[] = [];

  if (namespaces.length === 0) {
    return allResults;
  }

  let minSearchResultCount = k;

  for (const namespace of namespaces) {
    const namespaceStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index as any,
      textKey: "text",
      namespace: namespace,
    });

    try {
      // Search results count given by the min result count for a given namespace (or k if k is greater)
      const results = await namespaceStore.similaritySearch(
        query,
        Math.max(k, namespaceToMinResults.get(namespace)),
      );
      console.log(`Found ${results.length} results in namespace: ${namespace}`);
      allResults = [...allResults, ...results];
      if (results.length > minSearchResultCount) {
        minSearchResultCount = results.length;
      }
    } catch (error) {
      console.log(`Error searching namespace ${namespace}:`, error);
    }
  }

  // Limit to top minSearchResultCount results
  // return allResults.slice(0, minSearchResultCount);

  return allResults;
}

// Reformulate user query to make more concise query to database, taking into consideration context
async function reformulateQuery(
  latestQuery: string,
  conversationHistory: any[],
): Promise<string> {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // console.log("History: ", conversationHistory);

    // Create messages array with the correct type structure
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `IMPORTANT: You are NOT a conversational assistant. You are a query transformation tool.

          Your ONLY job is to convert a user's question into a self-contained search query. 

          RULES:
          - Output ONLY the reformulated search query
          - NO explanations, greetings, or additional text
          - NO answering the query yourself
          - DO include all relevant contextual information from conversation history
          - DO replace pronouns and references with specific names and identifiers
          - DO include course codes, names and specific details for academic entities
          - If the query is not about university courses & offerings, return exactly a copy of the user's query.

          Examples:
          User: "When is it offered?"
          Output: "When is CSCA48 Introduction to Computer Science offered in the 2024-2025 academic year?"

          User: "Tell me more about that"
          Output: "What are the details, descriptions, and requirements for MATA31 Calculus I?"

          User: "Who teaches it?"
          Output: "Who are the instructors for MGEA02 Introduction to Microeconomics at UTSC?"

          User: "What are the course names of those codes?"
          Output: "What are the course names of course codes: MGTA01, CSCA08, MATA31, MATA35?"

          User: "How are you doing today?"
          Output: "How are you doing today?"

          User: "Give 2nd year math courses."
          Output: "What are some 2nd year math courses?"

          User: "Give first year math courses."
          Output: "What are some 1st year math courses?"`,
      },
    ];

    // Add conversation history with proper typing
    conversationHistory.forEach((msg) => {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    });

    // Add the latest query
    messages.push({
      role: "user",
      content: latestQuery,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      temperature: 0.1, // Lower temperature for more consistent, focused queries
      max_tokens: latestQuery.length * 3, // Limit response length. Proportional to user input.
      top_p: 0.5, // Reduced top_p for more focused outputs
    });

    return response.choices[0].message.content?.trim() || latestQuery;
  } catch (error) {
    console.error("Error reformulating query:", error);
    // Fallback to original query if reformulation fails
    return latestQuery;
  }
}

export const chat = asyncHandler(async (req: Request, res: Response) => {
  const { messages } = req.body;
  const latestMessage = messages[messages.length - 1].content[0].text;

  // Get conversation history (excluding the latest message)
  const conversationHistory = (messages as any[]).slice(0, -1).map((msg) => ({
    role: msg?.role,
    content: msg?.content[0]?.text,
  }));

  // Use GPT-4o to reformulate the query based on conversation history
  const reformulatedQuery = await reformulateQuery(
    latestMessage,
    conversationHistory.slice(-CHATBOT_MEMORY_THRESHOLD), // last K messages
  );
  console.log(">>>> Original query:", latestMessage);
  console.log(">>>> Reformulated query:", reformulatedQuery);

  // Analyze the query to determine if search is needed and which namespaces to search
  const { requiresSearch, relevantNamespaces } =
    analyzeQuery(reformulatedQuery);

  let context = "[No context provided]";

  if (requiresSearch) {
    console.log(
      `Query requires knowledge retrieval, searching namespaces: ${relevantNamespaces.join(
        ", ",
      )}`,
    );

    // Search only relevant namespaces
    const searchResults = await searchSelectedNamespaces(
      reformulatedQuery,
      3,
      relevantNamespaces,
    );
    // console.log("Search Results: ", searchResults);

    // Format context from search results into plaintext
    if (searchResults.length > 0) {
      context = searchResults.map((doc) => doc.pageContent).join("\n\n");
    }
  } else {
    console.log("Query does not require knowledge retrieval, skipping search");
  }

  // console.log("CONTEXT: ", context);

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: `# Morpheus - Course Matrix Assistant
  
      ## Identity & Purpose
      You are Morpheus, the official AI assistant for Course Matrix, an AI-powered platform that helps University of Toronto Scarborough (UTSC) students plan their academic journey.
  
      ## About Course Matrix
      Course Matrix streamlines course selection and timetable creation by:
      - Generating optimized timetables in one click based on selected courses and personal preferences
      - Allowing natural language queries about courses, offerings, and academic programs
      - Providing personalized recommendations based on degree requirements and course availability
  
      ## Your Capabilities
      - Provide accurate information about UTSC courses, offerings, prerequisites, corequisites, and departments
      - Answer questions about course descriptions, schedules, instructors, offerings, and requirements
      - Explain degree program requirements and course relationships
      - Answer questions about offerings of individual courses such as meeting section, time, day, instructor
  
      ## Response Guidelines
      - Be concise and direct when answering course-related questions
      - Use bullet points for listing multiple pieces of information
      - Include course codes when referencing specific courses
      - If information is missing from the context but likely exists, try to use info from web to answer. If still not able to form a decent response, acknowledge the limitation
      - For unrelated questions, politely explain that you're specialized in UTSC academic information
  
      ## Available Knowledge
      ${
        context === "[No context provided]"
          ? "No specific course information is available for this query. Answer based on general knowledge about the Course Matrix platform."
          : "Use the following information to inform your response. Also use conversation history to inform response as well.\n\n" +
            context
      }
      `,
    messages,
  });

  result.pipeDataStreamToResponse(res);
});

// Test Similarity search
// Usage: provide user prompt in req.body
export const testSimilaritySearch = asyncHandler(
  async (req: Request, res: Response) => {
    const { message } = req.body;

    // Analyze the query to determine if search is needed and which namespaces to search
    const { requiresSearch, relevantNamespaces } = analyzeQuery(message);

    let context = "[No context provided]";

    if (requiresSearch) {
      console.log(
        `Query requires knowledge retrieval, searching namespaces: ${relevantNamespaces.join(
          ", ",
        )}`,
      );

      // Search only the relevant namespaces
      const searchResults = await searchSelectedNamespaces(
        message,
        3,
        relevantNamespaces,
      );
      console.log("Search Results: ", searchResults);

      // Format context from search results into plaintext
      if (searchResults.length > 0) {
        context = searchResults.map((doc) => doc.pageContent).join("\n\n");
      }
    } else {
      console.log(
        "Query does not require knowledge retrieval, skipping search",
      );
    }

    console.log("CONTEXT: ", context);
    res.status(200).send(context);
  },
);
