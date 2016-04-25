'use strict';
require('bootstrap/js/transition');
require('bootstrap/js/tooltip');

/**
 * 初始化 tooltip
 *
 * 给标签加上.ccc-tips-{arrow}和title，就可以自动调用tooltip
 * 如：<button class="ccc-tips-bottom" title="tips显示内容">test</button>
 */
['top', 'bottom', 'left', 'right'].forEach(function (arrow) {
    $('.ccc-tips-' + arrow)
        .tooltip({
            container: 'body',
            html: true,
            placement: arrow
        });
});
