"use strict";

require('bootstrap/js/transition');
require('bootstrap/js/carousel');
$('[data-ride="carousel"]').each(function () {
    var $carousel = $(this)
    $(this).carousel($carousel.data());
    console.log($carousel.data());
})