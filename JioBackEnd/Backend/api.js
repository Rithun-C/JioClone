const express = require("express")
const app = express();
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const cookieParser = require("cookie-parser")
dotenv.config()
const cors = require('cors');

/*  Mongodb connection link via link */ 
const dbLink = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.yjqma.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

/*  connecting it to the code via library called mongoose*/ 
mongoose.connect(dbLink).then(function(connection){
    console.log("connected to db")
}).catch(err => console.log(err))

const corsConfig = {
    origin: true,
    credentials: true,
};
app.use(cors(corsConfig));
app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/authRouter")
const userRouter = require("./routes/userRouter")
const movieRouter = require("./routes/movieRouter")
const discoverRouter = require("./routes/discoverRouter")
const tvRouter = require("./routes/tvRouter")
const payementRouter = require("./routes/paymentRouter")
const streamRouter = require("./routes/streamingRouter")



app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/movies",movieRouter)
app.use("/api/discover", discoverRouter);
app.use("/api/tv", tvRouter);
app.use("/api/payemnt",payementRouter)
app.use("/api/streaming", streamRouter);

app.listen(3010,function(){
    console.log("server started in port 3010");
})