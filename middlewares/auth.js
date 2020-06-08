const jwt  = require('jsonwebtoken')
const User = require('../models/user')

// errors
// provide incorrect token with bearer -> jsonwebtokenerror
// provide expired token -> tokenexpirederror
// doesn't provide token or provide token without bearer
// provide token which is not expired but can provide token after logout 

const isLoggedIn = async(req,res,next) => {
    try {
        // if(req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
        // {
        //     token = req.header('Authorization').replace('Bearer ', '')
        // }
        if(req.cookies.jwt)
        {
            token = req.cookies.jwt
        }
        else 
        {
            throw new Error('Please provide correct token')
        }
        const decoded = jwt.verify(token, 'thisisawesomeproject')
        const user = await User.findById(decoded._id)
        if(!user)
        {
            throw new Error("user doesn't exist")
        }
        req.user = user
        next()
    }
    catch(e)
    {
        res.status(400).send(e.message)
    }
}

const checkUser =  async(req,res,next)=> {
    res.locals.currentUser = null
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    if(req.cookies.jwt) {
        const decoded = jwt.verify(req.cookies.jwt, 'thisisawesomeproject')
        const user = await User.findById(decoded._id)
        res.locals.currentUser = user            
    }
    next()
}

const userRole = (...roles)=> {
    return (req,res,next)=> {
        try {
            if(!roles.includes(req.user.role))
            {
                throw new Error("You don't have permission to do that")
            }
            next()
        }
        catch(e) {
            res.status(400).send(e.message)
        }
    }
}

module.exports = {
    isLoggedIn,
    userRole,
    checkUser
}
