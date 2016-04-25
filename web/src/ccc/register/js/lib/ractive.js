'use strict';
var components = require('./components');
var flux = require('baconflux');
var Ractive = require('ractive');
var _ = require('lodash');
var action = flux.action.bind(null, 'register');
var store = flux.store.bind(null, 'register');
var services = require('./services');
require('./reactive'); // reactive logic in this file
var validation = require('./validation');

exports.RegisterRactive = Ractive.extend({
    components: components,
    init: function () {
        var root = this;
        root.set('onStep', 0);
        var steps = root.steps = root.findAllComponents('Step');
        var rinputs = root.rinputs = {};
        root.observe('onStep', function (newValue) {
            _.each(root.steps, function (step) {
                step.set('loading', false);
                step.set('onStep', newValue);
            });
        });
        root.steps.forEach(function (step, stepIndex) {
            step.fields = {};
            step.set('stepIndex', stepIndex);
            step.observe('loading', function (newValue) {
                step.set('stepLoading', newValue);
            });
            step.set('loading', false);
            step.findAllComponents('RInput').forEach(function (rinput) {
                step.observe('loading', function (newValue) {
                    rinput.set('stepLoading', newValue);
                });
                rinput.on('nextStep', function () {
                    step.fire('nextStep');
                });
                var initData = rinput.get();
                var field = initData.field;
                if (!field) {
                    throw(new Error('rinput field required'));
                }
                if (initData.defaultValue) {
                    rinput.set('value', initData.defaultValue);
                }
                step.fields[field] = rinput;
                root.rinputs[field] = rinput;

                // set initial values
                var initValue;
                if ((initValue = root.get(field + '.data.value'))) {
                    rinput.set('value', initValue);
                }

                // delegates data
                root.observe(field + '.data.*', function (newValue, oldValue, keypath, rfield) {
                    if ('value loading errCode errMsg strength smsCaptchaDisabled smsCaptchaReady smsCaptchaCountDown imgCaptchaBase64 imgCaptchaToken'.split(' ').indexOf(rfield) > -1) {
                        rinput.set(rfield, newValue);
                        _.each(root.steps, function (step) {
                            step.set('fields.'+keypath, newValue);
                        });
                        _.each(root.rinputs, function (rinput) {
                            rinput.set('fields.'+keypath, newValue);
                        });
                    }
                });
            });
        });
        var imgCaptcha = rinputs.imgCaptcha;
        if (imgCaptcha) {
            imgCaptcha.on('changeImgCaptcha', function () {
                services.imgCaptcha().then(function (body) {
                    root.set('imgCaptcha.data.imgCaptchaBase64', body.captcha);
                    root.set('imgCaptcha.data.imgCaptchaToken', body.token);
                    validation.imgCaptcha.async = validation.genAsyncValidator(
                        '/api/v2/captcha?token=' + body.token,
                        'captcha'
                    );
                    store('value', 'imgCaptcha').push('');
                    store('errCode', 'imgCaptcha').push(false);
                    store('errMsg', 'imgCaptcha').push(false);
                })
            });
            action('changeImgCaptcha').onValue(function () {
                imgCaptcha.fire('changeImgCaptcha');
            });
            action('changeImgCaptcha').push();
        }

        root.on('*.resetAll', function () {
            'loginName email mobile password repassword imgCaptcha smsCaptcha'.split(' ').forEach(function (field) {
                store('value', field).push('');
                store('errCode', field).push(false);
                store('errMsg', field).push(false);
            });
        });

        // 后面的事情交给 这个 action 的 listener 做
        action('inited').push(root);
    },
});
