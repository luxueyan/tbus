$(function() {
    $.extend($.easing, {
        easeOutBack: function(x, t, b, c, d, s) {
            if (s == undefined) s = 500;
            return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
        },
        easeOutCubic: function(x, t, b, c, d) {
            return c * ((t = t / d - 1) * t * t + 1) + b;
        }
    });


    $('.newsUlNav li').click(function() {
        var i = $(this).index();
        $('.newsUlNav li').removeClass('actve');
        $(this).addClass('actve');
    })
    var video = $('video.wp-video-shortcode');
    $('.section3').hover(function() {
        video[0].play();
    }, function() {
        video[0].pause();
    });

    function load() {
        var i = 1;
        t = 1;
        $('.section2').mouseover(function() {
            clearInterval;
            setInterval(function() {
                i = i + 6;
                if (i < 2015) {
                    $('.year').html(i)
                } else {
                    $('.year').html(2015)
                    clearInterval;
                }
            }, 1);
        })
        $('.section2').mouseover(function() {
            clearInterval;
            setInterval(function() {
                t = t + 14;
                if (t < 5000) {
                    $('.money').html(t)
                } else {
                    $('.money').html(5000)
                    clearInterval;
                }
            }, 1);
        })
    }
    load();

    $('.newsUlNav li').click(function() {
        var Index = $(this).index();
        $('.newsUl li').hide();
        $('.newsUl li').eq(Index).show();
        $('.newsUl li .marAuto').addClass('row')
        $('.newsUl li .marAuto').eq(Index).removeClass('row');
        $('.newsUl li .newDet').addClass('col')
        $('.newsUl li .newDet').eq(Index).removeClass('col');
        $('.newsUl li .newA').addClass('col')
        $('.newsUl li .newA').eq(Index).removeClass('col');
    })
    $('.weixin').hover(function() {
        $('.erBox').animate({ opacity: "1" }, 1000)
    }, function() {
        $('.erBox').animate({ opacity: "0" }, 1000)
    })
    $('.weixin').hover(function() {
        $('.absLute').animate({ opacity: "1" }, 1000)
    }, function() {
        $('.absLute').animate({ opacity: "0" }, 1000)
    })
    $('.newA-fir').click(function() {
        $('.fir').show();
    })
    $('.newA-sec').click(function() {
        $('.sec').show();
    })
    $('.newA-thir').click(function() {
        $('.thir').show();
    })
    $('.closeImg').click(function() {
        $('.newsDetial').hide();
    })
})