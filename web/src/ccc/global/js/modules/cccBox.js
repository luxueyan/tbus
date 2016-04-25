'use strict';

var $ = require('jquery');

function Dialog(content, options) {
    Dialog.__zindex = 9000;
    Dialog.__count = 1;
    var defaults = {
        title: '',
        showTitle: true,
        // 是否显示标题栏。
        width: '500px',
        height: '200px',
        draggable: false,
        // 是否移动 
        modal: true,
        // 是否是模态对话框 
        center: true,
        // 是否居中。 
        fixed: true,
        // 是否跟随页面滚动。
        time: 0,
        // 自动关闭时间，为0表示不会自动关闭。 
        top: null,
        cla: '', // dialog wrap的扩展class
        id: false // 对话框的id，若为false，则由系统自动产生一个唯一id。 
    };

    options = $.extend(defaults, options);
    options.title = options.title || '';
    options.time = options.time || 0;
    options.id = options.id ? options.id : 'dialog-' + Dialog.__count; // 唯一ID
    var overlayId = options.id + '-overlay'; // 遮罩层ID
    var timeId = null; // 自动关闭计时器 
    var isShow = false;

    options.top = content.top || '20%';
    options.cla = content.cla || '';
	options.overlay = content.overlay || true;

    //var isIe = $.browser.msie;
    //var isIe6 = $.browser.msie && ('6.0' == $.browser.version);

    //var isIe = document.all && window.external;
    var isIe6 = false;
	var getWrap = function() {
		return {
			width: $(window).width() + $(document).scrollLeft(),
			height: $(document).height()
		};
	};
	/*
    var wrap = {
        width: $(window).width() + $(document).scrollLeft(),
        height: $(document).height()
    };
	*/
	var wrap = getWrap();

    /* 对话框的布局及标题内容。*/
    options.title = content.title || "";
    var barHtml = !options.showTitle ? '' :
        '<div class="bar"><span class="title">' + ((options.title === "" ||
            options.title === false) ? "" : options.title) +
        '</span><a class="close"></a></div>';
    var theDialog = $('<div id="' + options.id + '" class="dialog ccc-box-wrap ' + options.cla +
        '">' + barHtml + '<div class="Dcontent"></div></div>')
        .hide();
    $('body')
        .append(theDialog);


    /**
     * 重置对话框的位置。
     *
     * 主要是在需要居中的时候，每次加载完内容，都要重新定位
     *
     * @return void
     */
    this.resetPos = function () { /* 是否需要居中定位，必需在已经知道了dialog元素大小的情况下，才能正确居中，也就是要先设置dialog的内容。 */
        if (options.center) {
            var width = $(".Dcontent", theDialog)
                .outerWidth();

            theDialog.css("width", width);

            var left = ($(window)
                .width() - theDialog.width()) / 2;
            var top = ($(window)
                .height() - theDialog.height()) / 2;
            if (top < 0) {
                top = 0;
            }

            if (!isIe6 && options.fixed) {
                theDialog.css({
                    top: options.top ? options.top : top,
                    left: left
                });
            } else {
                theDialog.css({
                    top: top + $(document)
                        .scrollTop(),
                    left: left + $(document)
                        .scrollLeft()
                });
            }
        }
    };

    /**
     * 初始化位置及一些事件函数。
     *
     * 其中的this表示Dialog对象而不是init函数。
     */
    var init = function () { /* 是否需要初始化背景遮罩层 */

        if (options.modal) {
            $('body')
                .append('<div id="' + overlayId +
                    '" class="dialog-overlay ccc-box-overlay"></div>');
            $('#' + overlayId)
                .css('width', wrap.width)
                .css('height', wrap.height)
                .css('z-index', ++Dialog.__zindex);
            $('#' + overlayId)
                .css({
                    'left': 0,
                    'top': 0,
                    'position': 'absolute'
                })
                .hide();

        }

        theDialog.css({
            'z-index': ++Dialog.__zindex,
            'position': options.fixed ? 'fixed' : 'absolute'
        });

        /*  IE6 兼容fixed代码 */
        if (isIe6 && options.fixed) {
            theDialog.css('position', 'absolute');
            // resetPos();
            $(window)
                .scroll(function () {
                    var dia = {
                        top: $(document)
                            .scrollTop() + $(window)
                            .height() / 2 - theDialog.height() / 2 + 'px',
                        left: $(document)
                            .scrollLeft() + $(window)
                            .width() / 2 - theDialog.outerWidth() / 2 +
                            'px'
                    };
                    theDialog.css({
                        'top': dia.top,
                        'left': dia.left
                    });
                });
        }

        /* 以下代码处理框体是否可以移动 */
        var mouse = {
            x: 0,
            y: 0
        };

        function moveDialog(event) {
            var e = window.event || event;
            var top = parseInt(theDialog.css('top')) + (e.clientY - mouse.y);
            var left = parseInt(theDialog.css('left')) + (e.clientX - mouse.x);
            theDialog.css({
                top: top,
                left: left
            });
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        }
        theDialog.find('.bar')
            .mousedown(function (event) {
                if (!options.draggable) {
                    return;
                }

                var e = window.event || event;
                mouse.x = e.clientX;
                mouse.y = e.clientY;
                $(document)
                    .bind('mousemove', moveDialog);
            });
        $(document)
            .mouseup(function () {
                $(document)
                    .unbind('mousemove', moveDialog);
            });

        /* 绑定一些相关事件。 */
        theDialog.find('.close')
            .bind('click', this.close);
        theDialog.bind('mousedown', function () {
            theDialog.css('z-index', ++Dialog.__zindex);
        });

        // 自动关闭 
        if (0 !== options.time) {
            timeId = setTimeout(this.close, options.time);
        }
    };


    /**
     * 设置对话框的内容。
     *
     * @param string c 可以是HTML文本。
     * @return void
     */
    this.setContent = function (c) {
        if (c.time) {
            options.time = c.time;
        }
        var div = theDialog.find('.Dcontent');
        var width = c.width ? c.width : defaults.width,
            height = c.height ? c.height : defaults.height;

        if (c.alert) {
            c.value = '<div class="box-alert-wrap" style="padding-top:80px;">' +
                c.value + '</div>';
        }
        if (c.confirm) {
            c.value = '<div class="box-alert-wrap"><p>' + c.value + '</p>' +
                '<button class="btn btn-yes btn-long btn-close">确定</button><span></span>' +
                '<button class="btn btn-cancel btn-long btn-gray btn-close">取消</button></div>';
        }
        var that = this;
        if ('object' === typeof (c)) {
            c.type = c.type || "";
            switch (c.type.toLowerCase()) {
            case 'id':
                // 将ID的内容复制过来，原来的还在。
                div.append($('#' + c.value));
                $('#' + c.value)
                    .css("display", "block");
                break;
            case 'img':
                div.html('加载中...');
                $('<img alt="" />')
                    .load(function () {
                        div.empty()
                            .append($(this));
                        that.resetPos();
                    })
                    .attr('src', c.value);
                break;
            case 'url':
                div.html('加载中...');
                $.ajax({
                    url: c.value,
                    success: function (html) {
                        div.html(html);
                        that.resetPos();
                    },
                    error: function () {
                        div.html('出错啦');
                    }
                });
                break;
            case 'iframe':
                div.append($('<iframe src="' + c.value + '" width=' + width +
                    ' height=' + height + ' />'));
                break;
            case 'text':
                break;
            default:
                !! width && div.width(width); !! height && div.height(height);
            
                div.html(c.value);
                break;
            }
        } else {
            div.html(c);
        }

        // 主动显示弹窗
        if (c.showed) {
            this.show(c.showed);
        }

        if (c.alert || c.confirm) {
            theDialog.find('.btn-close')
                .bind('click', this.close);
        }
    };

    /**
     * 显示对话框
     */
    this.show = function (callback) {
        if (undefined !== options.beforeShow && !options.beforeShow()) {
            return;
        }

        /**
         * 获得某一元素的透明度。IE从滤境中获得。
         *
         * @return float
         */

        /* 是否显示背景遮罩层 */
        if (options.modal) {
            $('#' + overlayId)
                .css("display", "block");
        }
        theDialog.css("display", "block");
        if (undefined !== options.afterShow) {
            options.afterShow();
        }
        isShow = true;
        // 自动关闭 
        if (0 !== options.time) {
            timeId = setTimeout(this.close, options.time);
        }
        this.resetPos();
		
		// 设置overlay背景
		if (options.overlay) {
			$(".dialog-overlay").css("background", "#D3D3D3");
		}

        //回调
        if (callback) {
            var d = theDialog.find(".Dcontent");
            callback(d[0], this);
        }

        var that = this;

        $(window)
            .keydown(function (e) {
                var tag = e.target.tagName.toLowerCase();
                if (!e.target) {
                    return false;
                };
                if (tag === 'input' || tag === 'textarea') {} else {
                    if (e.keyCode === 27) {
                        that.close();
                    }
                }
            });

    };
    /*
     * 隐藏对话框。但并不取消窗口内容。
     */
    this.hide = function (callback) {
        if (!isShow) {
            return;
        }

        if (undefined !== options.beforeHide && !options.beforeHide()) {
            return;
        }

        theDialog.css('display', "none");
        if (undefined !== options.afterHide) {
            options.afterHide();
        }

        if (options.modal) {
            $('#' + overlayId)
                .css('display', "none");
        }

        isShow = false;

        if (callback) {
            callback();
        }
    };


    /**
     * 关闭对话框
     *
     * @return void
     */
    this.close = function (e, real) {
        $("body")
            .find(".dialog")
            .remove();
        if (undefined !== options.beforeClose && !options.beforeClose()) {
            return;
        }
        if (!real) {
            theDialog.find(".Dcontent:eq(0)")
                .appendTo("body")
                .css("display", "none");
        }
        theDialog.remove();
        isShow = false;
        if (undefined !== options.afterClose) {
            options.afterClose();
        }

        if (options.modal) {
            $('#' + overlayId)
                .css('display', "none")
                .remove();
        }
        clearTimeout(timeId);
        $("body")
            .find(".Dcontent")
            .remove();
    };

    this.resetOverlay = function () {
        $('#' + overlayId)
            .css({
                'width': $(window)
                    .width() + $(document)
                    .scrollLeft(),
                'height': $(document)
                    .height(),
                'left': 0,
                'top': 0
            });
    };

    init.call(this);
    this.setContent(content);

    Dialog.__count++;
    Dialog.__zindex++;
}
module.exports = Dialog;