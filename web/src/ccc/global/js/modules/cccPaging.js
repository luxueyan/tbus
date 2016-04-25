"use strict";

/*
使用方法
	1. 在html文件中创建一个div的标签， 例如：
		<div class="ccc-paging"></div>
	2. 在js文件中调用，如：
		$(".ccc-paging").each(function() {
			$(this).cccPaging();
		});

关于样式
	位置：assets/css/account/common.less
	说明：默认主题		<div class="ccc-paging"></div>
		 蓝色主题则为	<div class="ccc-paging-blue"></div>
	更多主题：http://mis-algoritmos.com/some-styles-for-your-pagination

关于js：
	已加入lib.json

关于options:
	选项值		default		说明
	total		100			条目总数
	ajax		false		点击btn是否触发ajax请求
	params		undefined	发送ajax请求的参数(url, type, success函数等)，如果希望page从0开始计数，需要设置params.pageFromZero=true

More：
	实现：依赖第三发插件jquery.paging.js
	网站：http://www.xarg.org/2011/09/jquery-pagination-revised/
*/

require('../lib/jquery.paging');

$.fn.cccPaging = function (options) {
    return this.each(function () {
        var defaults = {
            total: 100,
            perpage: 20,
            page: 1,
            onSelect: function () {},
            ajax: true
        };
        var settings = $.extend({}, defaults, options);
        // ...
        $(this)
            .paging(settings.total, {
                format: '< ncnnn >',
                perpage: settings.perpage,
                page: settings.page,
                onSelect: function (page) {
                    if (settings.ajax) {
                        // page是从1开始的，如果api需要从零开始计算页面
                        // 设置settings.params.pageFromZero为true
                        var current = page,
                            params = settings.params;
                        if (settings.params.pageFromZero) {
                            current = page - 1;
                        }
                        // 加入当前页参数 
                        $.extend(params.data, {
                            page: current
                        });
                        if (page !== 1) {
                            params.url = settings.api.replace('$page',
                                current);
                            params.success = function (o) {
                                settings.onSelect(current, o);
                            };
                            $.ajax(params);
                        } else {
                            settings.onSelect(current);
                        }
                    }
                    $(document)
                        .scrollTop(0);
                },
                onFormat: function (type) {
                    switch (type) {
                    case 'block': // n and c
                        if (this.value !== this.page) {
                            return '<a>' + this.value + '</a>';
                        }
                        return '<span class="current">' + this.value +
                            '</span>';
                    case 'next': // >
                        return '<a>下一页</a>';
                    case 'prev': // <
                        return '<a>上一页</a>';
                    }
                }
            });
    });
};
