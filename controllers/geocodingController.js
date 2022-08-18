require('dotenv').config
let axios = require('axios')

exports.forwardgeocode = async (req, res) => {
    try {
        const params = {
            access_key: process.env.POSITION_STACK_API_KEY,
            query: req.body.address,
            // output: 'json'
        }
        const {data} = await axios.get('http://api.positionstack.com/v1/forward', {params});
        res.status(200).json(data)

        
    } catch (e) {
        res.status(500).json({error: e.message})
    }
    
}

exports.reversegeocode = async (req, res) => {
    try {
        const params = {
            access_key: process.env.POSITION_STACK_API_KEY,
            query: req.body.address,
            // output: 'json'
        }
        const {data} = await axios.get('http://api.positionstack.com/v1/reverse', {params});
        res.status(200).json(data)

        
    } catch (e) {
        res.status(500).json({error: e.message})
    }
    
}

exports.geocode = async (address) => {
    try {
        const params = {
            access_key: process.env.POSITION_STACK_API_KEY,
            query: address,
            // output: 'json'
        }
        const {data} = await axios.get('http://api.positionstack.com/v1/forward', {params});
        return [data.data[0].longitude, data.data[0].latitude]

        
    } catch (e) {
        return null
    }
}