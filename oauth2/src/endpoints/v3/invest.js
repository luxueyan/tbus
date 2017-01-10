// 投资相关

'use strict';

var auth = require('../../auth');
var request = require('promisingagent');
var ccBody = require('cc-body');
var marketPrefix = require('config').proxy.market;
var cache = require('../../cache');

var router = require('express').Router();
module.exports = router;

router.post('/api/v3/invest/tender/:userId',
  auth.owner(),
  require('../../investor-limit'),
  ccBody,
  function(req, res, next){
    request
    .post(marketPrefix + req.url)
    .type('form')
    .send(req.body)
    .accept('json')
    .end(function (err, r) {
      if (r.body.success) {
        try {
          // 更新标的缓存 LOAN_LIST
          cache.del('LOAN_LIST');
          cache.del(req.body.loanId + '_LOAN_INVEST_LIST');
        } catch (e) {}
      }
      res.send(r.body);
    });
  });
router.post('/api/v3/invest/user/:userId/creditAssign/invest', auth.owner());
