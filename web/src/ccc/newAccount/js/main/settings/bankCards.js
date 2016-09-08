"use strict";

var utils = require('ccc/global/js/lib/utils');
var Confirm = require('ccc/global/js/modules/cccConfirm');
var accountService = require('ccc/newAccount/js/main/service/account').accountService;
var CccOk = require('ccc/global/js/modules/cccOk');

if (CC.user.account) {
    CC.user.account.Faccount = utils.bankAccount(CC.user.account.account);
}

var banksabled = _.filter(CC.user.bankCards, function (r) {
    return r.deleted === false;
});

var ractive = new Ractive({
    el: "#ractive-container",
    template: require('ccc/newAccount/partials/settings/bankCards.html'),

    data: {
        step1: true,
        step2: false,
        step3: false,
        status: banksabled.length ? 1 : 0,
        payment: CC.user.name ? true : false,
        // banks: banks,
        newbanks: [],
        msg: {
            BANK_NULL: false,
            CARD_NULL: false,
            CARD_INVALID: false,
        },
        bank: '',
        bankAccount: banksabled || [],
        province: '',
        city: '',
    },
    oninit: function () {
        accountService.getUserInfo(function (o) {
            if (o.userInfo.user.idNumber) {
                ractive.set('hasCardO', true);
                ractive.set('idNo', o.userInfo.user.idNumber);
                ractive.set('personal', o.userInfo.user.name);
            } else {
                ractive.set('hasCardO', false);
            }
        });
        $.get('/api/v2/baofoo/getBankConstraints', function (r) {
            if(r.success){
                ractive.set('newbanks', r.data);
                //var o=r.data;
                //for(var i=0;i<o.length;i++){
                //    if(o[i].singleQuota>10000){
                //        o[i].singleQuota = o.singleQuota/10000;
                //        o[i].singleQuotaU = '万';
                //    }else{
                //        o[i].singleQuotaU = '元';
                //    }
                //    if(o[i].dailyQuota>10000){
                //        o[i].dailyQuota = o[i].singleQuota/10000;
                //        o[i].dailyQuotaU = '万';
                //    }else{
                //        o[i].dailyQuotaU = '元';
                //    }
                //}
            }

        });
        $.get('/api/v2/user/MYSELF/authenticates', function (r) {
            ractive.set('authenticates', r);
            if (r.paymentAuthenticated) {
                ractive.set('pwdText', '输入支付密码');
                ractive.set('paymentAuthenticated', r.paymentAuthenticated);
            } else {
                ractive.set('pwdText', '设定支付密码');
            }
        });
    }
});

var accessA = false;
var accessB = false;
var accessC = false;
var accessD = false;
var accessE = false;
//校验表单
ractive.on("validatePersonal", function () {
    var personal = this.get("personal");

    if (personal == '') {
        this.set("personalError", '请输入您的姓名');
        return;
    } else {
        this.set("personalError", false);
        accessA = true;
    }
});

ractive.on("validateIdNo", function () {
    var idNo = this.get("idNo");
    if (!/^(\d{15}$|^\d{18}$|^\d{17}(\d|X|x))$/.test(idNo)) {
        this.set("idNoError", '请输入正确的身份证号');
        return;
    } else {
        this.set("idNoError", false);
        accessB = true;
    }
});
ractive.on("validateCardNo", function () {
    var cardNo = this.get("cardNo");
    if (cardNo == '') {
        this.set("errMessgaeBank", '请输入您的银行卡号');
        return;
    } else if(!/^\d+$/.test(cardNo)){
        this.set("errMessgaeBank", '银行卡号只能是数字');
        return;
    }else {
        this.set("errMessgaeBank", false);
        accessC = true;
    }

});
ractive.on("validatePhoneNo", function () {
    var no = this.get("mobile");
    if (!/^[1][3|5|7|8][0-9]{9}$/.test(no)) {
        this.set("phoneNoError", '请输入正确的手机号');
        return;
    } else {
        this.set("phoneNoError", false);
        accessD = true;
    }
});
ractive.on("validateBankName", function () {
    var no = this.get("bankName");
    if (no == '') {
        this.set("bankNameError", '请选择开户银行');
        return;
    } else {
        this.set("bankNameError", false);
        accessE = true;
    }
});
ractive.on("validatePwd", function () {
    var pwd = this.get("password");
    if (pwd === '') {
        this.set('errMessgaePwd', '请输入支付密码');
        return;
    } else if (pwd.length != 6 || !/^[0-9]*$/g.test(pwd)) {
        this.set('errMessgaePwd', '支付密码为6位纯数字');
        return;
    } else {
        this.set('errMessgaePwd', false);
    }
});
ractive.on("validateRePwd", function () {
    var pwd = this.get("password");
    var rePwd = this.get("repassword");
    if (rePwd === '') {
        this.set('errMessgaeRePwd', '请再次输入支付密码');
        return;
    } else if (pwd !== rePwd) {
        this.set('errMessgaeRePwd', '两次密码输入不一致');
        return;
    } else {
        this.set('errMessgaeRePwd', false);
    }
});

