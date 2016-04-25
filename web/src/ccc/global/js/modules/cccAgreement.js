'use strict';
/**
 * 注册服务协议弹窗
 */
var $ = require('jquery');
var Box = require('assets/js/modules/cccBox');
var tpl = require('partials/modules/cccAgreement.html');

module.exports = function (options) {
    var defaults = {
        title: '注册服务协议',
        tpl: tpl,
        width: 600,
        height: 400,
        checker: $('.ccc-agreement-check'),
        api: '/api/v2/cms/服务声明/agreement',
        okText: '已阅读并同意此协议',
        debug: false,
        showed: function () {},
        ok: function () {},
        done: function () {}
    };
    
    var config = {};
	$.extend(config, defaults, options);
    
    config.tpl = config.tpl.replace('{{okText}}', config.okText);
    
    new Box({
        title: config.title,
        value: config.tpl,
        width: config.width,
        height: config.height,
        top: '15%',
        showed: function(ele, box) {
            config.showed(ele, box);
            var $container = $(ele).find('.ccc-agreement-container > div');
            
            $.get(config.api, function(o) {
                if (config.debug) {
                    console.log('debug:cccAgreement:getData', o);
                }
                if (o && o.length > 0) {
                    $container.html(o[0].content);
                } else {
                    $container.find('p.align-center').html('请在CMS的服务声明模块中新建agreement栏目');
                }
                config.done(o, ele, box);
            }).error(function(){
                $container.find('p.align-center').html('网络错误，稍后请重试');
            });
            
            // click ok
            $(ele).find('.btn-ok').on('click', function(){
                if (config.debug) {
                    console.log('debug:cccAgreement:okBtn', 'ok btn clicked');
                }
                config.checker.prop('checked', true);
                box.hide();
                config.ok($(this), ele, box);
            });
        }
    });
};