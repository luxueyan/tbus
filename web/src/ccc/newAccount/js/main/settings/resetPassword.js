"use strict";
var CommonService = require('ccc/global/js/modules/common').CommonService;
var accountService = require('ccc/newAccount/js/main/service/account').accountService;
var CccOk = require('ccc/global/js/modules/cccOk');

var resetPasswordRactive = new Ractive({
	el: '#ractive-container',
	template: require('ccc/newAccount/partials/settings/resetPassword.html'),
	data: {
	}
});
resetPasswordRactive.on('checkpwd',function(){
  var pwd = this.get('password');
  var rePwd = this.get('repassword');
    this.set('isAcessa',false);
    if (pwd === '') {
        showErrorIndex('showErrorMessagea','errorMessagea','密码不能为空');
    } else if (pwd.length < 6) {
        showErrorIndex('showErrorMessagea','errorMessagea','交易密码长度最少为6位');
  }else {
    clearErrorIndex('showErrorMessagea','errorMessagea');
      this.set('isAcessa',true);
  }
});
resetPasswordRactive.on('checkrepwd',function(){
  var pwd = this.get('password');
  var rePwd = this.get('repassword');
    this.set('isAcessb',false);
    if (rePwd === '') {
        showErrorIndex('showErrorMessageb','errorMessageb','密码不能为空');
    } else if (pwd !== rePwd) {
        showErrorIndex('showErrorMessageb','errorMessageb','两次密码输入不一致');
  }else {
    clearErrorIndex('showErrorMessageb','errorMessageb');
      this.set('isAcessb',true);
  }
});
resetPasswordRactive.on('checksms',function(){
  var smsCaptcha = this.get('smsCaptcha');
    this.set('isAcessc',false);
    if (smsCaptcha.length < 6 || smsCaptcha === '') {
        showErrorIndex('showErrorMessagec','errorMessagec','短信验证码为6位');
  }else {
    clearErrorIndex('showErrorMessagec','errorMessagec');
      this.set('isAcessc',true);
  }
});
resetPasswordRactive.on('resetPassword', function () {
    var pwd = this.get('password');
    var repwd = this.get('repassword');
    var smsCaptcha = this.get('smsCaptcha');

    resetPasswordRactive.fire('checkpwd');
    resetPasswordRactive.fire('checkrepwd');
		resetPasswordRactive.fire('checksms');
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
    var isAcess=this.get('isAcessa')&&this.get('isAcessb')&&this.get('isAcessc');

        if(isAcess) {
					accountService.checkPassword(pwd,function(r){
	       if(r){
			        showErrorIndex('showErrorMessagea','errorMessagea','与原密码相同');
	             }else{
            accountService.resetPassword(pwd, smsCaptcha, function (r) {
                if (r) {
                    CccOk.create({
                        msg: '交易密码重置成功！',
                        okText: '确定',
                        // cancelText: '重新登录',
                        ok: function () {
                            window.location.href = "/newAccount/home/index";
                        },
                        cancel: function () {
                            window.location.reload();
                        }
                    });
                    return;
                }
								else{
									showErrorIndex('showErrorMessagec','errorMessagec','短信验证码错误');
								}
            });}});
        }

    // }
});

resetPasswordRactive.on('sendCode', function (){
	var pwd = this.get('password');
	var repwd = this.get('repassword');
    //if(pwd === ""||repwd === ""){
    //        return showErrorIndex('showErrorMessagec','errorMessagec','交易密码不能为空');
		//}
    if (!this.get('isSend')) {
        this.set('isSend', true);
        var smsType = 'CREDITMARKET_RESET_PAYMENTPASSWORD';
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
            resetPasswordRactive.set('isSend', true);
            $('.sendCode')
                .html(previousText);
            $('.sendCode')
                .removeClass('disabled');
			resetPasswordRactive.set('isSend',false);
            clearInterval(interval);
        }
    }), 1000);
}

// function showError(msg) {
//     resetPasswordRactive.set({
//         showErrorMessage: true,
//         errorMessage: msg
//     });
//
//     return false;
// }
// function clearError(msg) {
//     resetPasswordRactive.set({
//         showErrorMessage: false,
//         errorMessage: ''
//     });
// }
function clearErrorIndex(key,msgkey){
  resetPasswordRactive.set(key,false);
  resetPasswordRactive.set(msgkey,'');
  return false;
}
function showErrorIndex(key,msgkey,msg){
  resetPasswordRactive.set(key,true);
  resetPasswordRactive.set(msgkey,msg);
return false;
}
