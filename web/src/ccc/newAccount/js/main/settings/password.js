"use strict";
require('ccc/global/js/modules/cccTab');
var utils = require('ccc/global/js/lib/utils');
var CccOk = require('ccc/global/js/modules/cccOk');
var accountService = require('ccc/newAccount/js/main/service/account').accountService;
var CommonService = require('ccc/global/js/modules/common.js').CommonService;
var banksabled = _.filter(CC.user.bankCards, function (r) {
    return r.deleted === false;
});
var passwordRactive = new Ractive({
    el: '#ractive-container',
    template: require('ccc/newAccount/partials/settings/password.html'),
    data: {
        paymentPasswordHasSet: CC.user.paymentPasswordHasSet || false,
        step: '0',
        showFundPass: true,
        frontTab: 'fundPass',
        validateCode: {
            canGet: true
        },
        bank: banksabled.length ? true : false,
        user: null,
        captcha: {
            img: '',
            token: '',
            captcha: ''
        }
    }
});

passwordRactive.on('checkTab', function (event) {
    var tab = event.node.getAttribute('data-tab');
    this.set('newPassword', '');
    if (tab !== this.get('frontTab')) {
        this.set('frontTab', tab);
        this.set('showFundPass', !this.get('showFundPass'));
        clearError();
    }
    $('.resetfundpass').css('display', 'none');
});


//重置交易密码开始
passwordRactive.on('checkpwd', function () {
    var pwd = this.get('password');
    var rePwd = this.get('repassword');
    this.set('isAcessa', false);
    if (pwd === '') {
        showErrorIndex('showErrorMessagea', 'errorMessagea', '交易密码不能为空');
    } else if (pwd.length < 6 || !/^[0-9]*$/g.test(pwd)) {
        showErrorIndex('showErrorMessagea', 'errorMessagea', '交易密码为6位纯数字');
    } else {
        clearErrorIndex('showErrorMessagea', 'errorMessagea');
        this.set('isAcessa', true);
    }
});
passwordRactive.on('checkrepwd', function () {
    var pwd = this.get('password');
    var rePwd = this.get('repassword');
    this.set('isAcessb', false);
    if (rePwd === '') {
        showErrorIndex('showErrorMessageb', 'errorMessageb', '交易密码不能为空');
    } else if (pwd !== rePwd) {
        showErrorIndex('showErrorMessageb', 'errorMessageb', '两次密码输入不一致');
    } else {
        clearErrorIndex('showErrorMessageb', 'errorMessageb');
        this.set('isAcessb', true);
    }
});


passwordRactive.on('checksms', function () {
    var smsCaptcha = this.get('smsCaptcha');
    this.set('isAcessc', false);
    if (smsCaptcha.length < 6 || smsCaptcha === '' || smsCaptcha.length > 6) {
        showErrorIndex('showErrorMessagec', 'errorMessagec', '短信验证码为6位');
    } else {
        clearErrorIndex('showErrorMessagec', 'errorMessagec');
        this.set('isAcessc', true);
    }
});


passwordRactive.on('sendCode', function () {
    var pwd = this.get('password');
    var repwd = this.get('repassword');
    if (pwd === "" || repwd === "") {
        return showErrorIndex('showErrorMessagec', 'errorMessagec', '交易密码不能为空');
    }
    if (!this.get('isSend')) {
        this.set('isSend', true);
        var smsType = 'CONFIRM_CREDITMARKET_RESET_PAYMENTPASSWORD';
        CommonService.getMessage(smsType, function (r) {
            if (r.success) {
                countDown();
            }
        });
    }
});

function countDown() {
    $('.sendCode')
        .addClass('disabled');
    var previousText = '获取验证码';
    var msg = '$秒后重新发送';

    var left = 60;
    var interval = setInterval((function () {
        if (left > 0) {
            $('.sendCode')
                .html(msg.replace('$', left--));
        } else {
            passwordRactive.set('isSend', true);
            $('.sendCode')
                .html(previousText);
            $('.sendCode')
                .removeClass('disabled');
            passwordRactive.set('isSend', false);
            clearInterval(interval);
        }
    }), 1000);
}
passwordRactive.on('resetPassword', function () {
    var pwd = this.get('password');
    var repwd = this.get('repassword');
    var smsCaptcha = this.get('smsCaptcha');
    passwordRactive.fire('checkpwd');
    passwordRactive.fire('checkrepwd');
    passwordRactive.fire('checksms');
    var isAcess = this.get('isAcessa') && this.get('isAcessb') && this.get('isAcessc');
    if (isAcess) {
        accountService.checkPassword(pwd, function (r) {
            if (r) {
                showErrorIndex('showErrorMessagea', 'errorMessagea', '与原密码相同');
            } else {
                accountService.resetPassword(pwd, smsCaptcha, function (r) {
                    if (r.success) {
                        $('.resetfundpass').css('display', 'block');
                        $('.initialWra').css('display', 'none');
                    } else {
                        showErrorIndex('showErrorMessagec', 'errorMessagec', '短信验证码错误');
                    }
                });
            }
        });
    }

    // }
});
//重置交易密码结束









