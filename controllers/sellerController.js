let Ad = require('../models/ad');
let Seller = require('../models/seller');
let Category = require('../models/category');

let async = require('async');
const { body,validationResult } = require("express-validator");

const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const asyncHandler = require('express-async-handler');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1d'
    })
}

exports.seller_register = [
    body('name', 'Seller name must not be empty.').trim().isLength({min:1}).escape(),
    body('password', 'Password must not be empty.').trim().isLength({min:1}),
    body('email').isLength({ min: 1 }).trim().withMessage('Email must be specified.'),
    body('email').isEmail().withMessage('Email must be a valid email address.'),
    body('phone', 'Phone number must be valid').isMobilePhone().optional({checkFalsy: true}).escape(),

    asyncHandler(async (req,res,next) => {
        const errors = validationResult(req);
        let {name,email, phone, password} = req.body;
        if (!phone) {phone=false};

        const sellerExists = await Seller.findOne({email})

        if(sellerExists) {
            return res.status(400).json({message:'This email is already in use'})
            
        }

        // Hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)
        const seller = await Seller.create(
            {
                name,
                email,
                phone,
                password: hashedPassword
            }
        )

        if (!errors.isEmpty()) {
            return res.status(400);
        }else if (seller) {
            res.status(201).json({
                message: "Account created successfuly",
                _id: seller.id,
                name: seller.name,
                email: seller.email,
                phone: seller.phone,
                token: generateToken(seller._id)
            })
        } else {
            res.status(400).json({message: 'Invalid account data'})
        }

    })
]

exports.seller_login = asyncHandler(async(req, res, next) => {
    const {email, password} = req.body

    // Check for seller email
    const seller = await Seller.findOne({email})

    if(seller && (await bcrypt.compare(password, seller.password))) {
        res.status(200).json({
            message: 'Logged in successfully',
            _id: seller.id,
            name: seller.name,
            email: seller.email,
            phone: seller.phone,
            token: generateToken(seller._id)
        })
    } else {
        res.status(400).json({message:'Invalid credentials'})
    }
})

exports.seller_delete = asyncHandler(async (req, res, next) => {
    try {
        const seller = await Seller.findById(req.params.id)

        if (!seller) return res.status(404).json({message: "Seller not found"})
        if (req.params.id != req.seller.id) return res.status(401).json({message: "You are not authorized to delete other seller accounts"})

        const deletedSeller = await Seller.findByIdAndDelete(req.seller.id);
        const deletedSellerAds = await Ad.deleteMany({seller: req.params.id});

        if (deletedSeller && deletedSellerAds) {
            delete req.seller;
            return res.status(200).json({message: "Successfully deleted", seller: deletedSeller});
        }

        return res.status(500).json({message: "An error occurred"})

    } catch (e) {
        return res.status(500).json({ error: e.message });
    }

})

exports.seller_update = [
    body('name', 'Seller name must not be empty.').trim().isLength({min:1}).escape(),
    body('password', 'Password must not be empty.').trim().isLength({min:1}),
    body('email').isLength({ min: 1 }).trim().withMessage('Email must be specified.'),
    body('email').isEmail().withMessage('Email must be a valid email address.'),
    body('phone', 'Phone number must be valid').isMobilePhone().optional({checkFalsy: true}).escape(),

    asyncHandler(async (req,res,next) => {
        const errors = validationResult(req);
        let {name, email, phone, password} = req.body;
        if (!phone) {phone=false};
        const seller = await Seller.findById(req.params.id)
        if(!seller) {
            return res.status(404).json({error:'Seller not found'})
        }
        if (req.params.id != req.seller.id) return res.status(401).json({message:"You can only edit your own account"})

        // Hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)
        seller.name=name;
        seller.email=email;
        seller.phone=phone;
        seller.password=hashedPassword;

        const updatedSeller = await seller.save();

        if (!errors.isEmpty()) {
            return res.status(400);
        } else if (seller) {
            res.status(201).json({
                message: "Profile updated successfuly",
                token: generateToken(updatedSeller._id),
                seller: updatedSeller
            })
        } else {
            res.status(400).json({message: 'Invalid account data'})
        }

    })
]

exports.seller_detail = function(req, res, next) {
    async.parallel({
        seller: function(callback) {
            Seller.findById(req.params.id).exec(callback)
        },
        ads: function(callback) {
            Ad.find({'seller': req.params.id}).populate('seller').populate('category').exec(callback)
        }
    }, function (err, results) {
        if (err) {return next(err);}
        if (results.seller == null) {
            var err = new Error('Seller not found');
            err.status = 404;
            return next(err);
        }
        res.status(200).json({seller: results.seller, ads: results.ads})
    })
}

exports.seller_list = function(req, res, next) {
    Seller.find({})
      .sort({name : 1})
      .exec(function(err, list_sellers) {
        if (err) {return next(err)}
        else {
            // Successful, so render
            res.status(200).json(list_sellers)
        }
      })
}