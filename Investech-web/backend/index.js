// To connect with your mongoDB database
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const cors = require("cors");
mongoose.connect('mongodb+srv://badshah:Badshahboy52@cluster0.icj6b.mongodb.net/?retryWrites=true&w=majority', {
	dbName: 'StockData',
	useNewUrlParser: true,
	useUnifiedTopology: true
}).then(()=>{
    console.log("Connected")
}).catch((err)=>{
    console.error("Error connecting",err.message)
});
// For backend and express
console.log("App listen at port 5000");
app.use(express.json());
app.use(cors());
app.use(express.json());

const stockDataRoutes = require('./routes/stockdata'); // Assuming you have a file with your stock data routes
app.use('/api', stockDataRoutes); // Mount the stockDataRoutes to /api
app.listen(5000);
