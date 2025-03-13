import Groq from "groq-sdk";

const groqClient = new Groq({ apiKey: process.env.ATHENAGROQ_API_KEY });

export default groqClient;