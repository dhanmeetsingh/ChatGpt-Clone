const express = require('express');
const { MongoClient } = require('mongodb');
const openai = require('openai');

const app = express();
const port = 5001;

const mongoURI = 'mongodb+srv://harry123:7*Q9KMh%409XHW4rg@mongoyoutube.nhtraxd.mongodb.net/chatgpt';
const mongoClient = new MongoClient(mongoURI);

openai.api_key = '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';

app.get('/', async (req, res) => {
  try {
    await mongoClient.connect();
    const db = mongoClient.db();
    const chats = await db.collection('chats').find({}).toArray();
    console.log(chats);
    res.render('index.html', { myChats: chats });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/api', async (req, res) => {
  try {
    console.log(req.body);
    const question = req.body.question;
    await mongoClient.connect();
    const db = mongoClient.db();
    const chat = await db.collection('chats').findOne({ question });
    console.log(chat);
    if (chat) {
      const data = { question, answer: chat.answer };
      res.json(data);
    } else {
      const response = await openai.Completion.create({
        model: 'text-davinci-003',
        prompt: question,
        temperature: 0.7,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });
      console.log(response);
      const data = { question, answer: response.choices[0].text };
      await db.collection('chats').insertOne({ question, answer: response.choices[0].text });
      res.json(data);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
