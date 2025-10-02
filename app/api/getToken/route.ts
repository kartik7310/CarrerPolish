// app/api/getToken/route.ts
import { NextResponse } from "next/server";
import { AssemblyAI } from "assemblyai";

const assemblyAi = new AssemblyAI({
  apiKey: process.env.NEXT_PUBLIC_ASSEMBLY_API_KEY as string,
});
console.log("key",process.env.NEXT_PUBLIC_ASSEMBLY_API_KEY);

export async function GET(req: Request) {
  try {
    const response = await assemblyAi.streaming.createTemporaryToken({
      expires_in_seconds: 600,
    });
    
    // Return only the token string for client simplicity
    return NextResponse.json({ token: response });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}