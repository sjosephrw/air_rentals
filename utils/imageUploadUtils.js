const fs = require('fs');
const path = require('path');


const cloudinary = require('cloudinary').v2;
const multer = require('multer');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {

        let dir = '';

        dir = path.join(__dirname,'../public/img/temp/');
        
        if (!fs.existsSync(dir)) {
            // Do something
            fs.mkdirSync(dir);
        }

      cb(null, dir)
    
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname.split('.')[0] + Date.now() + path.extname(file.originalname)); //Appending extension
    }
})

// const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {

    var ext = path.extname(file.originalname);

    if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
        return cb(new Error('Only images are allowed'))
    }
    
    cb(null, true);
  
  }

exports.upload = multer({ storage: storage, fileFilter });


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

//https://stackoverflow.com/questions/43701013/cloudinary-api-resolve-promise
//https://stackoverflow.com/questions/51014778/cloudinary-async-wait-upload-for-multiple-images-at-once-then-save-to-array-in-n
const resolveMultiplePromises = async (arr) => {
    //https://stackoverflow.com/questions/33073509/promise-all-then-resolve
    return Promise.all(arr).then(res => res).catch(err => console.error(err));
};

const cloudinaryPromise = (images, dimensions = [640, 480]) => {

    return images.map(file => {
        return new Promise((resolve, reject) => {
    
          cloudinary.uploader.upload(file.path,
          { "width": dimensions[0], "height": dimensions[1], "crop": "fill" }, 
          function(err, res) {
              console.log(err, res); 
                if (res){
                    
                    //https://stackoverflow.com/questions/41411604/how-to-delete-local-file-with-fs-unlink
                    fs.unlink(file.path, (err) => {
                        if (err) {
                            console.log("failed to delete local image:"+err);
                        } else {
                            console.log('successfully deleted local image');                                
                        }
                    });

                    // return res;
                    resolve(res.secure_url);

                } else if (err){
                    reject(err);
                    console.error(err);
                }
           });
        })

    })
};

exports.cloudinaryResizeAndUploadImages = async (req, res, next) => {
    
    if (!req.files) return next();
    
    let dir;

    if (req.body.collection === 'listing'){
        
        dir = 'air_rentals/listings/';

        if (req.body.category === 'stay'){

            const res = await resolveMultiplePromises(cloudinaryPromise(req.files));
            
            req.body.images = res;

        } else if (req.body.category === 'adventure'){
            
            const mainPhotosArr = req.files.filter(el => {
                return el.fieldname === 'photos'    
            });

            const individualPhotosArr = req.files.filter(el => {
                return el.fieldname.startsWith('loc');    
            });

            req.body.images = [];

            req.body.individualPhotos = [];

            const res = await resolveMultiplePromises(cloudinaryPromise(mainPhotosArr));    

            req.body.images = res;

            const res1 = await resolveMultiplePromises(cloudinaryPromise(individualPhotosArr));            

            req.body.individualPhotos = res1;
        }

    } else if (req.body.collection === 'user'){
        const res = await resolveMultiplePromises(cloudinaryPromise(userPhoto, [200, 200]));    
        req.body.img = res[0];
    }

  
    next();

};