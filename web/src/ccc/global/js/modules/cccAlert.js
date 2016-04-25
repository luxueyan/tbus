'use strict';

/**
 * cccBox -> alert
 */
var $ = require('jquery');
var Box = require('assets/js/modules/cccBox');
var tpl = require('partials/modules/cccAlert.html');

new Box({
	title: '支付提示',
	value: tpl,
	width: 400,
	height: 180,
	overlay: false,
	showed: function() {
		//$(".dialog-overlay").css("background", "#D3D3D3");
	}
});