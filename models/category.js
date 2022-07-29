let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let CategorySchema = new Schema(
    {
        name: {type: String, required: true, maxLength: 100}
    }
)

// Export model
module.exports = mongoose.model('Category', CategorySchema);