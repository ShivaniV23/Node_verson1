const express = require("express");
const connectDB = require("./config/database.js");
const app = express();
const User = require("./models/user")
const bcrypt = require("bcrypt");
const {validateSignupData} = require("./utils/validation") 


//middle ware activation for json to js object
app.use(express.json());

app.post("/signup",async(req,res) => {
    //Important -- never trust req.body thats why use validations
    try {
         //validation of data
         validateSignupData(req);

         const {firstName,lastName,emailId,password} = req.body;

          //Encrypt the password
        const passwordHash = await bcrypt.hash(password,10);
        console.log(passwordHash);

        //creating a new instance of user model
      const user = new User({
        firstName,
        lastName,
        emailId,
        password : passwordHash
      });

        await user.save();//it returns a promise
        res.send("User Added Successfully");
    } catch (err) {
        if(err.code === 11000) {
            res.status(409).send("Error : Duplicate emailId detected");
        } else {
            res.status(400).send("ERROR : " + err.message);
        }
        
    }
 });

//login api
app.post("/login",async(req,res) => {
    try {
        const { emailId, password } = req.body;

        //sanitizing email
        const user = await User.findOne({emailId : emailId});
        if(!user) {
            throw new Error("Invalid credentials");
        }
        //password
        const isPasswordValid = await bcrypt.compare(password,user.password);
        if(isPasswordValid) {

            //create a JWT token

            //Add the tokem to cookie and send the response back to the user
            res.cookie("token","sadhjdhsudwididhwhd8wd")
            res.send("Login Successfull!!");
        } else {
            throw new Error("Invalid credentials");
        }

    } catch(err) {
        res.status(400).send("ERROR : " + err.message);
    }
})

//Get profile

app.get("/profile",async(req,res) => {

    const cookies = req.cookies;
    console.log(cookies);
    res.send("Reading cookies");
})
//Get user by email
app.get("/user",async(req,res) => {
    const userEmail = req.body.emailId;

    try{
        const users = await User.find({emailId : userEmail});
        if(users.length === 0) {
            res.status(404).send("User not found");
        } else {
            res.send(users);
        }
    } catch(err) {
        res.status(400).send("Something went wrong");
    }
})

//IF there are two users with same email Id then use findOne method to get and in that case it will give the data of first created old user

//feed API  - GET/feed  - get all the users from database
// app.get("/feed",async(req,res) => {

//     try {
//         const users = await User.find({});//empty {} gives all users
//         res.send(users);

//     } catch(err) {
//         res.status(400).send("Something went wrong");
//     }
// })


app.delete("/user" , async (req,res) => {
    const userId = req.body.userId;
    try {
        const user = await User.findByIdAndDelete(userId);
        //const user = await User.findByIdandDelete({_id : userId}); this is actual but above is shorthand and can easily understand gives by id
        res.send("User Deleted succesfully");
    } catch(err) {
        res.status(400).send("Something went wrong...");
    }
})
//update data of the user
app.patch("/user/:userId" ,async (req,res) => {
    const userId = req.params?.userId;
    const data = req.body;

  
    try {
        const ALLOWED_UPDATES = [
              "photoUrl","about","gender","age","skills"
        ]
        const isUpdateAllowed = Object.keys(data).every((k) => 
            ALLOWED_UPDATES.includes(k)
        );
        if(!isUpdateAllowed) {
            throw new Error("Update not allowed");
        }
        if(data?.skills.length > 10) {
            throw new Error("Skills cannot be more than 10")
        }
        const user = await User.findByIdAndUpdate({_id : userId},data,{
            returnDocument : "after",//return the data after update option is followed
            runValidators : true //to make validators work on update way by which it works correctly on patch also like post
        })
        console.log(user);
        res.send("User updated successfully")
    } catch (err) {
        res.status(400).send("Update failed : " + err.message);
    }
});
//pushing code



//here after connecting database itself the server should start bcoz if server started listening but it is not conected to db then no data will be feteched
connectDB()
.then(() => {
    console.log("Database connection established....");
    app.listen(7777, () => {
        console.log("Server is listening on port 7777.....");
    })
})
.catch ((err) => {
    console.error("Database cannot be connected");
})
