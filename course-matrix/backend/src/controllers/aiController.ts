import "openai/shims/node";

import { createOpenAI } from "@ai-sdk/openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { Index, Pinecone, RecordMetadata } from "@pinecone-database/pinecone";
import {
  CoreMessage,
  generateObject,
  InvalidToolArgumentsError,
  NoSuchToolError,
  streamText,
  tool,
  ToolExecutionError,
} from "ai";
import { Request, Response } from "express";
import { Document } from "langchain/document";
import OpenAI from "openai";
import { z } from "zod";

import {
  availableFunctions,
  FunctionNames,
} from "../constants/availableFunctions";
import {
  CHATBOT_MEMORY_THRESHOLD,
  CHATBOT_TIMETABLE_CMD,
  CHATBOT_TOOL_CALL_MAX_STEPS,
  namespaceToMinResults,
} from "../constants/constants";
import {
  ASSISTANT_TERMS,
  BREADTH_REQUIREMENT_KEYWORDS,
  DEPARTMENT_CODES,
  GENERAL_ACADEMIC_TERMS,
  NAMESPACE_KEYWORDS,
  USEFUL_INFO,
  YEAR_LEVEL_KEYWORDS,
} from "../constants/promptKeywords";
import asyncHandler from "../middleware/asyncHandler";
import { TimetableFormSchema } from "../models/timetable-form";
import { CreateTimetableArgs } from "../models/timetable-generate";
import { analyzeQuery } from "../utils/analyzeQuery";
import { convertBreadthRequirement } from "../utils/convert-breadth-requirement";
import { convertYearLevel } from "../utils/convert-year-level";
import { includeFilters } from "../utils/includeFilters";

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