ractive.on("bind-card-submit", function (e) {
    e.original.preventDefault();

    var authenticates = this.get('authenticates');
    var paymentAuthenticated = authenticates.paymentAuthenticated;
    //console.log(paymentAuthenticated);

    var bankName = this.get('bankName');
    var cardNo = this.get('cardNo');
    var idNo = this.get('idNo');
    var personal = this.get('personal');
    var cardPhone = this.get('mobile');
    var smsCaptcha = this.get('smsCaptcha');
    var pwd = this.get('password');
    var rePwd = this.get('repassword');

    //校验表单
    this.fire('validatePersonal');
    this.fire('validateIdNo');
    this.fire('validateCardNo');
    this.fire('validatePhoneNo');
    this.fire('validateBankName');

    if (smsCaptcha === '') {
        this.set('SMS_NULL', '请输入手机验证码');
        return;
    } else {
        this.set('SMS_NULL', false);
    }

    if (pwd === '') {
        this.set('errMessgaePwd', '请输入支付密码');
        return;
    } else if (pwd.length != 6 || !/^[0-9]*$/g.test(pwd)) {
        this.set('errMessgaePwd', '支付密码为6位纯数字');
        return;
    } else {
        this.set('errMessgaePwd', false);
    }

    if (rePwd === '') {
        this.set('errMessgaeRePwd', '请再次输入支付密码');
        return;
    } else if (pwd !== rePwd) {
        this.set('errMessgaeRePwd', '两次密码输入不一致');
        return;
    } else {
        this.set('errMessgaeRePwd', false);
    }


    var sendCard = {
        realName: personal,
        idNumber: idNo,
        accountNumber: cardNo,
        mobile: cardPhone,
        bankName: bankName,
        smsCode: smsCaptcha,
        userId: CC.user.id,
    }
    var msg = {
        SEND_CAPTCHA_FAILED: '验证码发送失败',
        SMSCAPTCHA_IS_NOT_CORRECT: '手机验证码不匹配',
        IDNUMBER_ALREADY_EXISTED: '此身份证号已被注册',
        REGISTER_FAILED: '开户失败',
        CHECK_CARD_FAILED: '验卡失败',
        BIND_CARD_FAILED: '绑卡失败',
        UNKNOWN: '系统繁忙，请稍后重试！',
        ACCESS_DENIED: '登录超时',
        IDNUMBER_EXISTS: '账号已存在',
        SUCCEED: '银行卡绑定成功'
    };

    if (!paymentAuthenticated) {
        accountService.initialPassword(pwd, function (r) {
            if (r.success) {
                $('.btn-box button').text('绑卡中,请稍等...');
                $.post('/api/v2/baofoo/MYSELF/confirmBindCard', sendCard, function (res) { //bindCard
                    if (res.success) {
                        ractive.set('step1', false);
                        ractive.set('step2', true);
                        ractive.set('step3', false);
                    } else {
                        $('.btn-box button').text('绑定');
                        ractive.set('step1', false);
                        ractive.set('step2', false);
                        ractive.set('step3', true);
                        if (res.error[0].message === 'Something is wrong') {
                            msg[res.error[0].message] = '请再次确认您的信息'
                        }
                        ractive.set('failError', msg[res.error[0].message]);
                    }

                });
            } else {
                ractive.set('errMessgaePwd', '支付密码设定失败');
            }
        });
    } else {
        //accountService.checkPassword(pwd, function (r) {
            //if (r) {
                $('.btn-box button').text('绑卡中,请稍等...');
                $.post('/api/v2/baofoo/MYSELF/confirmBindCard', sendCard, function (res) { //bindCard
                    if (res.success) {
                        //console.log(res);

                        ractive.set('step1', false);
                        ractive.set('step2', true);
                        ractive.set('step3', false);
                    } else {
                        $('.btn-box button').text('绑定');
                        if (res.error[0].message === 'SMSCAPTCHA_IS_NOT_CORRECT') {
                            ractive.set('SMS_NULL', '手机验证码错误');
                            return;
                        } else {
                            ractive.set('SMS_NULL', false);
                        }
                        ractive.set('step1', false);
                        ractive.set('step2', false);
                        ractive.set('step3', true);
                        if (res.error[0].message === 'Something is wrong') {
                            msg[res.error[0].message] = '请再次确认您的信息'
                        }
                        ractive.set('failError', res.error[0].message)

                    }

                });
            //} else {
            //    ractive.set('errMessgaePwd', '交易密码错误');
            //}
        //});
    }


});

ractive.on('sendCode', function () {
    var realName = this.get('personal');
    var idNumber = this.get('idNo');
    var accountNumber = this.get('cardNo');
    var cardPhone = this.get('mobile');
    var bankName = this.get('bankName');

    //校验表单
    this.fire('validatePersonal');
    this.fire('validateIdNo');
    this.fire('validateCardNo');
    this.fire('validatePhoneNo');
    this.fire('validateBankName');

    var params = {
        realName: realName,
        idNumber: idNumber,
        accountNumber: accountNumber,
        mobile: cardPhone,
        bankName: bankName
    }

    if (accessA && accessB && accessC && accessD && accessE) {
        $.post('/api/v2/baofoo/MYSELF/preBindCard', params, function (r) {
            if (r.success) {
                ractive.set('hasCardO', true);
                ractive.set('hasCard1', true);
                countDown();
            } else {
                CccOk.create({
                    msg: '信息验证错误，请检查上述四要素是否填写正确!',
                    okText: '确定',
                    ok: function () {
                        $('.ccc-box-overlay').remove();
                        $('.ccc-box-wrap').remove();
                    }
                });
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
            ractive.set('isSend', false);
            $('.sendCode')
                .html(previousText);
            $('.sendCode')
                .removeClass('disabled');
            clearInterval(interval);
        }
    }), 1000);
}

