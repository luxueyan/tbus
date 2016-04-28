'use strict';

window.Promise = require('bluebird');
var globalValidator = require('@ccc/validation').validator;
var Bacon = require('baconjs');
var _ = require('lodash');
var flux = require('baconflux');
var errmsgs = require('@ccc/validation').errmsgs;
var action = flux.action.bind(null, 'register');
var astore = flux.async.bind(null, 'register');
var store = flux.store.bind(null, 'register');
var validation = require('./validation');
var smsOriginalCaptcha = validation.smsCaptcha;
var smsVoiceCaptcha = {
    required: true,
    sync: function (sms) {
        if (!sms || !sms.length) {
            return 'SMSCAPTCHA_NULL';
        }

        if (sms.length !== 4) {
            return 'SMSCAPTCHA_INVALID_4';
        }

        return false;
    },
    async: validation.genAsyncValidator('/api/v2/users/voiceCaptcha', 'voiceCaptcha'),
};
var services = require('./services');
errmsgs.INVALID_CAPTCHA = errmsgs.IMGCAPTCHA_INVALID = errmsgs.IMG_CAPTCHA_INVALID = '图片验证码错误或已失效';
errmsgs.INVALID_REQUIRED = errmsgs.IMGCAPTCHA_NULL = errmsgs.IMG_CAPTCHA_NULL = '请填写图片验证码';
errmsgs.REFM_NOT_EXISTS = '此手机号码未在本站注册';
errmsgs.REFM_INVALID = '请正确填写推荐人手机号码';
errmsgs.EMP_REFERRAL_NOT_EXISTS = '未找到此号码关联的财富经理';
errmsgs.EMAIL_ALREADY_EXISTED = '此邮箱已在本站注册';
errmsgs.SMSCAPTCHA_INVALID_4 = '语音验证码为 4 位';
errmsgs["推荐人不存在"] = "推荐人不存在";

var registerUserSmsType = 'CONFIRM_CREDITMARKET_REGISTER';

