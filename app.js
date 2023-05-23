const express = require('express');
const { MongoClient } = require('mongodb');
const openai = require('openai');

const app = express();
const port = 5001;
const mongoURI = 'mongodb://127.0.0.1:27017/chatgpt';
const mongoClient = new MongoClient(mongoURI);

openai.api_key = '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';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    const db = mongoClient.db(); // Move the db variable outside of the try block
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

mongoClient.connect((err) => {
if (err) {
    console.error('Error connecting to MongoDB:', err);
} else {
    app.listen(port, () => {
console.log(`Server is running on port ${port}`);
    });
}
});
