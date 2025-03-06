import { OpenAIEmbeddings } from "@langchain/openai";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
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

// Generate embeddings for csv tables
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

// Generate embeddings for pdfs
async function processPDF(filePath: string, namespace: string) {
  const fileName = path.basename(filePath);
  const loader = new PDFLoader(filePath);
  let docs = await loader.load();

  const fullText = docs.map((doc) => doc.pageContent).join(" ");

  const sections = fullText.split("Calendar Section:");

  // Create new documents with proper metadata
  const splitDocs = sections
    .map((section, index) => {
      const sectionTitle = `Calendar Section ${index}`;
      const content =
        index === 0 ? section.trim() : "Calendar Section:" + section.trim();

      // Use the same Document structure as the original docs
      const newDoc = { ...docs[0] };
      newDoc.pageContent = content;
      newDoc.metadata = {
        ...newDoc.metadata,
        fileName,
        sectionTitle,
        sectionIndex: index,
      };

      return newDoc;
    })
    .filter(Boolean); // Remove any nulls

  // console.log("Sample split docs: ", splitDocs.slice(0, 6))

  console.log(
    `Split into ${splitDocs.length} sections by "Calendar Section:" delimiter`,
  );

  // Store the split documents as embeddings
  const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!);
  await PineconeStore.fromDocuments(splitDocs, embeddings, {
    pineconeIndex: index as any,
    namespace: namespace,
  });
}

// processPDF("../data/pdfs/Programs 1.pdf", "programs");
// processPDF("../data/pdfs/Programs 2.pdf", "programs");
// processPDF("../data/pdfs/Programs 3.pdf", "programs");
// processPDF("../data/pdfs/Programs 4.pdf", "programs");
// processPDF("../data/pdfs/Programs 5.pdf", "programs");
// processPDF("../data/pdfs/Programs 6.pdf", "programs");
// processPDF("../data/pdfs/Programs 7.pdf", "programs");
// processPDF("../data/pdfs/Programs 8.pdf", "programs");
// processCSV("../data/tables/corequisites.csv", "corequisites");
// processCSV("../data/tables/prerequisites.csv", "prerequisites")
// processCSV("../data/tables/courses.csv", "courses")
// processCSV("../data/tables/offerings_fall_2025.csv", "offerings")
// processCSV("../data/tables/offerings_summer_2025.csv", "offerings")
// processCSV("../data/tables/offerings_winter_2026.csv", "offerings")
// processCSV("../data/tables/departments.csv", "departments")

console.log("embeddings done.");

export const pdfsa = "d";
