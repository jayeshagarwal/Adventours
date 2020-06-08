const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const {sendResetMail} = require('../utils/email')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate: [validator.isEmail, 'Email is invalid!'] 
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6,
    },
    passwordConfirm: {
        type: String,
        required: true,
        validate: {
            validator(value) {
                return this.password === value
            },
            message: 'Password does not match'
        }
    },
    role: {
        type: String,
        enum: ['admin', 'user', 'guide', 'lead-guide'],
        default: 'user'
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    passwordResetToken: String,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
})

// document middleware-> hashing password before saving
userSchema.pre('save', async function(next) {
    const user = this
    if(user.isModified('password'))
    {
        user.password = await bcrypt.hash(user.password, 8) 
        user.passwordConfirm = undefined
    }
    next()
})

// sending tokens to authenticate users
userSchema.methods.generateToken = async function() {
    const user = this
    const token = await jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET_KEY, {
        expiresIn: '90d'
    })
    return token
}

// validating users before logging them in
userSchema.statics.findByCredentials = async (email,password)=> {
    if(!email || !password)
    {
        throw new Error('Please provide correct email and password')
    }
    const user = await User.findOne({email})
    if(!user)
    {
        throw new Error('Invalid Email!')
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch)
    {
        throw new Error("Password don't match")
    }
    return user
}

userSchema.methods.toJSON = function() {
    const user = this
    const userObj = user.toObject()
    delete userObj.password
    delete userObj.__v
    return userObj
}

// sending mail to users for resetting passwords
userSchema.methods.resetToken = async function (req) {
    const user = this
    try {
        const token = jwt.sign({}, process.env.PASSWORD_RESET_KEY, {
            expiresIn: 600
        })
        user.passwordResetToken = token
        await User.updateOne(user) 
        const resetURL = `${req.protocol}://${req.get('host')}/users/resetPassword?token=${token}`
        await sendResetMail("passwordReset", {
            name: user.name,
            email: user.email,
            subject: 'Your password reset token (valid only for 10 min)',
            url: resetURL
        })
    }
    catch(e) {
        user.passwordResetToken = null
        await User.updateOne(user) 
        throw new Error('There was an error sending the mail. Please try again later') 
    }
}

userSchema.methods.checkPassword = async function(password)
{
    const user = this
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
        throw new Error('please provide correct password')
    }
    return user
}

const User = mongoose.model('user', userSchema)
module.exports = User