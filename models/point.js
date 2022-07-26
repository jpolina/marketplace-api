let mongoose = require('mongoose');

let Schema = mongoose.Schema;

const pointSchema = new mongoose.Schema(
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


// Export model
module.exports = mongoose.model('Category', CategorySchema);