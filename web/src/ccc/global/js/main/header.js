"use strict";

var utils = require('ccc/global/js/lib/utils');

//导航状态
var path = window.location.pathname;

if (new RegExp("^/$")
    .test(path)) {
    $(".u-nolist-ul li a#index")
        .addClass("navactive");

} else if (new RegExp("^/invest")
    .test(path)) {
    $(".u-nolist-ul li a#touzi")
        .addClass("navactive");

} else if (new RegExp("^/applyloan")
    .test(path)) {
    $(".u-nolist-ul li a#jiekuan")
        .addClass("navactive");

} else if (new RegExp("^/newAccount/*")
    .test(path)) {
    $(".u-nolist-ul li a#safety")
        .addClass("navactive");

} else if (new RegExp("^/guide")
    .test(path)) {
    $(".u-nolist-ul li a#help")
        .addClass("navactive");

} else if (new RegExp("^/aboutus/*")
    .test(path)) {
    $(".u-nolist-ul li a#aboutus")
        .addClass("navactive");
}