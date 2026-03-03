export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, systemPrompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const apiKey = process.env.MINIMAX_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API Key not configured on server. Please add MINIMAX_API_KEY to Vercel environment variables.' });
  }

  try {
    const url = 'https://api.minimax.chat/v1/text/chatcompletion_pro';

    const requestBody = {
      model: 'abab6.5s-chat',
      messages: [
        { role: 'system', content: systemPrompt || 'You are a professional cover letter writer.' },
        { role: 'user', content: prompt }
      ]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({ 
        error: errorData.base_resp?.display_msg || 'MiniMax API request failed'
      });
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return res.status(500).json({ error: 'Invalid API response format' });
    }

    const result = data.choices[0].message.content;

    res.status(200).json({ result });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
