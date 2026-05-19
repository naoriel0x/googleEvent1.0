import { GoogleAuth } from 'google-auth-library';
import { readFileSync } from 'fs';
import { join } from 'path';

interface GeminiRequest {
  contents: Array<{
    role: string;
    parts: Array<{
      text: string;
    }>;
  }>;
  systemInstruction?: {
    parts: Array<{
      text: string;
    }>;
  };
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

let auth: GoogleAuth | null = null;

async function getAuth(): Promise<GoogleAuth> {
  if (auth) return auth;

  const credentialsPath = join(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS || './service-account.json');
  const credentials = JSON.parse(readFileSync(credentialsPath, 'utf-8'));

  auth = new GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  return auth;
}

async function getAccessToken(): Promise<string> {
  const authClient = await getAuth();
  const client = await authClient.getClient();
  const accessToken = await client.getAccessToken();
  
  if (!accessToken.token) {
    throw new Error('Failed to get access token from Google Cloud');
  }

  return accessToken.token;
}

export async function generateContent(
  prompt: string,
  systemPrompt?: string,
  maxRetries: number = 2
): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const accessToken = await getAccessToken();
      const projectId = process.env.GOOGLE_PROJECT_ID;
      const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

      if (!projectId) {
        throw new Error('GOOGLE_PROJECT_ID environment variable is not set');
      }

      const endpoint = `https://aiplatform.googleapis.com/v1/projects/${projectId}/locations/global/publishers/google/models/${model}:generateContent`;

      const requestBody: GeminiRequest = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      };

      if (systemPrompt) {
        requestBody.systemInstruction = {
          parts: [
            {
              text: systemPrompt,
            },
          ],
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${errorData}`);
      }

      const data: GeminiResponse = await response.json();

      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format from Gemini API');
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
      }
    }
  }

  throw new Error(
    `Failed to generate content after ${maxRetries + 1} attempts: ${lastError?.message}`
  );
}
