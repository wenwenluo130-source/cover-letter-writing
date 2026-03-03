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

  console.log('=== API Key Debug ===');
  console.log('Key exists:', !!apiKey);
  console.log('Key length:', apiKey.length);
  console.log('Key full:', apiKey);
  console.log('Key trimmed:', apiKey.trim());
  console.log('===================');

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

    const cleanKey = apiKey.trim();
    console.log('=== MiniMax API Request ===');
    console.log('URL:', url);
    console.log('Model:', requestBody.model);
    console.log('Clean Key (first 10 chars):', cleanKey.substring(0, 10) + '...');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + cleanKey
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Response Status:', response.status);
    console.log('Response Status Text:', response.statusText);

    const responseText = await response.text();
    console.log('=== Raw Response (full) ===');
    console.log(responseText);
    console.log('=== End Raw Response ===');

    if (!response.ok) {
      let errorMsg = 'MiniMax API request failed';
      try {
        const errorData = JSON.parse(responseText);
        errorMsg = errorData.base_resp?.display_msg || errorData.msg || errorData.error?.message || errorMsg;
      } catch (e) {}
      return res.status(response.status).json({ error: errorMsg, raw: responseText });
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse response JSON:', e);
      return res.status(500).json({ error: 'Invalid JSON response from API', raw: responseText });
    }

    console.log('=== Parsed Response Structure ===');
    console.log('Keys:', Object.keys(data));
    console.log('Full data:', JSON.stringify(data, null, 2));
    console.log('=== End Response Structure ===');

    // Try multiple possible response formats
    let result = null;
    
    // Format 1: choices[0].message.content
    if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
      result = data.choices[0].message.content;
      console.log('Found result in format: choices[0].message.content');
    }
    // Format 2: choices[0].text
    else if (data.choices && data.choices[0] && data.choices[0].text) {
      result = data.choices[0].text;
      console.log('Found result in format: choices[0].text');
    }
    // Format 3: choices[0].delta.content (streaming)
    else if (data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content) {
      result = data.choices[0].delta.content;
      console.log('Found result in format: choices[0].delta.content');
    }
    // Format 4: content directly
    else if (data.content) {
      result = data.content;
      console.log('Found result in format: data.content');
    }
    // Format 5: text directly
    else if (data.text) {
      result = data.text;
      console.log('Found result in format: data.text');
    }
    // Format 6: response directly
    else if (data.response) {
      result = data.response;
      console.log('Found result in format: data.response');
    }

    if (!result) {
      console.log('Could not find result in any known format');
      
      // Return full response for debugging
      return res.status(500).json({ 
        error: 'Could not parse API response', 
        raw_response: responseText,
        parsed_keys: Object.keys(data),
        parsed_data: data
      });
    }

    console.log('Success! Result length:', result.length);
    console.log('Result preview:', result.substring(0, 200));

    res.status(200).json({ result });

  } catch (error) {
    console.error('=== Server Error ===');
    console.error('Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
