'use strict';

require('bootstrap/js/tab');

var url = location.pathname;
if(url=="/us/administration"){
    $(".usA:nth-child(3)").css("color","#e4262b");
    $(".pull-left ul li:nth-child(2)").addClass('active');
    $(".usA").css("display","inline-block")
}else if(url=="/us/investment"){
    $(".usA:nth-child(4)").css("color","#e4262b");
    $(".pull-left ul li:nth-child(2)").addClass('active');
    $(".usA").css("display","inline-block")
}else if(url=="/us/risk"){
    $(".usA:nth-child(5)").css("color","#e4262b");
    $(".pull-left ul li:nth-child(2)").addClass('active');
    $(".usA").css("display","inline-block")
}else if(url=="/us/invest"){
    $(".usA").css("display","inline-block")
}


$('.ar-title-wp').on('click', function () {
    var $this = $(this);
    var $content = $this.parents("div.article-wp").children("div.article-content");
    var $arrow = $this.find('span');
    var $contents = $(".ar-title-wp").parents("div.article-wp").children("div.article-content");
    var $arrows = $(".ar-title-wp").find('span');


     if($arrow.hasClass('open')){
         $contents.css('display','none');
         $arrows.removeClass('stop').addClass('open');
         $content.css('display','block');
         $arrow.removeClass('open').addClass('stop');
     }else{
         $content.css('display','none');
         $arrow.removeClass('stop').addClass('open');
     }
});


var hash = location.hash;



