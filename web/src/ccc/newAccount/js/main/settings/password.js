"use strict";
require('ccc/global/js/modules/cccTab');
var utils = require('ccc/global/js/lib/utils');
var CccOk = require('ccc/global/js/modules/cccOk');
var accountService = require('ccc/newAccount/js/main/service/account').accountService;
var CommonService = require('ccc/global/js/modules/common.js').CommonService;
var banksabled = _.filter(CC.user.bankCards, function (r) {
    return r.deleted === false;
});
var passwordRactive = new Ractive({
    el: '#ractive-container',
    template: require('ccc/newAccount/partials/settings/password.html'),
    data: {
        paymentPasswordHasSet: CC.user.paymentPasswordHasSet || false,
        step: '0',
        showFundPass: true,
        frontTab: 'fundPass',
        validateCode: {
            canGet: true
        },
        bank: banksabled.length ? true : false,
        user: null,
        captcha: {
            img: '',
            token: '',
            captcha: ''
        }
    }
});

passwordRactive.on('checkTab', function (event) {
    var tab = event.node.getAttribute('data-tab');
    this.set('newPassword', '');
    if (tab !== this.get('frontTab')) {
        this.set('frontTab', tab);
        this.set('showFundPass', !this.get('showFundPass'));
        clearError();
    }
    $('.resetfundpass').css('display', 'none');
});
passwordRactive.on('checkpwd', function () {
    var pwd = this.get('password');
    var rePwd = this.get('repassword');
    this.set('isAcessa', false);
    if (pwd === '') {
        showErrorIndex('showErrorMessagea', 'errorMessagea', '交易密码不能为空');
    } else if (pwd.length < 6) {
        showErrorIndex('showErrorMessagea', 'errorMessagea', '交易密码长度最少为6位');
    } else {
        clearErrorIndex('showErrorMessagea', 'errorMessagea');
        this.set('isAcessa', true);
    }
});
passwordRactive.on('checkrepwd', function () {
    var pwd = this.get('password');
    var rePwd = this.get('repassword');
    this.set('isAcessb', false);
    if (rePwd === '') {
        showErrorIndex('showErrorMessageb', 'errorMessageb', '交易密码不能为空');
    } else if (pwd !== rePwd) {
        showErrorIndex('showErrorMessageb', 'errorMessageb', '两次密码输入不一致');
    } else {
        clearErrorIndex('showErrorMessageb', 'errorMessageb');
        this.set('isAcessb', true);
    }
});
passwordRactive.on('initialPassword', function () {
    var pwd = this.get('password');
    var rePwd = this.get('repassword');
    var isAcess = this.get('isAcessa') && this.get('isAcessb');
    passwordRactive.fire('checkpwd');
    passwordRactive.fire('checkrepwd');

    var msg, link;
    if (this.get('bank') && this.get('paymentPasswordHasSet')) {
        msg = "恭喜您，设置成功！";
        link = '/newAccount/recharge';
    } else if (!this.get('bank') && this.get('paymentPasswordHasSet')) {
        msg = "设置成功，请绑定银行卡！";
        link = '/newAccount/settings/bankCards';
    } else {
        msg = "恭喜您，设置成功！";
        link = '/newAccount/recharge';
    }
    if (isAcess) {
        accountService.initialPassword(pwd, function (r) {
            //            if (r.success) {
            //                CccOk.create({
            //                    msg: msg,
            //                    okText: '确定',
            //                    cancelText: '稍后再说',
            //                    ok: function () {
            //                        // if (link) {
            //                        window.location.href = link;
            //                        // }
            //                        // window.location.reload();
            //                    },
            //                    cancel: function () {
            //                        window.location.reload();
            //                    }
            //                });
            //                return;
            //            }
            $('.resetfundpass').css('display', 'block');
            $('.initialWra').css('display', 'none');
        });
    }
});
//passwordRactive.on('checkoldpwd', function () {
//    var oldpwd = this.get('oldPassword');
//    var newPwd = this.get('newPassword');
//    var reNewPwd = this.get('reNewPassword');
//    this.set('isAcess0', false);
//    if (oldpwd === '') {
//        showErrorIndex('showErrorMessage0', 'errorMessage0', '原密码不能为空');
//    } else {
//        clearErrorIndex('showErrorMessage0', 'errorMessage0');
//        this.set('isAcess0', true);
//    }
//});
//passwordRactive.on('checknewpwd', function () {
//    var oldpwd = this.get('oldPassword');
//    var newPwd = this.get('newPassword');
//    var reNewPwd = this.get('reNewPassword');
//    this.set('isAcess1', false);
//    if (newPwd.length < 6) {
//        showErrorIndex('showErrorMessage1', 'errorMessage1', '交易密码长度最少为6位');
//    } else if (newPwd === '') {
//        showErrorIndex('showErrorMessage1', 'errorMessage1', '交易密码不能为空');
//    } else if (oldpwd == newPwd) {
//        showErrorIndex('showErrorMessage1', 'errorMessage1', '新密码原密码不能相同！');
//    } else if (newPwd.indexOf(' ') > -1) {
//        showErrorIndex('showErrorMessage1', 'errorMessage1', '含有非法字符:空格');
//    } else {
//        clearErrorIndex('showErrorMessage1', 'errorMessage1');
//        this.set('isAcess1', true);
//    }
//
//});
//passwordRactive.on('checkreNewPassword', function () {
//    var oldpwd = this.get('oldPassword');
//    var newPwd = this.get('newPassword');
//    var reNewPwd = this.get('reNewPassword');
//    this.set('isAcess2', false);
//    if (reNewPwd === '') {
//        showErrorIndex('showErrorMessage2', 'errorMessage2', '交易密码不能为空');
//    } else if (newPwd !== reNewPwd) {
//        showErrorIndex('showErrorMessage2', 'errorMessage2', '两次密码输入不一致');
//    } else {
//        clearErrorIndex('showErrorMessage2', 'errorMessage2');
//        this.set('isAcess2', true);
//    }
//});

