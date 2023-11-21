const isLogin = async(req,res,next) =>{
    try {
        if (req.session.user_id) {
            next();
        } else {
            res.redirect('/');
        }
        
    } catch (error) {
        console.log(error.messsage);
    }
}

const isLogout = async(req,res,next)=>{
    try {
        if (req.session.user_id) {
            res.redirect('/home');
        } else {
            next();
        }
        
        
    } catch (error) {
        console.log(error.messsage);
    }
}

module.exports = {isLogin,isLogout};