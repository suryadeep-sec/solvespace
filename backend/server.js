const express = require("express");
const mongoose = require("mongoose");
const errorMiddleware = require("./middleware/errorMiddleware");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./model/config");
const profileRouter = require("./router/profileRouter");
const userRouter = require("./router/userRouter");
const problemRouter = require("./router/problemRouter");
const adminRouter = require("./router/adminRouter");
const submissionRouter = require("./router/submissionRouter");
const studentDashboardRouter = require("./router/studentDashboardRouter");
dotenv.config();

const app = express();
app.use(cors());

app.use(express.json());


app.use("/api/problems", problemRouter);
app.use("/api/users", userRouter);
app.use("/api/profile", profileRouter);
app.use("/api/admin", adminRouter);
app.use("/api/submissions", submissionRouter);
app.use("/api/student/dashboard", studentDashboardRouter);


app.get("/",(req,res)=>{
    res.send("API is running...");
})

// Start server after database connects
const startServer = async () => {
    await connectDB();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};
app.use(errorMiddleware);
startServer();
