const express = require('express');
const adminRoute = express();
const session = require('express-session');
const config = require('../config/config');
const bodyparser = require('body-parser');

adminRoute.use((req, res, next) => {
    res.set('cache-control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    res.set('Expires', '-1');
    res.set('Pragma', 'no-cache');
    next();
});

adminRoute.use(session({secret:config.sessionSecret,resave:false,saveUninitialized:true}));

adminRoute.use(bodyparser.json());
adminRoute.use(bodyparser.urlencoded({extended:true}));

adminRoute.set('view engine','ejs');
adminRoute.set('views','./views/admin');

const multer = require('multer');
const path = require('path');

adminRoute.use(express.static('public'));

const storage = multer.diskStorage({
    destination:function(req,file,cb) {
        cb(null,path.join(__dirname,'../public/userImages'));
    },
    filename:function(req,file,cb){
        const name = Date.now()+'-'+file.originalname;
        cb(null,name);
    }
});
const upload = multer({storage:storage});

const auth = require('../middleware/adminAuth');
const adminController = require('../controllers/adminController');


adminRoute.get('/',auth.isLogout,adminController.loadLogin);

adminRoute.post('/',adminController.verifyLogin);

adminRoute.get('/home',auth.isLogin,adminController.loadDashboard);

adminRoute.get('/logout',auth.isLogin,adminController.logout);

adminRoute.get('/dashboard',auth.isLogin,adminController.adminDashboard);

adminRoute.get('/new-user',auth.isLogin,adminController.newUser);

adminRoute.post('/new-user',upload.single('image'),adminController.addUser);

adminRoute.get('/edit-user',auth.isLogin,adminController.editUser);

adminRoute.post('/edit-user',upload.single('image'),adminController.updateUser);

adminRoute.get('/delete-user',adminController.deleteUser);



adminRoute.get('*',(req,res) =>{
    res.redirect('/admin');
});

module.exports = adminRoute;