const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.handler = async (event) => {
  try {
    const { prompt, operation } = JSON.parse(event.body);
    const apiKey = process.env.OPENAI_API_KEY;
    let systemPrompt;
    let maxTokens;
    if (operation === 'followups') {
      systemPrompt = 'You are an expert medical researcher who helps refine a topic by generating five clarifying questions.';
      maxTokens = 200;
    } else if (operation === 'summary') {
      systemPrompt = 'You are a medical research assistant that searches up-to-date, reputable literature from PubMed, NEJM, JAMA and guidelines. Produce a multi-page journal club summary (introduction, methods, results, discussion) with APA citations.';
      maxTokens = 1500;
    } else {
      systemPrompt = 'You are a medical assistant that summarises research into high-yield key points.';
      maxTokens = 500;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-5',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        max_tokens: maxTokens,
      }),
    });
    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify({ result: data.choices[0].message.content }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
