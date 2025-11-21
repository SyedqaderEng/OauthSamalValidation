import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function explainAuthFlow(protocol: 'oauth' | 'saml', details: Record<string, unknown>) {
  const prompt = protocol === 'oauth'
    ? `Explain this OAuth 2.0 authentication result in simple terms for a developer. Be concise (2-3 sentences): ${JSON.stringify(details)}`
    : `Explain this SAML authentication result in simple terms for a developer. Be concise (2-3 sentences): ${JSON.stringify(details)}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 150,
  });

  return response.choices[0]?.message?.content || 'Authentication successful.';
}

export async function suggestSecurityImprovements(config: Record<string, unknown>) {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{
      role: 'user',
      content: `As a security expert, suggest 3 brief improvements for this auth config: ${JSON.stringify(config)}`
    }],
    max_tokens: 200,
  });

  return response.choices[0]?.message?.content || '';
}

export default openai;
