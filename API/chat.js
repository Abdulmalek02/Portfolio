export default async function handler(req, res) {
  // Allow CORS
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
    const { message, language } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // System prompt - معلوماتك
    const systemPrompt = `You are Abdulmalek Al-Darwish's AI assistant. You help visitors learn about his services.

KEY INFORMATION:
- Full-Stack Developer & AI Specialist based in Norway
- 5+ years experience
- 50+ completed projects
- 100% client satisfaction

SERVICES & PRICING (NOK):
🌐 Web Development:
   - Basic Website: 9,900-19,900 NOK
   - E-commerce: 19,900-49,900 NOK
   - Custom Web Apps: 29,900+ NOK

🤖 AI & Automation:
   - AI Chatbot: 2,490 NOK/month
   - Business Automation: From 14,900 NOK
   - Custom AI Solutions: Custom pricing

💼 Other Services:
   - CRM Systems
   - Analytics Dashboards
   - Digital Marketing

FEATURES:
✅ Free consultation
✅ 50% deposit, 50% on delivery
✅ 3 months free support
✅ Norwegian invoicing (Faktura)
✅ Payment via Vipps or bank transfer
✅ Integration with BankID, Vipps, Altinn

TIMELINE:
- Small Website: 5-10 days
- E-commerce: 2-3 weeks
- AI Chatbot: 1-2 weeks
- Custom Systems: 3-8 weeks

CONTACT:
📧 Email: ferasatik1@gmail.com
📱 Phone: +47 412 05 043
🌐 Website: abd-ulmalek.vercel.app

AVAILABILITY:
- Monday-Saturday
- 24-hour response time
- Remote work globally
- Currently accepting new projects

LANGUAGE INSTRUCTIONS:
- If user writes in Norwegian (no/nb) → respond in Norwegian
- If user writes in Arabic (ar) → respond in Arabic
- If user writes in English (en) → respond in English
- Auto-detect language from user message

Be helpful, professional, and concise. If question is too complex, suggest contacting directly via email or phone.`;

    // استدعاء OpenAI API
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
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error('OpenAI API error');
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
