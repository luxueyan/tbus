"use strict";

var utils = require('ccc/global/js/lib/utils');

$(".s-header-info .app").hover(
    function () {
        $(".app_img").fadeIn("fast");
    }, 
    function () {
        $(".app_img").fadeOut("fast");
    });

$(".s-header-info .wx_img").hover(
    function () {
        $(".wx_gzh").fadeIn("fast");
    }, 
    function () {
        $(".wx_gzh").fadeOut("fast");
    });

//导航状态
var path = window.location.pathname;

if (new RegExp("^/$")
    .test(path)) {
    $(".u-nolist-ul li a#index")
        .addClass("navactive");

} else if (new RegExp("^/invest")
    .test(path)) {
    $(".u-nolist-ul li a#invest")
        .addClass("navactive");

} else if (new RegExp("^/newAccount/*")
    .test(path)) {
    $(".u-nolist-ul li a#account")
        .addClass("navactive");

} else if (new RegExp("^/guide")
    .test(path)) {
    $(".u-nolist-ul li a#guide")
        .addClass("navactive");

} else if (new RegExp("^/aboutus/*")
    .test(path)) {
    $(".u-nolist-ul li a#aboutus")
        .addClass("navactive");
}