let express = require('express');
let router = express.Router();

// Require the controllers
let ad_controller = require('../controllers/adController')
let seller_controller = require('../controllers/sellerController')
let category_controller = require('../controllers/categoryController')

const {protect} = require('../middleware/authMiddleware')
let { generateUploadURL } = require('./s3.js')



/// AD ROUTES ///

// GET catalog home page.
router.get('/', ad_controller.index);

// POST request for creating an ad.
router.post('/ad', protect, ad_controller.ad_post);

// POST request to delete an ad.
router.delete('/ad/:id', protect, ad_controller.ad_delete);

// PUT request to update an ad.
router.put('/ad/:id', protect, ad_controller.ad_update);

// GET request for one ad.
router.get('/ad/:id', ad_controller.ad_detail);

// GET request for list of all ads.
router.get('/ads', ad_controller.ad_list);


/// SELLER ROUTES ///

// POST request for creating a seller.
router.post('/seller', seller_controller.seller_register);

// POST request for logging in a seller.
router.post('/login', seller_controller.seller_login);

// DELETE request to delete a seller.
router.delete('/seller/:id', protect, seller_controller.seller_delete);

// PUT request to update a seller.
router.put('/seller/:id', protect, seller_controller.seller_update);

// GET request for one seller.
router.get('/seller/:id', seller_controller.seller_detail);

// GET request for list of all sellers.
router.get('/sellers', seller_controller.seller_list);


/// CATEGORY ROUTES ///

// POST request for creating a category.
router.post('/category', protect, category_controller.category_post);

// DELETE request to delete a category.
router.delete('/category/:id', protect, category_controller.category_delete);

// PUT request to update a category.
router.put('/category/:id', protect, category_controller.category_update);

// GET request for one category.
router.get('/category/:id', category_controller.category_detail);

// GET request for list of all category.
router.get('/categories', category_controller.category_list);



/// S3 ROUTE ///

router.get('/s3Url', async (req, res)=> {
    const url = await generateUploadURL()
    res.send({url})
})


module.exports = router;