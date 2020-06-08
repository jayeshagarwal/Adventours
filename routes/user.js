const express = require('express')
const router = express.Router()
const userController = require('../controllers/user')
const {isLoggedIn,userRole} = require('../middlewares/auth')

router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUpUser)
router.get('/login', userController.loginPage)
router.post('/login', userController.loginUser)
router.post('/forgotpassword', userController.forgotPassword)
router.put('/resetpassword', userController.resetPassword)

// routes for user
router.use(isLoggedIn)
router.put('/updatepassword', userController.updatePassword)
router.get('/me', userController.getMe)
router.put('/me', userController.uploadUserPhoto, userController.updateMe)
router.delete('/me', userController.deleteMe)
router.get('/logout', userController.logoutUser)

// routes for admin
router.use(userRole('admin'))
router.get('/', userController.getAllUsers)
router.get('/:id', userController.getUser)
router.put('/:id', userController.updateUser)
router.delete('/:id', userController.deleteUser)

module.exports = router