import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"


const app = express()

app.use(cors({  // .use is for middlewares
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))   

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true}))
app.use(express.static("public"))
app.use(cookieParser())

//routes
import proReshape from './routes/proreshape.routes.js'


//routes declaration
app.use("/api/v1/rewriter", proReshape)


export { app }