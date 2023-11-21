const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/web_application');

//----------------------------------------------------------------
const express = require('express');
const app = express();

const userRoute = require('./routes/userRoute');
const adminRoute = require('./routes/adminRoute');

app.use('/',userRoute);

app.use('/admin',adminRoute);

app.listen(4000,(req,res) =>{
    console.log('Server Running...');
});