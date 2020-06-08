const express = require('express')
require('./db/mongoose')
const methodOverride = require('method-override')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const compression = require('compression')
const flash = require('connect-flash')
const expressSession = require('express-session')
const {checkUser} = require('./middlewares/auth')
const userRoutes = require('./routes/user')
const tourRoutes = require('./routes/tour')
const app = express()

app.enable('trust proxy')

// using express session to use flash
app.use(expressSession({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(flash())

app.use(methodOverride('_method'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.json())
app.use(cookieParser())
app.set('view engine', 'ejs')
app.use(express.static(__dirname+'/public'))

// securing http headers, preventing xss & CSRF attacks
app.use(helmet())
app.use(mongoSanitize())
app.use(xss())
app.use(hpp({
    whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'difficulty', 'price', 'maxGroupSize']
}))
app.use(compression())

// preventing brute force attacks
const limiter = rateLimit({
    max: 100,
    windowMs: 60*60*1000,
    message: 'Too many requests from this IP, please try again in an hour' 
})
app.use('/',limiter)

app.use(checkUser)

app.use('/tours', tourRoutes)
app.use('/users', userRoutes)

app.get('/', (req,res)=> {
    res.render('index')
})

app.get('*', (req,res)=> {
    res.status(404).send({
        status: 'fail',
        message: `Can't find ${req.originalUrl} on this server`
    })
})

const port = process.env.PORT || 3000
const server = app.listen(port, ()=> {
    console.log(`server has been started on ${port}`)
})

// heroku send sigterm signals every 24 hours
process.on('SIGTERM', ()=> {
    console.log('SIGTERM received. Shutting down gracefully!')
    server.close(()=> {
        console.log('Process terminated!')
    })
})