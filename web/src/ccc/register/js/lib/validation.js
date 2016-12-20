'use strict';
var validator = require('@ccc/validation').validator;

exports.passwordStrength = validator.passwordStrength;

exports.genAsyncValidator = genAsyncValidator;
function genAsyncValidator(url, field) {
    return function (value, cb) {
        var body = {};
        body[field] = value;
        request('POST', url, {body: body})
            .then(function (r) {
                if (!r.body) {
                    throw new Error;
                }
                cb(r.body.success ? false : r.body.error[0].message);
            })
            .catch(function () {
                cb('UNKNOWN_ERROR');
            });
    };
}

exports.loginName = {
    required: true,
    sync: validator.loginName,
    async: genAsyncValidator('/api/v2/users/check/login_name', 'loginName'),
};

exports.password = {
    required: true,
    sync: validator.password,
};

exports.repassword = {
    required: true,
};

exports.mobile = {
    required: true,
    sync: validator.mobile,
    async: genAsyncValidator('/api/v2/users/check/mobile', 'mobile'),
};

exports.refi = {
    required: false,
    sync: validator.refi,
    async: genAsyncValidator('/api/v2/users/check/inviteCode', 'inviteCode'),
};

exports.refm = {
    required: false,
    sync: function (mobile) {
        var result = validator.mobile(mobile);
        if (result === 'MOBILE_INVALID') {
            return 'REFM_INVALID';
        }
        return false;
    },
    async: (function() {
        var av = genAsyncValidator('/api/v2/users/check/mobile', 'mobile');
        return function (value, cb) {
            av(value, function (result) {
                if (result === false) {
                    cb('REFM_NOT_EXISTS');
                } else if (result === 'MOBILE_INVALID') {
                    cb('REFM_INVALID');
                } else if (result === 'UNKNOWN_ERROR') {
                    cb('UNKNOWN_ERROR');
                }
                cb(false);
            });
        };
    }()),
};

exports.imgCaptcha = {
    required: false,
};

exports.smsCaptcha = {
    required: true,
    sync: validator.smsCaptcha,
    //async: genAsyncValidator('/api/v2/users/smsCaptcha', 'smsCaptcha'),
};

exports.email = {
    required: false,
    sync: validator.email,
    async: genAsyncValidator('/api/v2/users/check/email', 'email'),
};

exports.empReferral = {
    required: false,
    async: genAsyncValidator('/api/v2/users/check/emp_referral', 'empReferral'),
};

exports.agreement = {
    required: true,
};
