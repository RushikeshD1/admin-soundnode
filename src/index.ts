import express from "express"
import dotenv from "dotenv"
import { sql } from "./config/db.js"
import adminRoutes from "./route.js"
import cloudinary from "cloudinary"
import redis from "redis";
import cors from "cors"


dotenv.config()

export const redisClient = redis.createClient({
    password: process.env.Redis_Password as string,
    socket:{
        host: "redis-12950.c305.ap-south-1-1.ec2.cloud.redislabs.com",
        port: 12950
    }
})

redisClient.connect()
    .then(() => {
        console.log("Connected to redis")
    })
    .catch(console.error)

cloudinary.v2.config({
    cloud_name: process.env.CLOUD_NAME as string,
    api_key: process.env.CLOUD_API_KEY as string,
    api_secret: process.env.CLOUD_API_SECERT as string
})

const app = express()
app.use(cors());


app.use(express.json())

async function initDB() {
    try {
        await sql`
        CREATE TABLE IF NOT EXISTS albums(
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description VARCHAR(255) NOT NULL,
            thumbnail VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        `

        await sql`
        CREATE TABLE IF NOT EXISTS songs(
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description VARCHAR(255) NOT NULL,
            thumbnail VARCHAR(255),
            audio VARCHAR(255) NOT NULL,
            album_id INTEGER REFERENCES albums(id) ON DELETE SET NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        `

        console.log("Database initialized successfully!")
    } catch (error) {
        console.log("Error initDb", error);        
    }
}


app.use("/api/v1", adminRoutes)

const port = process.env.PORT

initDB().then(() => {
    app.listen(port, () => {
        console.log(`Server running at port ${port}`)
    })
})
