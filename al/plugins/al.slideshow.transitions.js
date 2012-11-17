/*global window, jQuery, aleksic*/
/**
 * Additional transitions for aleksic.ui.slideshow
 */
(function ($) {
	
	"use strict";

	$.extend(al.ui.SlideshowTransitions, {

        /* the new slide fades in while the old one fades out */
        crossfade: {
            strict: false,
            animateIn: function (slide, easing) {
                var from, to;
                from = {
                    opacity: 0,
                    top: 0,
                    left: 0
                };
                to = {
                    opacity: 1
                };
                slide.css(from).animate(to, this.options.duration, easing, $.proxy(this.animateInComplete, this, slide));
            },
            animateOut: function (slide, easing) {
                var from, to;
                from = {};
                to = {
                    opacity: 0
                };
                slide.stop().css(from).animate(to, this.options.duration / 2, easing);
            }
        },

        /* animates the horizontal positions of the slides */
        slideHorizontal: {
            strict: true,
            animateIn: function (slide, easing, dir) {
                var from, to;
                from = {
                    left: dir * slide.width(),
                    opacity: 1,
                    top: 0
                };
                to = {
                    left: 0
                };
                slide.css(from).animate(to, this.options.duration, easing, $.proxy(this.animateInComplete, this, slide));
            },
            animateOut: function (slide, easing, dir) {
                var from, to;
                from = {
                    left: 0
                };
                to = {
                    left: dir * slide.width()
                };
                slide.css(from).animate(to, this.options.duration, easing);
            }
        },

        /* animates the vertical positions of the slides */
        slideVertical: {
            strict: true,
            animateIn: function (slide, easing, dir) {
                var from, to;
                from = {
                    top: dir * slide.height(),
                    left: 0,
                    opacity: 1
                };
                to = {
                    top: 0
                };
                slide.css(from).animate(to, this.options.duration, easing, $.proxy(this.animateInComplete, this, slide));
            },
            animateOut: function (slide, easing, dir) {
                var from, to;
                from = {
                    top: 0
                };
                to = {
                    top: dir * slide.height()
                };
                slide.css(from).animate(to, this.options.duration, easing);
            }
        }
    });
    
}(jQuery));