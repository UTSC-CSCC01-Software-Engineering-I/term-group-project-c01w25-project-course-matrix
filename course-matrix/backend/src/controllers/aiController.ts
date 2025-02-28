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
} from "../constants/promptKeywords";

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
  process.env.PINECONE_INDEX_NAME!
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
    if (!relevantNamespaces.includes("courses"))
      relevantNamespaces.push("courses");
    if (!relevantNamespaces.includes("offerings"))
      relevantNamespaces.push("offerings");
    if (!relevantNamespaces.includes("prerequisites"))
      relevantNamespaces.push("prerequisites");
  }

  // Check for dept codes
  if (DEPARTMENT_CODES.some((code) => lowerQuery.includes(code))) {
    if (!relevantNamespaces.includes("departments"))
      relevantNamespaces.push("departments");
    if (!relevantNamespaces.includes("courses"))
      relevantNamespaces.push("courses");
  }

  // If search is required at all
  const requiresSearch =
    relevantNamespaces.length > 0 ||
    GENERAL_ACADEMIC_TERMS.some((term) => lowerQuery.includes(term)) ||
    containsCourseCode;

  // If no specific namespaces identified & search required, then search all
  if (requiresSearch && relevantNamespaces.length === 0) {
    relevantNamespaces.push(
      "courses",
      "offerings",
      "prerequisites",
      "corequisites",
      "departments"
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
  namespaces: string[]
): Promise<Document[]> {
  let allResults: Document[] = [];

  if (namespaces.length === 0) {
    return allResults;
  }

  for (const namespace of namespaces) {
    const namespaceStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index as any,
      textKey: "text",
      namespace: namespace,
    });

    try {
      const results = await namespaceStore.similaritySearch(query, k);
      console.log(`Found ${results.length} results in namespace: ${namespace}`);
      allResults = [...allResults, ...results];
    } catch (error) {
      console.log(`Error searching namespace ${namespace}:`, error);
    }
  }

  // Limit to top k results
  return allResults.slice(0, k);
}

export const chat = asyncHandler(async (req: Request, res: Response) => {
  const { messages } = req.body;
  const latestMessage = messages[messages.length - 1].content[0].text;

  // Analyze the query to determine if search is needed and which namespaces to search
  const { requiresSearch, relevantNamespaces } = analyzeQuery(latestMessage);

  let context = "[No context provided]";

  if (requiresSearch) {
    console.log(
      `Query requires knowledge retrieval, searching namespaces: ${relevantNamespaces.join(
        ", "
      )}`
    );
    const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!);

    // Search only the relevant namespaces
    const searchResults = await searchSelectedNamespaces(
      latestMessage,
      3,
      relevantNamespaces
    );
    console.log("Search Results: ", searchResults);

    // Format context from search results into plaintext
    if (searchResults.length > 0) {
      context = searchResults.map((doc) => doc.pageContent).join("\n\n");
    }
  } else {
    console.log("Query does not require knowledge retrieval, skipping search");
  }

  console.log("CONTEXT: ", context);

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
      - Answer questions about course descriptions, schedules, instructors, and requirements
      - Explain degree program requirements and course relationships
      - Help students understand course planning and registration processes
  
      ## Response Guidelines
      - Be concise and direct when answering course-related questions
      - When multiple relevant courses are mentioned in the context, prioritize the most relevant ones to the query
      - Use bullet points for listing multiple pieces of information
      - Include course codes when referencing specific courses
      - If information is missing from the context but likely exists, acknowledge the limitation
      - For unrelated questions, politely explain that you're specialized in UTSC academic information
  
      ## Available Knowledge
      ${
        context === "[No context provided]"
          ? "No specific course information is available for this query. Answer based on general knowledge about the Course Matrix platform."
          : "Use the following information to inform your response:\n\n" +
            context
      }
      `,
    messages,
  });

  result.pipeDataStreamToResponse(res);
});
