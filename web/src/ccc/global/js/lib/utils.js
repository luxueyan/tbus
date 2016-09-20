"use strict";
module.exports = (function () {


    // 公用表单验证组件

    var FormValidator = function () {};

    FormValidator.prototype = {

        checkLoginName: function (loginName, next) {
            var reg =
                /^(?!(([1][3|5|7|8][0-9]{9})|([\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+)))([0-9a-zA-Z_\u4E00-\u9FBF]+)/;

            if (!loginName || !loginName.length) {
                next(false, 'LOGINNAME_NULL');
                return;
            }

            if (loginName.length < 2 || loginName.length > 30) {
                next(false, 'LOGINNAME_SIZE');
                return;
            }

            if (!!('' + loginName).match(/[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+/)) {
                next(false, 'LOGINNAME_NOT_EMAIL');
                return;
            }

            if (!!('' + loginName).match(/^[1][3|5|7|8][0-9]{9}$/)) {
                next(false, 'LOGINNAME_NOT_MOBILE');
                return;
            }

            next(true, null);
        },

        checkRegisterName: function (registerName, next) {
            var reg =
                /^(?!(([1][3|5|7|8][0-9]{9})|([\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+)))([0-9a-zA-Z_\u4E00-\u9FBF]+)/;

            if (!registerName || !registerName.length) {
                next(false, 'LOGINNAME_NULL');
                return;
            }

            if (!('' + registerName)
                .match(reg)) {
                next(false, 'LOGINNAME_INVALID');
                return;
            }

            if (registerName.indexOf('-') >= 0) {
                next(false, 'LOGINNAME_INVALID');
                return;
            }

            if (registerName.length < 2 || registerName.length >
                30) {
                next(false, 'LOGINNAME_SIZE');
                return;
            }

            next(true, null);
        },

        checkPassword: function (password, next) {

            if (!password || !password.length) {
                next(false, 'PASSWORD_NULL');
                return;
            }

            if (password.length < 6) {
                next(false, 'PASSWORD_LENGTH');
                return;
            }

            next(true, null);
        },
        checkRePassword: function (password, repassword, next) {

            if (!repassword || !repassword.length) {
                next(false, 'REPASSWROD_NULL');
                return;
            }

            if (repassword !== password) {
                next(false, 'REPASSWORD_INVALID');
                return;
            }

            next(true, null);
        },

        checkEmail: function (email, next) {
            if (!email || !email.length) {
                next(false, 'EMAIL_NULL');
                return;
            }
            if (!('' + email).match(/[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+/)) {
                next(false, 'EMAIL_INVALID');
                return;
            }
            next(true, null);
        },
        checkMobile: function (mobile, next) {
            if (!mobile || !mobile.length) {
                next(false, 'MOBILE_NULL');
                return;
            }
            if (!('' + mobile)
                .match(/^[1][3|5|7|8][0-9]{9}$/)) {
                next(false, 'MOBILE_INVALID');
                return;
            }
            next(true, null);
        },
        checkIdNumber: function (idNumber, next) {
            idNumber = ('' + idNumber).replace(/^\s+|\s+$/g, '');
            var pcode = []; //只有这些数字开头的代码才是合法的
            pcode.push("11"); //北京
            pcode.push("12"); //天津
            pcode.push("13"); //河北
            pcode.push("14"); //山西
            pcode.push("15"); //内蒙古
            pcode.push("21"); //辽宁
            pcode.push("22"); //吉林
            pcode.push("23"); //黑龙江
            pcode.push("31"); //上海
            pcode.push("32"); //江苏
            pcode.push("33"); //浙江
            pcode.push("34"); //安徽
            pcode.push("35"); //福建
            pcode.push("36"); //江西
            pcode.push("37"); //山东
            pcode.push("41"); //河南
            pcode.push("42"); //湖北
            pcode.push("43"); //湖南
            pcode.push("44"); //广东
            pcode.push("45"); //广西
            pcode.push("46"); //海南
            pcode.push("50"); //重庆
            pcode.push("51"); //四川
            pcode.push("52"); //贵州
            pcode.push("53"); //云南
            pcode.push("54"); //西藏
            pcode.push("61"); //陕西
            pcode.push("62"); //甘肃
            pcode.push("63"); //青海
            pcode.push("64"); //宁夏
            pcode.push("65"); //新疆
            if (!~pcode.indexOf(idNumber.substring(0, 2))) {
                if (next) {
                    next(false, 'IDNUMBER_INVALID');
                    return;
                } else {
                    return {
                        success: false,
                        data: 'IDNUMBER_INVALID'
                    };
                }
            }

            var factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9,
                10, 5, 8, 4,
                2
            ];
            var validEnding = ["1", "0", "X", "9", "8", "7",
                "6", "5", "4",
                "3", "2"
            ];
            
            if (idNumber[17] != validEnding[_.reduce(factor,
                function (r, n, i) {
                    return r + n * ~~idNumber[i];
                }, 0) % 11]) {
                if (next) {
                    next(false, 'IDNUMBER_INVALID');
                    return;
                } else {
                    return {
                        success: false,
                        data: 'IDNUMBER_INVALID'
                    };
                }
            }
            if (next) {
                next(true, null);
                return;
            } else {
                return {
                    success: true,
                    data: null
                };
            }
        },
        checkName: function (name, next) {
            if (!name || !name.length) {
                next(false, 'NAME_NULL');
                return;
            }
            if (!('' + name)
                .match(/[\u4E00-\u9FBF]{2,15}/)) {
                next(false, 'NAME_INVALID');
                return;
            }
            next(true, null);
        },
        checkSmsCaptcha: function (sms, next) {
            if (!sms || !sms.length) {
                next(false, 'SMSCAPTCHA_NULL');
                return;
            }

            if (sms.length !== 6) {
                next(false, 'SMSCAPTCHA_INVALID');
                return;
            }
            next(true, null);
        }
    };

    var ErrorMsg = {
        PASSWORD_NULL: '请填写密码,不能为空字符',
        PASSWORD_LENGTH: '密码由6-20位数字和字母组成，区分大小写，不能包含空字符',
        PASSWORD_AGAIN_NULL: '请填写密码确认',
        PASSWORD_AGAIN_INVALID: '两次输入的密码不一致',
        REPASSWORD_NULL: '请填写密码确认',
        REPASSWORD_INVALID: '两次输入的密码不一致',
        MOBILE_USED: '手机号码已被使用',
        MOBILE_CAPTCHA_NULL: '请填写手机短信验证码',
        MOBILE_CAPTCHA_INVALID: '验证码无效或已过期，请尝试重新发送',
        MOBILE_CAPTCHA_EXPIRED: '验证码过期，请尝试重新发送',
        AGREEMENT_NULL: '注册需先同意服务条款',
        CAPTCHA_NULL: '请填写验证码',
        CAPTCHA_INVALID: '验证码不正确',
        MOBILE_NULL: '请填写手机号码',
        MOBILE_INVALID: '请输入正确的手机号',
        LOGINNAME_EXISTS: '用户名已存在',
        LOGINNAME_STRICT: '2至15位中英文字符、数字或下划线',
        LOGINNAME_NULL: '请填写用户名',
        LOGINNAME_INVALID: '2至15位中英文字符、数字或下划线',
        LOGINNAME_SIZE: '2至15位中英文字符、数字或下划线',
        LOGINNAME_NOT_MOBILE: '用户名不能是手机号（注册后可以用手机号登录）',
        LOGINNAME_NOT_EMAIL: '用户名不能是邮箱',
        NAME_NULL: '请填写真实姓名',
        NAME_INVALID: '真实姓名错误，应为2-15位中文汉字',
        EMAIL_NULL: '请填写电子邮箱',
        EMAIL_INVALID: '请输入正确的邮箱',
        IDNUMBER_INVALID: '请正确填写 18 位身份证号码',
        LOGIN_INVALID: '手机号或密码错误',
        INVALID_CAPTCHA: '验证码错误',
        LOGINNAME_NOT_MATCH: '手机号码与登录名不匹配',
        INVITATION_INVALID: 'H码无效',
        INVITATION_NULL: 'H码为空',
        PAYMENT_ACCOUNT_CREATE_ERROR: '国政通实名认证校验未通过',
        SMSCAPTCHA_INVALID: '验证码为6位',
        SMSCAPTCHA_NULL: '验证码不能为空',
        IDNUMBER_NULL: '身份证号不能为空'
    };

    var CountDown = function () {};

    CountDown.prototype = {
        getCountDownTime: function (time, serverDate, next) {
            time = parseInt(time, 10);
            if (!time || time === null) {
                return;
            }

            var checkTime = function (i) {
                if (i < 10) {
                    i = "0" + i;
                }
                return i;
            };
            var leftTime = (new Date(time)) - (new Date(
                serverDate));
            if (leftTime < 0) {
                return;
            }
            var dd = Math.floor(leftTime / 1000 / 60 / 60 / 24);
            leftTime -= dd * 1000 * 60 * 60 * 24;
            var hh = Math.floor(leftTime / 1000 / 60 / 60);
            leftTime -= hh * 1000 * 60 * 60;
            var mm = Math.floor(leftTime / 1000 / 60);
            leftTime -= mm * 1000 * 60;
            var ss = Math.floor(leftTime / 1000);

            // 倒计时完成后刷新页面
            if (hh === 0 && mm === 0 && ss === 0) {
                setTimeout((function () {
                    window.location.reload();
                }), 2000);
            }
            leftTime -= ss * 1000;
            dd = checkTime(dd);
            hh = checkTime(hh);
            mm = checkTime(mm);
            ss = checkTime(ss);
            var o = {
                day: dd,
                hour: parseInt(hh, 10) + (dd > 0 ? dd * 24 :
                    0),
                min: mm,
                sec: ss
            };
            if (next) {
                next(o);
            } else {
                return o;
            }
        },
        getCountDownTime2: function (time, serverDate, next) {
            time = parseInt(time, 10);
            if (!time || time === null) {
                return;
            }

            var checkTime = function (i) {
                if (i < 10) {
                    i = "0" + i;
                }
                return i;
            };
            var leftTime = (new Date(time)) - (new Date(
                serverDate));
            if (leftTime < 0) {
                return;
            }
            var dd = Math.floor(leftTime / 1000 / 60 / 60 / 24);
            leftTime -= dd * 1000 * 60 * 60 * 24;
            var hh = Math.floor(leftTime / 1000 / 60 / 60);
            leftTime -= hh * 1000 * 60 * 60;
            var mm = Math.floor(leftTime / 1000 / 60);
            leftTime -= mm * 1000 * 60;
            var ss = Math.floor(leftTime / 1000);
            leftTime -= ss * 1000;
            dd = checkTime(dd);
            hh = checkTime(hh);
            mm = checkTime(mm);
            ss = checkTime(ss);
            var o = {
                day: dd,
                hour: hh,
                min: mm,
                sec: ss
            };
            if (next) {
                next(o);
            } else {
                return o;
            }
        }
    };

    // 格式化duration
    var formateDuration = function (dur) {
        var _month = 0;
        if (dur.days > 0) {
            if (typeof dur.totalDays === "undefined") {
                _month = dur.days + "天";
            } else {
                _month = dur.totalDays + "天";
            }
        } else {
            if (dur.years > 0) {
                _month += dur.years * 12;
            }
            if (dur.months > 0) {
                _month += dur.months;
            }
            _month = _month + "个月";
        }
        return _month;
    };

    // 格式化银行卡号
    var bankAccount = function (str) {
        str = str.toString();
        str = str.trim();
        var result = '';
        if (str.length === 16) {
            result = str.substring(0, 4) + ' ' + '**** ****' + ' ' +
                str.substring(
                    12);
        } else if (str.length === 19) {
            result = str.substring(0, 6) + ' ' + '*******' + ' ' +
                str.substring(
                    13);
        } else {
            console.error('Bank account number ' + str +
                ' is invalid');
            result = str;
        }
        //return result.replace(/\s/g, '&nbsp;')
        return result;
    };

    // format amount
    var formatAmount = function (s, n) {
        n = n > 0 && n <= 20 ? n : 0;
        if (s < 0) {
            var _s = 0;
            return _s.toFixed(n);
        }
        s = parseFloat((s + "")
            .replace(/[^\d\.-]/g, ""))
            .toFixed(n) + "";
        var l = s.split(".")[0].split("")
            .reverse();
        var r = s.split(".")[1];
        var t = "",
            i;
        for (i = 0; i < l.length; i++) {
            t += l[i] + ((i + 1) % 3 === 0 && (i + 1) !== l.length ?
                "," :
                "");
        }
        if (r) {
            return t.split("")
                .reverse()
                .join("") + "." + r; // 99.99
        } else {
            return t.split("")
                .reverse()
                .join("");
        }
    };

    // format percent
    var formatPercent = function (percent, offset) {
        console.log("1111")
        console.log(percent)
        console.log("1111")
        percent = percent.toString();
        if (offset === undefined || offset === null) {
            offset = 2;
        }
        if (percent.indexOf('.') === -1) {
            return percent;
        } else {
            if (offset === 0) {
                return percent.substring(0, percent.indexOf("."));
            } else {
                return percent.substring(0, percent.indexOf(".") +
                    (offset +
                        1));
            }
        }
    };

    // format timeElapsed 

    var timeElapsed = function (timeElapsed, isobj) {
        if (timeElapsed < 0) {
            return;
        }
        var s = ~~ (timeElapsed / 1000),
            m = 0,
            h = 0,
            d = 0;
        var result = '';

        if (s > 59) {
            m = ~~ (s / 60);
            s = s % 60;
        }
        if (m > 59) {
            h = ~~ (m / 60);
            m = m % 60;
        }
        if (h > 24) {
            d = ~~ (h / 24);
            h = h % 24;
        }

        if (s < 0) {
            s = 0;
        }
        result = '' + s + '秒';
        if (m) {
            result = '' + m + '分' + result;
        }
        if (h) {
            result = '' + h + '小时' + result;
        }
        if (d) {
            result = '' + d + '天' + result;
        }
        return !isobj ? result : {
            day: d,
            hour: h,
            min: m,
            sec: parseInt(s)
        };
    };

    var ieCheck = function () {
        var version = typeof navigator !== 'undefined' &&
            navigator.appVersion &&
            navigator.appVersion.match(/MSIE ([\d.]+)/);

        return version ? Number(version[1]) || 0 : 0;
    };
    
    var match = {
        mobile: function (mobile) {
            var req = /^[1][3|5|7|8][0-9]{9}$/;
            return !!mobile.toString().match(req);
        },
        amount: function (amount) {
            var exp = /^([1-9][\d]{0,7}|0)(\.[\d]{1,2})?$/;
            return exp.test(amount);
        },
        email: function (email) {
            var exp = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/;
            return exp.test(email);
        },
        // 6到20位数字字母密码
        password: function (s){
            return !!s.match(/[0-9a-zA-Z]{6,20}/);
        }
    };
    
    
    var tool = {
        jsonToParams: function (params) {
            var str = '';
            for (var key in params) {
                if (typeof params[key] === 'object') {
                    for (var i=0; i<params[key].length; i++) {
                        str += '&' + key + '=' + params[key][i];
                    }
                } else {
                    if (params.hasOwnProperty(key)) {
                        str += '&' + key + '=' + params[key];
                    }
                }
            }
            return str;
        },
        setDate: function(date) {
            var _date, y, m, d;
            _date = date.split("-");
            y = parseInt(_date[0]);
            m = parseInt(_date[1]);
            d = parseInt(_date[2]);
            if (m < 10) {
                m = '0' + m;
            }
            if (d < 10) {
                d = '0' + d;
            }
            return y + '-' + m + '-' + d;
        },

        loadScript: function(url, callback) {
            var _script = document.createElement("script");
            _script.setAttribute('type','text/javascript');
            _script.setAttribute('src',url);
            document.getElementsByTagName("head")[0].appendChild(_script);
            if (_script.readyState) {
                //IE
                _script.onreadystatechange = function () {
                    if (_script.readyState == "loaded" || _script.readyState == "complete") {
                        _script.onreadystatechange = null;
                        callback();
                    }
                };
            } else {
                //非IE
                _script.onload = function () {
                    callback();
                };
            }
        }
    };

    // 暴露接口
    return {
        formValidator: new FormValidator(),
        errorMsg: ErrorMsg,
        countDown: new CountDown(),
        format: {
            amount: formatAmount,
            duration: formateDuration,
            percent: formatPercent,
            timeElapsed: timeElapsed
        },
        bankAccount: bankAccount,
        i18n: require('@ds/i18n')['zh-cn'].enums,
        ieCheck: ieCheck,
        match: match,
        tool: tool
    };

})();
