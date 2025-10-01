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
        const SpecialCategoryCollection = client.db("peaky_online").collection("specials");
        const IconicCategoryCollection = client.db("peaky_online").collection("iconic");
        const orderCollection = client.db("peaky_online").collection("orders");
        const customerCollection = client.db("peaky_online").collection("customers");
        const bannerCollection = client.db("peaky_online").collection("banner");
        const couponCollection = client.db("peaky_online").collection("coupon");

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
        //Get specific product
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const product = await productCollection.findOne(query);
            res.send(product);
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
        //Edit Product image
        app.patch('/product_image/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const images = req.body;
            const updatedDoc = {
                $set: {
                    images: images
                }
            }
            const result = await productCollection.updateOne(query, updatedDoc);
            res.send(result)
        })
        //Edit product
        app.patch('/edit_product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const { name, category, price, discount, discount_price, shippingCharge, subtitle, whyBest, images, description } = req.body;
            const updatedDoc = {
                $set: {
                    name: name,
                    category: category,
                    price: price,
                    discount: discount,
                    discount_price: discount_price,
                    shippingCharge: shippingCharge,
                    subtitle: subtitle,
                    whyBest: whyBest,
                    images: images,
                    description: description
                }
            }
            const result = await productCollection.updateOne(query, updatedDoc);
            res.send(result)
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
        //Get specific category
        app.get('/category_by_id/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const category = await categoryCollection.findOne(query);
            res.send(category);
        })
        //Edit Category image
        app.patch('/category_image/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const img = req.body.img;
            const updatedDoc = {
                $set: {
                    img: img
                }
            }
            const result = await categoryCollection.updateOne(query, updatedDoc);
            res.send(result)
        })
        //Edit Category
        app.patch('/edit_category/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const { name, img } = req.body;
            const updatedDoc = {
                $set: {
                    name: name,
                    img: img
                }
            }
            const result = await categoryCollection.updateOne(query, updatedDoc);
            res.send(result)
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


        //Get all Special Categories
        app.get('/special_categories', async (req, res) => {
            const specialCategories = await SpecialCategoryCollection.find().toArray();
            res.send(specialCategories);
        })
        //Add Special Category
        app.post('/special_categories', async (req, res) => {
            const newSpecialCategory = req.body;
            const result = await SpecialCategoryCollection.insertOne(newSpecialCategory);
            res.send(result);
        })
        //Get specific Special category
        app.get('/special_category/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const category = await SpecialCategoryCollection.findOne(query);
            res.send(category);
        })
        // DELETE Special Category
        app.delete('/special_category_delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };

            try {
                const result = await SpecialCategoryCollection.deleteOne(query);
                if (result.deletedCount === 1) {
                    res.send({ success: true, message: "Category deleted successfully" });
                } else {
                    res.status(404).send({ success: false, message: "Category not found" });
                }
            } catch (error) {
                console.error(error);
                res.status(500).send({ success: false, message: "Internal server error" });
            }
        });
        // Update Special Category - Add Product
        app.patch('/special_category/:id/add-product', async (req, res) => {
            const id = req.params.id;
            const product = req.body; // product object from frontend
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $push: { products: product }
            };
            const result = await SpecialCategoryCollection.updateOne(filter, updateDoc);
            res.send(result);
        });
        // Update Special Category Timer
        app.patch('/special_category/:id/update-timer', async (req, res) => {
            const id = req.params.id;
            const { startTime, endTime } = req.body;
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: { startTime, endTime }
            };
            const result = await SpecialCategoryCollection.updateOne(filter, updateDoc);
            res.send(result);
        });
        // Remove product from Special Category
        app.patch('/special_category/:id/remove-product', async (req, res) => {
            const id = req.params.id;
            const productId = req.body._id; // frontend will send product._id
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $pull: { products: { _id: productId } }
            };
            const result = await SpecialCategoryCollection.updateOne(filter, updateDoc);
            res.send(result);
        });


        //Get all Iconic Categories
        app.get('/iconic_categories', async (req, res) => {
            const iconic_categories = await IconicCategoryCollection.find().toArray();
            res.send(iconic_categories);
        })
        //Get specific Iconic category
        app.get('/iconic_category/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const category = await IconicCategoryCollection.findOne(query);
            res.send(category);
        })
        //Add Iconic Category
        app.post('/iconic_categories', async (req, res) => {
            const newIconicCategory = req.body;
            const result = await IconicCategoryCollection.insertOne(newIconicCategory);
            res.send(result);
        })
        // DELETE Iconic Category
        app.delete('/iconic_category_delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };

            try {
                const result = await IconicCategoryCollection.deleteOne(query);
                if (result.deletedCount === 1) {
                    res.send({ success: true, message: "Category deleted successfully" });
                } else {
                    res.status(404).send({ success: false, message: "Category not found" });
                }
            } catch (error) {
                console.error(error);
                res.status(500).send({ success: false, message: "Internal server error" });
            }
        });
        // Update Iconic Category - Add Product
        app.patch('/iconic_category/:id/add-product', async (req, res) => {
            const id = req.params.id;
            const product = req.body; // product object from frontend
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $push: { products: product }
            };
            const result = await IconicCategoryCollection.updateOne(filter, updateDoc);
            res.send(result);
        });
        // Remove product from Iconic Category
        app.patch('/iconic_category/:id/remove-product', async (req, res) => {
            const id = req.params.id;
            const productId = req.body._id; // frontend will send product._id
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $pull: { products: { _id: productId } }
            };
            const result = await IconicCategoryCollection.updateOne(filter, updateDoc);
            res.send(result);
        });


        //Get all Banner Images 
        app.get('/banner', async (req, res) => {
            const banner = await bannerCollection.find().toArray();
            res.send(banner);
        })
        // Post all banner images
        app.post('/banner', async (req, res) => {
            const newData = req.body;

            try {
                await bannerCollection.deleteMany({}); // delete old banners

                let inserted = { acknowledged: true, insertedCount: 0 };

                if (newData && newData.length > 0) {
                    inserted = await bannerCollection.insertMany(newData); // only insert if non-empty
                }

                res.send({ message: "Banner collection replaced", result: inserted });
            } catch (err) {
                console.error("Error replacing banner collection:", err);
                res.status(500).send({ error: "Internal server error" });
            }
        });


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
            const { state, steps } = req.body;
            const query = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: { status: state },
                $push: { orderSteps: { $each: steps } }
            }
            const result = await orderCollection.updateOne(query, updatedDoc);
            res.send(result)
        })


        //Get all coupons
        app.get('/coupons', async (req, res) => {
            const coupons = await couponCollection.find().toArray();
            res.send(coupons);
        })
        //Post a coupon
        app.post('/coupon', async (req, res) => {
            const newCoupon = req.body;
            const result = await couponCollection.insertOne(newCoupon);
            res.send(result);
        })
        //Delete Coupon
        app.delete('/coupon/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await couponCollection.deleteOne(query);
            res.send(result);

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
        app.delete('/customer-delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await customerCollection.deleteOne(query);
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

        // Total Sales
        app.get('/api/sales/total', async (req, res) => {
            try {
                const result = await orderCollection.aggregate([
                    {
                        $match: { status: "delivered" }
                    },
                    {
                        $group: {
                            _id: null,
                            totalSales: { $sum: "$total" },
                            totalOrders: { $sum: 1 }
                        }
                    }
                ]).toArray();

                res.send(result[0] || { totalSales: 0, totalOrders: 0 });
            } catch (err) {
                console.error("Error in /api/sales/total:", err);
                res.status(500).send({ message: "Internal error", error: err });
            }
        });

        // Monthly Sales Summary
        app.get('/api/sales/monthly-summary', async (req, res) => {
            try {
                const result = await orderCollection.aggregate([
                    {
                        $match: {
                            status: "delivered" // Optional filter by order status
                        }
                    },
                    {
                        $group: {
                            _id: {
                                $dateToString: { format: "%Y-%m", date: { $toDate: "$date" } }
                            },
                            totalSales: { $sum: "$total" },
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $sort: { _id: 1 }
                    }
                ]).toArray();

                res.send(result);
            } catch (error) {
                console.error("Monthly summary error:", error);
                res.status(500).send({ message: "Internal Server Error", error });
            }
        });

        // Last month daily Sales
        app.get('/api/sales/last-month', async (req, res) => {
            try {
                const now = new Date();
                const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

                const result = await orderCollection.aggregate([
                    {
                        $match: {
                            status: "delivered",
                            $expr: {
                                $and: [
                                    { $gte: [{ $toDate: "$date" }, firstDayLastMonth] },
                                    { $lte: [{ $toDate: "$date" }, lastDayLastMonth] }
                                ]
                            }
                        }
                    },
                    {
                        $group: {
                            _id: {
                                $dateToString: { format: "%d-%b", date: { $toDate: "$date" } }
                            },
                            totalSales: { $sum: "$total" },
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $sort: { _id: 1 }
                    }
                ]).toArray();

                res.send(result);
            } catch (error) {
                console.error("Error in /api/sales/last-month:", error);
                res.status(500).send({ message: "Internal Server Error", error });
            }
        });

        // This month daily sales
        app.get('/api/sales/this-month', async (req, res) => {
            try {
                const now = new Date();
                const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const lastDayThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

                const result = await orderCollection.aggregate([
                    {
                        $match: {
                            status: "delivered",
                            $expr: {
                                $and: [
                                    { $gte: [{ $toDate: "$date" }, firstDayThisMonth] },
                                    { $lte: [{ $toDate: "$date" }, lastDayThisMonth] }
                                ]
                            }
                        }
                    },
                    {
                        $group: {
                            _id: {
                                $dateToString: { format: "%d-%b", date: { $toDate: "$date" } }
                            },
                            totalSales: { $sum: "$total" },
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { _id: 1 } }
                ]).toArray();

                res.send(result);
            } catch (error) {
                console.error("Error in /api/sales/this-month:", error);
                res.status(500).send({ message: "Internal Server Error", error });
            }
        });

        // Last 7 days Daily Sales
        app.get('/api/sales/last-7-days', async (req, res) => {
            try {
                const now = new Date();
                const sevenDaysAgo = new Date(now);
                sevenDaysAgo.setDate(now.getDate() - 6); // last 7 days including today

                const result = await orderCollection.aggregate([
                    {
                        $addFields: {
                            convertedDate: {
                                $dateFromString: {
                                    dateString: "$date",
                                    onError: null,
                                    onNull: null
                                }
                            }
                        }
                    },
                    {
                        $match: {
                            status: "delivered",
                            convertedDate: { $ne: null, $gte: sevenDaysAgo, $lte: now }
                        }
                    },
                    {
                        $group: {
                            _id: {
                                $dateToString: { format: "%d-%b", date: "$convertedDate" }
                            },
                            totalSales: { $sum: "$total" },
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $sort: { _id: 1 }
                    }
                ]).toArray();

                res.send(result);
            } catch (err) {
                console.error("Error in /api/sales/last-7-days:", err);
                res.status(500).send({ message: "Internal error", error: err });
            }
        });

        // Today Sales
        app.get('/api/sales/today', async (req, res) => {
            try {
                const now = new Date();
                const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
                const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

                const result = await orderCollection.aggregate([
                    {
                        $addFields: {
                            convertedDate: {
                                $dateFromString: {
                                    dateString: "$date",
                                    onError: null,
                                    onNull: null
                                }
                            }
                        }
                    },
                    {
                        $match: {
                            status: "delivered",
                            convertedDate: {
                                $ne: null,
                                $gte: startOfDay,
                                $lte: endOfDay
                            }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalSales: { $sum: "$total" },
                            count: { $sum: 1 }
                        }
                    }
                ]).toArray();

                res.send(result[0] || { totalSales: 0, count: 0 });
            } catch (err) {
                console.error("Error in /api/sales/today:", err);
                res.status(500).send({ message: "Internal error", error: err });
            }
        });



        //Admin Login
        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const user = await customerCollection.findOne({ email: email });
            const isAdmin = user.role === 'admin';
            res.send({ admin: isAdmin })
        })


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

