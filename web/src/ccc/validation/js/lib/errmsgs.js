'use strict';

exports = module.exports = {
    PASSWORD_NULL: '请填写密码,不能为空字符',
    PASSWORD_LENGTH: '请填写至少 6 位密码',
    PASSWORD_AGAIN_NULL: '请填写密码确认',
    PASSWORD_AGAIN_INVALID: '两次输入的密码不一致',
    REPASSWORD_NULL: '请填写密码确认',
    REPASSWORD_INVALID: '两次输入的密码不一致',
    MOBILE_USED: '手机号码已被使用',
    MOBILE_EXISTS: '手机号码已被使用',
    MOBILE_CAPTCHA_NULL: '请填写手机短信验证码',
    MOBILE_CAPTCHA_INVALID: '验证码无效或已过期，请尝试重新发送',
    MOBILE_CAPTCHA_EXPIRED: '验证码过期，请尝试重新发送',
    AGREEMENT_NULL: '注册需先同意服务条款',
    CAPTCHA_NULL: '请填写验证码',
    CAPTCHA_INVALID: '验证码不正确',
    MOBILE_NULL: '请填写手机号码',
    MOBILE_INVALID: '请输入正确的手机号',
    LOGINNAME_EXISTS: '用户名已存在',
    LOGINNAME_STRICT: '2至16位中英文字符、数字或下划线',
    LOGINNAME_NULL: '请填写用户名',
    LOGINNAME_INVALID: '2至16位中英文字符、数字或下划线',
    LOGINNAME_SIZE: '2至16位中英文字符、数字或下划线',
    LOGINNAME_NOT_MOBILE: '用户名不能是手机号（注册后可以用手机号登录）',
    NAME_NULL: '请填写真实姓名',
    NAME_INVALID: '真实姓名错误，应为2-16位中文汉字',
    EMAIL_NULL: '请填写电子邮箱',
    EMAIL_INVALID: '请输入正确的邮箱',
    IDNUMBER_INVALID: '请正确填写 18 位身份证号码',
    LOGIN_INVALID: '手机号或密码错误',
    INVALID_CAPTCHA: '验证码错误',
    LOGINNAME_NOT_MATCH: '手机号码与登录名不匹配',
    INVITATION_INVALID: 'H码无效',
    INVITATION_NULL: 'H码为空',
    PAYMENT_ACCOUNT_CREATE_ERROR: '国政通实名认证校验未通过',
    SMSCAPTCHA_INVALID: '验证码为6位',
    SMSCAPTCHA_NULL: '验证码不能为空',
    INVITECODE_INVALID:'邀请码无效'
};

exports.getFromErrCode = function (errCode) {
    return errCode ? (exports[errCode] || '出错了，请稍后重试') : '';
};
