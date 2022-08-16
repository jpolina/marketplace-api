const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const Seller = require('../models/seller')

const protect = asyncHandler(async(req,res,next)=> {
    let token

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1]

            //Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            // Get seller from the token
            req.seller = await Seller.findById(decoded.id).select('-password')

            next()
        } catch (error) {
            console.log(error)
            res.status(401).json({})
            throw new Error('Not authorized')
        }
    }
    if (!token) {
        res.status(401).json({message: 'Not authorized, no token.'})
    }
})

module.exports = {protect}