
$(function () {
    var positionX = 0;
    var positionY = 0;
    var arr = [];
    for (var i = 0; i < 15; i++) {
        var num = Math.random()* 10+5 ;
        arr.push(num)
    }
    console.log(arr)
    $('.section2').mousemove(function (e) {

        var e = e || event;

        var x = e.clientX,
            y = e.clientY;

        if (positionX === 0 && positionY === 0) {
            positionX = x;
            positionY = y;
        }

        if (x > positionX && y < positionY) {//右下
            $('.s2text').stop().animate({
                'margin-left': arr[7],
                'margin-top': -arr[7]
            }, '500', "easeOutCubic");
            $('.buildImg').stop().animate({
                'margin-left': arr[8],
                'margin-top': -arr[8]
            }, '500', "easeOutCubic");
            positionX = x;
            positionY = y;
        }
        else if (x > positionX && y > positionY) {//右上
           $('.s2text').stop().animate({
                'margin-left': arr[7],
                'margin-top': arr[7]
            }, '500', "easeOutCubic");
           $('.buildImg').stop().animate({
                'margin-left': arr[8],
                'margin-top': arr[8]
            }, '500', "easeOutCubic");
            positionX = x;
            positionY = y;
        } else if (x < positionX && y < positionY) {//左下
          $('.s2text').stop().animate({
                'margin-left': -arr[7],
                'margin-top': -arr[7]
            }, '500', "easeOutCubic");
          $('.buildImg').stop().animate({
                'margin-left': -arr[8],
                'margin-top': -arr[8]
            }, '500', "easeOutCubic");
            positionX = x;
            positionY = y;
        } else if (x < positionX && y > positionY) {//左上
           $('.s2text').stop().animate({
                'margin-left': -arr[7],
                'margin-top':  arr[7]
            }, '500', "easeOutCubic");
           $('.buildImg').stop().animate({
                'margin-left': -arr[8],
                'margin-top': arr[8]
            }, '500', "easeOutCubic");
            positionX = x;
            positionY = y;
        }
})
    $.extend($.easing, {
        easeOutBack: function (x, t, b, c, d, s) {
            if (s == undefined) s = 500;
            return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
        },
        easeOutCubic: function (x, t, b, c, d) {
            return c * ((t = t / d - 1) * t * t + 1) + b;
        }
    });
})