function clearErrorIndex(key, msgkey) {
    passwordRactive.set(key, false);
    passwordRactive.set(msgkey, '');
    return false;
}

function showErrorIndex(key, msgkey, msg) {
    passwordRactive.set(key, true);
    passwordRactive.set(msgkey, msg);
    return false;
}
//passwordRactive.on('updatePassword', function () {
//
//    var oldpwd = this.get('oldPassword');
//    var newPwd = this.get('newPassword');
//    var reNewPwd = this.get('reNewPassword');
//    passwordRactive.fire('checkoldpwd');
//    passwordRactive.fire('checknewpwd');
//    passwordRactive.fire('checkreNewPassword');
//    var isAcess = this.get('isAcess0') && this.get('isAcess1') && this.get('isAcess2');
//
//
//    if (isAcess) {
//
//        accountService.checkPassword(oldpwd, function (r) {
//            if (!r) {
//                // showError("原始密码错误！");
//                showErrorIndex('showErrorMessage0', 'errorMessage0', '原始密码错误!');
//            } else {
//
//                accountService.updatePassword(oldpwd, newPwd, function (r) {
//                    if (r.success) {
//                        //                CccOk.create({
//                        //                    msg: '交易密码修改成功！',
//                        //                    okText: '确定',
//                        //                    // cancelText: '重新登录',
//                        //                    ok: function () {
//                        //                        window.location.href = "/newAccount/recharge";
//                        //                    },
//                        //                    cancel: function () {
//                        //                        window.location.reload();
//                        //                    }
//                        //                });
//                        //                return;
//                        $('.resetfundpass').css('display', 'block');
//                        $('.paypwd-wp').css('display', 'none');
//                    }
//                });
//            }
//
//        });
//
//    }
//});



passwordRactive.on('sendCode', function (){
	var pwd = this.get('password');
	var repwd = this.get('repassword');
    if(pwd === ""||repwd === ""){
			  return showErrorIndex('showErrorMessagec','errorMessagec','交易密码不能为空');
		}
    if (!this.get('isSend')) {
        this.set('isSend', true);
        var smsType = 'CONFIRM_CREDITMARKET_RESET_PAYMENTPASSWORD';
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
            passwordRactive.set('isSend', true);
            $('.sendCode')
                .html(previousText);
            $('.sendCode')
                .removeClass('disabled');
			passwordRactive.set('isSend',false);
            clearInterval(interval);
        }
    }), 1000);
}


