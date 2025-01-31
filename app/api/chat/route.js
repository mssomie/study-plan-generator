import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import Groq from "groq-sdk";

// Define the system prompt
const systemPrompt = `
You are a rate my professor agent to help students find classes, that takes in user questions and answers them.
For every user question, the top 3 professors that match the user question are returned.
Use them to answer the question if needed.
 `;

//  Define parameters to connect to the embedding model
const axios = require("axios");
const modelId = "sentence-transformers/all-MiniLM-L6-v2";
const apiUrl = `https://api-inference.huggingface.co/pipeline/feature-extraction/${modelId}`;

// Function to query the embedding model and get the response.
async function query(texts) {
  try {
    const response = await axios.post(
      apiUrl,
      {
        inputs: texts,
        options: { wait_for_model: true },
      },
      {
        headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error querying model: ", error);
  }
}

export async function POST(req) {
  let data;
  try {
    // parse incoming data as json
    data = await req.json();

    // Connect to index in vector database
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    const index = pc.Index("rmp-rag").namespace("ns1");

    console.log(
      `data:  ${data}, data.length: ${data.messages.length}, data.messages: ${data.messages.length}`
    );

    const text = data.messages[data.messages.length - 1].content;
    console.log("text", text);

    const embedding = await query(text);

    const results = await index.query({
      topK: 3,
      includeMetadata: true,
      vector: embedding,
    });

    console.log("results", results);
    let resultString = "\n \n Returned result from vector db";
    results.matches.forEach((match) => {
      resultString += `
                professor: ${match.id}
                Review: ${match.metadata.review}
                Subject: ${match.metadata.subject}
                Stars: ${match.metadata.stars}
                \n\n
            `;
    });

    console.log(resultString);
    console.log("data: ", data);
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    data = data.messages;
    const lastMessage = data[data.length - 1];
    const lastMessageContent = lastMessage.content + resultString;
    const lastDataWithoutLastMessage = data.slice(0, data.length - 1);

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          ...lastDataWithoutLastMessage,
          { role: "user", content: lastMessageContent },
        ],
        model: "llama3-70b-8192",
        top_p: 1,
        stream: true,
      });

      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          try {
            for await (const chunk of completion) {
              const content = chunk.choices[0]?.delta?.content;
              if (content) {
                const text = encoder.encode(content);
                controller.enqueue(text);
              }
            }
          } catch (error) {
            controller.error(error);
          } finally {
            controller.close();
          }
        },
      });

      return new NextResponse(stream);
    } catch (err) {
      console.error("Error generating flashcards:", err);
      return NextResponse.json(
        { error: "Failed to generate flashcards" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in /api/chat:", error);
    return NextResponse.json(
      {
        message: "Error",
        error: error.message || "An unknown error occurred.",
      },
      {
        status: 500,
      }
    );
  }
}
