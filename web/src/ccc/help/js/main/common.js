'use strict';

//var $ = require('jquery');
require('bootstrap/js/tab');





var $preArrow = null;
$('.ar-title-wp').on('click', function () {
    var $this = $(this);
    var $wp = $this.parents("div.article-wp");
    var $content = $this.parents("div.article-wp").children("div.ar-content-wp");
    var $arrow = $wp.find('span');
    var klass = 'opened';
    var right = 'show';
    var down = 'closed';


//     $('.article-wp').removeClass(klass);
    
//     $wp.addClass(klass);
     if($arrow.hasClass(right)){
            $content.css('display','block'); 
            $arrow.removeClass(right).addClass(down);
        }else{
            $content.css('display','none'); 
            $arrow.removeClass(down).addClass(right);
        }

});

var hash = location.hash;

// 自动展开三方账户
//if (hash === '#paymentAccount') {
//    var $wp = $('.invest-wrapper h2');
//    $wp.eq($wp.length - 1).addClass('opened');
//}
//
//$(".invest-wrapper p").hide()
//$(".invest-wrapper p").ready(function(){
//  $(".invest-wrapper h2").click(function(){
//  $(".opened .invest-wrapper p").toggle();
//  });
//});


