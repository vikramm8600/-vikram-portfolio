// Vercel serverless function. Configure CHATBOT_API_URL and CHATBOT_API_KEY
// as Vercel Environment Variables; never put secret keys in frontend files.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { message, context = '' } = req.body || {};
  if (!message || typeof message !== 'string') return res.status(400).json({ error: 'Please enter a message.' });
  const endpoint = process.env.CHATBOT_API_URL;
  const apiKey = process.env.CHATBOT_API_KEY;
  if (!endpoint || !apiKey) {
    return res.status(503).json({ error: 'Chatbot setup is incomplete. Configure CHATBOT_API_URL and CHATBOT_API_KEY in Vercel project settings.' });
  }
  try {
    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: process.env.CHATBOT_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: `You are Vikram Vadhera's portfolio assistant. Answer briefly and only from the provided portfolio context. If the context does not contain an answer, say you don't have that detail and suggest contacting Vikram. Never invent contact details, credentials, achievements, or project URLs.\n\nPORTFOLIO CONTEXT:\n${context}` },
          { role: 'user', content: message }
        ],
        temperature: 0.4
      })
    });
    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      console.error('Chat provider error:', upstream.status);
      return res.status(502).json({ error: 'The assistant provider returned an error. Please try again later.' });
    }
    const reply = data.choices?.[0]?.message?.content || data.reply || data.output_text;
    if (!reply) return res.status(502).json({ error: 'The assistant returned an unexpected response format.' });
    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Chat request failed:', error.message);
    return res.status(500).json({ error: 'Something went wrong while contacting the assistant. Please try again.' });
  }
}