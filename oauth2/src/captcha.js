var exports, db, ref$, ef, exec, hostname, uat, Promise;
db = require('@cc/redis');
ef = require('./ef');
module.exports = function checkCaptcha(token, captcha, cb) {
    var respond, ptt;
    respond = function (success) {
        var result;
        result = {
            data: captcha,
            error: [],
            success: success
        };
        if (!success) {
            result.error.push({
                "message": "INVALID_CAPTCHA",
                "type": "captcha",
                "value": captcha,
                "code": 0
            });
        }
        return cb(null, result);
    };
    ptt = pt(token);
    return bind$(uat, 'then')(function (isUat) {
        if (isUat && (captcha || '').match(/^test/i)) {
            return true;
        }
        return ef(cb, bind$(db, 'get'), ptt, function (json) {
            var ref$, created_at, ttl, answer;
            if (!json) {
                return respond(false);
            }
            ref$ = JSON.parse(json), created_at = ref$.created_at, ttl = ref$.ttl, answer = ref$.answer;
            if (Date.now() > created_at + ttl * 1000 || captcha.toUpperCase() !== answer.toUpperCase()) {
                return respond(false);
            }
            return respond(true);
        });
    });
}
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
