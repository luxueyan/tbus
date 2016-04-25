'use strict';
/**
 * 通用登录模块
 */

var $ = global.jQuery = require('jquery');
var Ractive = require('ractive/ractive-legacy');
var LoginService = require('assets/js/service/login');
var CommonService = require('assets/js/modules/common')
    .CommonService;
var utils = require('assets/js/lib/utils');

module.exports = function (options) {
    
    var defaults = {
        el: $('.login-wrap'),
        template: require('partials/login.html'),
        redirectWhenSuccess: '/account',
        
        // 没有帐号,直接购买
        showBuy: false,
        buyHref: '#',
        
        popup: false,
        changeToRegister: function(){},
        next: false,
        reload: false,
        nothing: false, // true:不转跳，也不reload，后续处理在success回调里进行
        success: function(){},
        debug: false
    };
    
    var config = {};
	$.extend(config, defaults, options);
    
    var loginRac = new Ractive({
        el: config.el,
        template: config.template,
        data: {
            msg: {},
            
            // 未登录点击购买,购买连接
            showBuy: config.showBuy,
            buyHref: config.buyHref,
            
            popup: config.popup,
            ACCESS: false
        },
        partials: {},
        captcha: {},
        validateForm: [
            'loginName',
            'password',
            'captcha'
        ],
        errorMaps: {
            USER_DISABLED: '账号密码错误次数过多，禁止登录，请联系管理员',
            FAILED: '用户名或密码错误'
        },
        oncomplete: function () {
            this.$loginForm = $(this.el).find('form[name=loginForm]');
            this.$postBtn = $(this.el).find('button.btn-login');
            this.$loginName = $(this.el).find('input[name=loginName]');
            this.$password = $(this.el).find('input[name=password]');
            this.$captcha = $(this.el).find('input[name=captcha]');
            this.$captChaImg = $(this.el).find('.captcha-img');
            
            this.service = LoginService;
            
            this.bindActions();
            this.bindEvents();
            this.getCaptCha();
        },
        bindActions: function () {
            var self = this;
            
            this.$loginForm.submit(function(e){
                var $this = $(this);
                if (e && e.preventDefault){
                    e.preventDefault();
                } else {
                    window.event.returnValue = false;
                }
                
                if (self.$postBtn.hasClass('disabled')) {
                    return;
                }
                
                self.set('ACCESS', true);
                
                if (config.debug) {
                    console.log('debug:login:submit', $(this).serialize());
                }
                
                $.each(self.validateForm, function (index, value) {
                    var ele = $(self.el).find('input[name=' + value + ']');
                    if (!ele.val().length) {
                        self.showMsg(utils.errorMsg[value.toUpperCase() + '_NULL'], value);
                    } else {
                        self.clearMsg(value);
                    }
                });
                
                self.captcha.captcha = self.$captcha.val();
                
                if (!self.get('ACCESS')) {
                    return;
                }
                
                self.beforePost();
                
                CommonService.checkCaptcha(self.captcha, function(r) {
                    if (r.success) {
                        LoginService.login({
                            loginName: self.$loginName.val(),
                            password: self.$password.val()
                        }, function (o) {
                            if (o.success) {
                                config.success(o);
                                if (config.next) {
                                    config.next();
                                } else {
                                    if (!config.nothing) {
                                        if (config.reload) {
                                            location.reload();
                                        } else {
                                            location.href = config.redirectWhenSuccess;
                                        }
                                    }
                                }
                            } else {
                                self.set('msg.post', self.errorMaps[o.error_description.result]);
                                self.getCaptCha();
                                self.$captcha.val('');
                                self.resetForm();
                            }
                        });
                    } else {
                        self.showMsg(utils.errorMsg[r.error[0].message], 'captcha');
                        self.getCaptCha();
                        self.resetForm();
                    }
                });
            });
            
            setTimeout(function() {
                if (!self.get('gotCaptcha')) {
                    self.getCaptCha();
                }
            }, 1000);
        },
        
        getCaptCha: function () {
            var self = this;
            /*
            CommonService.getCaptcha(function (data) {
                self.captcha = data;
                self.set('gotCaptcha', true);
                self.$captChaImg.attr('src', data.captcha);
            });
            */
            $.get('/api/v2/register/captcha?timestamp=' + Date.now(), function(data){
                self.captcha = data;
                self.set('gotCaptcha', true);
                self.$captChaImg.attr('src', data.captcha);
            });
        },
        
        bindEvents: function () {
            var self = this;
            this.on('changeCaptcha', function(){
                self.getCaptCha();
            });
            
            this.on('changeToRegister', function(e){
                config.changeToRegister(self, $(e.node));
                return false;
            });
        },
        
        beforePost: function () {
            this.$postBtn.addClass('disabled');
        },
        
        resetForm: function () {
            this.$postBtn.removeClass('disabled');
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
    
    return loginRac;
};