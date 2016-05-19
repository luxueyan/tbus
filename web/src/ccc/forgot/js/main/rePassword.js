	"use strict";
	var utils = require('ccc/global/js/lib/utils');
	var maskLayer = require('ccc/global/js/lib/maskLayer');
	var formValidator = utils.formValidator;
	var rePasswordService = require('ccc/forgot/js/service/rePassword')
	    .rePasswordService;
	var CommonService = require('ccc/global/js/modules/common')
	    .CommonService;
	var registerService = require('ccc/register/js/lib/service').RegisterService
	var returnMap = {
	    'INVALID_CAPTCHA': '验证码不正确',
	    'MOBILE_NAME_NOT_MATCH': '用户名和手机号码不匹配'
	};

	var rePassword = new Ractive({
	    el: '#u-page-container',
	    template: require('ccc/forgot/partials/rePassword.html'),
	    init: function () {
	        if (!CC.user.id) {
	            // window.location.href = '/';
	        }
	    },
	    data: {
	        // 这里存放有关于注册用户的所有信息
	        telcode: false,
	        phone: null,
	        time: 120,
	        visible: false,
	        step1: true,
	        step2: false,
	        step3: false,
	        step4: false,
	        captcha: {
	            img: '',
	            token: ''
	        },
	        isLegacy: CC.isLegacy,
	        errors: {
	            msg: '',
	            visible: 'false'
	        },
	        user: {
	            loginName: '',
	            mobile: ''
	        }
	    }
	});

	// 获取验证码
	CommonService.getCaptcha(function (res) {
	    rePassword.set('captcha', {
	        img: res.captcha,
	        token: res.token
	    });
	});

	rePassword.on('changeCaptcha', function () {
	    CommonService.getCaptcha(function (res) {
	        rePassword.set('captcha', {
	            img: res.captcha,
	            token: res.token
	        });
	    });
	});

	rePassword.on('step1', function (e) {
	    // alert(1);
	    e.original.preventDefault();
	    var user = {
	        loginName: 'zqjr_' + this.get('user.mobile'),
	        mobile: this.get('user.mobile'),
	        captcha: this.get('captcha.text'),
	        token: this.get('captcha.token')
	    };
	    utils.formValidator.checkLoginName(user.loginName, function (err, msg) {
	        if (!err) {
	            showErrors(msg);
	            return false;
	        }
	        utils.formValidator.checkMobile(user.mobile, function (err, msg) {
	            if (!err) {
	                showErrors(msg);
	                return false;
	            }

	            rePasswordService.verifyLoginNameAndMobile(user, function (err, msg) {
	                if (!err) {
	                    showErrors(msg);
	                    return false;
	                }
	                utils.formValidator.checkSmsCaptcha(this.get("phone").trim(), function (err, msg) {
	                    if (!err) {
	                        showErrors(msg);
	                        return false;
	                    }
	                    disableErrors();
	                    rePassword.set('step1', false);
	                    rePassword.set('step2', true);
	                });

	            });

	        });
	    });
	});

	rePassword.on('next', function (e) {
	    e.original.preventDefault();
	    var user = {
	        mobile: this.get('user.mobile'),
	        captcha: this.get('phone'),
	        smsType: 'CONFIRM_CREDITMARKET_CHANGE_LOGIN_PASSWORD'
	    };

	    if (user.mobile == '') {
	        showErrors("MOBILE_NULL");
	        return false;
	    }

        var bMobile = false;
	    utils.formValidator.checkMobile(user.mobile, function (ok, msg) {
            if (ok) {
                disableErrors();
                registerService.checkMobile(user.mobile, function (err, msg) {

                    if (err) {
                        rePassword.set('errors', {
                            visible: true,
                            msg: '未注册的手机号码'
                        });
                        bMobile = true;
                    }
                });
            } else {
                showErrors(msg);
                bMobile = true;
            }
	    });
        if(bMobile){
            return false;
        }


        if (user.captcha == null || user.captcha.toString().trim() === "") {
	        showErrors("MOBILE_CAPTCHA_NULL");
	        return false;
	    }

	    rePasswordService.verifyMobileCaptcha(user, function (err, msg) {
	        if (!err) {
	            showErrors(msg);
	        } else {
	            disableErrors();
	            $(".u-con-1").hide();
	            rePassword.set('step1', false);
	            rePassword.set('step2', true);
	        }
	        return false;
	    });
	});


	rePassword.on('login', function (e) {
	    var re = /\s/g;
	    e.original.preventDefault();
	    var user = {
	        newPassword: this.get('newPass'),
	        rePass: this.get('rePass'),
	        mobile: this.get('user.mobile'),
	        captcha: this.get('phone'),
	        smsType: 'CONFIRM_CREDITMARKET_CHANGE_LOGIN_PASSWORD'
	    };

	    var isVer = true;
	    if (!user.newPassword || !user.rePass) {
	        rePassword.set('errors', {
	            visible: true,
	            msg: '新密码不能为空'
	        });
	        isVer = false;
	        return false;
	    }
        var reg = /(?!^[0-9]*$)(?!^[a-zA-Z]*$)^([a-zA-Z0-9]{8,16})$/;   
	    if (user.newPassword.length < 8 || !reg.test(user.newPassword)) {
	        rePassword.set('errors', {
	            visible: true,
	            msg: '密码需要为至少8位数字字母组合'
	        });
	        isVer = false;
	        return false;
	    } else if (user.newPassword != user.rePass) {
	        rePassword.set('errors', {
	            visible: true,
	            msg: '两次密码不一致，请检查'
	        });
	        isVer = false;
	        return false;

	    } else if (user.newPassword.length < 6) {
	        rePassword.set('errors', {
	            visible: true,
	            msg: '密码长度不能小于6'
	        });
	        isVer = false;
	        return false;
	    } else if (user.newPassword.length > 16) {
	        rePassword.set('errors', {
	            visible: true,
	            msg: '密码长度不能大于16'
	        });
	        isVer = false;
	        return false;
	    }

	    if (isVer) {
	        rePasswordService.doResetPassword(user, function (err, msg) {
	            if (!err) {
	                showErrors(msg);
	            } else {
	                disableErrors();
	                $(".u-con-2").hide();
	                rePassword.set('step2', false);
	                rePassword.set('step3', true);
	                var time = 3;
//	                rePassword.set('timeLeft', 3);
//	                setInterval(function () {
//	                    if (time > 0) {
//	                        rePassword.set('timeLeft', --time);
//	                    } else {
//	                        rePassword.set('timeLeft', 0);
//	                        time = 1;
//	                    }
//	                    if (time === 1) {
//	                        clearInterval();
//	                        window.location.href = '/';
//	                    }
//	                }, 1000);
	            }
	        });
	    }

	});
	rePassword.on('keydown',function(){
		var newPass=this.get('newPass');
		if(newPass.length>16||newPass.length==16){
			rePassword.set('errors', {
	            visible: true,
	            msg: '密码长度不能大于16'
	        });
		}
	});
	rePassword.on('sendTelCode', function (e) {
	    var $captchaBtn = $(".getcaptcha");
	    var mobile = this.get('user.mobile');
	    if ($captchaBtn.hasClass('disabled')) {
	        return;
	    }

	    utils.formValidator.checkMobile(mobile, function (ok, msg) {
	        if (ok) {
                registerService.checkMobile(mobile, function (err, msg) {

                    if (err) {
                        rePassword.set('errors', {
                            visible: true,
                            msg: '未注册的手机号码'
                        });
                    }else{
                        CommonService.getSmsCaptchaForResetPassword(mobile, function (r) {
                            if (r.success) {
                                countDown();
                            }
                        });
                    }
                });
	        } else {
	            showErrors(msg);
	        }
	    });
	});

	function countDown() {
	    $('.getcaptcha')
	        .addClass('disabled');
	    var previousText = '获取验证码';
	    var msg = '$秒后重新发送';

	    var left = 60;
	    var interval = setInterval((function () {
	        if (left > 0) {
	            $('.getcaptcha')
	                .html(msg.replace('$', left--));
	        } else {
	            $('.getcaptcha')
	                .html(previousText);
	            $('.getcaptcha')
	                .removeClass('disabled');
	            clearInterval(interval);
	        }
	    }), 1000);
	}

	function showErrors(error) {
	    rePassword.set('errors', {
	        visible: true,
	        msg: utils.errorMsg[error]
	    });
	}


	// disable errors
	function disableErrors() {
	    rePassword.set('errors', {
	        visible: false,
	        msg: ''
	    });
	}

	$("#phone").on('blur', function () {
	    var mobile = $(this).val().trim();
	    utils.formValidator.checkMobile(mobile, function (ok, msg) {
	        if (ok) {
	            disableErrors();
	            registerService.checkMobile(mobile, function (err, msg) {

	                if (err) {
	                    rePassword.set('errors', {
	                        visible: true,
	                        msg: '未注册的手机号码'
	                    });
	                }
	            });
	        } else {
	            showErrors(msg);
	        }
	    });
	});
