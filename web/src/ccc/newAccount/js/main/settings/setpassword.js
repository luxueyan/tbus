"use strict";
require('ccc/global/js/modules/cccTab');
var utils = require('ccc/global/js/lib/utils');
var CccOk = require('ccc/global/js/modules/cccOk');
var accountService = require('ccc/newAccount/js/main/service/account').accountService;
var CommonService = require('ccc/global/js/modules/common.js').CommonService;

var setpasswordRactive = new Ractive({
    el: '#ractive-container',
    template: require('ccc/newAccount/partials/settings/setpassword.html'),
    data: {
        step: '0',
        showFundPass: true,
        frontTab: 'fundPass',
        validateCode: {
            canGet: true
        },
        user: null,
        captcha: {
            img: '',
            token: '',
            captcha: ''
        }
    }
});

//登陆原密码判定开始
setpasswordRactive.on('checkcurrentpwd', function () {
    var currentPassword = this.get("currentPassword");
    this.set('isAcessc', false);
    if (!currentPassword) {
        showErrorIndex('showErrorMessagec', 'errorMessagec', '还未填写原密码');
    } else {
        clearErrorIndex('showErrorMessagec', 'errorMessagec');
        this.set('isAcessc', true);
    }
});
setpasswordRactive.on('checknewp', function () {
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
setpasswordRactive.on('checkrepwdConfirm', function () {
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



setpasswordRactive.on("submit-modify-password", function (event) {
    event.original.preventDefault();
    var currentPassword = this.get("currentPassword");
    var newPassword = this.get("newPassword");
    var passwordConfirm = this.get("passwordConfirm");
    setpasswordRactive.fire('checkcurrentpwd');
    setpasswordRactive.fire('checknewp');
    setpasswordRactive.fire('checkrepwdConfirm');

    if (currentPassword === newPassword) {
        return showErrorIndex('showErrorMessaged', 'errorMessaged', '新密码不能与原始密码相同');
    } else if (newPassword !== passwordConfirm) {
        return showErrorIndex('showErrorMessagee', 'errorMessagee', '两次密码不一致');
    }
    var isAcess = this.get('isAcessc') && this.get('isAcessd') && this.get('isAcesse');
    if(isAcess){
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
    }

});
//登陆原密码判定结束

function showError(msg) {
    setpasswordRactive.set({
        showErrorMessage: true,
        errorMessage: msg
    });

    return false;
}

function clearError(msg) {
    setpasswordRactive.set({
        showErrorMessage: false,
        errorMessage: ''
    });
}

function clearErrorIndex(key, msgkey) {
    setpasswordRactive.set(key, false);
    setpasswordRactive.set(msgkey, '');
    return false;
}

function showErrorIndex(key, msgkey, msg) {
    setpasswordRactive.set(key, true);
    setpasswordRactive.set(msgkey, msg);
    return false;
}