// middlewares

var db = require('@cc/redis');
var conext = require('conext');
ef = require('../ef');
var checkCaptcha = require('../captcha');

// 图形验证码校验
exports.captchaRequired = conext(function *(req, res, next) {
    res.set('Content-Type', 'application/json; charset=utf-8');
    if (!req.query.captcha_token) {
        res.status(403);
        res.json({
            data: null,
            error: [{
                "message": "IMG_CAPTCHA_REQUIRED",
                "type": "captcha",
                "value": null,
                "code": 0
            }],
            success: false
        });
        return;
    }
    var token = req.query.captcha_token;
    var captcha = req.query.captcha_answer;

    return ef(next, checkCaptcha, token, captcha, function (result) {
        if (result.success) {
            db.del(pt(token), next);
        } else {
            res.status(400);
            return res.send(result);
        }
    });
});
function pt(token) {
    return 'captcha_token:' + token;
}