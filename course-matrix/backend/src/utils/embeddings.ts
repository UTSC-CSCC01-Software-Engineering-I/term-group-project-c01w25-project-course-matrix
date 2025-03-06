import { OpenAIEmbeddings } from "@langchain/openai";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import config from "../config/config";
import path from "path";

console.log("Running embeddings process...");

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY!,
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

async function processCSV(filePath: string, namespace: string) {
  const fileName = path.basename(filePath);
  const loader = new CSVLoader(filePath);
  let docs = await loader.load();

  docs = docs.map((doc, index) => ({
    ...doc,
    metadata: { ...doc.metadata, source: fileName, row: index + 1 }, // Store row number & csv filename
  }));
  console.log("Sample doc: ", docs[0]);

  const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!);

  // Store each row as an individual embedding
  await PineconeStore.fromDocuments(docs, embeddings, {
    pineconeIndex: index as any,
    namespace: namespace,
  });
}

processCSV("../data/tables/corequisites.csv", "corequisites");
// processCSV("../data/tables/prerequisites.csv", "prerequisites")
// processCSV("../data/tables/courses.csv", "courses")
// processCSV("../data/tables/offerings_fall_2025.csv", "offerings")
// processCSV("../data/tables/offerings_summer_2025.csv", "offerings")
// processCSV("../data/tables/offerings_winter_2026.csv", "offerings")
// processCSV("../data/tables/departments.csv", "departments")

console.log("embeddings done.");

export const p = "d";
