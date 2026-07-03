const express=require('express');
const mongoose=require('mongoose');
const path=require('path');
const CampGround=require("./models/campground")
const methodOverride = require('method-override');
const ejsmate=require('ejs-mate');
const async_error_handler=require('./utils/WrapAsync');
const express_error=require('./utils/express_error');
const Review=require('./models/reviews')
const {campgroundschema,reviewSchema}=require('./schema');



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

const validateCampGround=(req,res,next)=>{
   
    const result= campgroundschema.validate(req.body);
    if (result.error){
        const message=result.error.details.map(el=>el.message).join(",");
        throw new express_error(message,400);
    }
    next()
}
const validateReview=(req,res,next)=>{
    const result=reviewSchema.validate(req.body);
     if (result.error){
        const message=result.error.details.map(el=>el.message).join(",");
        throw new express_error(message,400);
    }
    next()

}


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
app.post("/campgrounds/:id/review",validateReview,async_error_handler(async (req,res,next)=>{
    const {id}=req.params;
    const {review}=req.body;
    const campground=await CampGround.findById(id);
    const newreview=new Review(review);
    campground.reviews.push(newreview._id);
    await newreview.save();
    await campground.save();
    res.redirect("/campgrounds")
    

}))

app.put("/campgrounds/:id",validateCampGround,async_error_handler(async (req,res,next)=>{
    const {id}=req.params;
    await CampGround.findByIdAndUpdate(id,req.body.campground,{
    runValidators: true,
    new: true});
    res.redirect(`/campgrounds/${id}`)
}))
app.post("/campgrounds",validateCampGround,async_error_handler(async (req,res,next)=>{
   
    const newcamp=req.body.campground;
    const newplace=new CampGround(newcamp);
    await newplace.save();
    res.redirect("/campgrounds");
}))
app.get("/campgrounds/:id",async_error_handler(async (req,res,next)=>{
    const {id}=req.params;
    const camp=await CampGround.findById(id).populate("reviews");
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