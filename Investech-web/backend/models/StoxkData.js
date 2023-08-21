// models/StockData.js
const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

const stockDataSchema = new mongoose.Schema({
  symbol: String,
  date: String,
  price:  String,
  change: String,
  volume: String,
},
{

},

);

const StockData = (collectionname)=>mongoose.model('StockData', stockDataSchema,collectionname);

module.exports = StockData;
