'use strict';
var RegisterRactive = require('../../').RegisterRactive; // 真实项目中就是 require('@ccc/register').RegisterRactive
var registerRactive = new RegisterRactive({
    el: '#register-container',
    template: require('ccc/register/partials/steps-example1.html'),
});
