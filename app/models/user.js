
const bcrypt = require('bcryptjs');
const config = require('../config/database');
const mongoose = require('mongoose');
//The Schema is just like a user Defined Data Type, a Normal Struct.
const userSchema = mongoose.Schema({
    name:{
        type : String
    },
    email : {
        type : String,
        required : true
    },
    username : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    balance : {
        type : Number,
        required : true
    }
});
const User = module.exports = mongoose.model("User",userSchema);
//here, Mongoose creates a Model, which is Named as "User", and the fields of the model are defined in the 
// Schema as userSchema.

module.exports.getUserById = function(id,callback)
{
    User.findById(id,callback); //Here, the Model is User, which is the Model created.
}
module.exports.getUserByUserName = function(username,callback)
{
    const query = {username : username};
    User.findOne(query,callback);
}
module.exports.addUser = function(newUser,callback)
{
    bcrypt.genSalt(10,function(err,salt)
    {
        bcrypt.hash(newUser.password,salt,function(err,hash)
        {
            if(err)
                throw err;
            newUser.password = hash;
            newUser.save(callback);
        });
    })
}
module.exports.comparePassword = function(candidatePassword, hash, callback)
{
    bcrypt.compare(candidatePassword,hash,function(err,isMatch)
    {
        if(err)
            throw err;
        callback(null,isMatch);
    })
}