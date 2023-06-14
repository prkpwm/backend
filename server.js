const express = require('express');
const PORT = 3000;
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const bodyParser = require('body-parser');
const shortid = require('shortid');

const whitelist = ['https://resume-prkpwm.firebaseapp.com', 'http://localhost:4200'];

const corsOption = (req, callback) => {
    let corsOptions;
    if (whitelist.indexOf(req.header('Origin')) !== -1) corsOptions = { origin: true, credentials: true };
    else corsOptions = { origin: false, credentials: true };
    callback(null, corsOptions);
};
app.use(cors(corsOption));
app.use(
    bodyParser.urlencoded({
        limit: '1mb',
        extended: true,
    }),
);


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


const passwd = encodeURIComponent('@uth0rizedIsByPa$$=???')
const url = `mongodb+srv://prkpwm:${passwd}@cluster0.5zkwnn4.mongodb.net/?retryWrites=true&w=majority`;


app.post('/api/shorten', async (req, res) => {
    const { originalUrl } = req.body;
    const shortUrl = shortid.generate();
    const body = {
        originalUrl,
        shortUrl,
    };

    try {
        const client = await MongoClient.connect(url);
        const dbo = client.db("meta");
        const collection = dbo.collection("urlShorter");

        const existingDocument = await collection.findOne({ originalUrl });

        if (existingDocument) {
            res.send(existingDocument);
        } else {
            const result = await collection.insertOne(body);
            if (result.acknowledged)
                res.send(body);
        }

        client.close();
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/api/originalUrl', async (req, res) => {
    const { shortUrl } = req.body;
    const body = {
        shortUrl,
    };

    try {
        const client = await MongoClient.connect(url);
        const dbo = client.db("meta");
        const collection = dbo.collection("urlShorter");

        const existingDocument = await collection.findOne({ shortUrl });

        if (existingDocument) {
            res.send(existingDocument);
        } else {
            const result = await collection.insertOne(body);
            if (result.acknowledged)
                body.originalUrl = 'Not Found';
                res.send(body);
        }

        client.close();
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});


