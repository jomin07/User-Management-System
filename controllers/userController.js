const User = require('../models/userModel');
const bcrypt = require('bcrypt');

const securePassword = async(password)=>{
    try{
        const passwordHash = await bcrypt.hash(password,10);
        return passwordHash;
    }catch(error){
        console.log(error.message);
    }
}

const loadRegister = async(req,res) =>{
    try{
        res.render('registration');
    }catch(error){
        console.log(error.message);
    }
}

const insertUser = async(req,res) =>{
    try{
        const secPassword = await securePassword(req.body.password);
        const existingUser = await User.findOne({ email: req.body.email });

        if (existingUser) {
            return res.render('registration', { message: "Email already exists, try another one" });
        }
        const user = new User({
            name:req.body.name,
            email:req.body.email,
            mobile:req.body.mno,
            image:req.file.filename,
            password:secPassword,
            is_admin:0
        });
        const userData = await user.save();

        if(userData){
            res.render('registration',{message:"Your registration has been successfull!"});
        }
        else{
            res.render('registration',{message:"Registration unsuccessful"})
        }
    }catch(error){
        console.log(error.message);
    }
}

//login user
const loginUser = async(req,res) =>{
    try{
        res.render('login');
    }catch(error){
        console.log(error.message);
    }
}

const verifyLogin = async(req,res) =>{
    try {
        
        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({email:email});

        if (userData) {
            const passwordMatch = await bcrypt.compare(password,userData.password);

            if (passwordMatch && userData.is_admin === 0) {
                // if (userData.is_verified === 0) {
                //     console.log('Please verify your mail');
                // } else {
                    req.session.user_id = userData._id;
                    res.redirect('/home');
                // }
            } else {
                res.render('login',{message:'Incorrect Username and Password'});
            }
        } else {
            res.render('login',{message:'Invalid Username'});
        }
    } catch (error) {
        console.log(error.message);
    }
}

const loadHome = async(req,res) =>{
    try {
        const userData = await User.findById({_id:req.session.user_id});
        if(userData.is_admin === 0){
            res.render('home',{user:userData});
        }
    } catch (error) {
        console.log(error.message);
    }
}

const userLogout = async(req,res) =>{
    try {  
        req.session.destroy();
        res.redirect('/');
    } catch (error) {
        console.log(error.message);
    }
}

//user profile edit and update
const editLoad = async(req,res) =>{
    try {
        const id = req.query.id;

        const userData = await User.findById({_id:id});

        if (userData) {
            res.render('edit',{user:userData});
        } else {
            res.redirect('/home');
        }
    } catch (error) {
        console.log(error.message);
    }
}

const editProfile = async(req,res) =>{
    try {
        if (req.file) {
            const userData = await User.findByIdAndUpdate({_id:req.body.user_id},{$set: {name:req.body.name,email:req.body.email,mobile:req.body.mno,image:req.file.filename}});
        } else {
            const userData = await User.findByIdAndUpdate({_id:req.body.user_id},{$set: {name:req.body.name,email:req.body.email,mobile:req.body.mno}});
        }

        res.redirect('/home');
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {loadRegister,insertUser,loginUser,verifyLogin,loadHome,userLogout,editLoad,editProfile};