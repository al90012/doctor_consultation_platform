
const express = require('express')
const mongoose = require('mongoose')
const helmet = require('helmet')
const morgan = require('morgan')
const cors = require('cors')
const bodyParser = require('body-parser')
require('dotenv').config()
require('./config/passport')
const passportLib = require('passport')
const response = require('./middleware/response')



const app = express()

// helmet is a security middleware for Expressjs, It helps to protect your app by settings various HTTP headers
app.use(helmet())

// morgan is just for the logger, jesa ki aap koi api log karte ho, ki hame console ma dekha ga ki hamara ya api successfully log hogya  
// its an HTTP request logger middleware 
app.use(morgan('dev'))

// to handle the issue of cors 
app.use(cors({
  origin: (process.env.ALLOWED_ORIGINS || '').split(',').map(s =>s.trim()).filter(Boolean) || `*`,
  credentials: true
}))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

// used response
app.use(response)


// Initialize passport
app.use(passportLib.initialize())

// MongoDB Connection
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(()=> console.log("MongoDB Connected")).catch((err)=> console.error("MongoDB Connection error:", err))

app.use('/api/auth', require('./routes/auth'))
app.use('api/doctor', require('./routes/doctor'))
app.use('api/patient', require('./routes/patient'))

app.get('/health', (req, res) => res.ok({time: new Date().toISOString()}, 'OK'))

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
