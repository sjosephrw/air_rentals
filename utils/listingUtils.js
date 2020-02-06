const axios = require('axios');


//https://stackoverflow.com/questions/54055935/my-call-async-await-returns-a-promise-pending-in-my-actions
const locationIQAPIRequest = async (APITOKEN, data) => {
    const res = await axios(`https://us1.locationiq.com/v1/search.php?key=${APITOKEN}&q=${encodeURI(data)}&format=json`, { mode : 'cors' });    
    console.log(res);
    // const parsedResult = JSON.parse(res);
    // console.log(res.data[0].lat, res.data[0].lon)
    return [parseFloat(res.data[0].lat), parseFloat(res.data[0].lon)]; 
} 

const locationIQAPIMultipleRequest = async (APITOKEN, data) => {
    const arr = [];

    for (let x = 0; x < data.length; x++) {
        arr.push(axios.get(`https://us1.locationiq.com/v1/search.php?key=${APITOKEN}&q=${encodeURI(data[x])}&format=json`, { mode : 'cors' }));
    }
      
      let res = await axios.all(arr);
      return res;
}

exports.prepareDataForDbInsertion = async (req, APITOKEN) => {

    console.log(req.body);

    if (req.body.collection === 'listing'){

        if (req.body.category === 'stay'){
        
            const dataToDb = {...req.body};
            // const images = [];
        
            // for (index = 0; index < req.files.length; ++index) {
            //     images.push(req.files[index].filename);
            // }
            
            // dataToDb['images'] = images;    
    
            const latAndLon = await locationIQAPIRequest(APITOKEN, dataToDb.address);
    
            let combinedObjToDb = Object.assign( {}, dataToDb, { additionalDetails: 
                [{
                    maxGroupSize: parseInt(dataToDb.maxGroupSize),
                    location: {
                        address: dataToDb.address,
                        coordinates: latAndLon
                    }  
                }]
            });
    
    
            delete combinedObjToDb.maxGroupSize;
            return combinedObjToDb;
    
        } else if (req.body.category === 'adventure'){
    
    
            const dataToDb = {...req.body};
        
            //https://stackoverflow.com/questions/16037049/why-does-javascript-map-function-return-undefined
            // const mainPhotosArr = req.files.filter(el => {
            //     return el.fieldname === 'photos'    
            // });
    
            // const mainPhotosArrWithRequiredFields = mainPhotosArr.map(el => el.filename);
    
            // dataToDb["images"] = mainPhotosArrWithRequiredFields;
            
    
            //https://stackoverflow.com/questions/16037049/why-does-javascript-map-function-return-undefined
            // const individualPhotosArr = req.files.filter(el => {
            //     return el.fieldname.startsWith('loc');    
            // });
    
            // const indvidualPhotosArrWithRequiredFields = individualPhotosArr.map(el => el.filename);
    
            //************** */
            const indvidualPhotosArrWithRequiredFields = req.body.individualPhotos;
            //*************** */

            const tempArr = [];
            for (let x = 0; x < dataToDb.loc.length; x++){
                let tempObj = dataToDb.loc[x];
                dataToDb.loc[x].maxGroupSize = parseInt(dataToDb.loc[x].maxGroupSize);
                tempArr.push(Object.assign({}, tempObj, {image: indvidualPhotosArrWithRequiredFields[x]}));   
            }
    
            const locationsArr = tempArr.map(el => el.address);
    
    
    
            const latAndLonArray = await locationIQAPIMultipleRequest(APITOKEN, locationsArr);
    
            // console.log(latAndLonArray[1].data[0].lat, latAndLonArray[1].data[0].lon);
    
            const tempArr1 = []; 
    
            for (let x = 0; x < locationsArr.length; x++){
                let tempObj = {address: locationsArr[x], coordinates: [parseFloat(latAndLonArray[x].data[0].lat), parseFloat(latAndLonArray[x].data[0].lon)]};
                tempArr[x]['booked'] = false;
                tempArr1.push(Object.assign({}, tempArr[x], {location: tempObj}));   
            }        
    
            const newDataToDb = {};
    
            //https://stackoverflow.com/questions/2958841/how-to-loop-through-key-value-object-in-javascript
            for (var k in dataToDb) {
                if (dataToDb.hasOwnProperty(k)) {
    
                   if (!k.startsWith('loc')) newDataToDb[k] = dataToDb[k];
                }
            }
    
            let combinedObjToDb = Object.assign( {}, newDataToDb, { additionalDetails: 
                tempArr1
            });
    
            combinedObjToDb.price = parseInt(combinedObjToDb.price);
    
            return combinedObjToDb;
        }
    }

}