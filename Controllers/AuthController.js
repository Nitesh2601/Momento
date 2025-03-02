
// this is AuthController.Js

const UserModel = require("../Models/User");

// const bcrypt = require('bcrypt');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const signup = async (req,res)=>{

    try {

        const {name, email , password} = req.body;

        const user = await UserModel.findOne({email});

        if(user){

            return res.status(409)
               .json({message: 'User already exist, you can login', success: false});
              
        }

        const userModel = new UserModel({name,email,password});

        userModel.password = await bcrypt.hash(password,10);

        await userModel.save();

        res.status(201)
              .json({
                message: "signup successfully",
                success: true
              })

    } catch(err){

        res.status(500)
         .json({
            message: "Internal server errror",
            success: false
         })
           
    }

}




const login = async (req,res)=>{

    try {

        const { email , password} = req.body;

        const user = await UserModel.findOne({email});

        const errorMsg = 'Auth failed , email or password is wrong';

        if(!user){

            return res.status(403)
               .json({message: errorMsg, success: false});
              
        }

        const isPassEqual = await bcrypt.compare(password,user.password);

        if(!isPassEqual){

            return res.status(403)
               .json({ message: errorMsg, success: false});

        }

        const jwtToken = jwt.sign(

            {email: user.email, _id: user._id},
            process.env.JWT_SECRET,
            {expiresIn:'24h'}
        )

        res.status(200)
              .json({
                message: "login successfully",
                success: true,
                jwtToken,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email
                }
              })

    } catch(err){

        res.status(500)
         .json({
            message: "internal server error",
            success: false
         })
           
    }

}






module.exports = {
    signup,
    login
}