'use strict';
var auth = require('../../auth');
var router = require('express').Router();
module.exports = router;
router.get('/api/v2/survey', auth.pass());
router.get('/api/v2/survey/:surveyId', auth.pass());
router.get('/api/v2/user/:userId/surveyFilling', auth.owner());
router.post('/api/v2/user/:userId/surveyFilling', auth.owner());
router.put('/api/v2/user/:userId/surveyFilling/:fillingId', auth.owner());
