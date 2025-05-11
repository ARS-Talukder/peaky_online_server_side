const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o1hre.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


async function run() {
    try {
        await client.connect();
        const productCollection = client.db("peaky_online").collection("products");
        const categoryCollection = client.db("peaky_online").collection("categories");
        const orderCollection = client.db("peaky_online").collection("orders");
        const customerCollection = client.db("peaky_online").collection("customers");

        // Configure the storage engine for multer
        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                const uploadPath = path.join(__dirname, 'uploads'); // Path to store images
                // Ensure the 'uploads' folder exists
                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath);
                }
                cb(null, uploadPath); // Save in 'uploads' folder
            },
            filename: (req, file, cb) => {
                cb(null, Date.now() + path.extname(file.originalname)); // Use a timestamp as the filename
            },
        });

        const upload = multer({ storage });

        // Create an endpoint for uploading images
        app.post('/upload', upload.single('image'), (req, res) => {
            if (!req.file) {
                return res.status(400).json({ error: "No file uploaded" });
            }
            res.json({ filePath: `/uploads/${req.file.filename}` });
        });

        // Set up static folder to serve images
        app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

        // Create an endpoint to delete an image
        app.delete('/delete', async (req, res) => {
            const { imageUrl } = req.body;
            const imagePath = `./uploads/${imageUrl.split('/').pop()}`;

            try {
                fs.unlinkSync(imagePath); // Delete file
                res.json({ success: true, message: "Image deleted successfully" });
            } catch (err) {
                res.status(500).json({ success: false, message: "Failed to delete image" });
            }
        });



        // all the APIs are written here
        //Get all Products
        app.get('/products', async (req, res) => {
            const products = await productCollection.find().toArray();
            res.send(products);
        })
        //Edit Specific Product
        app.patch('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const querySent = req.body.query;
            const inputValue = req.body.inputValue;
            const updatedDoc = {
                $set: {
                    [querySent]: inputValue
                }
            }
            const result = await productCollection.updateOne(query, updatedDoc);
            res.send(result)
        })
        //Delete Product
        app.delete('/product-delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.send(result);

        })
        //Add product
        app.post('/products', async (req, res) => {
            const newProduct = req.body;
            const result = await productCollection.insertOne(newProduct);
            res.send(result);
        })



        //Get all Categories
        app.get('/categories', async (req, res) => {
            const categories = await categoryCollection.find().toArray();
            res.send(categories);
        })
        //Get specific Category
        app.get('/category/:name', async (req, res) => {
            const name = req.params.name;
            const query = { category: name };
            const products = await productCollection.find(query).toArray();
            res.send(products);
        })
        //Add Category
        app.post('/categories', async (req, res) => {
            const newCategory = req.body;
            const result = await categoryCollection.insertOne(newCategory);
            res.send(result);
        })
        //Delete Category
        app.delete('/category-delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await categoryCollection.deleteOne(query);
            res.send(result);

        })



        //Get all Orders
        app.get('/orders', async (req, res) => {
            const orders = await orderCollection.find().toArray();
            res.send(orders);
        })
        //Get Orders by customer email
        app.get('/order/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const orders = await orderCollection.find(query).toArray();
            res.send(orders);
        })
        //Get Orders by customer phone
        app.get('/order_by_phone/:phone', async (req, res) => {
            const phone = req.params.phone;
            const query = { phone: phone };
            const orders = await orderCollection.find(query).toArray();
            res.send(orders);
        })
        //Post an order
        app.post('/orders', async (req, res) => {
            const newOrder = req.body;
            const result = await orderCollection.insertOne(newOrder);
            res.send(result);
        })
        app.delete('/order-delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.send(result);

        })
        //Edit Order State
        app.patch('/order_state/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const state = req.body.state;
            const updatedDoc = {
                $set: {
                    status: state
                }
            }
            const result = await orderCollection.updateOne(query, updatedDoc);
            res.send(result)
        })



        //Get all Customers
        app.get('/customers', async (req, res) => {
            const customers = await customerCollection.find().toArray();
            res.send(customers);
        })
        // Post a customer by email
        app.put('/customers/:email', async (req, res) => {
            const email = req.params.email;
            const newCustomer = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: newCustomer,
            };
            const result = await customerCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })
        // Post a customer by phone
        app.put('/customers/:phone', async (req, res) => {
            const phone = req.params.phone;
            const newCustomer = req.body;
            const filter = { phone: phone };
            const options = { upsert: true };
            const updateDoc = {
                $set: newCustomer,
            };
            const result = await customerCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })
        //Update Customer Mobile
        app.patch('/customer-mobile/:email', async (req, res) => {
            const email = req.params.email;
            const phone = req.body.phone;
            const query = { email: email };
            const updatedDoc = {
                $set: {
                    phone: phone
                }
            }
            const result = await customerCollection.updateOne(query, updatedDoc);
            res.send(result)
        })
        //Update Customer Address
        app.patch('/customer-address/:email', async (req, res) => {
            const email = req.params.email;
            const address = req.body.address;
            const query = { email: email };
            const updatedDoc = {
                $set: {
                    address: address
                }
            }
            const result = await customerCollection.updateOne(query, updatedDoc);
            res.send(result)
        })



        //Admin Login
        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const user = await customerCollection.findOne({ email: email });
            const isAdmin = user.role === 'admin';
            res.send({ admin: isAdmin })
        })


        // app.delete('/product/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: new ObjectId(id) };
        //     const result = await productCollection.deleteOne(query);
        //     res.send(result);
        // })

    }
    finally {

    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Welcome to the Home page of PeakyOnline')
});



app.listen(port, () => {
    console.log('port is running')
})

