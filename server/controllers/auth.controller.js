
import User from "../models/user.model.js";
import genToken from "../config/token.js";
export const googleAuth = async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { email, name } = req.body;
    console.log("EMAIL:", email);
    console.log("NAME:", name);

    let user = await User.findOne({ email });
    console.log("USER FOUND:", user);

    if (!user) {
      user = await User.create({ email, name });
      console.log("USER CREATED:", user);
    }

    console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);

    const token = genToken(user._id);
    console.log("TOKEN:", token);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",   // <-- fix this
      path: "/",
    });

    return res.status(200).json({
      message: "User authenticated successfully",
      user,
      token,
    });
  } catch (err) {
    console.error("GOOGLE AUTH ERROR:", err);
    console.error(err.stack);

    return res.status(500).json({
      message: err.message,
    });
  }
};



export const logOut=async(req,res)=>{
    try{
         // bhai ye krta kya hai?
         res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    }); // -->  Ye browser me jo token cookie save hai usse delete kar deta hai. ye logout ke liye important hai.
        return res.status(200).json({message:"User logged out successfully"});
    }
    catch(err){
        console.log(err,"Error in logout");
    }
}