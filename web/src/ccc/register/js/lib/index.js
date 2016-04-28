/**
 * @file 登录控件的交互逻辑层
 * @author huip(hui.peng@creditcloud.com)
 */

"use strict";
var bind = require('lodash-node/compat/functions/bind');
var CommonService = require('ccc/global/js/modules/common')
    .CommonService;
var RegisterService = require('./service')
    .RegisterService;
var LoginService = require('ccc/login/js/lib/service')
    .LoginService;
var maskLayer = require('ccc/global/js/lib/maskLayer');
var formValidator = utils.formValidator;

var popupServiceAgreement = require('./serviceAgreement')
    .popupServiceAgreement;
var popupRegistAgreement = require('./registAgreement')
    .popupRegistAgreement;
var bus = require('ccc/global/js/lib/bus');

exports.popupRegister = {
    instance: false,
    init: function () {
        var popupRegister = this;
        this.popupRegisterRactive = new Ractive({
            el: '#register-wraper',
            template: require('../../partials/register.html'),
            data: {
                // 这里存放有关于注册用户的所有信息
                user: {
                    loginName: '',
                    password: '',
                    repassword: '',
                    smsCaptcha: '',
                    invitation: '',
                    email: '',
                    mobile: '',
                    agreement: false,
                    captcha: {
                        // captcha的图片(base64)
                        image: '',
                        // captcha的验证token
                        token: '',
                        // 用户输入的captcha的值
                        value: ''
                    }
                },
                countDown: {
                    visible: false,
                    leftSeconds: 0
                },
                isLegacy: CC.isLegacy,
                visible: false,
                step1: true,
                step2: false,
                step3: false,

                errors: {
                    visible: false,
                    msg: ''
                },
            }
        });

        // 初始化captcha
        // showCaptcha();

        var popupRegisterRactive = this.popupRegisterRactive;
        popupRegisterRactive.on('close', function () {
            this.set('visible', false);
            maskLayer.close();
        });
        popupRegisterRactive.on('previous', function (e) {
            e.original.preventDefault();
            this.set('step1', true);
            this.set('step2', false);
            this.set('step3', false);
        });
        popupRegisterRactive.on('doNext', function () {
            var self = this;

            formValidator.checkRegisterName(self.get('user.loginName'),
                function (
                    bool, error) {
                    if (bool) {
                        RegisterService.checkLoginName(self.get(
                                'user.loginName'),
                            function (bool, error) {
                                if (!bool) {
                                    showErrors(error[0].message);
                                    return;
                                } else {

                                    formValidator.checkPassword(self.get(
                                            'user.password'),
                                        function (bool, error) {
                                            if (bool) {
                                                formValidator.checkRePassword(
                                                    self.get(
                                                        'user.password'),
                                                    self.get(
                                                        'user.repassword'),
                                                    function (
                                                        bool,
                                                        error) {


                                                        if (
                                                            bool
                                                        ) {
                                                            if (!
                                                                self
                                                                .get(
                                                                    'user.agreement'
                                                                )
                                                            ) {
                                                                showErrors(
                                                                    'AGREEMENT_NULL'
                                                                );
                                                                return false;
                                                            }
                                                            popupRegisterRactive
                                                                .fire(
                                                                    'next'
                                                            );

                                                        } else {
                                                            showErrors(
                                                                error);
                                                        }
                                                    });
                                            } else {
                                                showErrors(error);
                                            }
                                        });
                                }
                            });
                    } else {
                        showErrors(error);
                    }

                });
        });

        popupRegisterRactive.on('changeCaptcha', function () {
            showCaptcha();
        });

        popupRegisterRactive.on('next', function () {
            this.set('step1', false);
            this.set('step2', true);
            disableErrors();
        });

        popupRegisterRactive.on('doRegister', function (e) {
            e.original.preventDefault();
            var self = this;
            formValidator.checkMobile(self.get('user.mobile'),
                function (
                    bool, error) {
                    var user = {};
                    var _user = self.get('user');
                    if (bool) {
                        RegisterService.checkMobile(_user.mobile,
                            function (
                                bool, error) {
                                if (bool) {
                                    user = {
                                        loginName: $.trim(_user.loginName),
                                        password: $.trim(_user.password),
                                        mobile_captcha: $.trim(_user.smsCaptcha),
                                        mobile: $.trim(_user.mobile)
                                    };
                                    RegisterService.doRegister(user,
                                        function (
                                            body,
                                            error) {
                                            if (body.success) {
                                                var params =
                                                    'code=' +
                                                    self.get(
                                                        'user.invitation'
                                                ) +
                                                    '&settoused=1&associator=' +
                                                    popupRegisterRactive
                                                    .get(
                                                        'user.loginName'
                                                );
                                                RegisterService.checkInvitation(
                                                    params, function () {
                                                        bus('session:user')
                                                            .push(body.user);
                                                        LoginService.doLogin(
                                                            popupRegisterRactive
                                                            .get(
                                                                'user.loginName'
                                                            ),
                                                            popupRegisterRactive
                                                            .get(
                                                                'user.password'
                                                            ));
                                                        popupRegisterRactive
                                                            .set(
                                                                'step1',
                                                                false);
                                                        popupRegisterRactive
                                                            .set(
                                                                'step2',
                                                                false);
                                                        popupRegisterRactive
                                                            .set(
                                                                'step3',
                                                                true);
                                                    });

                                            } else {
                                                showErrors(error[0]
                                                    .message);
                                            }
                                        });
                                    disableErrors();
                                } else {
                                    showErrors(error[0].message);
                                }
                            });

                    } else {
                        showErrors(error);
                    }
                });
        });

        popupRegisterRactive.on('getSmsCaptcha', function () {
            var self = this;

            formValidator.checkMobile(self.get('user.mobile'),
                function (
                    bool, error) {

                    if (bool) {
                        RegisterService.checkMobile(self.get(
                                'user.mobile'),
                            function (bool, error) {
                                if (bool) {
                                    CommonService.getSmsCaptcha(
                                        self.get(
                                            'user.mobile'),
                                        function (body) {
                                            if (body.success) {
                                                countDown();
                                            }
                                        });
                                    disableErrors();
                                } else {
                                    showErrors(error[0].message);
                                }
                            });
                    } else {
                        showErrors(error);
                    }
                });
        });

        popupRegisterRactive.on('maskServiceAgreement', function () {
            var fireClose = function () {
                popupServiceAgreement.popupServiceAgreementRactive.fire(
                    'close');
            };
            popupRegister.maskLayerOnClickHandlers.push(fireClose);
            popupServiceAgreement.show(function () {
                var hs = popupRegister.maskLayerOnClickHandlers;
                for (var i = hs.length; --i > 0;) {
                    if (hs[i] === fireClose) {
                        hs.splice(i, 1);
                    }
                }
            });
        });

        popupRegisterRactive.on('maskRegistAgreement', function () {
            var fireClose = function () {
                popupRegistAgreement.popupRegistAgreementRactive.fire(
                    'close');
            };
            popupRegister.maskLayerOnClickHandlers.push(fireClose);
            popupRegistAgreement.show(function () {
                var hs = popupRegister.maskLayerOnClickHandlers;
                for (var i = hs.length; --i > 0;) {
                    if (hs[i] === fireClose) {
                        hs.splice(i, 1);
                    }
                }
            });
        });

        // 从common service中获取captcha
        function showCaptcha() {
            CommonService.getCaptcha(function (body) {
                popupRegisterRactive.set('user.captcha.image', body
                    .captcha);
                popupRegisterRactive.set('user.captcha.token', body
                    .token);
            });
        }

        // show errors
        function showErrors(error) {
            popupRegisterRactive
                .set('errors', {
                    visible: true,
                    msg: utils.errorMsg[error]
                });
        }

        // disable errors
        function disableErrors() {
            popupRegisterRactive
                .set('errors', {
                    visible: false,
                    msg: ''
                });
        }

        // countDown
        function countDown(left) {
            left = 60 || left;
            var interval = setInterval((function () {
                if (left > 0) {
                    popupRegisterRactive.set(
                        'countDown.visible', true);
                    popupRegisterRactive.set(
                        'countDown.leftSeconds',
                        left--);
                } else {
                    clearInterval(interval);
                    popupRegisterRactive.set(
                        'countDown.visible', false);
                    popupRegisterRactive.set(
                        'countDown.leftSeconds', 0);
                }
            }), 1000);

        }
    },

    show: function () {
        if (!this.instance) {
            this.init();
            this.instance = true;
        }

        this.maskLayerOnClickHandlers.push(bind(function () {
            this.popupRegisterRactive.fire('close');
        }, this));

        maskLayer.show({
            onClick: bind(this.maskLayerOnClick, this)
        });
        this.popupRegisterRactive.set('visible', true);
    },

    maskLayerOnClickHandlers: [],
    maskLayerOnClick: function () {
        var fn = this.maskLayerOnClickHandlers.pop();
        if (typeof fn !== 'function') {
            return;
        }
        fn();
    }
};