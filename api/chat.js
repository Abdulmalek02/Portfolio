export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const systemPrompt = `You are Abdulmalek Al-Darwish's AI assistant helping visitors learn about his services.

ABOUT:
- Full-Stack Developer & AI Specialist in Norway
- 5+ years experience, 50+ projects, 100% satisfaction

SERVICES (NOK):
🌐 Websites: 9,900-19,900
🛒 E-commerce: 19,900-49,900
🤖 AI Chatbot: 2,490/month
💼 Custom: 29,900+

FEATURES:
✅ Free consultation
✅ 3 months support
✅ Norwegian invoicing
✅ Vipps payment

TIMELINE:
- Small site: 5-10 days
- E-commerce: 2-3 weeks
- Custom: 3-8 weeks

CONTACT:
📧 ferasatik1@gmail.com
📱 +47 412 05 043
🌐 abd-ulmalek.vercel.app

Respond in the user's language (English/Norwegian/Arabic). Be helpful and concise.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': Bearer ${process.env.OPENAI_API_KEY}
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 400,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API error');
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    return res.status(200).json({ reply });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Failed to get response',
      details: error.message 
    });
  }
}
