'use strict';
var tpl = require('ccc/global/partials/tips.html');

var demoTpl = '<p style="padding: 30px 20px">$content</p>';

/**
 * ccc-tips
 */
module.exports.create = function (p) {
    var defaults = {
        obj: null,
        width: 200,
        height: 250, // auto
        tigger: 'hover',
        placement: 'left', // top/right/bottom
        container: demoTpl.replace('$content', 'cccTips'),
        callback: function () {}
    };

    $.extend(defaults, p);
    var o = defaults;

    $('.cc-tips-wp')
        .remove();
    $('body')
        .append(tpl);

    var offset = o.obj.offset();
    var _left = 0,
        _top = 0;

//    if (o.height === 'auto') {
//        //o.height = ;
//    }
	
	var $container = $('.cc-tips-wp .cc-tips-container');
	
	// append to tips-container
	$container.html(o.container);

    var _reset = function (height) {
        if (height) {
            o.height = height > 350 ? 350 : height;
        }
        switch (o.placement) {
        case 'left':
            _left = offset.left - o.width + 2;
            _top = offset.top - (o.height / 2) + o.obj.outerHeight() / 2;
            $('.cc-tips-container')
                .width(o.width - $('.cc-tips-arrow')
                    .width());
            break;
        case 'top':
            _left = offset.left + (o.obj.outerWidth() / 2);
            _top = offset.top;
            break;
        }

        $('.cc-tips-wp')
            .css({
                width: o.width,
                height: (o.height === 'auto') ? 'auto' : o.height,
                left: _left,
                top: _top
            });
    };
    _reset();
	
	if (o.height === 'auto') {
		o.callback(_reset, $container);
	} else {
		o.callback($container);
	}
};

module.exports.close = function () {
    $('.cc-tips-wp')
        .remove();
};

module.exports.reset = function () {
    // TODO
};

