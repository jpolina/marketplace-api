#! /usr/bin/env node

console.log('This script populates some test ads, sellers and categories to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var Ad = require('./models/ad')
var Seller = require('./models/seller')
var Category = require('./models/category')
const bcrypt = require('bcryptjs')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var ads = []
var sellers = []
var categories = []

async function sellerCreate(name, email, phone, password, cb) {
    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password,salt)
    sellerdetail = { name: name, email: email, password:  hashedPassword}
    if (!phone) sellerdetail.phone = phone
    
    var seller = new Seller(sellerdetail);
        
    seller.save(function (err) {
        if (err) {
        cb(err, null)
        return
        }
        console.log('New Seller: ' + seller);
        sellers.push(seller)
        cb(null, seller)
    }  );
}

function categoryCreate(name, cb) {
  var category = new Category({ name: name });
       
  category.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Category: ' + category);
    categories.push(category)
    cb(null, category);
  }   );
}

function adCreate(title, seller, location, price, description, category, imageUrl, condition, cb) {
  addetail = { 
    title: title,
    seller: seller,
    location: location,
    price: price,
    condition: condition
  }
  if (category != false) addetail.category = category
  if (description != false) addetail.description = description
  if (imageUrl != false) addetail.imageUrl = imageUrl
    
  var ad = new Ad(addetail);    
  ad.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Ad: ' + ad);
    ads.push(ad)
    cb(null, ad)
  }  );
}


function createSellersCategories(cb) {
    async.series([
        function(callback) {
            sellerCreate('Patrick Rothfuss', 'p.roth@hotmail.com', '416 111 2222','password!', callback);
        },
        function(callback) {
            sellerCreate('Ben Bova', 'bova@gmail.com', '123 321 1239','watermelon?', callback);
        },
        function(callback) {
            sellerCreate('Isaac Asimov', 'isaac12@gmail.com', '577 321 1234','applesss', callback);
        },
        function(callback) {
            sellerCreate('Bob Billings', 'bbills@gmail.com', false,'!orange', callback);
        },
        function(callback) {
            sellerCreate('Jim Jones', 'jonesy123@hotmail.com', false,'?banana', callback);
        },
        function(callback) {
            categoryCreate("Bikes", callback);
        },
        function(callback) {
            categoryCreate("Books", callback);
        },
        function(callback) {
            categoryCreate("Electronics", callback);
        },
        function(callback) {
            categoryCreate("Furniture", callback);
        },
        function(callback) {
            categoryCreate("Toys & Games", callback);
        },
        function(callback) {
            categoryCreate("Clothing", callback);
        },
        function(callback) {
            categoryCreate("Appliances", callback);
        },
        ],
        // optional callback
        cb);
}


function createAds(cb) {
    async.parallel([
        function(callback) {
            adCreate('Folding E-bike', sellers[0], {type:'Point', coordinates:[-79.697581, 43.609617]}, 20000, 'Broken Folding e-bike. Would like to sell to anyone who wants to fix it or for parts', categories[0], 'https://media.istockphoto.com/photos/bicycle-with-full-clipping-path-picture-id171586627', 'For parts/Not working', callback);
        },
        function(callback) {
            adCreate('LG Refrigerator', sellers[2], {type:'Point', coordinates:[-79.691273, 43.638866]}, 30000, 'LG Refrigerator, still works well. Bought in May 2021.', categories[6], 'https://www.lg.com/ca_en/images/refrigerators/md06074436/gallery/D1.jpg', 'Very good', callback);
        },
        function(callback) {
            adCreate('Hamilton Beach smoothie blender', sellers[1], {type:'Point', coordinates:[-79.433183, 43.648533]}, 2000, 'Blender for making smoothies and other good stuff.', categories[6], 'https://hamiltonbeach.ca/media/products/images/51109CR_2.jpg', 'Like new', callback);
        },
        function(callback) {
            adCreate('Nintendo Switch', sellers[3], {type:'Point', coordinates:[-79.292897, 43.833072]}, 30000, 'New Nintendo switch. Very fun.', categories[4], 'https://cdn.pocket-lint.com/r/s/1200x630/assets/images/140007-games-review-nintendo-switch-review-image1-lp6zy9awm0.jpg', 'Very good', callback);
        },
        function(callback) {
            adCreate('The Legend of Zelda: Breath of the Wild for Nintendo Switch', sellers[4], {type:'Point', coordinates:[-79.642288, 43.482634]}, 4000, 'Game for Nintendo Switch, Comes with case', categories[4], 'https://m.media-amazon.com/images/I/81o8tnkKkkL._AC_SY550_.jpg', 'Like new', callback);
        },
        function(callback) {
            adCreate('Forza Horizon 5 for Xbox One', sellers[1], {type:'Point', coordinates:[-80.543684, 43.471960]}, 6000, 'Racing game, also works for XBox Series X, disc not included', categories[4], 'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6466/6466929_ra.jpg', 'Acceptable', callback);
        },
        function(callback) {
            adCreate('A single Adidas shoe.', sellers[0], {type:'Point', coordinates:[-79.801133, 43.246411]}, 30000, 'Don\'t ask what happened to the other shoe.', categories[5], 'https://assets.adidas.com/images/w_600,f_auto,q_auto/4e894c2b76dd4c8e9013aafc016047af_9366/Superstar_Shoes_White_FV3284_01_standard.jpg', 'For parts/Not working', callback);
        }
        ],
        // optional callback
        cb);
}



async.series([
    createSellersCategories,
    createAds,
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('Ads: '+ads);
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});



