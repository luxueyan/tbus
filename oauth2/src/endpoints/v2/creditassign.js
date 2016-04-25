'use strict';

var router = require('express').Router();
var auth = require('../../auth');

module.exports = router;

// 债权转让相关
router.post('/api/v2/creditassign/create/:userId/:investId/:creditDealRate', auth.user());
router.get('/api/v2/creditassign/listForCreditAssign/:userId', auth.user())
router.get('/api/v2/creditassign/list', auth.pass())
router.get('/api/v2/creditassign/creditAssignDetail/:creditassignId', auth.pass())
router.post('/api/v2/creditassign/cancel/:creditAssignId', auth.user())
router.post('/api/v2/creditassign/autoAssign/:userId', auth.user())
