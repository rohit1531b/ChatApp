import mongoose from "mongoose";
// Funcion to connect to the mongodb database
export const connectDB = async () =>{
    try{

        mongoose.connection.on('connected', ()=> console.log('Database Connected'));

        await mongoose.connect(`${process.env.MONGODB_URI}/chatapp`)
    }
    catch(error){
        console.log(error);
    }
}