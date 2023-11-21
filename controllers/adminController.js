const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const config = require('../config/config');

const securePassword = async(password) =>{
    try {
        
        const passwordHash = await bcrypt.hash(password,10);
        return passwordHash;

    } catch (error) {
        console.log(error.message);
    }
}

const loadLogin = async(req,res) =>{
    try {
        res.render('login');
    } catch (error) {
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

            if (passwordMatch) {
                
                if (userData.is_admin === 0) {
                    res.render('login',{message:'Invalid Username'})

                } else {
                    req.session.user_id = userData._id;
                    res.redirect('/admin/home')
                }

            } else {
                res.render('login',{message:'Invalid Username'});
            }
        
        } else {
            res.render('login',{message:'Invalid Username'});
        }
    } catch (error) {
        console.log(error.message);
    }
}

const loadDashboard = async(req,res) =>{
    try {
        const userData = await User.findById({_id:req.session.user_id})
        res.render('home',{admin:userData});
    } catch (error) {
        console.log(error.message);
    }
}

const logout = async(req,res) =>{
    try {
        req.session.destroy();
        res.redirect('/admin');
    } catch (error) {
        console.log(error.message);
    }
}

const adminDashboard = async(req,res) =>{
    try {
        
        var search = '';

        if(req.query.search){
            search = req.query.search;
        }
        
        const usersData = await User.find({
            is_admin:0,
            $or:[
                {name: {$regex:'.*'+search+'.*',$options:'i'}},
                {email: {$regex:'.*'+search+'.*',$options:'i'}},
                {mobile: {$regex:'.*'+search+'.*',$options:'i'}},
            ]
        })
        res.render('dashboard',{users:usersData});
    } catch (error) {
        console.log(error.message);
    }
}

const newUser = async(req,res) =>{
    try {
        res.render('new-user');
    } catch (error) {
        console.log(error.message);
    }
}

const addUser = async(req,res) =>{
    try {
        
        const name = req.body.name;
        const email = req.body.email;
        const mno = req.body.mno;
        const password = req.body.password;
        const image = req.file.filename;
        
        const sPassword = await securePassword(password);

        const user = new User({
            name:name,
            email:email,
            mobile:mno,
            image:image,
            password:sPassword,
            is_admin:0
        });

        const userData = await user.save();

        if (userData) {
            res.redirect('/admin/dashboard');
        } else {
            res.render('new-user',{message:'Something Wrong'});
        }

    } catch (error) {
        console.log(error.message);
    }
}

const editUser = async(req,res) =>{
    try {
        
        const id = req.query.id;
        const userData = await User.findById({_id:id});
        if (userData) {
            res.render('edit-user',{user:userData});
        } else {
            res.redirect('/admin/dashboard');
        }
    } catch (error) {
        console.log(error.message);
    }
}

const updateUser = async(req,res) =>{
    try {
        
        if (req.file) {
            
            const userData = await User.findByIdAndUpdate({_id:req.body.user_id},{$set: {name:req.body.name,email:req.body.email,mobile:req.body.mno,image:req.file.filename}});
        } else {
            const userData = await User.findByIdAndUpdate({_id:req.body.user_id},{$set: {name:req.body.name,email:req.body.email,mobile:req.body.mno}});
        }

        res.redirect('/admin/dashboard');
    } catch (error) {
        console.log(error.message);
    }
}

const deleteUser = async(req,res) =>{
    try {

        const id = req.query.id;
        await User.deleteOne({_id:id});
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadLogin,
    verifyLogin,
    loadDashboard,
    logout,
    adminDashboard,
    newUser,
    addUser,
    editUser,
    updateUser,
    deleteUser
}