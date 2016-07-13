'use strict';

require('bootstrap/js/tab');


var $preArrow = null;
$('.ar-title-wp').on('click', function () {
    var $this = $(this);
    var $content = $this.parents("div.article-wp").children("div.article-content");
    var $arrow = $this.find('span');

    if ($preArrow) {
        $preArrow.parent().next().css('display','none');
        $preArrow.removeClass('stop').addClass('open');
    }


     if($arrow.hasClass('open')){
         $content.css('display','block');
         $arrow.removeClass('open').addClass('stop');
         $preArrow = $arrow;
     }else{
         $content.css('display','none');
         $arrow.removeClass('stop').addClass('open');
         $preArrow = null;
     }
});

var hash = location.hash;



