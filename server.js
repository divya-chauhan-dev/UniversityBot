import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "public")));

// University knowledge base
const universityData = {
  examRules: [
    "Students must have a minimum of 75% attendance to be eligible for exams.",
    "The passing criteria is 40% in each subject.",
    "Exam forms must be filled before the deadline announced by the university."
  ],
  hostelRules: [
    "Hostel gate closes at 10:00 PM.",
    "Visitors are allowed only between 5:00 PM and 8:00 PM.",
    "Mess timings: Breakfast 8–10 AM, Lunch 1–2 PM, Dinner 8–9:30 PM."
  ],
  curriculum: [
    "Semester 1: DBMS, Data Structures, Java Programming, Operating Systems.",
    "Semester 2: Computer Networks, Advanced Java, Web Development, AI Basics."
  ]
};

// Create OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to search relevant information
function findRelevantInfo(query) {
  const lowerQuery = query.toLowerCase();
  let relevantInfo = [];

  // Search in exam rules
  if (lowerQuery.includes('exam') || lowerQuery.includes('attendance') || lowerQuery.includes('passing') || lowerQuery.includes('form')) {
    relevantInfo = relevantInfo.concat(universityData.examRules);
  }

  // Search in hostel rules
  if (lowerQuery.includes('hostel') || lowerQuery.includes('visitor') || lowerQuery.includes('mess') || lowerQuery.includes('gate') || lowerQuery.includes('timing')) {
    relevantInfo = relevantInfo.concat(universityData.hostelRules);
  }

  // Search in curriculum
  if (lowerQuery.includes('semester') || lowerQuery.includes('subject') || lowerQuery.includes('course') || lowerQuery.includes('curriculum')) {
    relevantInfo = relevantInfo.concat(universityData.curriculum);
  }

  return relevantInfo;
}

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    // Find relevant university information
    const relevantInfo = findRelevantInfo(message);

    let systemMessage = "You are a helpful university chatbot assistant. Answer questions based on the university information provided.";
    
    if (relevantInfo.length > 0) {
      systemMessage += "\n\nRelevant university information:\n" + relevantInfo.join("\n");
    }

    const messages = [
      { role: "system", content: systemMessage },
      { role: "user", content: message }
    ];

    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      temperature: 0.7,
      max_tokens: 500
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error("Error:", error);
    
    // Fallback response if OpenAI fails
    const relevantInfo = findRelevantInfo(req.body.message);
    if (relevantInfo.length > 0) {
      res.json({ 
        reply: "Here's what I found in our university database:\n\n" + relevantInfo.join("\n\n")
      });
    } else {
      res.status(500).json({ 
        error: "I'm having trouble processing your request right now. Please try again later." 
      });
    }
  }
});

// Serve the main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 University Chatbot Server running on http://localhost:${PORT}`);
  console.log("📚 University knowledge base loaded successfully!");
});