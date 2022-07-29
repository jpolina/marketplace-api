let mongoose = require('mongoose');

let Schema = mongoose.Schema;

const PointSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    }
);


// Export schema
module.exports = PointSchema;