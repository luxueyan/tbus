var router, exports, url, http, errto, bodyParser, apiPass, db, ref$, auth, sn, crypt, ef, concat, workerPrefix, env, Promise, exec, hostname, uat;
router = require('express').Router();
exports = module.exports = router;
url = require('url');
http = require('http');
errto = require('errto');
bodyParser = require('body-parser');
apiPass = require('api-pass');
db = require('@cc/redis');
auth = require('../../auth');
sn = require('../../sn');
crypt = require('../../crypt');
ef = require('../../ef');
concat = require("concat-stream");
workerPrefix = require('config').proxy.worker;
env = process.env.NODE_ENV || 'development';
var checkCaptcha = require('../../captcha');
if (env === 'test' || env === 'test-cov') {
    exports.lastCaptcha = null;
}
router.get('/api/v2/captcha', function (req, res, next) {
    var uri;
    res.set('Content-Type', 'application/json; charset=utf-8');
    uri = url.parse(workerPrefix + "/captcha");
    return http.request(uri, function (response) {
        return response.pipe(concat(function (data) {
            var token, answer, ttl, created_at, captcha, resObj, saveObj;
            token = response.headers['x-captcha-token'];
            answer = response.headers['x-captcha-answer'];
            ttl = parseInt(req.query.ttl, 10);
            if (!(ttl > 0)) {
                ttl = 1800;
            }
            created_at = Date.now();
            captcha = "data:image/png;base64," + data.toString("base64");
            resObj = {
                created_at: created_at,
                ttl: ttl,
                token: token,
                captcha: captcha
            };
            saveObj = {
                created_at: created_at,
                ttl: ttl,
                answer: answer
            };
            return ef(next, bind$(db, 'setex'), pt(token), ttl, JSON.stringify(saveObj), function () {
                if (env === 'test' || env === 'test-cov') {
                    exports.lastCaptcha = {
                        token: token,
                        answer: answer
                    };
                    console.log(exports.lastCaptcha);
                }
                return res.json(resObj);
            });
        }));
    }).end();
});
router.get('/api/v2/captcha.png', sn(function (req) {
    req.headers = {
        host: req.headers.host
    };
    req.url = '/captcha';
    return req.apiPass = true;
}), apiPass(workerPrefix, {
    onresponse: function (response, res) {
        var token, ttl, answer, created_at, saveObj;
        token = response.headers['x-captcha-token'];
        ttl = parseInt(res.req.query.ttl, 10);
        if (!(ttl > 0)) {
            ttl = 1800;
        }
        answer = response.headers['x-captcha-answer'];
        delete response.headers['x-captcha-answer'];
        res.cookie('captcha-token', token, {
            maxAge: ttl * 1000
        });
        created_at = Date.now();
        saveObj = {
            created_at: created_at,
            ttl: ttl,
            answer: answer
        };
        db.setex(pt(token), ttl, JSON.stringify(saveObj));
    }
}));
router.post('/api/v2/captcha', bodyParser.json(), bodyParser.urlencoded({
    extended: true
}), function (req, res, next) {
    var captcha, token;
    res.set('Content-Type', 'application/json; charset=utf-8');
    captcha = req.body.captcha;
    token = req.query.token;
    return ef(next, checkCaptcha, token, captcha, function (result) {
        if (result.success && req.query.invalidate) {
            db.del(pt(token));
        }
        return res.send(result);
    });
});

/*
// 关闭该部分的验证码校验，改成在router里直接用middlewares.captchaRequired来选择性校验
router.use(function (req, res, next) {
    var captcha, token;
    captcha = req.query.captcha_answer;
    token = req.query.captcha_token;
    if (!token) {
        return next();
    }
    return ef(next, checkCaptcha, token, captcha, function (result) {
        if (result.success) {
            if (req.query.invalidate) {
                db.del(pt(token));
            }
            return next();
        } else {
            return res.send(result);
        }
    });
});
*/
function pt(token) {
    return 'captcha_token:' + token;
}
Promise = require('bluebird');
exec = Promise.promisify(require('child_process').exec);
hostname = exec('hostname').then(function (hostname) {
    return hostname[0].trim();
}, function () {
    return '';
});
uat = hostname.then(function (hn) {
    return hn.match(/uat$/i);
});
function bind$(obj, key, target) {
    return function () { return (target || obj)[key].apply(obj, arguments) };
}