passwordRactive.on('checksms',function(){
  var smsCaptcha = this.get('smsCaptcha');
    this.set('isAcessc',false);
    if (smsCaptcha.length < 6 || smsCaptcha === '') {
        showErrorIndex('showErrorMessagec','errorMessagec','短信验证码为6位');
  }else {
    clearErrorIndex('showErrorMessagec','errorMessagec');
      this.set('isAcessc',true);
  }
});


passwordRactive.on('resetPassword', function () {
    var pwd = this.get('password');
    var repwd = this.get('repassword');
    var smsCaptcha = this.get('smsCaptcha');
		var isAcess=this.get('isAcessa')&&this.get('isAcessb')&&this.get('isAcessc');
    passwordRactive.fire('checkpwd');
    passwordRactive.fire('checkrepwd');
		passwordRactive.fire('checksms');
    // if (pwd === "") {
    //     return showError('请填写交易密码');
    // } else if (pwd.indexOf(" ") >=0) {
    //     return showError("密码不能为空格");
    // } else if (pwd.length < 6) {
    //     return showError('交易密码至少为6位');
    // } else if (pwd !== repwd ) {
    //     return showError('两次密码输入不一致');
    // } else if (smsCaptcha.length < 6 || smsCaptcha === '') {
    //     return showError('短信验证码为6位');
    // } else {
        // clearError();
//        isAcess = true;
        // if (pwd === '') {
        //     var r = confirm('您未输入重置密码，系统将生成随机的交易密码并发送到您的手机上,确定这样做吗？');
        //     if (r) {
        //         isAcess = true;
        //     } else {
        //         isAcess = false;
        //     }
        // }

        if(isAcess) {
					accountService.checkPassword(pwd,function(r){
	       if(r){
			        showErrorIndex('showErrorMessagea','errorMessagea','与原密码相同');
	             }else{
            accountService.resetPassword(pwd, smsCaptcha, function (r) {
                if (r) {
//                    CccOk.create({
//                        msg: '交易密码重置成功！',
//                        okText: '确定',
//                        // cancelText: '重新登录',
//                        ok: function () {
//                            window.location.href = "/newAccount/home";
//                        },
//                        cancel: function () {
//                            window.location.reload();
//                        }
//                    });
//                    return;
                    
                    
                    $('.resetfundpass').css('display', 'block');
                $('.initialWra').css('display', 'none');
                    
                    
                    
                }
								else{
									showErrorIndex('showErrorMessagec','errorMessagec','短信验证码错误');
								}
            });}});
        }

    // }
});

passwordRactive.on('tab', function (event) {
    var step = event.node.getAttribute('data-step');
    passwordRactive.set('step', step);
    clearError();
});

$("#newPassword").keyup(function () {
    var newPassword = $("#newPassword").val();
    if (newPassword.indexOf(' ') > -1) {
        showError("含有非法字符:空格");
    } else {
        passwordRactive.set({
            showErrorMessage: false
        });
    }

});
$("#oldPassword").blur(function () {
    var oldPassword = $("#oldPassword").val().trim();

    accountService.checkPassword(oldPassword, function (r) {
        if (!r) {
            showError("原始密码错误！");
        } else {
            passwordRactive.set({
                showErrorMessage: false
            });
        }

    });
});


CommonService.getCaptcha(function (res) {
    passwordRactive.set('captcha', {
        img: res.captcha,
        token: res.token,
        text: ''
    });
});

passwordRactive.on('changeCaptcha', function () {
    CommonService.getCaptcha(function (res) {
        passwordRactive.set('captcha', {
            img: res.captcha,
            token: res.token
        });
    });
});

