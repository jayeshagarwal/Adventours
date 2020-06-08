const User = require('../models/user')
const jwt = require('jsonwebtoken')
const factory = require('./handlerFactory')
const {sendWelcomeEmail} = require('../utils/email')
let multer = require('multer')
const sharp = require('sharp')

// sending jwt as cookies
const cookies = (req)=> {
    const cookieOptions = {
        expires: new Date(Date.now()+ 90*24*60*60*1000),
        httpOnly: true,
        secure: req.secure || req.headers('x-forwarded-proto') === 'https'
    }
    return cookieOptions
}


const signUpUser = async (req,res,next)=> {
    try {
        const user = await User.create(req.body)
        const token = await user.generateToken()
        res.cookie('jwt', token, cookies)
        const url = `${req.protocol}://${req.get('host')}/users/me`;
        await sendWelcomeEmail('welcome', {
            email: user.email,
            name: user.name,
            subject: 'Welcome to the Adventours Family!',
            url
        })
        req.flash('success', 'Signed in Successfully!')
        res.redirect('/tours')
    }
    catch(e)
    {
        req.flash('error', e.message)
        res.redirect('/users/signup')
    }
}

const signUpPage = async(req,res) => {
    res.render('users/signup')
}

// should login users who are active
const loginUser = async (req,res,next)=> {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateToken()
        res.cookie('jwt', token, cookies)
        req.flash('success', "Logged in successfully!")
        res.redirect('/tours')
    }
    catch(e) {
        req.flash('error', e.message)
        res.redirect('/users/login')
    }
}

const loginPage = async(req,res) => {
    res.render('users/login')
}

const forgotPassword = async (req,res,next)=> {
    try {
        const user = await User.findOne({email: req.body.email})
        if(!user)
        {
            throw new Error('user does not exist by this emailId')
        }
        await user.resetToken(req)
        res.send({
            status: 'success',
            message: 'Token sent to email!'
        })
    }
    catch(e)
    {
        res.status(400).send(e.message)
    }
}

const resetPassword = async (req,res,next)=> {
    try {
        const token = req.query.token
        const decoded = jwt.verify(token, process.env.PASSWORD_RESET_KEY)
        const user = await User.findOne({passwordResetToken: token}).select('+password')
        if(!user)
        {
            throw new Error('user does not exist. Please try again!')
        }
        user.password = req.body.password
        user.passwordConfirm = req.body.passwordConfirm
        await user.save()
        user.passwordResetToken = null
        await user.updateOne(user)
        res.send({
            status: 'success'
        })
    }
    catch(e)
    {
        res.status(400).send(e)
    }
}

const updatePassword = async(req,res,next)=> {
    try {
        const user = await req.user.checkPassword(req.body.oldpassword)
        user.password = req.body.password
        user.passwordConfirm = req.body.passwordConfirm
        await user.save()
        const token = await user.generateToken()
        res.cookie('jwt', token, cookieOptions)
        req.flash('success', 'Password has been updated successfully')
        res.redirect('/users/me')
    }
    catch(e)
    {
        req.flash('error', e.message)
        res.redirect('/users/me')
    }
}

const getMe = async(req,res) => {
    res.render('users/me', {user: req.user})
}


const multerStorage = multer.memoryStorage();
const multerFilter = (req,file,cb)=> {
    if(!file.mimetype.startsWith('image')) {
        return cb(new Error('Please upload only images'), false)
    }
    cb(undefined, true)
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})
const uploadUserPhoto = upload.single('photo')

const updateMe = async (req,res,next)=> {
    try {
        const allowedFields = ['name', 'email']
        allowedFields.forEach((el)=> {
            if(req.body[el])
            {
                req.user[el] = req.body[el]
            }
        })
        if(req.file)
        {
            req.file.filename = `user-${req.user._id}.jpeg`
            await sharp(req.file.buffer).resize({width: 250, height: 250}).toFormat('jpeg')
            .jpeg({quality: 90}).toFile(`public/img/users/${req.file.filename}`)
            req.user.photo = req.file.filename
        }
        const id = req.user._id
        delete req.user._id
        const user = await User.findByIdAndUpdate(id, req.user)
        req.flash('success', 'Your data has been sucessfully updated!')
        res.redirect('/users/me')
    }
    catch(e)
    {
        req.flash('error', e.message)
        res.redirect('/users/me')
    }
}

const deleteMe = async (req,res)=> {
    try {
        req.user.active = false
        await User.updateOne(req.user)
        res.redirect('/')
    }
    catch(e)
    {
        res.status(400).send(e)
    }
}

const getAllUsers = factory.getAll(User)
const getUser = factory.getOne(User)
const deleteUser = factory.deleteOne(User)
const updateUser = factory.updateOne(User)

const logoutUser = async (req,res,next)=> {
    try {
        res.cookie('jwt', '', {
            expires: new Date(Date.now() + 10*1000),
            httpOnly: true
        })
        req.flash('success', "Successfully logged out!")
        res.redirect('/tours')
    }
    catch(e) {
        req.flash('error', e.message)
        res.redirect('/tours')
    }
}

module.exports = {
    signUpUser,
    signUpPage,
    loginPage,
    loginUser,
    forgotPassword,
    resetPassword,
    updatePassword,
    getMe,
    updateMe,
    deleteMe,
    getUser,
    getAllUsers,
    updateUser,
    deleteUser,
    logoutUser,
    uploadUserPhoto
}