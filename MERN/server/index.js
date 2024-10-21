import express from 'express'
import cors from cors



const app = express()
app.use(cors())
app.use(express.json())
// require('dotenv').config();
app.listen(process.env.PORT, () => {
    console.log(`server is running on port ${process.env.PORT}`)
})