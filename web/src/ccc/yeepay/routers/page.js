'use strict';
module.exports = function (router) {
    var qs = require('qs');
    var ccBody = require('cc-body');
    var log = require('bunyan-hub-logger')({app: 'web', name: 'yeepay'});
    var config = require('config');
    // post绑卡单独处理
    _.each({
        '/bindCard': '/bindCard',
        '/deleteCard': '/deleteCard'
    }, function (api, fe) {
        router.post(fe, ccBody,
            function (req, res, next) {
                req.body.userId = res.locals.user.id;
                var data = qs.stringify(req.body);
                req.body = data.replace(/%5B\d+%5D/g, '');
                next();
            },
            function (req, res) {
                req.uest.post('/api/v2/yeepay' + api + '/MYSELF')
                    .type('form')
                    .send(req.body)
                    .end()
                    .then(function (r) {
                        if (r.body.success) {
                            var data = {
                                success: r.body.success,
                            };
                            res.json(data);
                        } else {
                            res.json(r.body);
                        }
                    });
            });
    });

	_.each({
	    '/tender': '/tender',
	}, function (api, fe) {
	    router.post(fe, ccBody,
	        function (req, res, next) {
	            req.body.userId = res.locals.user.id;
	            var data = qs.stringify(req.body);
	            req.bodyStr = data.replace(/%5B\d+%5D/g, '');
                console.log(req.bodyStr);
	            next();
	        },
	        function (req, res) {
	            req.uest.post('/api/v2/invest/tender/MYSELF/loan/'+ req.body.loanId)
	                .type('form')
	                .send(req.bodyStr)
	                .end()
	                .then(function (r) {
                        res.json(r.body);
	                });
	        });
	});
	
    _.each({
        '/withdraw': '/withdraw',
    }, function (api, fe) {
        router.post(fe, ccBody,
            function (req, res, next) {
                req.body.userId = res.locals.user.id;
                var data = qs.stringify(req.body);
                req.body = data.replace(/%5B\d+%5D/g, '');
                next();
            },
            function (req, res) {
                console.log(req.body);
                req.uest.post('/api/v2/yeepay' + api + '/MYSELF')
                    .type('form')
                    .send(req.body)
                    .end()
                    .then(function (r) {
                        res.json(r.body);
                    });
            });
    });

	_.each({
	    '/deposit': '/deposit',
	    '/onlineBankDeposit' : '/onlineBankDeposit'
	}, function (api, fe) {
	    router.post(fe, ccBody, function (req, res, next) {
	        log.info({
	            type: 'yeepay'+fe+'/request',
	            req: req,
	            body: req.body
	        });
            //req.body.retUrl = 'http://'+req.connection.remoteAddress+'/newAccount/recharge';
            req.body.retUrl = 'http://718zc.com/newAccount/recharge';
	        var data = qs.stringify(req.body);
	        req.body = data.replace(/%5B\d+%5D/g, '');
	        next();
	    }, function (req, res) {
	        req.uest.post('/api/v2/yeepay' + api + '/MYSELF')
	            .type("form")
	            .send(req.body)
	            .end()
	            .then(function (r) {
	                log.info({
	                    type: 'yeepay'+fe+'/post',
	                    req: req,
	                    body: r.body
	                });
//	                res.render('post', {
//	                    data: r.body
//	                });
                    res.redirect(r.body.message);
	            });
	    });
	});
};

