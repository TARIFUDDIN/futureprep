// app/api/getToken/route.js
import { AssemblyAI } from 'assemblyai';

export const dynamic = 'force-dynamic';

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLY_API_KEY
});

export async function GET() {
  if (!process.env.ASSEMBLY_API_KEY) {
    console.error('ASSEMBLY_API_KEY is missing');
    return Response.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  try {
    const token = await client.realtime.createTemporaryToken({
      expires_in: 3600 // 1 hour
    });
    return Response.json({ token });
  } catch (error) {
    console.error('Token generation error:', error);
    return Response.json(
      { error: "Token generation failed", details: error.message },
      { status: 500 }
    );
  }
}