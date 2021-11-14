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
        const usersCollection = database.collection('Users');
        const ordersCollection = database.collection('Orders');
        const reviewsCollection = database.collection('Reviews');


        app.get('/allgames', async(req, res) => {
            const cursor = gamesCollection.find({});
            const games = await cursor.toArray();
            res.send(games);
        });

        app.get('/games/onsale', async(req, res) => {
            const query = {"discount": { $gt: 0 }};
            let games = await gamesCollection.find(query).toArray();
            games = games.slice(0, 6);
            res.json(games);
        });

        app.get('/games/free', async(req, res) => {
            const query = {"price": 0};
            let games = await gamesCollection.find(query).toArray();
            games = games.slice(0, 3);
            res.json(games);
        });

        app.get('/games/bestseller', async(req, res) => {
            const query = {"soldcopies": { $gt: 100000 }};
            let games = await gamesCollection.find(query).toArray();
            games = games.slice(0, 4);
            res.json(games);
        });

        app.get('/games/toprated', async(req, res) => {
            const query = {"rate": { $gt: 8 }};
            let games = await gamesCollection.find(query).toArray();
            games = games.slice(0, 6);
            res.json(games);
        });

        app.get('/game/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const game = await gamesCollection.findOne(query);
            res.json(game);
        });

        app.post('/users', async(req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        })

        app.post('/games', async(req, res) => {
            const user = req.body;
            const result = await gamesCollection.insertOne(user);
            console.log(result);
            res.json(result);
        })

        app.put('/users', async(req, res) => {
            const user = req.body;
            console.log('userput', user);
            const filter = {email: user.email};
            const options = {upsert: true};
            const updateDoc = {$set: user};
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        })

        app.post('/orders', async(req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.send(result);
        })


        app.get('/orders/:id', async(req, res) => {
            const id = req.params.id;
            let query = {clientId: id};
            const user = await usersCollection.findOne({fireBaseId: id});
            if(user.role === 'Admin')
                query = {};
            const orders = await ordersCollection.find(query).toArray();
            res.json(orders);
        })



        // DELETE a order 
        app.delete('/orders/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        });

        // UPDATE a order 
        app.patch('/orders/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await ordersCollection.updateOne(query, { $set: {status: "confirmed" }});
            res.json(result);
        });


        app.patch('/orders/pay/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await ordersCollection.updateOne(query, { $set: {status: "paid" }});
            res.json(result);
        });

        app.post('/reviews', async(req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.send(result);
        })

        app.get('/reviews', async(req, res) => {
            const cursor = reviewsCollection.find({});
            let reviews = await cursor.toArray();
            reviews = reviews.slice(0, 6);
            res.send(reviews);
        })

        app.get('/userinfo/:id', async(req, res) => {
            const id = req.params.id;
            const query = {fireBaseId: id};
            const user = await usersCollection.findOne(query);
            res.send(user);
        })

        app.patch('/makeadmin', async(req, res) => {
            const email = req.body.email;
            const query = {email: email};
            console.log('email', email);
            const result = await usersCollection.updateOne(query, { $set: {role: "Admin" }});
            res.json(result);
        });


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
