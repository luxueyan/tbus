// 投资相关

'use strict';

var auth = require('../../auth');
var router = require('express').Router();
module.exports = router;

router.post('/api/v3/invest/tender/:userId', auth.owner());
router.post('/api/v3/invest/user/:userId/creditAssign/invest', auth.owner());