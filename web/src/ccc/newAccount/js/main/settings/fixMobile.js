"use strict";
var CommonService = require('ccc/global/js/modules/common').CommonService;
var accountService = require('ccc/newAccount/js/main/service/account').accountService;

var fixMobileRactive = new Ractive({
    el: '#ractive-container',
    template: require('ccc/newAccount/partials/settings/fixMobile.html'),
    data: {
        step1:true,
        step2:false,
        canOldClick:true,
        canNewClick:true
    },
    init:function(){
        request.get('/api/v2/user/MYSELF/userinfo')
            .end()
            .then(function(r){
                fixMobileRactive.set('user', r.body.userInfo.user)
            });
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
    var params = {
        newMobile: mobile,
        smsCaptcha: oldSms,
        newSmsCaptcha:newSms
    }

    fixMobileRactive.fire('checkold');
    fixMobileRactive.fire('checkmobile');
    fixMobileRactive.fire('checknew');

    var isAcess = this.get('isAcessa') && this.get('isAcessb') && this.get('isAcessc');

    if (isAcess) {
        accountService.fixMobile(params, function (r) {
            if (r.success) {
                fixMobileRactive.set('step1',false);
                fixMobileRactive.set('step2',true);
                setTimeout(function(){
                    window.location.href = '/logoutNew';
                },5000);
            }
            else {
                if(r.error[0].type === 'newSmsCaptcha'&&r.error[0].message === 'INVALID_MOBILE_CAPTCHA'){
                    showErrorIndex('showErrorMessagec', 'errorMessagec', '短信验证码错误');
                }else if(r.error[0].type === 'smsCaptcha'&&r.error[0].message === 'INVALID_MOBILE_CAPTCHA'){
                    showErrorIndex('showErrorMessagea', 'errorMessagea', '短信验证码错误');
                }else{
                    clearErrorIndex('showErrorMessagea', 'errorMessagea');
                    clearErrorIndex('showErrorMessagec', 'errorMessagec');
                }
                if(r.error[0].message === 'MOBILE_EXISTS'){
                    showErrorIndex('showErrorMessageb', 'errorMessageb', '该手机号已被注册过');
                }else{
                    clearErrorIndex('showErrorMessageb', 'errorMessageb');
                }
            }
        });
    }
});

fixMobileRactive.on('sendOldCode', function (e) {
    //var pwd = this.get('password');
    //var repwd = this.get('repassword');
    //if (pwd === "" || repwd === "") {
    //    return showErrorIndex('showErrorMessagec', 'errorMessagec', '交易密码不能为空');
    //}
    //if (!this.get('isSend')) {
    //    this.set('isSend',true);
    var that = this;
    if(this.get('canOldClick')){
        this.set('canOldClick',false)
        var smsType = 'CREDITMARKET_RESET_MOBILE';
        CommonService.getMessage(smsType, function (r) {
            if (r.success) {
                //alert('111');
                countDown('sendOldCode',function(){
                    that.set('canOldClick',true)
                });
                //alert('222');
            }
        });
    }
        
    //}
});

fixMobileRactive.on('sendNewCode', function () {
    var mobile = this.get('newMobile');
    var params = {
        mobile: mobile,
        smsType: 'CREDITMARKET_RESET_MOBILE'
    }
    var that = this;
    if(!this.get('canNewClick')){
        return;
    }
    
    if (mobile === "") {
        return showErrorIndex('showErrorMessagec', 'errorMessagec', '请先输入手机号');
    }else{
        clearErrorIndex('showErrorMessagec', 'errorMessagec');
    }
    //if (!this.get('isSend')) {
    //    this.set('isSend', true);
    //    var smsType = 'CREDITMARKET_RESET_MOBILE';
        this.set('canNewClick',false)
        accountService.sendSmsCaptcha(params, function (r) {
            if (r.success) {
                //alert("333");
                countDown('sendNewCode',function(){
                    that.set('canNewClick',true)
                });
            }
        });
    //}
});

function countDown(className,next) {
    $('.'+className).addClass('disabled');
    var previousText = '获取验证码';
    var msg = '$秒后重新发送';

    var left = 60;
    var interval = setInterval((function () {
        if (left > 0) {
            $('.'+className)
                .html(msg.replace('$', left--));
        } else {
            //fixMobileRactive.set('isSend', true);
            $('.'+className)
                .html(previousText);
            $('.'+className)
                .removeClass('disabled');
            //fixMobileRactive.set('isSend', false);
            clearInterval(interval);
           next()
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
