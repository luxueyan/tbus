'use strict';

require('bootstrap/js/tab');



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



