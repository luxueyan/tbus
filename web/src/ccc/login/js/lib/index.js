/**
 * @file 登录控件的交互逻辑层
 * @author huip(hui.peng@creditcloud.com)
 */

"use strict";
var Ractive = require('ractive/ractive-legacy');
var LoginService = require('./service')
    .LoginService;
var CommonService = require('assets/js/modules/common')
    .CommonService;
var popupRegister = require('ccc/register/js/lib')
    .popupRegister;
var maskLayer = require('assets/js/lib/maskLayer');
var utils = require('assets/js/lib/utils');
var formValidator = utils.formValidator;
var bus = require('ccc/reactive/js/lib/bus');
exports.popupLogin = {
    instance: false,
    init: function () {

        this.popupLoginRactive = new Ractive({
            el: '#login-wraper',
            template: require('../../partials/login.html'),
            data: {
                loginName: '',
                password: '',
                captcha: {
                    value: '',
                    image: '',
                    token: ''
                },
                visible: false,
                errors: {
                    visible: false,
                    msg: ''
                },
            }
        });

        var popupLoginRactive = this.popupLoginRactive;

        // 初始化captcha
        // showCaptcha();

        popupLoginRactive.on('close', function () {
            this.set('visible', false);
            maskLayer.close();
        });
        popupLoginRactive.on('doLogin', function (e) {
            e.original.preventDefault();
            var self = this;

            formValidator.checkLoginName(self.get('loginName'), function (
                bool, error) {
                if (bool) {
                    formValidator.checkPassword(self.get('password'),
                        function (bool, error) {
                            if (bool) {
                                LoginService.doLogin(self.get(
                                    'loginName'), self.get(
                                    'password'), function (err,
                                    body) {
                                    self.set('password', '');
                                    if (body.success) {
                                        bus('session:user')
                                            .push(body.user);
                                        popupLoginRactive.fire(
                                            'close');
                                        self.set('loginName', self.get(
                                            'loginName'));
                                        window.location.reload();
                                    } else {
                                        showErrors(err);
                                    }

                                });
                                disableErrors();
                            } else {
                                showErrors(error);
                            }
                        });
                } else {
                    showErrors(error);
                }
            });
        });

        popupLoginRactive.on('changeCaptcha', function () {
            showCaptcha();
        });

        popupLoginRactive.on('register', function () {
            popupLoginRactive.fire('close');
            popupRegister.show();
        });

        function showCaptcha() {
            CommonService.getCaptcha(function (body) {
                popupLoginRactive.set('captcha.image', body.captcha);
            });
        }

        // show errors
        function showErrors(error) {
            popupLoginRactive
                .set('errors', {
                    visible: true,
                    msg: utils.errorMsg[error]
                });
        }

        // disable errors
        function disableErrors() {
            popupLoginRactive
                .set('errors', {
                    visible: false,
                    msg: ''
                });
        }
    },

    show: function () {
        if (!this.instance) {
            this.init();
            this.instance = true;
        }
        var popupLoginRactive = this.popupLoginRactive;
        maskLayer.show({
            onClick: function () {
                popupLoginRactive.fire('close');
            }
        });
        this.popupLoginRactive.set('visible', true);
    }

};
