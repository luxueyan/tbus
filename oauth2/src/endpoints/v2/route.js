// Generated by LiveScript 1.3.1
var auth, ef, cache, router, config;
auth = require('../../auth');
ef = require('../../ef');
cache = require('../../cache');
router = require('express').Router();
module.exports = router;
config = require('config');
router.post('/api/v2/smsCaptcha/:userId', auth.owner());
router.post('/api/v2/checkSMSCaptcha/:userId', auth.owner());
