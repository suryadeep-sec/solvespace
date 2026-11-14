const mongoose = require("mongoose");
const User = require("./models/userModel");

const testUser = async () => {
    try {

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB Connected");

        // Create a new user
        const user = await User.create({
            name: "Test Student",
            email: "test@gmail.com",
            password: "mypassword123"
        });

        console.log("User Created Successfully");
        console.log(user);

    } catch (error) {

        console.log("Error:", error.message);

    } finally {

        await mongoose.disconnect();
    }
};

require("dotenv").config();

testUser();
