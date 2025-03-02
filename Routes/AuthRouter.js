
//this is AuthRouter.Js

const {signup,login} = require('../Controllers/AuthController');

const { signupValidation } = require('../Middlewares/ValidateMiddleware');

const { loginValidation } = require('../Middlewares/ValidateMiddleware');

const router = require('express').Router();

// router.post('/login',(req, res) =>{

//     res.send('login success');

// });

router.post('/login',loginValidation,login);

router.post('/signup',signupValidation,signup);

module.exports = router;