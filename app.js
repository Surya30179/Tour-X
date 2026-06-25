const express=require('express');
const mongoose=require('mongoose');
const path=require('path');
const CampGround=require("./models/campground")
const methodOverride = require('method-override');
const ejsmate=require('ejs-mate');
const async_error_handler=require('./utils/WrapAsync');
const express_error=require('./utils/express_error');
const joi=require('joi');




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




app.get("/",(req,res,)=>{
    res.render("home.ejs");
})
app.get("/campgrounds",async_error_handler(async (req,res,next)=>{
    const campgrounds= await CampGround.find({});
    res.render("camps.ejs",{campgrounds})
}))
app.get("/campgrounds/new" ,async_error_handler(async (req,res,next)=>{
    res.render("newcamp.ejs");
}))     

app.put("/campgrounds/:id",async_error_handler(async (req,res,next)=>{
    const {id}=req.params;
    await CampGround.findByIdAndUpdate(id,req.body.campground,{
    runValidators: true,
    new: true});
    res.redirect(`/campgrounds/${id}`)
}))
app.post("/campgrounds",async_error_handler(async (req,res,next)=>{
    const campgroundschema=joi.object({
        campground:joi.object({
            title:joi.string().required(),
            price:joi.number().required(),
            description:joi.string().required(),
            location:joi.string().required(),
            image:joi.string().required()
        }).required()
    });
    const result= campgroundschema.validate(req.body);
    if (result.error){
        const message=result.error.details.map(el=>el.message).join(",")
        throw new express_error(message,500);
    }
    const newcamp=req.body.campground;
    const newplace=new CampGround(newcamp);
    await newplace.save();
    res.redirect("/campgrounds");
}))
app.get("/campgrounds/:id",async_error_handler(async (req,res,next)=>{
    const {id}=req.params;
    const camp=await CampGround.findById(id);
    res.render("singlecamp.ejs",{camp});
})) 
app.delete("/campgrounds/:id", async_error_handler(async (req,res,next)=>{
    const{id}=req.params;
    await CampGround.findByIdAndDelete(id);
    res.redirect("/campgrounds")
}))
app.get("/campgrounds/:id/edit/",async_error_handler(async(req,res,next)=>{
    const{id}=req.params;
    const camp=await CampGround.findById(id);
    res.render("editcamps.ejs",{camp});
}))    

app.all('/{*path}', (req, res, next) => {
      next(new express_error("Page Not Found",404))
})

app.use((err,req,res,next)=>{
    const {status_code=500}=err;
    if (!err.message) err.message="Something went Wrong"
    res.status(status_code).render("error.ejs",{err});
})

app.listen(3000,()=>{
    console.log("Serving on port 3000");
})