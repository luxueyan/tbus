'use strict';

exports.sendSmsCaptcha = function (mobile) {
    return request('GET', '/api/v2/users/smsCaptcha?mobile=' + mobile).end().get('body');
}

exports.sendVoiceCaptcha = function (mobile) {
    return request('GET', '/api/v2/users/smsVoiceCaptcha?mobile=' + mobile).end().get('body');
}

exports.imgCaptcha = function () {
    return request('/api/v2/captcha', {query: {v: (new Date).valueOf()}}).end().get('body');
}

exports.smsCaptcha = function (token, captcha, mobile) {
    return request(CC.registerSmsCaptchaApi || '/register/ajax/smsCaptcha', {
        query: {
            captcha_token: token,
            captcha_answer: captcha,
            mobile: mobile,
        },
    }).end().get('body');
}

exports.voiceCaptcha = function (token, captcha, mobile) {
    return request(CC.registerVoiceCaptchaApi || '/register/ajax/voiceCaptcha', {
        query: {
            captcha_token: token,
            captcha_answer: captcha,
            mobile: mobile,
        },
    }).end().get('body');
}

exports.register = function (user) {
    return request('POST', CC.registerSubmit || '/register/ajax/submit', {
        body: user
    }).end().get('body');
}
