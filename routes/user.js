const express = require('express');
const userControler = require('../controllers/user')
const passwordController = require('../controllers/password')
const mainPagecontroler = require('../controllers/mainPage')
const authController = require('../authentication/user')
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
router.post('/signup',userControler.userSignup);
router.post('/signin',userControler.userSignin);
router.post('/forgotpassword',passwordController.userResetpasswordMail)
router.get('/reset/:forgotId', passwordController.userResetpasswordform)
router.post('/password-reset',passwordController.userResetpassword)
router.post('/post-message',authController.authorization,userControler.saveChatHistory)
router.post('/post-image',authController.authorization,upload.single('image'),userControler.saveChatImages)
router.get('/get-message',authController.authorization,userControler.getUserChatHistory);
router.get('/get-users',authController.authorization,userControler.getAlluser)
router.get('/get-user',authController.authorization,userControler.getcurrentuser)
router.get('/get-messages',userControler.getAllChatHistory);
router.post('/create-group',authController.authorization,userControler.createGroup)
router.post('/update-group',authController.authorization,userControler.updateGroup)
router.get('/get-groups',userControler.getAllgroups)
router.get('/get-mygroups',authController.authorization,userControler.getMygroups)
router.get('/get-group',userControler.getGroupbyId)
router.get('/get-group-messages',userControler.getGroupChatHistory)
router.get('/get-group-members',userControler.getGroupMembersbyId)
router.get('/',mainPagecontroler.getMainpage)
module.exports = router;