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
        if (!errors.isEmpty()) {
            return res.status(400).json({message:'Invalid input data'})
        }

        if(!req.seller) {return res.status(404).json({message:"Seller not found"})}

        const addressArray = []
        if (req.body.address) addressArray.push(req.body.address)
        if (req.body.city) addressArray.push(req.body.city)
        if (req.body.state) addressArray.push(req.body.state)
        if (req.body.zip) addressArray.push(req.body.zip)
        
        const address = addressArray.join(', ')
        const coordinates = await geocoding_controller.geocode(address)
        let location = '';

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
        return res.status(500).json({message:e.message});
    }
    
})

exports.ad_update = [
    body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('address').optional({checkFalsy: true}).escape(),
    body('city').optional({checkFalsy: true}).escape(),
    body('state').optional({checkFalsy: true}).escape(),
    body('zip').optional({checkFalsy: true}).escape(),
    body('price', 'Price must not be empty').trim().isLength({ min: 1 }).escape(),
    body('description', 'Description must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('imageUrl').isURL().withMessage('is invalid'),
    body('condition', 'Condition must not be empty.').trim().isLength({ min: 1 }).escape(),

    asyncHandler(async (req,res,next) => {
        try{
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({message:errors[0]});
            }

            const category = await Category.findOne({name:req.body.category})
            if(!category) {
                return res.status(404).json({message: 'Category not found'})
            }

            const addressArray = []
            if (req.body.address) addressArray.push(req.body.address)
            if (req.body.city) addressArray.push(req.body.city)
            if (req.body.state) addressArray.push(req.body.state)
            if (req.body.zip) addressArray.push(req.body.zip)
            
            const address = addressArray.join(', ')
            const coordinates = await geocoding_controller.geocode(address)
            let location;

            if (coordinates) {location = {"type":"Point", "coordinates":coordinates}}

            const ad = await Ad.findById(req.params.id);
            if(!ad) return res.status(404).json({message: 'Ad not found'})
            if (ad.seller!=req.seller.id) return res.status(401).json({message:'You can only edit your own ads.'});
            const {title, price, description, imageUrl, condition} = req.body;
            ad.title = title;
            ad.location = location;
            ad.address = address;
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
            return res.status(500).json({message:err})
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

exports.ad_list = (req, res, next) => {
    if ('limit' in req.query) {
        Ad.find({})
        .limit(Number(req.query.limit))
        .sort({title : 1})
        .populate('seller')
        .populate('category')
        .exec(function(err, list_ads) {
            if (err) {return next(err)}
            else {
                // Successful, so render
                return res.status(200).json(list_ads)
            }
        })
    } else {
        Ad.find({})
        .sort({title : 1})
        .populate('seller')
        .populate('category')
        .exec(function(err, list_ads) {
          if (err) {return next(err)}
          else {
              // Successful, so render
              return res.status(200).json(list_ads)
          }
        })
    }
}

exports.ad_search = [
    body('keyword').optional({checkFalsy: true}).escape(),
    body('category').optional({checkFalsy: true}).escape(),
    body('condition').optional({checkFalsy: true}).escape(),
    body('location').optional({checkFalsy: true}).escape(),
    body('minPrice').optional({checkFalsy: true}).escape(),
    body('maxPrice').optional({checkFalsy: true}).escape(),

    asyncHandler(async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({message:"Invalid input data"})
        }

        console.log(req.body)

        const {keyword, condition, location, distance, minPrice, maxPrice} = req.body

        const query = {title:{$regex:keyword.trim(), '$options':'i'}}
        

        if (req.body.category != 'Any Category') {
            const category = await Category.findOne({name:req.body.category})
            if(!category) {
                return res.status(400).json({message:'Category not found'})
            }
            query['category']=category.id
        }
        
        
        if (condition!='Any Condition') query['condition']=condition;

        // LOCATION QUERY
        if (location != '') {
            try{
            const coordinates = await geocoding_controller.geocode(location)
            if (coordinates) {
                query['location'] = { $near:
                    {
                        $geometry: { type: "Point",  coordinates: coordinates },
                        $minDistance: 0,
                        $maxDistance: distance*1000
                    }
                }
            } else {
                return res.status(400).json({message:'Location is invalid'})
            }} catch (err) {
                console.log(err)
            }
            
        }
        

        if (minPrice != '' && maxPrice != '') query['price']={$gte:Number(minPrice)*100,$lte:Number(maxPrice)*100}
        else if (minPrice != '') {query['price']= {$gte:Number(minPrice)*100}}
        else if (maxPrice != '') {query['price']= {$lte:Number(maxPrice)*100}}

        try {
            Ad.find(query)
            .sort({title : 1})
            .populate('seller')
            .populate('category')
            .exec(function(err, list_ads) {
                if (err) {return res.status(500).json(err)}
                else {
                    // Successful, so render
                    return res.status(200).json(list_ads)

                }
        })
        } catch (err) {
            console.log(err)
            return res.status(500).json({message:err})
        }
    })
]