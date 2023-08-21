const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const StockData = require('../models/StoxkData');

router.get('/fetchall/:collectionName', async (req, res) => {
  try {
    const collectionname=req.params.collectionName;
    const stockDataModel = StockData(collectionname);
    const stockData = await stockDataModel.find();
    res.json(stockData);
  } catch (e) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

router.get('/fetchlatest/:collectionName', async (req, res) => {
  try {
    const collectionname=req.params.collectionName;
    const stockDataModel = StockData(collectionname);
    const stockData = await stockDataModel.findOne({}).sort({ _id: -1 }).exec();
    res.json(stockData);
  } catch (e) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});


router.get('/fetchallPred/:collectionName', async (req, res) => {
  try {
    const collectionname=req.params.collectionName;
    const stockDataModel = StockData(collectionname);
    const stockData = await stockDataModel.find();
    res.json(stockData);
  } catch (e) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});



module.exports = router;
