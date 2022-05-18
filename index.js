const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bqpuq.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    await client.connect();
    const productCollection = client.db("emaJohn").collection("product");

    // for all products
    app.get("/product", async (req, res) => {
      // page & size যেহেতু string আকারে থাকে তাই number এ করা হল;
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);

      const query = {};
      const cursor = productCollection.find(query);
      let products;
      // যদি page & size থাকে তাহলে page & size অনুযায়ি data দেখাবে । নাহলে সব data দেখাবে ; clint site এ size useState(10) default দেয়া আছে তাই প্রথমে ১০টা data দেখাবে ।
      if (page || size) {
        // page 0 --> skip:0 get:0-10
        // page 1 --> skip:1*10 get:11-20
        // page 2 --> skip:2*10 get:21-30
        // page 3 --> skip:3*10 get:31-40
        products = await cursor
          .skip(page * size)
          .limit(size)
          .toArray();
      } else {
        products = await cursor.toArray();
      }
      res.send(products);
    });

    // count how many products is here
    app.get("/productCount", async (req, res) => {
      const count = await productCollection.estimatedDocumentCount();
      res.send({ count });
    });

    // use post to get products by ids/keys
    app.post('/productByKeys', async(req,res) => {
      const keys = req.body;
      const ids = keys.map(id => ObjectId(id));
      const query = {_id: {$in: ids}};
      const cursor = productCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    })
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
