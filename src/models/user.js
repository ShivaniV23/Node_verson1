const mongoose = require('mongoose');
const validator = require('validator')
//user schema
const userSchema = new mongoose.Schema({
    firstName : {
        type : String,
        required : true,
        minLength : 4
    },
    lastName : {
        type : String,
        minLength : 5,
        maxLength : 50
    },
    emailId : {
        type : String,
        required : true,
        unique : true,
        lowercase :true,
        trim : true,
        validate(value) {
            if(!validator.isEmail(value)){
                throw new Error("Invalid email Address : "+ value)
            }
        }
    },
    password : {
        type : String,
        required : true,
        validate(value) {
            if(!validator.isStrongPassword(value)){
                throw new Error("Enter a strong password : "+ value)
            }
        }
    },
    age : {
        type : Number,
        min : 18
    },
    gender : {
        type : String,
        validate(value) { //this will work only on post [creation] but it wont work on patch [update]
            if(!["male","female","Others"].includes(value)){
                throw new Error("Gender data is not valid")
            }
        }
    },
    photoUrl : {
        type : String,
        validate(value) {
            if(!validator.isURL(value)){
                throw new Error("Invalid photo URL : "+ value)
            }
        }
    },
    about : {
        type : String,
        default : "this is default one"
    },
    skills : {
        type : [String]
    }
},
{
    timestamps : true,
});

//ensure unique index creation
userSchema.index({emailId : 1},{unique : true})

//mongoose model

const User = mongoose.model("User", userSchema);

//initializes indexes to ensure the database enforces uniqueness

User.init()
    .then(() => console.log("Indexes created succesfully"))
    .catch(err => console.error("Error creating indexes",err))

module.exports = User;