const express = require('express');
const userRoute = express();
const session = require('express-session');

const config = require('../config/config');

userRoute.use((req, res, next) => {
    res.set('cache-control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    res.set('Expires', '-1');
    res.set('Pragma', 'no-cache');
    next();
});

// userRoute.use((req, res, next) => {
//     if (req.method === 'GET') {
//         res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
//         res.set('Expires', '-1');
//         res.set('Pragma', 'no-cache');

//         const url = new URL(req.url, 'http://localhost'); // Replace 'http://localhost' with your actual base URL
//         url.searchParams.append('nocache', new Date().getTime());

//         req.url = url.pathname + url.search; // Update req.url
//     }

//     next();
// });

userRoute.use(session({secret:config.sessionSecret,resave:false,saveUninitialized:true}));

const auth = require('../middleware/auth');

userRoute.set('view engine','ejs');
userRoute.set('views','./views/users');

const bodyparser = require('body-parser');
userRoute.use(bodyparser.json());
userRoute.use(bodyparser.urlencoded({extended:true}));

const multer = require('multer');
const path = require('path');

userRoute.use(express.static('public'));

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

const userController = require('../controllers/userController');

userRoute.get('/register',auth.isLogout,userController.loadRegister);
userRoute.post('/register',upload.single('image'),userController.insertUser);

userRoute.get('/',auth.isLogout,userController.loginUser);
userRoute.get('/login',auth.isLogout,userController.loginUser);

userRoute.post('/login',userController.verifyLogin);

userRoute.get('/home',auth.isLogin,userController.loadHome);

userRoute.get('/logout',auth.isLogin,userController.userLogout);

userRoute.get('/edit',auth.isLogin,userController.editLoad);

userRoute.post('/edit',upload.single('image'),userController.editProfile);


module.exports = userRoute;