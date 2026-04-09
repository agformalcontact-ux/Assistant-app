import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.log('Anthropic API key not found');
      return res.status(500).json({ error: 'Anthropic API key not configured' });
    }

    const { prompt, model = 'claude-3-5-sonnet-20241022' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    console.log('Making API call to Claude...');
    const message = await anthropic.messages.create({
      model: model,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    console.log('Claude response received');

    res.status(200).json({ text });
  } catch (error) {
    console.error('Claude API error:', error);
    res.status(500).json({ error: 'Failed to get response from Claude', details: error.message });
  }
}