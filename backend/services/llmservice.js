const { PDFLoader } = require("@langchain/community/document_loaders/fs/pdf");
const { MistralAIEmbeddings, ChatMistralAI } = require("@langchain/mistralai");
const { MemoryVectorStore } = require("@langchain/classic/vectorstores/memory");
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const path = require("path");
require("dotenv").config();

// Initialize Mistral
const embeddings = new MistralAIEmbeddings({
  model: "mistral-embed",
});

const model = new ChatMistralAI({
  modelName: "mistral-tiny",
  apiKey: process.env.MISTRAL_API_KEY,
  temperature: 0,
});


const analyzeResumeSkills = async (relativeFilePath) => {
  try {
    const absolutePath = path.resolve("public", relativeFilePath);

    
    const loader = new PDFLoader(absolutePath);
    const rawDocs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 600,
      chunkOverlap: 100,
    });

    const splitDocs = await splitter.splitDocuments(rawDocs);

    
    const vectorStore = new MemoryVectorStore(embeddings);
    await vectorStore.addDocuments(splitDocs);

    
    const relevantDocs = await vectorStore.similaritySearch(
      "Technical Skills, Programming Languages, Frameworks, Tools, Soft Skills",
      3
    );
    const context = relevantDocs.map((d) => d.pageContent).join("\n---\n");

    const prompt = `
        You are a resume parser. Your goal is to find the "Skills" or "Technical Skills" section 
        in the provided text and extract the specific tools/languages.

        INSTRUCTIONS:
        1. Identify the section in the text usually labeled "Skills", "Technical Skills", "Tools", or "Expertise".
        2. Extract ONLY the specific names of technologies (e.g., Python, React, Docker).
        3. If the skills section has skills like Data structures and algorithms or problem solving or leadership etc do extract them as well.
        4. IGNORE sections like "Education", "Projects", "Key Courses", or "Experience". 
        5. If a word looks like an academic subject (e.g., "Numerical Methods", "Discrete Maths"), EXCLUDE it.
        6. Return ONLY a comma-separated list. No headers, no intro.

        RESUME TEXT:
        ${context}

        CLEAN SKILLS LIST:`;

    const response = await model.invoke(prompt);

    
    const skillsString = response.content.replace(/\n/g, " ").trim();
    const skillsArray = skillsString
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "");

    return skillsArray;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw new Error("Failed to parse resume skills.");
  }
};

module.exports = { analyzeResumeSkills };
