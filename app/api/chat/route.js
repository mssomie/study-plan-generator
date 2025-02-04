import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });

const systemPrompt = `You are Athena, an AI assistant that helps students generate study plans. Generate based on the given prompt`


export async function POST(req) {
  let data;
  try {
    data = await req.json();
  } catch (error) {
    return new NextResponse('Invalid JSON data', { status: 400 });
  }

  if (!Array.isArray(data.messages)) {
    return new NextResponse('Invalid messages format', { status: 400 });
  }

  try {
    const response = await groqClient.chat.completions.create({  
      messages: [
        { role: 'system', 
        content: systemPrompt },
        ...data.messages
      ],
      model: 'llama3-70b-8192',
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1, 
      stream: true
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of response) {
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
      }
    });

    return new NextResponse(stream);
  } catch (error) {
    console.error('Error handling request:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
