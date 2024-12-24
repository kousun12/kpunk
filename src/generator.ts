export async function generate(apiKey: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'text-davinci-002',
      prompt: 'Write a short poem:',
      max_tokens: 100,
    }),
  });

  const data = await response.json();
  return data.choices[0].text.trim();
}