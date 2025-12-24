import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3001;

// Simple rate limiting - track last request time
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.post('/api/solve', async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Rate limiting check
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      const waitTime = Math.ceil((MIN_REQUEST_INTERVAL - timeSinceLastRequest) / 1000);
      return res.status(429).json({ 
        error: `Please wait ${waitTime} seconds before trying again` 
      });
    }
    
    lastRequestTime = now;

    // Check if API key exists
    const apiKey = process.env.VITE_GOOGLE_API_KEY;
    if (!apiKey) {
      console.error('❌ Google API key is missing!');
      return res.status(500).json({ 
        error: 'API key not configured. Please add VITE_GOOGLE_API_KEY to your .env file' 
      });
    }

    console.log('🔄 Sending request to Google Gemini API...');

    // Try multiple model endpoints in order of preference
    const models = [
      'gemini-3-flash',
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite'
    ];
    
    let response;
    let data;
    let lastError;

    for (const model of models) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      
      try {
        console.log(`Trying model: ${model}`);
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Please analyze this image and solve any mathematical problems you find. 

Provide your response in the following format:
1. First, clearly state what math problem(s) you identified
2. Then show the step-by-step solution
3. Finally, provide the final answer

Be thorough in your explanations and show all work.`
                  },
                  {
                    inline_data: {
                      mime_type: 'image/jpeg',
                      data: image
                    }
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.4,
              topK: 32,
              topP: 1,
              maxOutputTokens: 2048
            }
          })
        });

        data = await response.json();

        if (response.ok) {
          console.log(`✅ Success with model: ${model}`);
          break;
        } else {
          lastError = data;
          console.log(`❌ Failed with ${model}:`, data.error?.message);
        }
      } catch (err) {
        lastError = err;
        console.log(`❌ Error with ${model}:`, err.message);
      }
    }

    if (!response || !response.ok) {
      console.error('❌ All models failed. Last error:', lastError);
      return res.status(response?.status || 500).json({ 
        error: lastError?.error?.message || lastError?.message || 'All API models failed'
      });
    }

    // Log the full response for debugging
    console.log('📥 API Response Status:', response.status);
    console.log('📥 API Response:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('❌ API Error:', data);
      return res.status(response.status).json({ 
        error: data.error?.message || `API request failed with status ${response.status}` 
      });
    }

    // Check if response has the expected structure
    if (!data.candidates || data.candidates.length === 0) {
      console.error('❌ No candidates in response');
      return res.status(500).json({ 
        error: 'No response from API. The model may have blocked the request.' 
      });
    }

    const textContent = data.candidates[0]?.content?.parts?.[0]?.text;
    
    if (!textContent) {
      console.error('❌ No text content in response');
      console.error('Response structure:', JSON.stringify(data.candidates[0], null, 2));
      return res.status(500).json({ 
        error: 'No solution text received from API' 
      });
    }

    console.log('✅ Successfully received solution');

    // Transform Google's response to match our expected format
    const transformedData = {
      content: [
        {
          type: 'text',
          text: textContent
        }
      ]
    };

    res.json(transformedData);
  } catch (error) {
    console.error('❌ Server Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
  console.log('🤖 Using Google Gemini API');
  console.log('🔑 API Key configured:', process.env.VITE_GOOGLE_API_KEY ? 'Yes' : 'No');
});