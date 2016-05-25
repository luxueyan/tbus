'use strict';

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

     if($arrow.hasClass(right)){
            $content.css('display','block'); 
            $arrow.removeClass(right).addClass(down);
        }else{
            $content.css('display','none'); 
            $arrow.removeClass(down).addClass(right);
        }

});

var hash = location.hash;



