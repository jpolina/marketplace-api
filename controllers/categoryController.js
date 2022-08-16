let Ad = require('../models/ad');
let Seller = require('../models/seller');
let Category = require('../models/category');

let async = require('async');
const { body,validationResult } = require("express-validator");
const asyncHandler = require('express-async-handler');

exports.category_post = [
    body('name', 'Category name must not be empty.').trim().isLength({min:1}).escape(),

    async (req,res,next) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        try {
            const newCategory = new Category({
                name: req.body.name
            });
            const savedCategory = await newCategory.save();
            if (savedCategory) {
                return res
                .status(201)
                .json({ message: "Succesfully created category", category: savedCategory });
            }
            } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    }
]

exports.category_delete = async (req, res, next) => {
    try {
        const relCategory = await Category.findById(req.params.id);

        if (!relCategory) {
            return res.status(404).json({ message: "Category not found" });
        }
        const ads = await Ad.find({category:req.params.id})

        if (ads.length!==0) return res.status(403).json({error:'Delete ads in this category before deleting this category.', ads:ads})
        
        const deletedCategory = await Category.findByIdAndDelete(req.params.id);
        if (deletedCategory) {
            return res
                .status(200)
                .json({ message: "Successfully deleted category", category: deletedCategory });
        }
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
}

exports.category_update = [
    body('name', 'Category name must not be empty.').trim().isLength({min:1}).escape(),

    async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array(), message:errors.array()[0] });

        try {
            const category = await Category.findById(req.params.id);

            category.name = req.body.name;

            const updatedCategory = await category.save();

            return res.status(201).json({
                message: "Category update successful",
                category: updatedCategory,
            });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    }
]

exports.category_detail = function(req, res, next) {
    async.parallel({
        category: function(callback) {
            Category.findById(req.params.id).exec(callback)
        },
        ads: function(callback) {
            Ad.find({'category': req.params.id}).exec(callback)
        }
    }, function (err, results) {
        if (err) {return next(err);}
        if (results.category == null) {
            var err = new Error('Category not found');
            err.status = 404;
            return next(err);
        }
        res.status(200).json({category: results.category, ads: results.ads})
    })
}

exports.category_list = function(req, res, next) {
    try{
        Category.find()
        .sort({name : 1})
        .exec(function(err, list_categories) {
            if (err) {return next(err)}
            else {
                // Successful, so render
                res.status(200).json({categories: list_categories})
            }
        })
    } catch (err) {
        return res.status(500).json({error:err.message})
    }
}