'use strict';
var RegisterRactive = require('../../').RegisterRactive; // 真实项目中就是 require('@ccc/register').RegisterRactive
var errmsgs = require('../../').errmsgs;
var validation = require('../../').validation;
validation.loginName.sync = (function(checkLoginName) {
    return function (value) {
        var errCode = checkLoginName(value);
        if (errCode) {
            return errCode;
        }
        if (value.length < 4 || value.length > 16) {
            return 'LOGINNAME_STRICT';
        }
        return false;
    }
}(validation.loginName.sync));
errmsgs.LOGINNAME_STRICT = '用户名长度为 4~16 个字符';
errmsgs.LOGINNAME_INVALID = '用户名长度为 4~16 个字符';
/* 重写密码强度算法
validation.passwordStrength = function (password) {
    return 0; // 1, 2, 3 based on password
}
*/
var registerRactive = new RegisterRactive({
    el: '#register-container',
    template: require('ccc/register/partials/steps-example2.html'),
});
