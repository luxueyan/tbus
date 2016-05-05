"use strict";
require('ccc/global/js/modules/cccTab');
var utils = require('ccc/global/js/lib/utils');
var CccOk = require('ccc/global/js/modules/cccOk');

var CommonService = require('ccc/global/js/modules/common.js').CommonService;
var ractive = new Ractive({
    el: "#ractive-container",
    template: require('ccc/account/partials/settings/index.html'),

    data: {
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

CommonService.getCaptcha(function (res) {
    ractive.set('captcha', {
        img: res.captcha,
        token: res.token,
        text: ''
    });
});

ractive.on('changeCaptcha', function () {
    CommonService.getCaptcha(function (res) {
        ractive.set('captcha', {
            img: res.captcha,
            token: res.token
        });
    });
});
ractive.on("submit-modify-password", function () {
    var currentPassword = this.get("currentPassword");
    var newPassword = this.get("newPassword");
    var passwordConfirm = this.get("passwordConfirm");
    var captcha = this.get("captcha.captcha");
    if (!currentPassword) {
        // 没填就密码
        return showError("还未填写原密码");
    }

    if (!newPassword) {
        // 没填新密码
        return showError("还未填写新密码");
    }

    if (newPassword.length < 6) {
        return showError("密码长度必须大于6位");
    }
    if (!passwordConfirm) {
        // 没重复新密码
        return showError("请重复新密码");
    }

    if (newPassword !== passwordConfirm) {
        return showError("两次密码不一致");
    }

    if (!captcha) {
        return showError('请填写图形验证码');
    }

    CommonService.checkCaptcha(ractive.get('captcha'), function (res) {
        if (res.success) {
            if(currentPassword===newPassword){
                            return showError('新密码不能与原始密码相同');
                    }
            request.post("/account/change_password")
                .type("form")
                .send({
                    currentPassword: currentPassword,
                    newPassword: newPassword,
                    captcha: captcha
                })
                .end(function (err, res) {
                    res = JSON.parse(res.text);

                    if (res.success) {

                        CccOk.create({
                            msg: '恭喜您修改密码成功！',
                            okText: '确定',
                            cancelText: '重新登录',
                            ok: function () {
                                window.location.pathname = "/login";
                            },
                            cancel: function () {
                                window.location.reload();
                            }
                        });

                        return;
                    }

                    var msg = res.message;
                    return showError(msg);
                });
        } else {
            return showError(utils.errorMsg[res.error[0].message]);
        }
    });


    return false;
});

function showError(msg) {
    ractive.set({
        showErrorMessage: true,
        errorMessage: msg
    });

    return false;
}