action('inited').onValue(function (registerRactive) {
    var rinputs = registerRactive.rinputs;
    var steps = registerRactive.steps;

    // 密码相关检查
    store('value', 'password').onValue(function (password) {
        var strength = validation.passwordStrength(password);
        registerRactive.set('passwordStrength', strength);
        registerRactive.set('password.data.strength', strength);
        registerRactive.set('repassword.data.strength', strength); // 有的奇葩设计可能把密码强弱放这，更奇葩的就不支持了
        if (rinputs.repassword) {
            validation.repassword.sync = globalValidator.repassword.bind(null, password);
            store('value', 'repassword').push(registerRactive.get('repassword.data.value'));
        }
    });
    function trimmedValue(value, field) {
        value = value || '';
        if (!(field||'').match(/password$/)) { // skip password or repassword
            return (''+value).trim();
        }
        return value;
    }
    // 通用项检查
    _.each(rinputs, function (rinput, field) {
        var validator = validation[field] || {};
        if (!validator) {
            return;
        }

        // 转换从 ractive 的事件成 stream
        action('startEditing', field).plug(Bacon.fromEvent(rinput, 'startEditing'));
        store('value', field).plug(Bacon.fromEvent(rinput, 'valueStable'));

        var asyncCheck = astore('check', field);
        function currentAsyncCheckPromise() {
            var promise = asyncCheck.currentPromise;
            if (promise) {
                return promise;
            }
            var resolve;
            promise = asyncCheck.currentPromise = new Promise(function () {
                resolve = arguments[0];
            });
            promise.resolveSelf = resolve;
            asyncCheck.push(promise);
            return promise;
        }
        action('startEditing', field).onValue(currentAsyncCheckPromise);
        store('value', field).onValue(function (value) {
            var validator = validation[field] || {};
            // promise 的 resolve 值是 errCode
            value = trimmedValue(value, field);
            var promise = currentAsyncCheckPromise();
            var errCode;
            delete asyncCheck.currentPromise; // 考虑异步检查还没返回就又 startEditing 的情况，在这里就 delete
            if (!value) {
                // 未填写先不在这验证，点击下一步时才做
                promise.resolveSelf(false);
                return;
            }
            if (validator.sync && (errCode = validator.sync(value))) {
                // 先做同步检查
                promise.resolveSelf(errCode);
                return;
            }
            if (validator.async) {
                // 同步检查没问题后做异步检查
                validator.async(value, promise.resolveSelf.bind(promise));
                return;
            }
            // 异步检查不存在，并且同步检查通过或也不存在的时候
            return promise.resolveSelf(false);

        });
        store('checkResult', field).plug(asyncCheck.flatMapLatest(Bacon.fromPromise));

        // 先设置依赖关系
        store('loading', field).plug(astore('check', field).map(true));
        store('loading', field).plug(store('checkResult', field).map(false));

        store('errCode', field).plug(action('startEditing', field).map(false));
        store('errCode', field).plug(store('checkResult', field)); // checkResult 的结果就是 errCode

        store('errMsg', field).plug(store('errCode', field).map(errmsgs.getFromErrCode));

        // 最后 push 上默认值
        store('loading', field).push(false);
        store('errCode', field).push(false);

        store(field).plug(Bacon.combineTemplate({
            loading: store('loading', field),
            value: store('value', field),
            errCode: store('errCode', field),
            errMsg: store('errMsg', field),
        }));

        var countdown = (function() {
            var currentValue = 61;
            function tick() {
                currentValue -= 1;
                if (!currentValue) {
                    return reset();
                }
                store(field, 'smsCaptchaCountDown').push(currentValue);
            }
            var timer;
            function reset() {
                currentValue = 61;
                store(field, 'smsCaptchaCountDown').push(0);
                clearInterval(timer);
                timer = null;
            }
            function start() {
                timer = setInterval(tick, 1000);
            }
            reset();
            var obj = {
                timer: null,
                tick: tick,
                reset: reset,
                start: start,
                isRunning: function () { return !!timer; }
            };
            return obj;
        }());

        if (field === 'mobile' || field === 'smsCaptcha') {
            var sendSmsCaptcha = action(field, 'sendSmsCaptcha');
            sendSmsCaptcha.plug(store('value', 'mobile').sampledBy(Bacon.fromEvent(rinput, 'sendSmsCaptcha')).map(function (mobile) {
                return {
                    mobile: mobile,
                    smsType: 'CONFIRM_CREDITMARKET_REGISTER',
                };
            }));
            sendSmsCaptcha.plug(store('value', 'mobile').sampledBy(Bacon.fromEvent(rinput, 'sendVoiceCaptcha')).map(function (mobile) {
                return {
                    mobile: mobile,
                    smsType: 'CREDITMARKET_VOICE_CAPTCHA',
                };
            }));
            store('value', 'smsType').plug(sendSmsCaptcha.map('.smsType'));
            store('value', 'smsType').onValue(function (smsType) {
                registerUserSmsType = smsType;
                if (smsType === 'CREDITMARKET_VOICE_CAPTCHA') {
                    validation.smsCaptcha = smsVoiceCaptcha;
                } else {
                    validation.smsCaptcha = smsOriginalCaptcha;
                }
            });
            var smsCaptchaReady = store(field, 'smsCaptchaReady');
            smsCaptchaReady.plug(astore('check', 'mobile').map(false));
            smsCaptchaReady.plug(store('value', 'mobile').sampledBy(astore('check', 'mobile').flatMapLatest(Bacon.fromPromise), function (value, checkResult) {
                if (value && !checkResult) {
                    countdown.reset();
                    return value;
                }
            }));
            smsCaptchaReady.onValue(registerRactive, 'set', field+'.data.smsCaptchaReady');

            var smsCaptchaCountDown = store(field, 'smsCaptchaCountDown');
            var smsCaptchaDisabled = store(field, 'smsCaptchaDisabled');
            smsCaptchaReady.onValue(function (ready) {
                smsCaptchaDisabled.push(!ready);
            });
            smsCaptchaCountDown.onValue(function (countdown) {
                smsCaptchaDisabled.push(countdown > 0);
            });
            smsCaptchaDisabled.onValue(registerRactive, 'set', field+'.data.smsCaptchaDisabled');
            smsCaptchaDisabled.push(true);
            if (!rinputs.imgCaptcha) {
                smsCaptchaDisabled.sampledBy(sendSmsCaptcha, function (disabled, obj) {
                    if (disabled || !obj || !obj.mobile || countdown.isRunning()) {
                        return false;
                    }
                    return obj;
                }).filter(Boolean).onValue(function (obj) {
                    if (obj.smsType === 'CREDITMARKET_VOICE_CAPTCHA') {
                        services.sendVoiceCaptcha(obj.mobile);
                    } else {
                        services.sendSmsCaptcha(obj.mobile);
                    }
                    countdown.start();
                });
            } else {
                var iccrs = astore(field, 'imgCaptchaCheckResultSampledByClick');
                iccrs.plug(astore('check', 'imgCaptcha').sampledBy(sendSmsCaptcha, function (resultPromise, obj) {
                    var mobileErrCode = rinputs.mobile.get('errCode');
                    (!obj || !obj.mobile || mobileErrCode ? Promise.resolve(mobileErrCode || 'MOBILE_NULL') : resultPromise)
                    .then(function (result) {
                        store('errCode', field).push(false);
                        var captcha = rinputs.imgCaptcha.get('value');
                        if (result || !captcha) {
                            store('errCode', field).push(result || 'IMG_CAPTCHA_NULL');
                            // action('changeImgCaptcha').push();
                            return;
                        }
                        var token = rinputs.imgCaptcha.get('imgCaptchaToken');
                        var mobile = rinputs.mobile.get('value');
                        return services[obj.smsType === 'CREDITMARKET_VOICE_CAPTCHA' ? 'voiceCaptcha' : 'smsCaptcha'](token, captcha, mobile)
                        .then(function (body) {
                            if (!body.success) {
                                store('errCode', field).push(result || 'IMG_CAPTCHA_INVALID');
                                action('changeImgCaptcha').push();
                                return false;
                            }
                            countdown.start();
                            return true;
                        });
                    });
                }));
            }
            smsCaptchaCountDown.onValue(registerRactive, 'set', field+'.data.smsCaptchaCountDown');
        }
        store('errCode', 'smsCaptcha').plug(action('startEditing', 'mobile').map(false));
        store(field).onValue(registerRactive, 'set', field + '.data');
    });

    var firstStepWithoutRInputReached = false;
    var doSubmit = [];
    steps.forEach(function (step, stepIndex) {
        if (stepIndex && !_.keys(step.fields).length && !firstStepWithoutRInputReached) {
            firstStepWithoutRInputReached = true;
            doSubmit[stepIndex - 1] = true;
        }

        var stepAsyncCheck = astore('step', stepIndex, 'asyncCheck');
        stepAsyncCheck.plug(Bacon.combineTemplate(_.transform(step.fields, function (result, rinput, field) {
            result[field] = astore('check', field);
        })).map(Promise.props)); // 输入后自动触发的检查
        var ac = astore('step', stepIndex, 'check'); // 这一步所有 input 的结果，点击下一步后需要的必填项修正
        ac.plug(stepAsyncCheck.map(function (checkResultPromise) {
            return checkResultPromise.then(function (checkResult) {
                return _.transform(checkResult, function (result, asyncErrCode, field) {
                    // 输入时忽略了未填错误，这里补上
                    value = trimmedValue(value, field);
                    var validator = validation[field] || {};
                    var value = rinputs[field].get('value');
                    var errCode;
                    if (validator.sync && (errCode = validator.sync(value))) {
                        result[field] = errCode;
                        fixRequired(result, field, value, errCode);
                        return;
                    }
                    result[field] = asyncErrCode;
                    fixRequired(result, field, value, errCode);
                });
            });
        }));
        function fixRequired(result, field, value, errCode) {
            var validator = validation[field] || {};
            if (validator.required === false && (errCode || '').match(/_NULL$/)) {
                result[field] = false;
            } else if (validator.required && !errCode && !value) {
                result[field] = field.toUpperCase() + '_NULL';
            }
        }
        action('nextStep', stepIndex).plug(Bacon.fromEvent(step, 'nextStep'));
        var ans = astore('nextStep', stepIndex);
        ans.plug(ac.sampledBy(action('nextStep', stepIndex), function (checkResultPromise, nextStep) {
            step.set('loading', true);
            // 这个回掉相当于点击下一步时得到 cr 的最新结果
            return checkResultPromise.then(function (cr) {
                var letsGo = true;
                _.each(cr, function (cr, field) {
                    if (!cr) {
                        return;
                    }
                    store('errCode', field).push(cr);
                    letsGo = false;
                });
                return letsGo;
            });
        }));
        ans.flatMapLatest(Bacon.fromPromise).onValue(function (shouldGoNext) {
            if (!shouldGoNext) {
                step.set('loading', false);
            } else {
                if (!doSubmit[stepIndex]) {
                    action('switchStep').push(stepIndex + 1);
                    return;
                }
                var user = _.transform(rinputs, function (result, rinput, field) {
                    result[propAlter(field) || field] = trimmedValue(rinput.get('value'), field);
                    if (field === 'email' && result.email && validation.email.vermail) {
                        result.vermail = '1';
                    }
                });
                user.smsType = registerUserSmsType;
                // 可以不要 loginName 这一项 field, 默认填写上，设置了 CC.config.clientCode 的话就以这个为前缀
                if (!user.loginName) {
                    var prefix;
                    if (window.CC && CC.config && CC.config.clientCode) {
                        prefix = CC.config.clientCode.toLowerCase() + '_';
                    } else if (registerRactive.get('mobilePrefix')) {
                        prefix = registerRactive.get('mobilePrefix');
                    } else {
                        prefix = '手机用户';
                    }
                    user.loginName = prefix + user.mobile;
                }
                doRegister(user, stepIndex).then(function (success) {
                    if (!success) {
                        step.set('loading', false);
                    }
                });
            }
        });
    });
    var alteredProps = {};
    function propAlter(prop) {
        var ap = {
            smsCaptcha: 'mobile_captcha',
            refm: 'referral',
            refl: 'referral',
            refc: 'referral',
            reftf: registerRactive.get('whatTheRefFuck') || 'referral',
            refi: 'inviteCode',
        }[prop];
        alteredProps[ap] = prop;
        return ap;
    }
    action('switchStep').onValue(registerRactive, 'set', 'onStep');
    var fieldInWhichStep = (function() {
        var result = {};
        steps.slice().reverse().slice(1).forEach(function (step) {
            _.each(step.fields, function (rinputs, field) {
                result[field] = step.get('stepIndex');
            });
        });
        return result;
    }());
    function doRegister(user, currentStep) {
        return services.register(user)
        .then(function (body) {
            var goStep = currentStep + 1;
            if (body.success) {
                store('success').push(_.assign(body.data, {postedData: user}));
            } else {
                var goStep = _(body.error)
                    .map(function (err) {
                        var op = alteredProps[err.type] || err.type;
                        store('errCode', op).push(err.message);
                        return fieldInWhichStep[op];
                    })
                    .uniq()
                    .min();
            }
            action('switchStep').push(goStep);
            return body.success;
        });
    }
});
window.rstore = store;
window.raction = action;
