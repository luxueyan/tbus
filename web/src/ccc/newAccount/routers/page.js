'use strict';
module.exports = function (router) {

    var ccBody = require('cc-body');
    router.get('/setpassword', function (req, res, next) {
        res.expose(req.query.mobile, 'mobile')
        res.expose(req.query.currentTime, 'currentTime')
        res.expose(req.query.md5key, 'md5key')
        res.render('/newAccount/setpassword');
    });

    // topNav 需要的东西
    router.get('/*', function (req, res, next) {
        if (!res.locals.user || (!res.locals.user.id)) {
            res.redirect('/login');
            return;
        } else {
            // assign user数据
            var user = res.locals.user;
            if (user && user.idNumber) {
                delete user.idNumber;
            }

            res.expose(user, 'user');
            // 检测用户是否登录
            if (!user) {
                next();
            }
            _.assign(res.locals, {
                // 检查手机号
                checkMobile: function () {
                    return !!user.mobile;
                },

                // 检查邮箱
                checkEmail: function () {
                    var email = user.email;
                    if (!email) {
                        return false;
                    }
                    if (email === 'notavailable@qilerong.com') {
                        return false;
                    }
                    return true;
                },

                // 检查是否绑定银行卡
                checkCard: function () {
                    return user.bankCards.length ? true :
                        false;
                },

                // 检查是否开通第三方支付
                checkUmpay: function () {
                    return !!user.name;

                },
                authenticates: req.uest('/api/v2/user/MYSELF/authenticates').end().get('body'),
                isEnterprise: res.locals.user.enterprise,
            });

            // safetyProgress
            var items = ['checkMobile', 'checkEmail', 'checkCard', 'checkUmpay'];
            var avail = items.reduce(function (ret, item) {
                if (res.locals[item]()) {
                    ret += 1;
                }
                return ret;
            }, 0);

            res.locals.safetyProgress = avail / items.length * 100;

            // riskText
            var riskText;
            var percent = res.locals.safetyProgress;
            if (percent <= 25) {
                riskText = '弱';
            } else if (percent > 25 && percent <=
                75) {
                riskText = '中';
            } else {
                riskText = '强';
            }
            res.locals.riskText = riskText;

            // 问候语
            var now = new Date();
            var hours = now.getHours();
            if (6 < hours && hours < 9) {
                res.locals.greetingText = '早上好';
            } else if (9 <= hours && hours < 12) {
                res.locals.greetingText = '上午好';
            } else if (12 <= hours && hours < 13) {
                res.locals.greetingText = '中午好';
            } else if (13 <= hours && hours < 18) {
                res.locals.greetingText = '下午好';
            } else {
                res.locals.greetingText = '晚上好';
            }
        }
        next();
    });

    // 特定页面的
    router.get('/coupon', function (req, res) {
        var paymentPasswordHasSet = req.uest('/api/v2/user/MYSELF/paymentPasswordHasSet').end().get('body');
        res.locals.user.paymentPasswordHasSet = paymentPasswordHasSet;

        res.render('newAccount/coupon', {
            title: '土巴士'
        });
    });
    router.get('/autobid', async function (req, res) {
        var user = res.locals.user;
        var autobidConfig = await req.uest.get('/api/v2/' + user.id + '/autobid_config').end().get('body');
        user.autobidConfig = autobidConfig;
        res.expose(user, 'user');

        res.render('newAccount/autobid', {
            title: '土巴士'
        });
        return false;
    });
    router.get('/assign', function (req, res) {
        res.render('newAccount/assign', {
            title: '土巴士'
        });
    });
    router.get('/invite', function (req, res) {
        var paymentPasswordHasSet = req.uest('/api/v2/user/MYSELF/paymentPasswordHasSet').end().get('body');
        res.locals.user.paymentPasswordHasSet = paymentPasswordHasSet;

        res.render('newAccount/invite', {
            title: '土巴士'
        });
    });
    router.get('/risk', function (req, res) {
        var paymentPasswordHasSet = req.uest('/api/v2/user/MYSELF/paymentPasswordHasSet').end().get('body');
        res.locals.user.paymentPasswordHasSet = paymentPasswordHasSet;

        res.render('newAccount/risk', {
            title: '土巴士'
        });
    });
    //理财师
    router.get('/financial', function (req, res) {
        if (res.locals.user.isMMC) {
            res.render('newAccount/financial', {
                title: '土巴士'
            });
        } else {
            res.redirect('/newAccount/home/index');
        }
    });

    //理财师二级
    router.get('/financial/:userId', function (req, res) {
        if (res.locals.user.isMMC) {
            res.expose(req.params.userId, 'userId');
            res.render('newAccount/financialTwo', {
                title: '土巴士'
            });
        } else {
            res.redirect('/newAccount/home/index');
        }
    });

    router.get('/recharge', async function (req, res) {
        var clientIp = getClientIp(req);
        res.expose(clientIp, 'clientIp');

        var paymentPasswordHasSet = await req.uest('/api/v2/user/MYSELF/paymentPasswordHasSet')
            .end().get('body');
        res.locals.user.paymentPasswordHasSet =
            paymentPasswordHasSet;
        var banks = _.filter(res.locals.user.bankCards, r => r.deleted === false);
        if (!banks.length) {
            res.redirect('/newAccount/settings/bankCards');
        }

        if (!paymentPasswordHasSet) {
            res.redirect('/newAccount/settings/password');
        }

        res.render('newAccount/recharge', {
            title: '土巴士'
        });
        return false;
    });

    router.get('/withdraw', async function (req, res) {
        var paymentPasswordHasSet = await req.uest('/api/v2/user/MYSELF/paymentPasswordHasSet')
            .end().get('body');
        res.locals.user.paymentPasswordHasSet =
            paymentPasswordHasSet;
        var banks = _.filter(res.locals.user.bankCards, r => r.deleted === false);
        if (!banks.length) {
            res.redirect('/newAccount/settings/bankCards');
        }

        if (!paymentPasswordHasSet) {
            res.redirect('/newAccount/settings/password');
        }

        res.render('newAccount/withdraw', {
            title: '土巴士'
        });
        return false;
    });
    router.get('/message', function (req, res) {
        res.render('newAccount/message', {
            title: '土巴士'
        });
    });

    router.get('/userInfo', function (req, res) {
        var paymentPasswordHasSet = req.uest('/api/v2/user/MYSELF/paymentPasswordHasSet').end().get('body');
        res.locals.user.paymentPasswordHasSet = paymentPasswordHasSet;

        res.render('newAccount/userInfo', {
            title: '土巴士'
        });
        return false;
    });

    router.get('/bindingEmail', function (req, res) {
        res.render('newAccount/bindingEmail', {
            title: '土巴士'
        });
    });
    router.get('/invest/*', function (req, res) {
        res.render('newAccount/invest', {
            title: '土巴士'
        });
    });
    router.get('/home/fixed/online', function (req, res) {
        res.render('newAccount/home', {
            tabName: 'online',
        });
    });
    router.get('/home/fixed/offline', function (req, res) {
        res.render('newAccount/home', {
            tabName: 'offline',
        });
    });
    [
        "index",
        "private",
        "float"
    ].forEach(function (tabName) {
        router.get('/home/' + tabName, function (req, res) {
            Promise.join(
                req.uest('/api/v2/user/MYSELF/statistics/invest').end().get('body'),
                req.uest('/api/v2/user/MYSELF/authenticates').end().get('body'),
                req.uest('/api/v2/user/MYSELF/paymentPasswordHasSet').end().get('body'),
                req.uest('/api/v2/user/MYSELF/fundaccountsMap').end().get('body'),
                function (investStatistics, authenticates, paymentPasswordHasSet, fundaccountsMap) {
                    res.locals.user.investStatistics = investStatistics;
                    res.locals.user.authenticates = authenticates;
                    res.locals.user.paymentPasswordHasSet = paymentPasswordHasSet;
                    res.locals.user.fundaccountsMap = fundaccountsMap;
                    res.render('newAccount/home', {
                        tabName: tabName,
                    });
                });
        });

    });

//个人中心
    [
        "bankCards",
        "authentication",
        "password",
        "setpassword",
        "resetPassword",
        "showbank",
        "tradeCards",
        "fixMobile",
    ].forEach(function (tabName) {
        router.get('/settings/' + tabName, function (req, res) {
            Promise.join(
                req.uest(
                    '/api/v2/user/MYSELF/authenticates')
                    .end().get('body'),
                req.uest(
                    '/api/v2/user/MYSELF/paymentPasswordHasSet')
                    .end().get('body'),
                req.uest(
                    '/api/v2/user/MYSELF/fundaccountsMap')
                    .end().get('body'),
                function (authenticates,
                          paymentPasswordHasSet,
                          fundaccountsMap) {
                    res.locals.user.authenticates =
                        authenticates;
                    res.locals.user.paymentPasswordHasSet =
                        paymentPasswordHasSet;
                    res.locals.user.fundaccountsMap =
                        fundaccountsMap;
                    res.render('newAccount/settings', {
                        tabName: tabName,
                    });
                });
        });

    });

    // 资金记录
    router.get('/fund', function (req, res, next) {
        //res.expose(req.params.name, 'loanl.urlname');
        res.render('/newAccount/fund', {
            title: '土巴士'
        });

    });

    // 查看投资人合同
    router.get('/account/invest/allContracts/:id',
        function (req, res, next) {
            res.redirect('/api/v2/user/MYSELF/invest/' + req.params.id + '/contract');
            next();
        });
};


function getClientIp(req) {
    return (req.headers['x-forwarded-for'] || '').split(',')[0] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
}