// 宝付相关

'use strict';

var auth = require('../../auth');
var router = require('express').Router();
module.exports = router;

router.post('/api/v3/baofoo/:userId/preBindCard', auth.owner());
router.post('/api/v3/baofoo/:userId/confirmBindCard', auth.owner());
router.post('/api/v3/baofoo/cancelBindCard', auth.user());
router.post('/api/v3/baofoo/charge', auth.user());