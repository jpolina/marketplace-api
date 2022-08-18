let Ad = require('../models/ad');
let Seller = require('../models/seller');
let Category = require('../models/category');

let async = require('async');
const asyncHandler = require('express-async-handler');

const { body,validationResult } = require("express-validator");

let geocoding_controller = require('../controllers/geocodingController')


exports.index = function(req, res, next) {
    async.parallel({
        ad_count: function(callback) {
            Ad.countDocuments({}, callback);
        }
    }, function(err, results) {
        if (err) {return next(err)}

        res.status(200).json({
            "number_of_ads":results.ad_count
        })
    })
}

exports.ad_post = [
    body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('address').optional({checkFalsy: true}).escape(),
    body('city').optional({checkFalsy: true}).escape(),
    body('state').optional({checkFalsy: true}).escape(),
    body('zip').optional({checkFalsy: true}).escape(),
    body('price', 'Price must not be empty').trim().isLength({ min: 1 }).escape(),
    body('description', 'Description must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('imageUrl').isURL().withMessage('is invalid'),
    body('condition', 'Condition must not be empty.').trim().isLength({ min: 1 }).escape(),

    asyncHandler(async (req,res) => {
        const category = await Category.findOne({name:req.body.category})
        if(!category) {
            return res.status(400).json({message:'Category not found'})
        }

        const errors = validationResult(req);
        if(!req.seller) {return res.status(404).json({message:"Seller not found"})}

        const addressArray = []
        if (req.body.address) addressArray.push(req.body.address)
        if (req.body.city) addressArray.push(req.body.city)
        if (req.body.state) addressArray.push(req.body.state)
        if (req.body.zip) addressArray.push(req.body.zip)
        
        const address = addressArray.join(', ')
        const coordinates = await geocoding_controller.geocode(address)
        let location = '';

        // location = {"type":"Point", "coordinates":[-79.705032, 43.617047]};


        if (coordinates) {location = {"type":"Point", "coordinates":coordinates}}

        const ad = await Ad.create(
            {
                title:req.body.title,
                seller: req.seller,
                location: location,
                address: address,
                price: req.body.price,
                description: req.body.description,
                category: category.id,
                imageUrl: req.body.imageUrl,
                condition: req.body.condition,
            }
        )
        if (!errors.isEmpty()) {
            return res.status(400).json({message:'Invalid input data'})
        } else 
        if (ad) {
            return res.status(201).json({
                message:'Ad created successfully',
                _id: ad.id,
                title: ad.title,
                seller: ad.seller,
                location: ad.location,
                price: ad.price,
                description: ad.description,
                category: ad.category,
                imageUrl: ad.imageUrl,
                condition: ad.condition,
            })
        } else {
            return res.status(400).json({message:'Invalid account data'})
        }
    })
]

exports.ad_delete = asyncHandler(async (req, res, next) => {
    try {
        const ad = await Ad.findById(req.params.id)
        if(!ad) return res.status(404).json({message:'Ad not found'})

        if(ad.seller!=req.seller.id) return res.status(401).json({message: "You are not authorized to delete other seller's ads"})
        
        const deletedAd = await Ad.findByIdAndDelete(req.params.id);
        if(deletedAd) {
            return res.status(200).json({message: 'Successfuly deleted ad', ad: deletedAd});
        }
        return res.status(500).json({message: 'An error occurred'});
    } catch (e) {
        return res.status(500).json({error:e.message});
    }
    
})

exports.ad_update = [
    (req, res, next) => {
        if(!(req.body.category instanceof Array)){
            if(typeof req.body.category==='undefined'){
                req.body.category=[];
            } else {
                req.body.category = new Array(req.body.category);
            }
        }
        next();
    },
    body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('location.coordinates.*').optional({checkFalsy: true}).escape(),
    body('price', 'Price must not be empty').trim().isLength({ min: 1 }).escape(),
    body('description', 'Description must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('category.*').escape(),
    body('imageUrl').isURL().withMessage('is invalid'),
    body('condition', 'Condition must not be empty.').trim().isLength({ min: 1 }).escape(),

    asyncHandler(async (req,res,next) => {
        try{
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({errors:errors});
            }

            const category = await Category.findOne({name:req.body.category})
            if(!category) {
                return res.status(404).json({message: 'Category not found'})
            }
            const ad = await Ad.findById(req.params.id);
            if(!ad) return res.status(404).json({message: 'Ad not found'})
            if (ad.seller!=req.seller.id) return res.status(401).json({message:'You can only edit your own ads.'});
            const {title, location, price, description, imageUrl, condition} = req.body;
            ad.title = title;
            ad.location = location;
            ad.price = price;
            ad.description = description;
            ad.category = category.id;
            ad.imageUrl = imageUrl;
            ad.condition = condition;

            const updatedAd = await ad.save();

            if (updatedAd) {
                return res.status(201).json({
                    message: 'Ad updated successfuly',
                    ad:updatedAd
                })
            } else {
                return res.status(400).json({message: 'Invalid account data'})
            }
        } catch (err) {
            return res.status(500).json({error:err})
        }
    })
]

exports.ad_detail = function(req, res, next) {
    Ad.findById(req.params.id)
    .populate('seller')
    .populate('category')
    .exec(function (err, ad) {
      if (err) { return next(err); }
      if (ad==null) { // No results.
          var err = new Error('Ad not found');
          err.status = 404;
          return next(err);
        }
      // Successful, so render.
      res.status(200).json(ad);
    })
}

exports.ad_list = function(req, res, next) {
    Ad.find({})
      .sort({title : 1})
      .populate('seller')
      .populate('category')
      .exec(function(err, list_ads) {
        if (err) {return next(err)}
        else {
            // Successful, so render
            res.status(200).json(list_ads)
        }
      })
}