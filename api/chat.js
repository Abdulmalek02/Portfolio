// api/chat.js
export default async function handler(req, res) {
  // CORS headers (للسماح بالاتصال من أي مصدر)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // التعامل مع طلبات OPTIONS (مطلوبة لـ CORS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // التحقق من أن الطلب هو POST فقط
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // التحقق من وجود مفتاح OpenAI في المتغيرات البيئية
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is not configured in environment variables');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    // الحصول على البيانات من طلب المستخدم
    const { message } = req.body;

    // التحقق من صحة البيانات
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Valid message is required' });
    }

    // System prompt - المعلومات الأساسية عنك
    const systemPrompt = `You are Abdulmalek Al-Darwish's AI assistant. You help visitors learn about his services.

KEY INFORMATION:
- Full-Stack Developer & AI Specialist based in Norway
- 5+ years experience, 50+ completed projects, 100% client satisfaction

SERVICES & PRICING (NOK):
🌐 Web Development: 9,900-49,900 NOK
🤖 AI Chatbot: 2,490 NOK/month
💼 CRM Systems, Analytics, Digital Marketing

CONTACT:
📧 ferasatik1@gmail.com
📱 +47 412 05 043

Be helpful, professional, and concise. Respond in the same language as the user's message.`;

    // إرسال الطلب إلى OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message.trim() }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    // التحقق من استجابة OpenAI
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API Error:', errorData);
      throw new Error('OpenAI API request failed');
    }

    // استخراج الرد من OpenAI
    const data = await response.json();
    const reply = data.choices[0].message.content.trim();

    // إرجاع الرد للمستخدم
    return res.status(200).json({ reply });

  } catch (error) {
    console.error('Chat API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to process your request. Please try again or contact directly.' 
    });
  }
}
