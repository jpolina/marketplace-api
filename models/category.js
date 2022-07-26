let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let CategorySchema = new Schema(
    {
        name: {type: String, required: true, maxLength: 100}
    }
)

// Virtual for category's URL
CategorySchema
.virtual('url')
.get(function() {
    return '/api/category/' + this._id;
});

// Export model
module.exports = mongoose.model('Category', CategorySchema);