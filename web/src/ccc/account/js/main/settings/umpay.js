"use strict";

var utils = require('ccc/global/js/lib/utils');
var Confirm = require('ccc/global/js/modules/cccConfirm');
var popupInvestRactive = require('ccc/agreement/js/main/quickInvest').popupInvestRactive;
var accountService = require('../service/account').accountService;
var CccOk = require('ccc/global/js/modules/cccOk');
var format = require('@ds/format');
var ractive = new Ractive({
    el: "#ractive-container",
    template: require('ccc/account/partials/settings/umpay.html'),

    data: {
        authenticated: CC.user.authenticates.idauthenticated || false,
        isQuickCheck: true,
        authenticateInfo: {
            name: CC.user.name || '',
            idNumber: ''
        },
        format: format,
        getPwdReturn: false
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
ractive.on("register-account-submit", function () {
    var name = this.get("name");
    var idNumber = this.get("idNumber");
    var licenseAgreed = this.get("licenseAgreed");
    utils.formValidator.checkName(name, function (bool, error) {
        if (!bool) {
            ractive.set({
                showErrorMessage: true,
                errorMessage: utils.errorMsg[error]
            });
        } else {
            utils.formValidator.checkIdNumber(idNumber, function (bool, error) {
                if (!bool) {
                    ractive.set({
                        showErrorMessage: true,
                        errorMessage: utils.errorMsg[error]
                    });

                    return false;
                }

                if (!licenseAgreed) {
                    ractive.set({
                        showErrorMessage: true,
                        errorMessage: "必须同意实名认证协议"
                    });

                    return false;
                }

                var user = {
                    name: $.trim(name),
                    idNumber: $.trim(idNumber)
                };

                accountService.authenticateUser(user,
                    function (res) {
                        if (res.success) {
                            CccOk.create({
                                msg: '实名认证成功，开通交易密码是您进行交易前必须步骤!',
                                okText: '现在开通',
                                cancelText: '稍后再说',
                                ok: function () {
                                    window.location.href = '/account/paypwd';
                                },
                                cancel: function () {
                                    window.location.reload();
                                }
                            });
                        } else {
                            if (res.error[0].message == '认证失败') {
                                res.error[0].message = "";
                            }
                            CccOk.create({
                                msg: '实名认证失败，' + res.error[0].message,
                                okText: '确定',
                                cancelText: '',
                                ok: function () {
                                    window.location.reload();
                                },
                                cancel: function () {
                                    window.location.reload();
                                }
                            });
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

ractive.on('maskInvestAgreement', function () {
    popupInvestRactive.show();
});

ractive.on('get-pwd', function (e) {
    var self = this;
    var $this = $(e.node);
    var text = $this.text();

    if ($this.hasClass('disabled')) {
        return;
    }

    $this.text('操作中...').addClass('disabled');

    var api = '/api/v2/upayment/sendPassword/MYSELF';
    $.get(api, function (o) {
            if (o.success) {
                self.set('getPwdReturn', true);
            } else {
                alert('操作出错~');
            }
            $this.text(text)
                .removeClass('disabled');
        })
        .error(function (o) {
            console.info('请求出现错误，' + o.statusText);
            $this.text(text)
                .removeClass('disabled');
        });
});