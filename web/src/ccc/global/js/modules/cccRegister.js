'use strict';
/**
 * 通用注册模块
 */

var $ = global.jQuery = require('jquery');
var Ractive = require('ractive/ractive-legacy');
var service = require('assets/js/service/register');
var Agreement = require('assets/js/modules/cccAgreement');
var LoginService = require('assets/js/service/login');
var CommonService = require('assets/js/modules/common')
    .CommonService;
var utils = require('assets/js/lib/utils');
var format = require('@ds/format');
var search = window.location.search;
var referral = search?search.split('=')[1]: '';
module.exports = function (options) {
    
    var defaults = {
        el: $('.register-wrap'),
        template: require('partials/register/step.html'),
        user: CC.user,
        step: {
            show: true,
            current: CC.user && CC.user.loginName ? 2:1
        },
        salary: null,
        fastMode: false,
        popup: false, // 是否是popup形式的切换(主要是在login和register视图之间的切换)
        agreementType: 'popup',
        redirectWhenSuccess: '/account/umpay',
        smsCaptchaWaitTime: 60, // 手机短信发送时间间隔(s)
        changeToLogin: function(){},
        debug: false
    };
    
    var config = {};
	$.extend(config, defaults, options);
    
    var registerRac = new Ractive({
        el: config.el,
        template: config.template,
        data: {
            msg: {},
            user: config.user,
            step: {
                show: config.step.show,
                current: config.step.current
            },
            //provinceInfos: provinceInfos,
            //area: Area,
            //citys: [],
            //industry: industryInfos,
            //jobs: [],
            countTime: 5, // 最后一步转跳时间
            agreementType: config.agreementType,
            popup: config.popup,
            ACCESS: false // 是否允许提交数据
        },
        partials: {
            step1: require('partials/register/step1.html'),
            step2: require('partials/register/step2.html'),
            step3: require('partials/register/step3.html')
        },
        validateForm: [
            'loginName',
            'mobile',
            'password',
            'repassword',
            'captcha',//'smsCaptcha',
            'agreement'
        ],
        defaultEmail: 'null@creditcloud.com',
        oninit: function () {},
        oncomplete: function () {
            this.$regForm = $(this.el).find('form[name=regForm]');
            this.$postStep1 = $(this.el).find('button.post-btn-step1');
            this.$loginName = $(this.el).find('input[name=loginName]');
            this.$mobile = $(this.el).find('input[name=mobile]');
            this.$smsCaptcha = $(this.el).find('input[name=smsCaptcha]');
            this.$captcha = $(this.el).find('input[name=captcha]');
            this.$password = $(this.el).find('input[name=password]');
            this.$repassword = $(this.el).find('input[name=repassword]');
            this.$agreement = $(this.el).find('input[name=agreement]');
            
            this.service = service;
            
            this.bindActions();
            this.bindStep2Actions();
            this.bindEvents();
            
            this.captChaImg = $(this.el).find('.captcha-img');
            
            this.getCaptCha();
            window.xx = registerRac;
        },
        
        captcha: {},
        getCaptCha: function() {
            var self = this;
            CommonService.getCaptcha(function (data) {
                self.captcha = data;
                self.captChaImg.attr('src', data.captcha);
            });
        },
        
        bindActions: function () {
            var self = this;
            
            // 注册服务协议弹窗
            $('.ccc-agreement').click(function(){
                Agreement({
                    title: '注册服务协议',
                    ok: function() {
                        self.clearMsg('agreement');
                    }
                });
                return false;
            });
            
            this.$loginName.blur(function() {
                if (self.$loginName.val() === '') {
                    return false;
                }
                self.service.checkLoginName(self.$loginName.val(), function (flag, error) {
                    if (config.debug) {
                        console.log('debug:register:ckLoginName', flag, error);
                    }
                    if (!flag) {
                        self.showMsg(utils.errorMsg[error[0].message], 'loginName');
                    } else {
                        self.clearMsg('loginName');
                    }
                });
            });

            this.$mobile.blur(function() {
                if (self.$mobile.val() === '') {
                    return false;
                }
                if (!utils.match.mobile(self.$mobile.val())) {
                    self.showMsg(utils.errorMsg.MOBILE_INVALID, 'mobile');
                    return false;
                }
                self.service.checkMobile(self.$mobile.val(), function (flag, error) {
                    if (!flag) {
                        self.showMsg(utils.errorMsg[error[0].message], 'mobile');
                    } else {
                        self.clearMsg('mobile');
                    }
                });
            });
            
            this.$smsCaptcha.blur(function() {
                var v = self.$smsCaptcha.val();
                if (v.length > 0) {
                    if (v.length != 6) {
                        self.showMsg('验证码为6位字串', 'smsCaptcha');
                    } else {
                        self.clearMsg('smsCaptcha');
                    }
                }
            });
            
            this.$password.blur(function(){
                var v = self.$password.val();
                v = v.replace(' ', '');
                if (v.length > 0) {
                    if (v.length < 6 || v.length > 20) {
                        self.showMsg(utils.errorMsg.PASSWORD_LENGTH, 'password');
                    } else {
                        self.clearMsg('password');
                    }
                }
            });
            
            this.$repassword.blur(function(){
                var v = self.$repassword.val();
                if (v.length > 0) {
                    if (v !== self.$password.val()) {
                        self.showMsg(utils.errorMsg.PASSWORD_AGAIN_INVALID, 'repassword');
                    } else {
                        self.clearMsg('repassword');
                    }
                }
            });
            
            this.$regForm.submit(function(e){
                var $this = $(this);
                if (e && e.preventDefault){
                    e.preventDefault();
                } else {
                    window.event.returnValue = false;
                }
                
                if (self.$postStep1.hasClass('disabled')) {
                    return;
                }
                
                self.set('ACCESS', true);
                
                if (config.debug) {
                    console.log('debug:register:submit', $(this).serialize());
                }
                
                $.each(self.validateForm, function (index, value) {
                    var ele = $(self.el).find('[name=' + value + ']');
                    if (value !== 'agreement') {
                        if (!ele.val().length) {
                            self.showMsg(utils.errorMsg[value.toUpperCase() + '_NULL'], value);
                        } else {
                            self.clearMsg(value);
                        }
                    } else {
                        if (!ele.prop('checked')) {
                            self.showMsg(utils.errorMsg.AGREEMENT_NULL, value);
                        } else {
                            self.clearMsg(value);
                        }
                    }
                });
                
                if (!self.get('ACCESS')) {
                    return;
                }
                
                if (!utils.match.mobile(self.$mobile.val())) {
                    self.showMsg(utils.errorMsg.MOBILE_INVALID, 'mobile');
                    return;
                }
                
                self.beforeRegister();
                
                self.service.checkLoginName(self.$loginName.val(), function (flag, error) {
                    if (config.debug) {
                        console.log('debug:register:ckLoginName', flag, error);
                    }
                    if (!flag) {
                        self.showMsg(utils.errorMsg[error[0].message], 'loginName');
                    } else {
                        self.clearMsg('loginName');
                        self.service.checkMobile(self.$mobile.val(), function (flag, error) {
                            if (!flag) {
                                self.showMsg(utils.errorMsg[error[0].message], 'mobile');
                            } else {
                                self.clearMsg('mobile');
                                
                                var userData = {
                                    loginName: self.$loginName.val(),
                                    password: self.$password.val(),
                                    mobile: self.$mobile.val(),
                                    email: self.defaultEmail,
                                    mobile_captcha: self.$smsCaptcha.val()
                                };
                                self.userData = userData;
                                self.set('Fmobile', format.mask(userData.mobile, 3, 4));
                                
                                self.$postStep1.text('处理中...').addClass('disabled');
                                
                                self.captcha.captcha = self.$captcha.val();
                                
                                // 检测图形验证码
                                self.clearMsg('captcha');
                                CommonService.checkCaptcha(self.captcha, function(data) {
                                    self.resetForm();
                                    if (!data.success) {
                                        self.getCaptCha();
                                        self.showMsg(utils.errorMsg[data.error[0].message], 'post');
                                    }else {
                                        self.set('msg.post', null);
                                        self.set('step.current', 2);
                                        self.bindStep2Actions();
                                        self.sendSmsCaptcha();
                                    }
                                });
                                /*
                                self.service.doRegister(userData, function (r, error) {
                                    self.regCallback(userData, r, error);
                                });
                                */
                            }
                        });
                    }
                });
            });
            
            $(this.el).find('.captcha-img').on('click', function (e) {
                e.preventDefault();
                self.getCaptCha();
            });
        },
        stepTwoVer: [
            'name',//'userName',
            'idNumber',
            'email'
        ],
        bindStep2Actions: function () {
            var self = this;
            // step2 el
            this.$postStep2 = $('button.post-btn-step2');
            
            $(this.el).find('[name=regFormStep2]').submit(function(e){
                var smsCaptcha = $.trim($(self.el).find('[name=smsCaptcha]').val());
                if (e && e.preventDefault){
                    e.preventDefault();
                } else {
                    window.event.returnValue = false;
                }
                
                self.clearMsg('smsCaptcha');
                self.set('ACCESS', true);
                
                if (self.$postStep1.hasClass('disabled')) {
                    return;
                }
                
                if (smsCaptcha === '') {
                    self.showMsg('短信验证码不能为空', 'smsCaptcha');
                }
                
                if (!self.get('ACCESS')) {
                    return;
                }
                
                self.userData.mobile_captcha = smsCaptcha;
                
                if (referral) {
                    self.service.checkMobile(referral, function(data) {
                        if (!data) {
                             self.userData.referral = referral;
                        }
                        console.log(self.userData);
                        self.service.doRegister(self.userData, function (r, error) {
                            self.regCallback(self.userData, r, error);
                        });
                    });
                }
            });
        },
        
        sendSmsCaptcha: function(obj){
            var self = this;
            var $this = obj || $(this.el).find('.get-captcha-tigger');
            
            this.set('smsSended', false);
            
            if ($this.hasClass('disabled')) {
                return;
            }
            if (self.userData.mobile === '') {
                self.showMsg(utils.errorMsg.MOBILE_NULL, 'mobile');
                return;
            }
            self.service.checkMobile(self.userData.mobile, function (flag, error) {
                if (!flag) {
                    self.showMsg(utils.errorMsg[error[0].message], 'mobile');
                } else {
                    CommonService.getSmsCaptcha(self.userData.mobile, function (r) {
                        if (r.success) {
                            self.set('smsSended', true);
                            self.countDown($this);
                        }
                    });
                }
            });
        },
        sendVoiceCaptcha: function(obj){
            var self = this;
            var $hint = obj.prev('.get-captcha-hint') || $(this.el).find('.get-captcha-hint');
            if (self.userData.mobile === '') {
                self.showMsg(utils.errorMsg.MOBILE_NULL, 'mobile');
                return;
            }
            self.service.checkMobile(self.userData.mobile, function (flag, error) {
                if (!flag) {
                    self.showMsg(utils.errorMsg[error[0].message], 'mobile');
                } else {
                    CommonService.getVoiceCaptcha(self.userData.mobile, function (r) {
                        if (r.success) {
                             $hint.text('请等待语音提示，');
                        }
                    });
                }
            });
        },
        bindEvents: function () {
            var self = this;
            this.on('getcaptcha', function(e){
                var $this = $(e.node);
                self.sendSmsCaptcha($this);
            });
            this.on('getvoice', function(e){
                var $this = $(e.node);
                self.sendVoiceCaptcha($this);
            });
            // 跳过第二步
            this.on('goNext', function(){
                self.set('step.current', 3);
                self.startCountDownRedirect();
            });
            
            this.on('oneStep', function(){
                self.set('step.current', 1);
                self.bindActions();
                self.bindEvents();
            });
            
            // 切换到popup login视图
            this.on('changeToLogin', function(e){
                config.changeToLogin(self, $(e.node));
                return false;
            });
        },
        
        startCountDownRedirect: function () {
            var self = this;
            setInterval(function() {
                var _time = self.get('countTime');
                if (_time === 0) {
                    location.href = config.redirectWhenSuccess;
                } else {
                    self.set('countTime', --_time);
                }
            }, 1000);
        },
        
        countDown: function (obj) {
            obj.addClass('disabled');
            var previousText = '获取验证码';
            var msg = '$秒后重新发送';

            var left = config.smsCaptchaWaitTime;
            var interval = setInterval((function () {
                if (left > 0) {
                    obj.html(msg.replace('$', left--));
                } else {
                    obj.html(previousText);
                    obj.removeClass('disabled');
                    $('.get-voice').show();
                    clearInterval(interval);
                }
            }), 1000);
        },
        
        beforeRegister: function () {
            this.$postStep1.addClass('disabled');
        },
        
        regCallback: function (user, r, error) {
            var self = this;
            self.loginName = user.loginName;
            self.password = user.password;
            if (r.success) {
                LoginService.login({
                    loginName: user.loginName,
                    password: user.password
                }, function (result) {
                    //location.href = config.redirectWhenSuccess;
                    if (result.success) {
                        CC.user = result.user;
                        /*
                        if (config.fastMode) {
                            self.set('step.current', 3);
                            self.startCountDownRedirect();
                        } else {
                            self.set('step.current', 2);
                            self.bindStep2Actions();
                        }
                        */
                        self.set('step.current', 3);
                        self.startCountDownRedirect();
                    } else {
                        location.href = '/login';
                    }
                });
            } else {
                this.showMsg(utils.errorMsg[error[0].message], 'post');
                setTimeout(function(){
                   self.clearMsg('post');
                }, 4000);
            }
        },
        
        resetForm: function () {
            this.$postStep1.removeClass('disabled').text('下一步');
        },
        
        showMsg: function (msg, key) {
            this.set('ACCESS', false);
            this.resetForm();
            this.set('msg.' + key, msg);
        },
        clearMsg: function (key) {
            this.set('msg.' + key, null);
        }
    });
    
    return registerRac;
};

/*
function getProvince(code) {
    if (!code) return;
    return provinceInfos.filter(function(item){
        return item.provinceCode.substring(0, 2) === code.toString().substring(0, 2);
    });
}
function getCity(code) {
    if (!code) return;
    return cityInfos.filter(function(item){
        return item.cityCode === code.toString();
    });
}
function getCountry(code) {
    if (!code) return;
    return areaInfos.filter(function(item){
        return item.areaCode === code.toString();
    });
}

function getCityByProvince(province) {
    return cityInfos.filter(function(item) {
        return item.cityCode.substring(0, 2) === province.substring(0, 2);
    });
}
function getCountryByCity(city) {
    return areaInfos.filter(function(item) {
        return item.areaCode.substring(0, 4) === city.substring(0, 4);
    });
}
*/