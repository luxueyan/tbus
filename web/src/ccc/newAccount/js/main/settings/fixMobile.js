"use strict";
var CommonService = require('ccc/global/js/modules/common').CommonService;
var accountService = require('ccc/newAccount/js/main/service/account').accountService;

var fixMobileRactive = new Ractive({
    el: '#ractive-container',
    template: require('ccc/newAccount/partials/settings/fixMobile.html'),
    data: {
        user:CC.user,
    }
});
fixMobileRactive.on('checkold', function () {
    var oldSms = this.get('oldSmsCaptcha');
    this.set('isAcessa', false);
    if (oldSms.length < 6 || oldSms === '') {
        showErrorIndex('showErrorMessagea', 'errorMessagea', '短信验证码为6位');
    }
    else {
        clearErrorIndex('showErrorMessagea', 'errorMessagea');
        this.set('isAcessa', true);
    }
});


fixMobileRactive.on('checkmobile', function () {
    var mobile = this.get('newMobile');
    this.set('isAcessb', false);
    if (mobile === '') {
        showErrorIndex('showErrorMessageb', 'errorMessageb', '手机号码不能为空');
    } else if (!/^[1][3|5|7|8][0-9]{9}$/.test(mobile)) {
        showErrorIndex('showErrorMessageb', 'errorMessageb', '请输入正确的手机号码');
    } else {
        clearErrorIndex('showErrorMessageb', 'errorMessageb');
        this.set('isAcessb', true);
    }
});
fixMobileRactive.on('checknew', function () {
    var newSms = this.get('newSmsCaptcha');
    this.set('isAcessc', false);
    if (newSms.length < 6 || newSms === '') {
        showErrorIndex('showErrorMessagec', 'errorMessagec', '短信验证码为6位');
    } else {
        clearErrorIndex('showErrorMessagec', 'errorMessagec');
        this.set('isAcessc', true);
    }
});
fixMobileRactive.on('fixMobile', function () {
    var oldSms = this.get('oldSmsCaptcha');
    var mobile = this.get('newMobile');
    var newSms = this.get('newSmsCaptcha');

    fixMobileRactive.fire('checkold');
    fixMobileRactive.fire('checkmobile');
    fixMobileRactive.fire('checknew');

    var isAcess = this.get('isAcessa') && this.get('isAcessb') && this.get('isAcessc');

    if (isAcess) {
        accountService.fixMobile(mobile, function (r) {
            if (r.success) {
                CccOk.create({
                    msg: '手机号修改成功！',
                    okText: '确定',
                    ok: function () {
                        window.location.href = "/newAccount/settings/home";
                    },
                    cancel: function () {
                        window.location.reload();
                    }
                });
                return;
            }
            else {
                showErrorIndex('showErrorMessagec', 'errorMessagec', '短信验证码错误');
            }
        });
    }
});

fixMobileRactive.on('sendOldCode', function () {
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
                countDown(sendOldCode);
            }
        });
    }
});

fixMobileRactive.on('sendNewCode', function () {
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
                countDown1();
            }
        });
    }
});

function countDown(className) {
    $('.'+className)
        .addClass('disabled');
    var previousText = '获取验证码';
    var msg = '$秒后重新发送';

    var left = 60;
    var interval = setInterval((function () {
        if (left > 0) {
            $('.'+className)
                .html(msg.replace('$', left--));
        } else {
            fixMobileRactive.set('isSend', true);
            $('.'+className)
                .html(previousText);
            $('.'+className)
                .removeClass('disabled');
            fixMobileRactive.set('isSend', false);
            clearInterval(interval);
        }
    }), 1000);
}

function countDown1() {
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
            fixMobileRactive.set('isSend', true);
            $('.sendCode')
                .html(previousText);
            $('.sendCode')
                .removeClass('disabled');
            fixMobileRactive.set('isSend', false);
            clearInterval(interval);
        }
    }), 1000);
}
function clearErrorIndex(key, msgkey) {
    fixMobileRactive.set(key, false);
    fixMobileRactive.set(msgkey, '');
    return false;
}
function showErrorIndex(key, msgkey, msg) {
    fixMobileRactive.set(key, true);
    fixMobileRactive.set(msgkey, msg);
    return false;
}
