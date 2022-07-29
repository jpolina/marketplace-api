let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let SellerSchema = new Schema(
    {
        name: {type: String,required: [true, 'Please add a name'], maxLength: [100, 'Name is too long']},
        email: {type: String, required: [true, 'Please add an email'], maxLength: [100, 'Email is too long']},
        phone: {type: String, maxLength: 100},
        password: {type: String, required: [true, 'Please add a password'], maxLength: [100, 'Password is too long']}
    }
)

// Export model
module.exports = mongoose.model('Seller', SellerSchema);