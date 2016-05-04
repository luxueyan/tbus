var applyLoanService = require('../service/applyloan').applyLoanService;
var CommonService = require('ccc/global/js/modules/common').CommonService;
var validate = require('ccc/global/js/lib/jquery.validate.min');
var Box = require('ccc/global/js/modules/cccBox');
var applyLoan = new Ractive({
    el: '#applyloan-page',
    template: require('../../partials/applyloan.html'),
    data: {
        captcha: {
            img: '',
            token: ''
        },
        loan: {
            name: ''
        }
    }

});

$.validator.addMethod("mobile", function (value, element) {
    var length = value.length;
    var mobile = /(^1[3|5|8][0-9]{9}$)/;
    return this.optional(element) || (length == 11 && mobile.test(value));
}, "手机号码格式错误");

$.validator.addMethod("amount", function (value, element) {
    var length = value.length;
    var amount = /(^[^0][0-9]{0,}$)/;
    return this.optional(element) || (length < 10 && amount.test(value));
}, "借款金额错误");
$.validator.addMethod("deadline", function (value, element) {
    var length = value.length;
    var deadline = /^\d+$/;
    return this.optional(element) || (value <= 48 && deadline.test(value));
}, "借款期限格式有误，必须为小于48的正整数");

// 只能输入中文或英文
$.validator.addMethod("egchinese", function (value, element) {
    var chinese = /^[\u4e00-\u9fa5a-zA-Z]+$/;
    return this.optional(element) || (chinese.test(value));
}, "只能输入中文或英文字母");

// 组织机构代码
$.validator.addMethod("organizing", function (value, element) {
    var organizing = /^([0-9a-z]){8}-[0-9|x]$/;
    return this.optional(element) || (organizing.test(value));
}, "组织机构代码格式错误");

$.validator.addMethod("checkEmail", function (value, element) {
    var email = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return this.optional(element) || (email.test(value));
}, "邮箱地址代码格式错误");

var v = $("#loanForm").validate({
    rules: {
        companyName: {
          required: true,        
          egchinese: true          
        },
        organizing: {
            required: true,
            organizing: true
        },
        personName: {
          required: true,
          egchinese: true              
        },
        mobilePhone: {
            required: true,
            minlength: 11,
            maxlength: 11,
            mobile: true
        },
        companyAddress: {
            required: true
        },        
        emailAddress: {
            required: true,
            checkEmail:true
        },
        loanMoney: {
            required: true,
            minlength: 1,
            maxlength: 9,
            amount: true
        },
        loanPurpos:{
           required:true 
        },
        guaranteeType: {
            required: true
        },
        deadline: {
            required: true,
            minlength: 1,
            maxlength: 2,
            deadline: true
        },
        contactAddress: {
            required: true
        },
        describe: {
            required: true
        },
        confirmCode: {
            required: true,
            minlength: 5,
            maxlength: 5
        }
    },
    messages: {
        companyName: {
            required: "输入企业名称"
        },
        organizing: {
            required: "请输入组织机构代码"
        },
        personName: {
            required: "输入联系人姓名"
        },
        mobilePhone: {
            required: "输入手机号",
            minlength: "手机号码为11位",
            maxlength: "手机号码为11位"
        },
        companyAddress: {
            required: "请输入您的地址"
        },        
        emailAddress: {
            required: "请输入您的电子邮箱"
        },
        loanMoney: {
            required: "请输入借款金额",
            minlength: "借款金额不能为0",
            maxlength: "借款金额不能超过1亿"
        },
        loanPurpos:{
            required:"请输入借款用途"
        },
        guaranteeType: {
            required: "请选择担保方式"
        },
        deadline: {
            required: "请输入借款期限",
            minlength: "借款期限不能为0",
            maxlength: "借款期限不能超过48个月"
        },
        contactAddress: {
            required: "请输入您的联系地址"
        },
        describe: {
            required: "请输入您的借款意图"
        },
        confirmCode: {
            required: "请输入验证码",
            minlength: "验证码为5位",
            maxlength: "验证码为5位"
        }
    },
    errorClass: "error",
    errorPlacement: function (error, element) { //指定错误信息位置
        if (element.is(':radio') || element.is(':checkbox')) { //如果是radio或checkbox
            var eid = element.attr('name'); //获取元素的name属性
            error.appendTo(element.parent().parent()); //将错误信息添加当前元素的父结点后面
        } else {
            error.insertAfter(element.parent());
        }
    }

});


// 获取验证码
CommonService.getCaptcha(function (res) {
    applyLoan.set('captcha', {
        img: res.captcha,
        token: res.token
    });
});

applyLoan.on('changeCaptcha', function () {
    CommonService.getCaptcha(function (res) {
        applyLoan.set('captcha', {
            img: res.captcha,
            token: res.token
        });
    });
});

$('#sendApplyloan').click(function () {
    if (!v.form()) {
        $('.loan-limit').addClass('error');
        return;
    }
    var loan = {};

    loan.coporationName = $("#companyName").val().trim();
    loan.mobile = parseInt($("#mobilePhone").val().trim());
    loan.amount = parseInt($("#loanMoney").val().trim());
    loan.loanType = $("#loanType").find("option:selected").val();
//    loan.loanPurpose = $("#loanPurpose").find("option:selected").val();
    loan.loanPurposeCustomized = $("#loanPurpos").val().trim();
    var months = parseInt($("#months").val().trim());
    loan.months = months;
    loan.year = parseInt(months / 12);
    loan.name = $("#personName").val();
    loan.address = $("#companyAddress").val();
    loan.status = 'PROPOSED';


    applyLoanService.addNew(loan, function (body) {
        if (body.success) {
            $(".success-box").css('display', 'inline');
            $(".loan-content").css('opacity', '0.5');
        } else {
            alert("申请借款失败");
        }
    });

});

    $(".success-colse").click(function () {
        $(".success-box").css('display', 'none');
        $(".loan-content").css('opacity', '1');
    });