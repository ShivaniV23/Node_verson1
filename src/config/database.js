

const mongoose = require('mongoose');

const connectDB = async  () => {
    await mongoose.connect(
    "mongodb+srv://NamasteNode:taGyQccF6S1yV1YK@namastenode.xckpe.mongodb.net/devTinder"
    );
}

module.exports = connectDB;



