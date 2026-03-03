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
    const url = 'https://api.minimax.chat/v1/text/chatcompletion';

    const requestBody = {
      model: 'abab6.5s-chat',
      messages: [
        { role: 'system', content: systemPrompt || 'You are a professional cover letter writer.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    };

    console.log('=== MiniMax API Request ===');
    console.log('URL:', url);
    console.log('Model:', requestBody.model);
    console.log('API Key (first 10 chars):', apiKey.substring(0, 10) + '...');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Response Status:', response.status);
    console.log('Response Status Text:', response.statusText);

    const responseText = await response.text();
    console.log('Response Body (first 500 chars):', responseText.substring(0, 500));

    if (!response.ok) {
      let errorMsg = 'MiniMax API request failed';
      try {
        const errorData = JSON.parse(responseText);
        errorMsg = errorData.base_resp?.display_msg || errorData.msg || errorData.error?.message || errorMsg;
        console.log('Parsed Error:', errorData);
      } catch (e) {
        console.log('Could not parse error response');
      }
      return res.status(response.status).json({ error: errorMsg });
    }

    let data;
    try {
      data = JSON.parse(responseText);
      console.log('Parsed Response Keys:', Object.keys(data));
    } catch (e) {
      console.error('Failed to parse response JSON:', e);
      return res.status(500).json({ error: 'Invalid JSON response from API' });
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.log('Invalid response structure:', data);
      return res.status(500).json({ error: 'Invalid API response format', details: data });
    }

    const result = data.choices[0].message.content;
    console.log('Success! Result length:', result.length);

    res.status(200).json({ result });

  } catch (error) {
    console.error('=== Server Error ===');
    console.error('Error:', error);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
