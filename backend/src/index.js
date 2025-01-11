import app from "./app.js";
import connectDB from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Serving is learning at port: ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("Mongodb error: ", err);
})