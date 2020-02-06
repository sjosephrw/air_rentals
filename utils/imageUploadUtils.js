const fs = require('fs');
const path = require('path');

const cloudinary = require('cloudinary').v2;
const multer = require('multer');

const { ErrorHandler } = require('./errorUtils');

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
        return cb(new ErrorHandler(400, 'Only images are allowed 🖼'), false);
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

                    resolve(res.secure_url);

                } else if (err){
                    console.error(err);
                    //throw error in promise reject
                    //https://stackoverflow.com/questions/21887856/should-an-async-api-ever-throw-synchronously
                    //https://javascript.info/promise-basics
                    reject(new ErrorHandler(500, `Failed to upload image to cloudinary. 🌩`));
                }
           });
        })

    })
};

exports.cloudinaryResizeAndUploadImages = async (req, res, next) => {

    if (req.body.collection === 'listing'){
        
        if (req.method === 'POST' && !req.files){
            return next(new ErrorHandler(400, `When adding a new listing you have to upload images 💥`));
        } else if (req.method === 'PATCH' && !req.files){
            //when editing a listing it is not compulsary to upload images
            return next();
        }

        if (req.body.category === 'stay'){

            //when I attached a then catch even with await it worked
            const res = await resolveMultiplePromises(cloudinaryPromise(req.files));
            
            req.body.images = res;

        } else if (req.body.category === 'adventure'){//not tested
            
            const mainPhotosArr = req.files.filter(el => el.fieldname === 'photos');

            const individualPhotosArr = req.files.filter(el => el.fieldname.startsWith('loc'));

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