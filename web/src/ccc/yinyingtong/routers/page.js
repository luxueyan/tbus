'use strict';
module.exports = function (router) {
    var qs = require('qs');
    var ccBody = require('cc-body');
    var log = require('bunyan-hub-logger')({app: 'web', name: 'yinyingtong'});
    var config = require('config');

	_.each({
	    '/onlineBankDeposit' : '/onlineBankDeposit'
	}, function (api, fe) {
	    router.post(fe, ccBody, function (req, res, next) {
	        log.info({
	            type: 'yinyingtong'+fe+'/request',
	            req: req,
	            body: req.body
	        });
	        var data = qs.stringify(req.body);
	        req.body = data.replace(/%5B\d+%5D/g, '');
	        next();
	    }, function (req, res) {

	        req.uest.post('/api/v2/yinyingtong' + api + '/MYSELF')
	            .type("form")
	            .send(req.body)
	            .end()
	            .then(function (r) {
	                log.info({
	                    type: 'yinyingtong'+fe+'/post',
	                    req: req,
	                    body: r.body
	                });
	                res.render('post', {
	                    data: r.body
	                });
	            });
	    });
	});
};