//初次设置交易密码开始
passwordRactive.on('initialPassword', function () {
    var pwd = this.get('password');
    var rePwd = this.get('repassword');
    passwordRactive.fire('checkpwd');
    passwordRactive.fire('checkrepwd');
    var isAcess = this.get('isAcessa') && this.get('isAcessb');
    if (isAcess) {
        accountService.initialPassword(pwd, function (r) {
            $('.resetfundpass').css('display', 'block');
            $('.initialWra').css('display', 'none');
        });
    }
});

//初次设置交易密码结束

passwordRactive.on('tab', function (event) {
    var step = event.node.getAttribute('data-step');
    passwordRactive.set('step', step);
    clearError();
});

CommonService.getCaptcha(function (res) {
    passwordRactive.set('captcha', {
        img: res.captcha,
        token: res.token,
        text: ''
    });
});

passwordRactive.on('changeCaptcha', function () {
    CommonService.getCaptcha(function (res) {
        passwordRactive.set('captcha', {
            img: res.captcha,
            token: res.token
        });
    });
});

//登陆原密码判定开始
passwordRactive.on('checkcurrentpwd', function () {
    var currentPassword = this.get("currentPassword");
    this.set('isAcessc', false);
    if (!currentPassword) {
        showErrorIndex('showErrorMessagec', 'errorMessagec', '还未填写原密码');
    } else {
        clearErrorIndex('showErrorMessagec', 'errorMessagec');
        this.set('isAcessc', true);
    }
});
passwordRactive.on('checknewp', function () {
    var currentPassword = this.get("currentPassword");
    var newPassword = this.get("newPassword");
    var passwordConfirm = this.get("passwordConfirm");
    this.set('isAcessd', false);    
    var reg = /(?!^[0-9]*$)(?!^[a-zA-Z]*$)^([a-zA-Z0-9]{8,16})$/;   
    if (!newPassword) {
        showErrorIndex('showErrorMessaged', 'errorMessaged', '还未填写新密码');        
    } else if (newPassword.length < 8 || !reg.test(newPassword)) {
        showErrorIndex('showErrorMessaged', 'errorMessaged', '密码需要为至少8位数字字母组合');
    } else if (newPassword.indexOf(" ") >= 0) {
        showErrorIndex('showErrorMessaged', 'errorMessaged', '密码不能为空格');
    } else {
        clearErrorIndex('showErrorMessaged', 'errorMessaged');
        this.set('isAcessd', true);
    }
});
passwordRactive.on('checkrepwdConfirm', function () {
    var currentPassword = this.get("currentPassword");
    var newPassword = this.get("newPassword");
    var passwordConfirm = this.get("passwordConfirm");
    this.set('isAcesse', false);
    if (!passwordConfirm) {
        showErrorIndex('showErrorMessagee', 'errorMessagee', '请重复新密码');
    } else if (newPassword !== passwordConfirm) {
        showErrorIndex('showErrorMessagee', 'errorMessagee', '两次密码不一致');
    } else {
        clearErrorIndex('showErrorMessagee', 'errorMessagee');
        this.set('isAcesse', true);
    }
});

passwordRactive.on("submit-modify-password", function (event) {
    event.original.preventDefault();
    var currentPassword = this.get("currentPassword");
    var newPassword = this.get("newPassword");
    var passwordConfirm = this.get("passwordConfirm");
    passwordRactive.fire('checkcurrentpwd');
    passwordRactive.fire('checknewp');
    passwordRactive.fire('checkrepwdConfirm');

    if (currentPassword === newPassword) {
        return showErrorIndex('showErrorMessaged', 'errorMessaged', '新密码不能与原始密码相同');
    } else if (newPassword !== passwordConfirm) {
        return showErrorIndex('showErrorMessagee', 'errorMessagee', '两次密码不一致');
    }
    request.post("/api/v2/user/MYSELF/change_password")
        .type("form")
        .send({
            currentPassword: currentPassword,
            newPassword: newPassword,
            //                    captcha: captcha
        })
        .end(function (err, res) {
            res = JSON.parse(res.text);

            if (res.success) {
                $('.resetfundpass').css('display', 'block');
                $('.modify-password-wrapper').css('display', 'none');
            }

            return showErrorIndex('showErrorMessagec', 'errorMessagec', '原始密码错误');
        });
    return false;
});
//登陆原密码判定结束

function showError(msg) {
    passwordRactive.set({
        showErrorMessage: true,
        errorMessage: msg
    });

    return false;
}

function clearError(msg) {
    passwordRactive.set({
        showErrorMessage: false,
        errorMessage: ''
    });
}

function clearErrorIndex(key, msgkey) {
    passwordRactive.set(key, false);
    passwordRactive.set(msgkey, '');
    return false;
}

function showErrorIndex(key, msgkey, msg) {
    passwordRactive.set(key, true);
    passwordRactive.set(msgkey, msg);
    return false;
}