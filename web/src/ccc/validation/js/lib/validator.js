'use strict';

exports.loginName = function (loginName) {
    var reg = /^(?!([\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+))([0-9a-zA-Z_\u4E00-\u9FBF]+)/;

    if (!loginName || !loginName.length) {
        return 'LOGINNAME_NULL';
    }

    if (loginName.length < 2 || loginName.length > 16) {
        return 'LOGINNAME_SIZE';
    }

    if (!exports.mobile(loginName)) {
        return 'LOGINNAME_NOT_MOBILE';
    }

    if (!('' + loginName).match(reg)) {
        return 'LOGINNAME_INVALID';
    }

    return false;
};

exports.password = function (password) {
    if (!password || !password.length) {
        return 'PASSWORD_NULL';
    }

    if (password.length < 6) {
        return 'PASSWORD_LENGTH';
    }

    return false;
};

exports.repassword = function (password, repassword) {
    if (!repassword || !repassword.length) {
        return 'REPASSWORD_NULL';
    }

    if (repassword !== password) {
        return 'REPASSWORD_INVALID';
    }

    return false;
};

exports.passwordStrength = function (password) {
    var upperReg = /[A-Z]/;
    var lowerReg = /[a-z]/;
    var numReg = /[0-9]/;
    var symbolReg = /\W/;

    if ((password || '').length < 6) {
        return 0;
    }

    var score = 0;
    if (upperReg.test(password)) {
        score += 0.6;
    }
    if (lowerReg.test(password)) {
        score += 0.6;
    }
    if (numReg.test(password)) {
        score += 0.6;
    }
    if (symbolReg.test(password)) {
        score += 0.9;
    }
    return Math.ceil(score);
};

exports.email = function (email) {
    if (!email || !email.length) {
        return 'EMAIL_NULL';
    }

    if (!('' + email).match(/[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+/)) {
        return 'EMAIL_INVALID';
    }

    return false;
};

exports.mobile = function (mobile) {
    if (!mobile || !mobile.length) {
        return 'MOBILE_NULL';
    }

    if (!('' + mobile)
        .match(/^1\d{10}$/)) {
        return 'MOBILE_INVALID';
    }

    return false;
};

exports.checkIdNumber = function (idNumber) {
    idNumber = ('' + idNumber).replace(/^\s+|\s+$/g, '');
    var pcode = []; //只有这些数字开头的代码才是合法的
    pcode.push('11'); //北京
    pcode.push('12'); //天津
    pcode.push('13'); //河北
    pcode.push('14'); //山西
    pcode.push('15'); //内蒙古
    pcode.push('21'); //辽宁
    pcode.push('22'); //吉林
    pcode.push('23'); //黑龙江
    pcode.push('31'); //上海
    pcode.push('32'); //江苏
    pcode.push('33'); //浙江
    pcode.push('34'); //安徽
    pcode.push('35'); //福建
    pcode.push('36'); //江西
    pcode.push('37'); //山东
    pcode.push('41'); //河南
    pcode.push('42'); //湖北
    pcode.push('43'); //湖南
    pcode.push('44'); //广东
    pcode.push('45'); //广西
    pcode.push('46'); //海南
    pcode.push('50'); //重庆
    pcode.push('51'); //四川
    pcode.push('52'); //贵州
    pcode.push('53'); //云南
    pcode.push('54'); //西藏
    pcode.push('61'); //陕西
    pcode.push('62'); //甘肃
    pcode.push('63'); //青海
    pcode.push('64'); //宁夏
    pcode.push('65'); //新疆
    if (!~pcode.indexOf(idNumber.substring(0, 2))) {
        return 'IDNUMBER_INVALID';
    }

    var factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    var validEnding = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
    var result = _.reduce(factor, function (r, n, i) { return r + n * ~~idNumber[i]; }, 0) % 11;

    if (idNumber[17] != validEnding[result]) {
        return 'IDNUMBER_INVALID';
    }
    return false;
};

exports.name = function (name) {
    if (!name || !name.length) {
        return 'NAME_NULL';
    }

    if (!('' + name)
        .match(/[\u4E00-\u9FBF]{2,15}/)) {
        return 'NAME_INVALID';
    }

    return false;
};

exports.smsCaptcha = function (sms) {
    if (!sms || !sms.length) {
        return 'SMSCAPTCHA_NULL';
    }

    if (sms.length !== 6) {
        return 'SMSCAPTCHA_INVALID';
    }

    return false;
};
