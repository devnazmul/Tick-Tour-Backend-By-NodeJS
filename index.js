const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASS}@cluster0.gu8bj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const PORT = process.env.PORT || 5000;

const run = async () => {
  try {
    await client.connect();
    console.log("mongoDB connected...");
    const db = client.db("travel_site_react");
    const destinationCollection = db.collection("travel_destination");
    const usersOrdersCollection = db.collection("users_orders");

    // Live Server Test
    app.get('/',(req,res)=>{
      res.send('Server Is Running')
    })
    
    // GET OPERATION
    app.get("/travel_destination", async (req, res) => {
      const cursor = destinationCollection.find({});
      const destination = await cursor.toArray();
      res.send({
        countData: cursor.count(),
        destination,
      });
    });

    // UPDATE OPERATION SINGLE USER ORDERS
    app.put("/user_orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: `done`
        },
      };
      const orders = usersOrdersCollection.updateOne(query,updateDoc,options);
      res.send(orders);
    });
 

    // GET OPERATION WITH FILTER
    app.get("/travel_destination/:_id", async (req, res) => {
      const id = req.params._id;
      const query = { _id: ObjectId(id) };
      const destination = await destinationCollection.findOne(query);
      res.send(destination);
    });

    // CREATE OPERATION FOR DESTINATION
    app.post("/travel_destination", async (req, res) => {
      const data = req.body;
      const insertResult = await destinationCollection.insertOne(data);
      res.send(insertResult);
    });

    // CREATE OPERATION FOR USERS ORDER
    app.post("/users_orders", async (req, res) => {
      const data = req.body;
      const insertResult = await usersOrdersCollection.insertOne(data);
      res.send(insertResult);
    });

    // GET OPERATION FOR USERS ORDER
    app.get("/users_orders", async (req, res) => {
      const cursor = usersOrdersCollection.find({});
      const usersOrders = await cursor.toArray();
      res.send({
        countData: cursor.count,
        usersOrders,
      });
    });


    // DELETE OPERATION FOR USERS ORDERS
    app.delete("/users_orders/:_id", async (req, res) => {
      const id = req.params._id;
      const query = { _id: ObjectId(id) };
      const usersOrders = usersOrdersCollection.deleteOne(query);
      res.send(usersOrders);
    });
  } finally {
    // await client.close();
  }
};

run().catch((err) => {
  console.log(err);
});

app.listen(PORT, () => {
  console.log(`Server start on: http://localhost:${PORT}`);
});
