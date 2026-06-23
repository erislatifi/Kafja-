const express = require('express');
const router = express.Router();
const { login, meCurrent, ndryshoFjalekalimin, loginWithPin } = require('../controllers/auth.controller');
const { autentikoUser } = require('../middleware/auth.middleware');

router.post('/login', login);
router.post('/login-pin', loginWithPin);
router.get('/me', autentikoUser, meCurrent);
router.post('/change-password', autentikoUser, ndryshoFjalekalimin);

module.exports = router;
