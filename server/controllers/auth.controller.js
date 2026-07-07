
import User from "../models/user.model.js";
import genToken from "../config/token.js";
export const googleAuth=async(req,res)=>{
    try{
        const {email,name}=req.body; // frontend se data lenge
        let user=await User.findOne({email}); 
        if(!user){
            user=await User.create({email,name}); // data se user create krnege
        }
        const token = genToken(user._id);
        console.log("TOKEN:", token);
        console.log("TYPE:", typeof token);
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: none,
            path:"/"
        });
        return res.status(200).json({
            message: "User authenticated successfully",
            user: {
              _id: user._id,
              name: user.name,
              email: user.email,
              credits: user.credits,
            },
            token: token
        });
    }
    catch(err){
        console.log(err,"Error in google auth");
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}



export const logOut=async(req,res)=>{
    try{
         // bhai ye krta kya hai?
         res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: none,
      path: "/",
    }); // -->  Ye browser me jo token cookie save hai usse delete kar deta hai. ye logout ke liye important hai.
        return res.status(200).json({message:"User logged out successfully"});
    }
    catch(err){
        console.log(err,"Error in logout");
    }
}