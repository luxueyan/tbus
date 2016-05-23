"use strict";

var utils = require('ccc/global/js/lib/utils');
// var LLPBANKS = require('ccc/global/js/modules/cccUmpBanks');
var Confirm = require('ccc/global/js/modules/cccConfirm');
var accountService = require('ccc/newAccount/js/main/service/account').accountService;
var CommonService = require('ccc/global/js/modules/common').CommonService;
var CccOk = require('ccc/global/js/modules/cccOk');
// 过滤银行卡，只显示enabled=true的
// var banks = _.filter(LLPBANKS, function (r) {
//     return r.enable === true;
// });

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
        ifDel: false,
        mobile: CC.user.mobile,
        realName: CC.user.name,
        isAuditing : CC.user.fundaccountsMap.data.auditingList.length > 0 ? true : false,
        authenticated: CC.user.authenticates.idauthenticated || false,
        paymentPasswordHasSet: CC.user.paymentPasswordHasSet
    },
    oninit: function () {
        accountService.getUserInfo(function (o) {
            ractive.set('realName', o.user.name);
        });
        $.get('/api/v2/hundsun/banks',function(r){
          ractive.set('newbanks',r);
        });
    }
});

ractive.on("validateCardNo", function () {
    var no = this.get("cardNo");
    if (!/^\d*$/.test(no)||no=='') {
        this.set("cardNoError", true);
    } else {
        this.set("cardNoError", false);
    }
});
ractive.on("validateIdNo", function () {
    var no = this.get("idNo");
    if (!/^(\d{15}$|^\d{18}$|^\d{17}(\d|X|x))$/.test(no)) {
        this.set("idNoError", true);
    } else {
        this.set("idNoError", false);
    }
});


ractive.on('checkSmsCaptcha', function () {
    var smsCaptcha = this.get('smsCaptcha');
    if (smsCaptcha === '') {
        this.set('SMS_NULL', true);
    } else {
        this.set('SMS_NULL', false);
    }
});

ractive.on("validatePhoneNo", function () {
    var no = this.get("phoneNo");
    if (!/^\d*$/.test(no)) {
        this.set("phoneNoError", true);
    } else {
        this.set("phoneNoError", false);
    }
});

ractive.on('doDel', function () {
    this.set('ifDel',true);
});

ractive.on("bind-card-submit", function (e) {
    e.original.preventDefault();
    var cardNoError = this.get("cardNoError");
    var idNoError = this.get("idNoError");
    var phoneNoError = this.get("phoneNoError");
    var SMS_NULL = this.get('SMS_NULL');
    if (cardNoError || phoneNoError || idNoError||SMS_NULL) {
        return false;
    }
    var bankName = this.get('bankName');
    var cardNo = this.get('cardNo');
    var idNo = this.get('idNo');
    var personal=this.get('personal');
    var cardPhone = this.get('mobile');
    var smsCaptcha = this.get('smsCaptcha');


    var sendObj = {
        bankCode: bankName,
        cardNo: cardNo,
        cardPhone: cardPhone,
        smsCaptcha: smsCaptcha
    }
    var sendName={
      idNumber:idNo,
      name:personal
    }
    var sendCard={
       bankCode:bankName,
       cardNo:cardNo,
       cardPhone:cardPhone,
       idNumber:idNo,
       name:personal
    }
    $.get('/api/v2/user/MYSELF',function(r){
      if(!r.priv){
        $.post('/api/v2/hundsun/register/MYSELF',sendName,function(){
        })
      }else{
        $.post('/api/v2/hundsun/checkCard/MYSELF',sendCard,function(r){
          if(r.success){
            $.post('/api/v2/hundsun/bindCard/MYSELF', sendObj, function (r) {
                if(r.success) {
                  window.location.reload();
                  // $('.bind-card-wrapper').css('display','none');
                  // $('.binded-card-wrapper').css('display','block');
                    // CccOk.create({
                    //     msg: '绑卡成功',
                    //     okText: '确定',
                    //     ok: function () {
                    //         window.location.reload();
                    //     },
                    //     cancel: function () {
                    //         window.location.reload();
                    //     }
                    // });
                } else {
                    CccOk.create({
                        msg: '绑卡失败，' + r.error[0].message,
                        okText: '确定',
                        ok: function () {
                            window.location.reload();
                        },
                        cancel: function () {
                            window.location.reload();
                        }
                    });
                }
            });
          }
        })
      }
    })



});


function changeToList(map) {
    var _arr = [];
    for (var key in map) {
        var tmp = {};
        tmp.key = key;
        tmp.val = map[key];
        _arr.push(tmp);
    }

    return _arr;
};

ractive.on('sendCode', function (){
    var cardNoError = this.get("cardNoError")==undefined?true:this.get("cardNoError");
    // var cardDiff = this.get('cardDiff')==undefined?true:this.get('cardDiff');

    if (cardNoError) {
        return false;
    }
    if (!this.get('isSend')) {
        this.set('isSend', true);
        var smsType = 'CREDITMARKET_CAPTCHA';
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
            ractive.set('isSend', false);
            $('.sendCode')
                .html(previousText);
            $('.sendCode')
                .removeClass('disabled');
            clearInterval(interval);
        }
    }), 1000);
}

function clearErrorIndex(key,msgkey){
    ractive.set(key,false);
    ractive.set(msgkey,'');
    return false;
}
function showErrorIndex(key,msgkey,msg){
    ractive.set(key,true);
    ractive.set(msgkey,msg);
    return false;
}
