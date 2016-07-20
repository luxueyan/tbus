"use strict";

var utils = require('ccc/global/js/lib/utils');
var Confirm = require('ccc/global/js/modules/cccConfirm');
var accountService = require('ccc/newAccount/js/main/service/account').accountService;
var CccOk = require('ccc/global/js/modules/cccOk');
var format = require('@ds/format');

var banksabled = _.filter(CC.user.bankCards, function (r) {
    return r.deleted === false;
});

var ractive = new Ractive({
    el: "#ractive-container",
    template: require('ccc/newAccount/partials/settings/authentication.html'),

    data: {
        step1: true,
        step2: false,
        step3: false,
        isQuickCheck: true,
        authenticateInfo: {
            name: CC.user.name || '',
            idNumber: ''
        },
        bank: banksabled.length ? true : false,
        paymentPasswordHasSet: CC.user.paymentPasswordHasSet || false,
        format: format
    },
    oninit: function () {
        accountService.getUserInfo(function (res) {
            ractive.set('authenticateInfo', {
                name: res.user.name,
                idNumber: res.user.idNumber
            });
        });
    }
});

var popupDepositAgreement = require('ccc/agreement/js/main/depositAgreement').popupDepositAgreement;
ractive.on('maskDepositAgreement', function (e) {
    e.original.preventDefault();
    popupDepositAgreement.show();
});

// 要认证
ractive.on('checkName', function () {
    var name = this.get("name");
    this.set('showErrorMessageName', false);
    utils.formValidator.checkName(name, function (bool, error) {
        if (!bool) {
            ractive.set({
                showErrorMessageName: true,
                errorMessageName: utils.errorMsg[error]
            });
        }
    });
});
ractive.on('checkIdNumber', function () {
    var idNumber = this.get("idNumber");
    this.set('showErrorMessageId', false);
    utils.formValidator.checkIdNumber(idNumber, function (bool, error) {
        if (!bool) {
            ractive.set({
                showErrorMessageId: true,
                errorMessageId: utils.errorMsg[error]
            });
        }
    });
});
ractive.on("register-account-submit", function () {
    var name = this.get("name");
    var idNumber = this.get("idNumber");
    var that = this;
    this.fire('checkName');
    this.fire('checkIdNumber');
    utils.formValidator.checkName(name, function (bool, error) {
        if (!bool) {
            ractive.set({
                showErrorMessageName: true,
                errorMessageName: utils.errorMsg[error]
            });
        } else {
            utils.formValidator.checkIdNumber(idNumber, function (bool, error) {
                if (!bool) {
                    ractive.set({
                        showErrorMessageId: true,
                        errorMessageId: utils.errorMsg[error]
                    });

                    return false;
                }

                var user = {
                    userId: CC.user.id,
                    name: $.trim(name),
                    idCardNumber: $.trim(idNumber)
                };
                var msg, link;
                if (that.get('bank') && that.get('paymentPasswordHasSet')) {
                    msg = "恭喜您，认证成功！";
                } else if (!that.get('bank') && that.get('paymentPasswordHasSet')) {
                    msg = "认证成功，请绑定银行卡！";
                    link = '/newAccount/settings/bankCards';
                } else {
                    msg = "认证成功，请开通交易密码";
                    link = '/newAccount/settings/password';
                }
                accountService.checkId(user,
                    function (res) {
                        //console.log(res);
                        if (res) {
                            ractive.set('step1',false);
                            ractive.set('step2',true);
                            ractive.set('step3',false);
                            //ractive.on('close',function(){
                            //    window.location.href = "/newAccount/settings/home";
                            //});
                        } else {
                            ractive.set('step1',false);
                            ractive.set('step2',false);
                            ractive.set('step3',true);
                            ractive.set('error',res.error[0].message);

                            //if (res.error[0].message == '认证失败') {
                            //    res.error[0].message = "";
                            //}
                            //CccOk.create({
                            //    msg: '实名认证失败，' + res.error[0].message,
                            //    okText: '确定',
                            //    cancelText: '',
                            //    ok: function () {
                            //        window.location.reload();
                            //    },
                            //    cancel: function () {
                            //        window.location.reload();
                            //    },
                            //    close: function () {
                            //        window.location.reload();
                            //    },
                            //});
                        }
                    });
            });
        }
    });
});


// 继续开通
ractive.on('continue-open', function () {
    if (!this.get('isQuickCheck')) {
        this.set({
            showErrorMessage: true,
            errorMessage: "必须同意托管协议"
        });
    } else {
        Confirm.create({
            msg: '签订是否成功？',
            okText: '签订成功',
            cancelText: '签订失败',
            ok: function () {
                window.location.reload();
            },
            cancel: function () {
                window.location.reload();
            }
        });
    }
});

ractive.on('agreement-check', function () {
    return false;
});
