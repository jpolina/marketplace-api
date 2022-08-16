let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let PointSchema = require('./point')

let AdSchema = new Schema(
    {
        title: {type: String, required: true, maxLength:100},
        seller: {type: Schema.Types.ObjectId, ref: 'Seller', required: true},
        location: {type: PointSchema},
        price: {type: Number, required: true, min: 0},
        description: {type: String, maxLength:500},
        category: {type: Schema.Types.ObjectId, ref: 'Category'},
        imageUrl: {type: String},
        condition: {type: String, enum:['Brand new', 'Like new', 'Very good', 'Good', 'Acceptable', 'For parts/Not working'], required: true}
    }
)

// Export model
module.exports = mongoose.model('Ad', AdSchema);