'use strict';

//var $ = require('jquery');
require('bootstrap/js/tab');



$('.arrow').on('click', function () {
    $(this).children("i").toggleClass('glyphicon-chevron-right');
    $(this).children("i").toggleClass('glyphicon-chevron-down');  
    $('.content').toggle(); 
});


var $preArrow = null;
$('.question-title').on('click', function () {

    var $this = $(this);
    var $wp = $this.parents("div.each-question");
    var $arrow = $wp.find('span');
    var klass = 'opened';
    var right = 'glyphicon-menu-right';
    var down = 'glyphicon-menu-down';

    if ($preArrow) {
        $preArrow.removeClass(down).addClass(right);
    }
    $preArrow = $arrow;

    if ($wp.hasClass(klass)) {
        $wp.removeClass(klass);
        $arrow.removeClass(down).addClass(right);
    } else {
        $('.each-question').removeClass(klass);
        $wp.addClass(klass);
        $arrow.removeClass(right).addClass(down);
    }
});

var hash = location.hash;

// 自动展开三方账户
if (hash === '#paymentAccount') {
    var $wp = $('.each-question');
    $wp.eq($wp.length - 1).addClass('opened');
}

$(".article-content p").hide()
$(".article-content p").ready(function(){
  $(".each-question").click(function(){
  $(".opened .article-content p").toggle();
  });
});

//tab上加修饰


