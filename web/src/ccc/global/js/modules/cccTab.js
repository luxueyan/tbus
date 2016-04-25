"use strict";

/*

 样式在 partials.less
 js 在此文件中,已加入lib.json

 html结构
    .ccc-tab (data-panels-selector="jQuery Selector") (data-header-selecor) (data-no-tab=true) data-lazy-find="true"
      ul
       li.active
        a (data-header-text)
   
     .ccc-tab-panels
       .tab-panel.active
       .tab-panel
    
    .ccc-tab 会触发 select/selected 事件,代表 选择前/后
 */


// jQuery needed
// 左边header的名字可能与tab文字不一样,a 标签上加上 data-header-text="xxx"
// 以 .cc-tab 的 data-no-tab = true,不做tab,只用样式

var $ = require('jquery');

$.prototype.cccTab = function () {
    this.each(function () {

        if ($(this)
            .data("no-tab")) {
            return;
        }

        var $cccTab = $(this);
        var $tabs = $(this)
            .find("ul");

        // panels
        var selector = $(this)
            .data("panels-selector");
        if (!selector) {
            selector = ".ccc-tab-panels";
        }

        var $panels = $(selector)
            .eq(0)
            .find(".tab-panel");

        // header
        var $header;
        var headerSelector = $(this)
            .data("header-selector");
        if (headerSelector) {
            $header = $(headerSelector)
                .eq(0);
        } else {
            $header = null;
        }

        $tabs.find("a")
            .click(function () {
                $(this)
                    .parent()
                    .addClass("active")
                    .siblings()
                    .removeClass("active");

                var index = $(this)
                    .parent()
                    .index(); // 第几个tab

                var panel = $panels.get(index);

                // select : beforeSelect
                var e = new $.Event("select", {
                    index: index,
                    panel: panel
                });
                $cccTab.trigger(e);
                if (e.isDefaultPrevented()) {
                    return false;
                }

                // 切换tab
                $(panel)
                    .addClass("active")
                    .siblings()
                    .removeClass("active");

                // 设置header的text
                if ($header) {
                    // data-header-text || a标签的text
                    $header.text($(this)
                        .data("header-text") || $(this)
                        .text());
                }

                // selectd 事件
                e = new $.Event("selected", {
                    index: index,
                    panel: panel
                });
                $cccTab.trigger(e);

                return false;
            });
    });
};

$(".ccc-tab")
    .cccTab();