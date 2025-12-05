# AI Resource Assistant - Deployment Guide

## Overview
The AI Resource Assistant provides intelligent, context-aware responses for real estate resources. Currently using simulated responses, but ready to integrate with OpenAI API.

## Features
- **Market News AI** - Answers questions about current real estate trends
- **Book Recommendations** - Suggests relevant books based on user needs
- **Analytics Guide** - Helps users understand market data
- **Consultation Prep** - Prepares users for agent consultations

## Current Implementation
The assistant uses pre-written, high-quality responses organized by resource type. This provides:
- ✅ Instant responses (no API delays)
- ✅ No API costs during development
- ✅ Consistent, curated information
- ✅ Works offline

## To Integrate OpenAI API (When Deployed Online)

### 1. Get OpenAI API Key
```bash
# Sign up at https://platform.openai.com/
# Get your API key from the dashboard
```

### 2. Add Environment Variable
Create `.env` file in frontend:
```env
VITE_OPENAI_API_KEY=your_api_key_here
```

### 3. Update AIResourceAssistant.jsx

Replace the `getAIResponse` function with:

```javascript
const getAIResponse = async (userMessage) => {
  setLoading(true);

  try {
    const systemPrompts = {
      "market-news": "You are a real estate market analyst in Ghana. Provide insights about current market trends, property values, and investment opportunities. Be specific and data-driven.",
      "books": "You are a real estate education expert. Recommend books and resources for real estate investors and buyers. Consider the user's experience level.",
      "analytics": "You are a real estate data analyst. Help users understand market analytics, property valuation, and investment calculations. Explain concepts clearly.",
      "consultation": "You are a real estate advisor. Help users prepare for agent consultations. Provide practical questions to ask and red flags to watch for.",
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: systemPrompts[resourceType] || systemPrompts['consultation']
          },
          ...messages,
          {
            role: 'user',
            content: userMessage
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage },
      { role: "assistant", content: aiMessage },
    ]);

  } catch (error) {
    console.error('OpenAI API Error:', error);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage },
      { role: "assistant", content: "I apologize, but I'm having trouble connecting right now. Please try again later or contact support." },
    ]);
  }

  setHasInitialResponse(true);
  setLoading(false);
};
```

### 4. Backend Alternative (Recommended for Production)

For better security, create a backend endpoint:

**Laravel Route (api.php):**
```php
Route::post('/ai/chat', [AIController::class, 'chat'])->middleware('auth:sanctum');
```

**AIController.php:**
```php
public function chat(Request $request)
{
    $validated = $request->validate([
        'messages' => 'required|array',
        'resource_type' => 'required|string'
    ]);

    $apiKey = env('OPENAI_API_KEY');
    
    $response = Http::withHeaders([
        'Authorization' => 'Bearer ' . $apiKey,
        'Content-Type' => 'application/json',
    ])->post('https://api.openai.com/v1/chat/completions', [
        'model' => 'gpt-4-turbo-preview',
        'messages' => $validated['messages'],
        'temperature' => 0.7,
        'max_tokens' => 800
    ]);

    return response()->json($response->json());
}
```

Then update frontend to call your backend:
```javascript
const response = await API.post('/ai/chat', {
  messages: [...messages, { role: 'user', content: userMessage }],
  resource_type: resourceType
});
```

## Cost Estimates (OpenAI GPT-4)
- ~$0.01 per conversation (3-5 messages)
- ~$10-30/month for moderate usage
- Consider caching common questions

## Best Practices
1. **Rate Limiting** - Limit requests per user
2. **Caching** - Cache common responses
3. **Fallback** - Keep simulated responses as fallback
4. **Monitoring** - Track API usage and costs
5. **User Feedback** - Add thumbs up/down for quality control

## Alternative: Use Current Simulated Version
The current implementation with pre-written responses is:
- FREE (no API costs)
- FAST (instant responses)
- RELIABLE (no API downtime)
- HIGH QUALITY (curated by experts)

Consider keeping it as-is, or using it as a fallback if OpenAI API is unavailable.
