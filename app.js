const express=require('express');
const mongoose=require('mongoose');
const path=require('path');
const CampGround=require("./models/campground")
const methodOverride = require('method-override');
const ejsmate=require('ejs-mate');

const app=express();
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.set('view engine','ejs');

app.engine('ejs',ejsmate)
app.set('views',path.join(__dirname,"views"));


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


app.get("/",(req,res)=>{
    res.render("home.ejs");
})
app.get("/campgrounds",async (req,res)=>{
    const campgrounds= await CampGround.find({});
    res.render("camps.ejs",{campgrounds})
})
app.get("/campgrounds/new" ,async (req,res)=>{
    res.render("newcamp.ejs");
})
app.put("/campgrounds/:id",async (req,res)=>{
    const {id}=req.params;
    await CampGround.findByIdAndUpdate(id,req.body,{
    runValidators: true,
    new: true});
    res.redirect(`/campgrounds/${id}`)
})
app.post("/campgrounds",async (req,res)=>{
    const newcamp=req.body;
    const newplace=new CampGround(newcamp);
    await newplace.save();
    res.redirect("/campgrounds");
})
app.get("/campgrounds/:id",async (req,res)=>{
    const {id}=req.params;
    const camp=await CampGround.findById(id);
    res.render("singlecamp.ejs",{camp});
})
app.delete("/campgrounds/:id", async(req,res)=>{
    const{id}=req.params;
    await CampGround.findByIdAndDelete(id);
    res.redirect("/campgrounds")
})
app.get("/campgrounds/:id/edit/",async(req,res)=>{
    const{id}=req.params;
    const camp=await CampGround.findById(id);
    res.render("editcamps.ejs",{camp});
})


app.listen(3000,()=>{
    console.log("Serving on port 3000");
})