const mongoose=require('mongoose');
const CampGround=require("../models/campground.js");
const connectdb=async ()=>{
    try{
    await mongoose.connect("mongodb://127.0.0.1:27017/yelpcamp");
    console.log("Database Connected Successfully!!!");
    }
    catch(err){
        console.log(err);
    }
    

}

connectdb();
const images = [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
    "https://images.unsplash.com/photo-1470770841072-f978cf4d019e",
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b",
    "https://images.unsplash.com/photo-1482192505345-5655af888cc4",
    "https://images.unsplash.com/photo-1433086966358-54859d0ed716",
    "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07"
];
const updateimages=async ()=>{
    const campgrounds=await CampGround.find({});

    for(let camp of campgrounds){
          camp.price=Math.floor(Math.random() * 65)
         camp.image = camp.image = images[Math.floor(Math.random() * images.length)];
        await camp.save();
    }
    const campground=await CampGround.find({});
    console.log(campground);

}

updateimages();
