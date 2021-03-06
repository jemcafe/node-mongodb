const express = require('express');
const router = express.Router(); // handles routes
const mongoose = require('mongoose');

// Model
const Product = require('../models/product');

router.get('/', (req, res, next) => {
  // Using exec() returns a real promise, so .then() can be used.
  Product.find()
    .select('name price _id')  // gets specific properties
    .exec()
    .then(docs => {
      console.log(docs);
      const response = {
        count: docs.length,
        products: docs.map(doc => ({
          name: doc.name,
          price: doc.price,
          _id: doc._id,
          request: {
            type: 'GET',
            url: 'http://localhost:3040/products/' + doc._id
          }
        }))
      };
      res.status(200).json(response);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.post('/', (req, res, next) => {
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price
  });

  // A method for mogoose models for saving data to database. exec() is unncessary. save() returns a real promise.
  product.save()
    .then(result => {
      console.log('Result', result);
      res.status(200).json({
        message: 'Product created',
        createdProduct: {
          name: result.name,
          price: result.price,
          _id: result._id,
          request: {
            type: 'POST',
            url: 'http://localhost:3040/products/' + result._id
          }
        }
      });
    }).catch(err => {
      console.log(err)
      res.status(500).json({ error: err });
    });
});

router.get('/:productId', (req, res, next) => {
  const id = req.params.productId;

  Product.findById(id)
    .select('name price _id')
    .exec()
    .then(doc => {
      console.log(doc);
      if (doc) {
        res.status(200).json({
          product: doc,
          request: {
            type: 'GET',
            url: 'http://localhost:3040/products/' + doc._id
          }
        });
      } else {
        res.status(404).json({message: 'No valid entry found'});
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: err});
    });
});

router.patch('/:productId', (req, res, next) => {
  const id = req.params.productId;
  const updateOps = {};

  // The request body is an array. If the request body has the property in the model, it is changed.
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }

  // Product.update({ _id: id }, { $set: { 
  //   name: newName, price: newPrice 
  // } })
  Product.update({ _id: id }, { $set: updateOps })
    .exec()
    .then(result => {
      console.log(result);
      res.status(200).json({
        message: 'Product updated',
        request: {
          type: 'PATCH',
          url: 'http://localhost:3040/products/' + result._id
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.delete('/:productId', (req, res, next) => {
  const id = req.params.productId;
  Product.remove({ _id: id })
    .exec()
    .then(result => {
      res.status(200).json({
        messaage: 'Product deleted',
        request: {
          type: 'DELETE',
          body: {
            name: 'String',
            price: 'Number'
          }
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

module.exports = router;