let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let pointSchema = require('./point')

let AdSchema = new Schema(
    {
        title: {type: String, required: true, maxLength:100},
        seller: {type: Schema.Types.ObjectId, ref: 'Seller', required: true},
        location: {type: pointSchema, required: true},
        price: {type: Integer, required: true},
        description: {type: String, maxLength:500},
        category: [{type: Schema.Types.ObjectId, ref: 'Category'}],
        imageUrl: {type: String}
    }
)

// Virtual for ad's URL
AdSchema
.virtual('url')
.get(function () {
    return '/api/ad/' + this._id;
});

// Export model
module.exports = mongoose.model('Ad', AdSchema);