//登陆原密码判定
passwordRactive.on('checkcurrentpwd', function () {
    var currentPassword = this.get("currentPassword");
    this.set('isAcessc', false);
    if (!currentPassword) {
        showErrorIndex('showErrorMessagec', 'errorMessagec', '还未填写原密码');
    } else {
        clearErrorIndex('showErrorMessagec', 'errorMessagec');
        this.set('isAcessc', true);
    }
});
passwordRactive.on('checknewp', function () {
    var currentPassword = this.get("currentPassword");
    var newPassword = this.get("newPassword");
    var passwordConfirm = this.get("passwordConfirm");
    this.set('isAcessd', false);
    if (!newPassword) {
        showErrorIndex('showErrorMessaged', 'errorMessaged', '还未填写新密码');
    } else if (newPassword.length < 6) {
        showErrorIndex('showErrorMessaged', 'errorMessaged', '密码长度必须大于6位');
    } else if (newPassword.indexOf(" ") >= 0) {
        showErrorIndex('showErrorMessaged', 'errorMessaged', '密码不能为空格');
    } else {
        clearErrorIndex('showErrorMessaged', 'errorMessaged');
        this.set('isAcessd', true);
    }
});
passwordRactive.on('checkrepwdConfirm', function () {
    var currentPassword = this.get("currentPassword");
    var newPassword = this.get("newPassword");
    var passwordConfirm = this.get("passwordConfirm");
    this.set('isAcesse', false);
    if (!passwordConfirm) {
        showErrorIndex('showErrorMessagee', 'errorMessagee', '请重复新密码');
    } else if (newPassword !== passwordConfirm) {
        showErrorIndex('showErrorMessagee', 'errorMessagee', '两次密码不一致');
    } else {
        clearErrorIndex('showErrorMessagee', 'errorMessagee');
        this.set('isAcesse', true);
    }
});
//passwordRactive.on('checkCaptcha', function () {
//    var captcha = this.get("captcha.captcha");
//    this.set('isAcessf', false);
//    if (!captcha) {
//        showErrorIndex('showErrorMessagef', 'errorMessagef', '请填写图形验证码');
//    } else {
//        clearErrorIndex('showErrorMessagef', 'errorMessagef');
//        this.set('isAcessf', true);
//    }
//});
passwordRactive.on("submit-modify-password", function (event) {
    event.original.preventDefault();
    var currentPassword = this.get("currentPassword");
    var newPassword = this.get("newPassword");
    var passwordConfirm = this.get("passwordConfirm");
    //    var captcha = this.get("captcha.captcha");
    passwordRactive.fire('checkcurrentpwd');
    passwordRactive.fire('checknewp');
    passwordRactive.fire('checkrepwdConfirm');
    //    passwordRactive.fire('checkCaptcha');
    //    var isAcess = this.get('isAcessc') && this.get('isAcessf') && this.get('isAcesse') && this.get('isAcessd');
    //    if (!isAcess) {
    //        return false;
    //    }
    //    CommonService.checkCaptcha(passwordRactive.get('captcha'), function (res) {
    //        if (res.success) {
    if (currentPassword === newPassword) {
        return showErrorIndex('showErrorMessaged', 'errorMessaged', '新密码不能与原始密码相同');
    } else if (newPassword !== passwordConfirm) {
        return showErrorIndex('showErrorMessagee', 'errorMessagee', '两次密码不一致');
    }
    request.post("/api/v2/user/MYSELF/change_password")
        .type("form")
        .send({
            currentPassword: currentPassword,
            newPassword: newPassword,
            //                    captcha: captcha
        })
        .end(function (err, res) {
            res = JSON.parse(res.text);

            if (res.success) {

                //                        CccOk.create({
                //                            msg: '恭喜您修改密码成功！',
                //                            okText: '确定',
                //                            cancelText: '重新登录',
                //                            ok: function () {
                //                                window.location.pathname = "/login";
                //                            },
                //                            cancel: function () {
                //                                window.location.reload();
                //                            }
                //                        });
                //
                //                        return;
                $('.resetfundpass').css('display', 'block');
                $('.modify-password-wrapper').css('display', 'none');
            }

            // var msg = res.message;
            return showErrorIndex('showErrorMessagec', 'errorMessagec', '原始密码错误');
        });
    //        } else {
    //            return showErrorIndex('showErrorMessagef', 'errorMessagef', '图片验证码错误或已失效');
    //        }
    //    });


    return false;
});


function showError(msg) {
    passwordRactive.set({
        showErrorMessage: true,
        errorMessage: msg
    });

    return false;
}

function clearError(msg) {
    passwordRactive.set({
        showErrorMessage: false,
        errorMessage: ''
    });
}