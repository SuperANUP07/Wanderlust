const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main().then(() =>{
    console.log("Connected to DB");
})
.catch((err)=>{ 
    console.log(err);
})

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});

  // initData.data = initData.data.map((obj) => ({
  //   ...obj, 
  //   owner: "68752bef4238a9a028d62643"}));

   const transformedData = initData.data.map((obj) => {
    // Extract URL from image object or use string directly
    const imageUrl = obj.image && obj.image.url 
      ? obj.image.url 
      : (typeof obj.image === 'string' ? obj.image : '');
    
    return {
      ...obj,
      image: imageUrl, // Store only the URL string
      owner: "68752bef4238a9a028d62643"
    };
  });

  await Listing.insertMany(transformedData);
  console.log("data was initialized");
};

initDB(); 

