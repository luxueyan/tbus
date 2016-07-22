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
        status: banksabled.length ? 1 : 0,
        payment: CC.user.name ? true : false,
        // banks: banks,
        newbanks:[],
        msg: {
            BANK_NULL: false,
            CARD_NULL: false,
            CARD_INVALID: false,
        },
        bank: '',
        bankAccount: banksabled || [],
        province: '',
        city: '',
        mobile: CC.user.mobile,
        realName: CC.user.name,
        paymentPasswordHasSet: CC.user.paymentPasswordHasSet
    },
    oninit: function () {
        accountService.getUserInfo(function (o) {
            ractive.set('realName', o.userInfo.user.name);
        });
        $.get('/api/v2/hundsun/banks',function(r){
          ractive.set('newbanks',r);
        });
        $.get('/api/v2/user/MYSELF', function (m) {
            if (m.idNumber) {
                ractive.set('hasCardO',true);
                ractive.set('idNo',m.idNumber);
                ractive.set('personal',m.name);
            }else{
                ractive.set('hasCardO',false);
            }
        })
    }
});

//校验表单
//ractive.on("validateCardNo", function () {
//    var no = this.get("cardNo");
//    if(no == ''){
//        this.set("errMessgaeBank", '银行账户不能为空');
//    }else if (!/^\d*$/.test(no)) {
//        this.set("errMessgaeBank", '银行卡号只能由数字组成');
//    } else {
//        this.set("errMessgaeBank", '');
//    }
//});
//ractive.on("validateIdNo", function () {
//    var no = this.get("idNo");
//    if (!/^(\d{15}$|^\d{18}$|^\d{17}(\d|X|x))$/.test(no)) {
//        this.set("idNoError", true);
//    } else {
//        this.set("idNoError", false);
//    }
//});
//ractive.on("validatePhoneNo", function () {
//    var no = this.get("mobile");
//    if (!/^\d*$/.test(no)) {
//        this.set("phoneNoError", true);
//    } else {
//        this.set("phoneNoError", false);
//    }
//});
//ractive.on("validateCaptcha", function () {
//    var no = this.get("smsCaptcha");
//    if (no === '') {
//        this.set('SMS_NULL', true);
//    } else {
//        this.set('SMS_NULL', false);
//    };
//});

ractive.on("bind-card-submit", function (e) {
    e.original.preventDefault();
    
    var bankName = this.get('bankName');
    var cardNo = this.get('cardNo');
    var idNo = this.get('idNo');
    var personal=this.get('personal');
    var cardPhone = this.get('mobile');
    var smsCaptcha = this.get('smsCaptcha');
    var pwd = this.get('password');
    var rePwd = this.get('repassword');

    //校验表单
    if(personal == ''){
        this.set("personalError", '请输入您的姓名');
        return;
    }else{
        this.set("personalError", false);
    };

    if (!/^(\d{15}$|^\d{18}$|^\d{17}(\d|X|x))$/.test(idNo)) {
        this.set("idNoError", '请输入正确的身份证号');
        return;
    } else {
        this.set("idNoError", false);
    };

    if(cardNo==''){
        this.set("errMessgaeBank", '请输入您的银行卡号');
    }else{
        this.set("errMessgaeBank", false);
    };

    if (smsCaptcha === '') {
        this.set('SMS_NULL', '请输入手机验证码');
    } else {
        this.set('SMS_NULL', false);
    };

    if (pwd === '') {
        this.set('errMessgaePwd', '请输入支付密码');
    } else if(pwd.length < 6 || !/^[0-9]*$/g.test(pwd)){
        this.set('errMessgaePwd', '交易密码为6位纯数字');
        return;
    }else{
        this.set('errMessgaePwd', false);
    };

    if (rePwd === '') {
        this.set('errMessgaeRePwd', '请再次输入支付密码');
        return;
    } else if (pwd !== rePwd) {
        this.set('errMessgaeRePwd', '两次密码输入不一致');
        return;
    } else {
        this.set('errMessgaeRePwd', false);
    }

    var sendCard={
        userId:CC.user.id,
        accountNumber:cardNo,
        mobile:cardPhone,
        idCardNumber:idNo,
        name:personal,
        smsCaptcha:smsCaptcha
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
        SUCCEED: '银行卡绑定成功'
    };
    accountService.initialPassword(pwd, function (r) {
        if(r.success){
            $('.btn-box button').text('绑卡中,请稍等...');
            $.post('/api/v2/user/checkBankcard', sendCard, function (res) { //bindCard
                if(res.success){
                    //console.log(res);

                    ractive.set('step1',false);
                    ractive.set('step2',true);
                    ractive.on('close',function(){
                        window.location.href = "/newAccount/home";
                    });
                }else{
                    $('.btn-box button').text('绑定');
                    if(res.error[0].message === 'Something is wrong'){
                        msg[res.error[0].message] = '请再次确认您的信息'
                    }
                    CccOk.create({
                        msg: '绑卡失败, '+msg[res.error[0].message],
                        okText: '确定',
                        ok: function () {
                            $('.ccc-box-overlay').remove();
                            $('.ccc-box-wrap').remove();
                        }
                    });
                }

            });
        }else{
            CccOk.create({
                msg: r.error[0].message,
                okText: '确定',
                ok: function () {
                    $('.ccc-box-overlay').remove();
                    $('.ccc-box-wrap').remove();
                }
            });
        }
    });


});

ractive.on('sendCode', function (){
    var cardPhone = this.get('mobile');

    if (!('' + cardPhone).match(/^1\d{10}$/) || cardPhone=='') {
        CccOk.create({
            msg: '请填写正确的手机号',
            okText: '确定',
            ok: function () {
                $('.ccc-box-overlay').remove();
                $('.ccc-box-wrap').remove();
            }
        });
        return false;
    }
    
    if (!this.get('isSend')) {
        this.set('isSend', true);
        $.get('/api/v2/hundsun/checkCard/sendSmsCaptcha/'+cardPhone,function(r){
            if (r.success) {
                countDown();
            }
        });
    };
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