export async function searchSelectedNamespaces(
  query: string,
  k: number,
  namespaces: string[],
  filters?: Object,
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
      // Search results count given by the min result count for a given
      // namespace (or k if k is greater)
      const results = await namespaceStore.similaritySearch(
        query,
        Math.max(k, namespaceToMinResults.get(namespace)),
        namespace === "courses_v3" ? filters : undefined,
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

// Reformulate user query to make more concise query to database, taking into
// consideration context
export async function reformulateQuery(
  latestQuery: string,
  conversationHistory: any[],
): Promise<string> {
  try {
    const openai2 = new OpenAI({
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
          - Append "code: " before course codes For example: "CSCC01" -> "code: CSCC01"
          - If a course year level is written as "first year", "second year", etc. Then replace "first" with "1st" and "second" with "2nd" etc.

          Examples:
          User: "When is it offered?"
          Output: "When is CSCA48 offered in the 2024-2025 academic year?"

          User: "Tell me more about that"
          Output: "What are the details, descriptions, and requirements for MATA31?"

          User: "Who teaches it?"
          Output: "Who are the instructors for MGEA02 at UTSC?"

          User: "What are the course names of those codes?"
          Output: "What are the course names of course codes: MGTA01, CSCA08, MATA31, MATA35?"

          User: "How are you doing today?"
          Output: "How are you doing today?"

          User: "Give 2nd year math courses."
          Output: "What are some 2nd year math courses?"

          User: "Give third year math courses."
          Output: "What are some 3rd year math courses?"
          
          User: "What breadth requirement does CSCC01 satisfy?"
          Output: "What breadth requirement does code: CSCC01 satisfy?"

          `,
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

    const response = await openai2.chat.completions.create({
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

/**
 * @description Handles user queries and generates responses using GPT-4o, with
 * optional knowledge retrieval.
 *
 * @param {Request} req - The Express request object, containing:
 *   @param {Object[]} req.body.messages - Array of message objects representing
 * the conversation history.
 *   @param {string} req.body.messages[].role - The role of the message sender
 * (e.g., "user", "assistant").
 *   @param {Object[]} req.body.messages[].content - An array containing message
 * content objects.
 *   @param {string} req.body.messages[].content[].text - The actual text of the
 * message.
 *
 * @param {Response} res - The Express response object used to stream the
 *     generated response.
 *
 * @returns {void} Responds with a streamed text response of the AI output
 *
 * @throws {Error} If query reformulation or knowledge retrieval fails.
 */
export const chat = asyncHandler(async (req: Request, res: Response) => {
  const { messages } = req.body;

  try {
    const latestMessage = messages[messages.length - 1].content[0].text;

    if (latestMessage.startsWith(CHATBOT_TIMETABLE_CMD)) {
      // ----- Flow 1 - Agent performs action on timetable -----

      // Get a new response from the model with all the tool responses
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
            - Creating, reading, updating, and deleting user timetables based on natural language
        
            ## Your Capabilities
            - Create new timetables based on provided courses and restrictions
            - Update timetable names and semesters
            - Delete a user's timetables
            - Retrieve timetables that the user owns
        
            ## Response Guidelines
            - Be concise and direct when answering course-related questions
            - Use bullet points for listing multiple pieces of information
            - Include course codes when referencing specific courses
            - If information is missing from the context but likely exists, try to use info from web to answer. If still not able to form a decent response, acknowledge the limitation
            - For unrelated questions, politely explain that you're specialized in UTSC academic information
            - Format long lists of timetables as a table

            ## Tool call guidelines
            - Include the timetable ID in all getTimetables tool call responses
            - Link: For every tool call, for each timetable that it gets/deletes/modifies/creates, include a link with it displayed as "View Timetable" to ${
              process.env.CLIENT_APP_URL
            }/dashboard/timetable?edit=[[TIMETABLE_ID]] , where TIMETABLE_ID is the id of the respective timetable.
            - If the user provides a course code of length 6 like CSCA08, then assume they mean CSCA08H3 (H3 appended)
            - If the user wants to create a timetable, first call getCourses to get course information on the requested courses, then call generateTimetable.
            - Do not make up fake courses or offerings. 
            `,
        messages,
        tools: {
          getTimetables: tool({
            description:
              "Get all the timetables of the currently logged in user.",
            parameters: z.object({}),
            execute: async (args) => {
              return await availableFunctions.getTimetables(args, req);
            },
          }),
          updateTimetable: tool({
            description: "Update a user's timetable by title and/or semester",
            parameters: z.object({
              id: z.number().positive(),
              timetable_title: z.string().optional(),
              semester: z
                .enum(["Fall 2025", "Summer 2025", "Winter 2026"])
                .optional(),
            }),
            execute: async (args) => {
              return await availableFunctions.updateTimetable(args, req);
            },
          }),
          deleteTimetable: tool({
            description: "Delete a user's timetable",
            parameters: z.object({
              id: z.number().positive(),
            }),
            execute: async (args) => {
              return await availableFunctions.deleteTimetable(args, req);
            },
          }),
          generateTimetable: tool({
            description:
              "Return a list of possible timetables based on provided courses and restrictions.",
            parameters: TimetableFormSchema,
            execute: async (args) => {
              // console.log("Args for generate: ", args)
              console.log("courses :", JSON.stringify(args.courses));
              console.log("restrictions :", JSON.stringify(args.restrictions));
              const data = await availableFunctions.generateTimetable(
                args,
                req,
              );
              console.log("Generated timetable: ", data);
              return data;
            },
          }),
          getCourses: tool({
            description: "Return course info for all course codes provided.",
            parameters: z.object({
              courses: z.array(z.string()).describe("List of course codes"),
            }),
            execute: async (args) => {
              return await availableFunctions.getCourses(args, req);
            },
          }),
        },
        maxSteps: CHATBOT_TOOL_CALL_MAX_STEPS, // Controls how many back and forths
        // the model can take with user or
        // calling multiple tools
        experimental_repairToolCall: async ({
          toolCall,
          tools,
          parameterSchema,
          error,
        }) => {
          if (NoSuchToolError.isInstance(error)) {
            return null; // do not attempt to fix invalid tool names
          }

          console.log("Error: ", error);

          const tool = tools[toolCall.toolName as keyof typeof tools];
          console.log(
            `The model tried to call the tool "${toolCall.toolName}"` +
              ` with the following arguments:`,
            toolCall.args,
            `The tool accepts the following schema:`,
            parameterSchema(toolCall),
            "Please fix the arguments.",
          );

          const { object: repairedArgs } = await generateObject({
            model: openai("gpt-4o", { structuredOutputs: true }),
            schema: tool.parameters,
            prompt: [
              `The model tried to call the tool "${toolCall.toolName}"` +
                ` with the following arguments:`,
              JSON.stringify(toolCall.args),
              `The tool accepts the following schema:`,
              JSON.stringify(parameterSchema(toolCall)),
              "Please fix the arguments.",
            ].join("\n"),
          });

          return { ...toolCall, args: JSON.stringify(repairedArgs) };
        },
      });

      result.pipeDataStreamToResponse(res);
    } else {
      // ----- Flow 2 - Answer query -----

      // Get conversation history (excluding the latest message)
      const conversationHistory = (messages as any[])
        .slice(0, -1)
        .map((msg) => ({
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

      // Analyze the query to determine if search is needed and which namespaces
      // to search
      const { requiresSearch, relevantNamespaces } =
        analyzeQuery(reformulatedQuery);

      let context = "[No context provided]";

      if (requiresSearch) {
        console.log(
          `Query requires knowledge retrieval, searching namespaces: ${relevantNamespaces.join(
            ", ",
          )}`,
        );

        const filters = includeFilters(reformulatedQuery);
        // console.log("Filters: ", JSON.stringify(filters))

        // Search only relevant namespaces
        const searchResults = await searchSelectedNamespaces(
          reformulatedQuery,
          3,
          relevantNamespaces,
          Object.keys(filters).length === 0 ? undefined : filters,
        );
        // console.log("Search Results: ", searchResults);

        // Format context from search results into plaintext
        if (searchResults.length > 0) {
          context = searchResults.map((doc) => doc.pageContent).join("\n\n");
        }
      } else {
        console.log(
          "Query does not require knowledge retrieval, skipping search",
        );
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
          - Use tables for listing multiple offerings, courses, or other information that could be better viewed in tabular fashion
          - Include course codes when referencing specific courses
          - If information is missing from the context but likely exists, try to use info from web to answer. If still not able to form a decent response, acknowledge the limitation
          - For unrelated questions, politely explain that you're specialized in UTSC academic information
          - If a user prompt appears like a task that requires timetable operations (like create, read, update, delete a user's timetable) BUT the user prompt doesn't start with prefix "/timetable" then remind user to use "/timetable" in front of their prompt to access these capabilities
      
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
    }
  } catch (error: any) {
    console.error("Error:", error);
    res.status(500).json({ error: error?.message });
  }
});

// Test Similarity search
// Usage: provide user prompt in req.body
export const testSimilaritySearch = asyncHandler(
  async (req: Request, res: Response) => {
    const { message } = req.body;

    // Analyze the query to determine if search is needed and which namespaces
    // to search
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
