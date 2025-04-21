const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY; 

// Function to make request to OpenAI's API
const getAIResponse = async (question) => {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: question
            }
          ],
          max_tokens: 30,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error fetching AI response:', error?.response?.data || error.message);
      return "Sorry, I couldn't process your request. Please try again.";
    }
  };
  

app.post('/api/ask', async (req, res) => {
  const { question } = req.body;
  const answer = await getAIResponse(question);  // Fetch AI response from OpenAI
  res.json({ answer });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
