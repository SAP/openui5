/*!
 * jQuery MobiScroll v2.2
 * http://mobiscroll.com
 *
 * Copyright 2010-2011, Acid Media
 * Licensed under the MIT license.
 *
 */
(function ($) {

    $.mobiscroll.themes.wp = {
        defaults: {
            width: 70,
            height: 76,
            dateOrder: 'mmMMddDDyy'
        },
        init: function(elm, inst) {
            var click,
                active;

            $('.dwwl', elm).bind('touchstart mousedown DOMMouseScroll mousewheel', function() {
                click = true;
                active = $(this).hasClass('wpa');
                $('.dwwl', elm).removeClass('wpa');
                $(this).addClass('wpa');
            }).bind('touchmove mousemove', function() {
                click = false;
            }).bind('touchend mouseup', function() {
                if (click && active) {
                    $(this).removeClass('wpa');
                }
            });
        }
    }

    $.mobiscroll.themes['wp light'] = $.mobiscroll.themes.wp;

})(jQuery);


