var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var SellerSchema = new Schema(
    {
        name: {type: String, required: true, maxLength: 100},
        email: {type: String, required: true, maxLength: 100},
        phone: {type: String, maxLength: 100},
    }
)

// Virtual for seller's URL
SellerSchema
.virtual('url')
.get(function () {
    return '/api/seller/' + this._id;
});

// Export model
module.exports = mongoose.model('Seller', SellerSchema);