"use strict";

var $ = require('jquery');

var isClicked = false;
$(function(){
	$(".toggleBtn")
		.click(function (){
			if ( !isClicked ) {
				console.log($(this).parent().siblings('div.content').text());
				$(this)
					.siblings('div.content')
					.slideDown();
				isClicked = true;	
			} else {
				$(this)
					.siblings('div.content')
					.slideUp();
				isClicked = false;
			}
		});
});