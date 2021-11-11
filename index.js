const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;

const { MongoClient } = require('mongodb');
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5cvzz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



async function run(){

    try{
        await client.connect();
        const database = client.db('GameTag');
        const gamesCollection = database.collection('Games');


        app.get('/games', async(req, res) => {
            const cursor = gamesCollection.find({});
            const games = await cursor.toArray();
            res.send(games);
        })
    } finally {

    }
}

run().catch(console.dir);


app.get('/', async (req, res) => {
    res.send('ok')
})

app.listen(port, () => {
    console.log(`Running on Port ${port}`)
})
