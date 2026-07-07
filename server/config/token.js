import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const genToken= (userId)=>{
    try{
        const token=jwt.sign({userId},process.env.JWT_SECRET,{expiresIn:"30d"});
        return token;
    }
    catch(err){
        console.log(err,"Error generating token");
    }
}

export default genToken;