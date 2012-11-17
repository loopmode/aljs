/*global window, jQuery, al*/
/*jslint nomen: true, white: true */



/*
 * Slideshow plugin
 * @author Jovica Aleksic
 */
(function($) {
	"use strict";
	
	var Slideshow = null, SlideshowTransitions = null;
	
	Slideshow = {
		
		element: null,
		wrapper: null,
		
		/**
		 * Whether the slideshow is currently running.
		 */
		active: false,
		
		/** array containing the urls of our images */
		sources: null,
		
		defaults: function() {
			var o = {
				imgSelector: '> img',
		        autoStart: true,
		        first: 0,
		        interval: 2000,
		        duration: 1500,
		        loop: true,
		        allowStretching: false,
		        transition: null,
		        easing: 'swing',
		        hwAccelStyles: {

					'transform': 'rotateZ(0)',
					'-webkit-transform': 'rotateZ(0)',
					'-moz-transform': 'rotateZ(0)',
					'-o-transform': 'rotateZ(0)',
					'-ms-transform': 'rotateZ(0)',
						
					'backface-visibility': 'hidden',
					'-webkit-backface-visibility': 'hidden',
					'-moz-backface-visibility': 'hidden',
					'-ms-backface-visibility': 'hidden',
					'-o-backface-visibility': 'hidden', /* not sure whether it's supported */
					
					'perspective': 1000,
					'-webkit-perspective': 1000,
					'-moz-perspective': 1000,
					'-ms-perspective': 1000,
					'-o-perspective': 1000 /* not sure whether it'	s supported */

				}
		    };
			return this.extend(this._super(), o);
		},
		
		/**
		 * @memberOf Slideshow
		 */
		construct: function(el, o) {
			this._super(o);
			this.element = $(el).addClass('al-slideshow');
			this.element.data(this.classname, this);
	        this.initialize();
		},
		
		initialize: function() {
			if (!this.options.transition) {
				this.options.transition = SlideshowTransitions.fade;
			}
			var o = this.options,
				images = [];
			this.element.find(this.options.imgSelector).each(function(i) {
				$(this)
					.addClass('slide')
					.attr('data-index', i)
					.css(o.hwAccelStyles)
					.remove()
					.load(function(){
						$(this).attr({
							'data-width': this.width,
							'data-height': this.height
						});
					});
				images.push(this);
			});
			this.images = images;
			this.change(this.options.first, true);
			if (o.autoStart) {
				this.start();
			}
		},
		

        //------------------------------------------------------------
        // PLAYBACK
        //------------------------------------------------------------
        start: function () {
            this.active = true;
            this.nextTimeout();
        },
        stop: function () {
            this.active = false;
            this.clearTimeout();
        },
        
        
        
        //------------------------------------------------------------
        // PREV
        //------------------------------------------------------------
        prev: function () {
            if (this.index - 1 < 0) {
                if (this.options.loop) {
                    this.change(this.images.length - 1);
                } else {
                    this.stop();
                }
            } else {
                this.change(this.index - 1);
            }
        },

        prevTimeout: function (time) {
            this.clearTimeout();
            this.timeout = window.setTimeout($.proxy(this.prev, this), time || this.options.interval);
        },


        //------------------------------------------------------------
        // NEXT
        //------------------------------------------------------------
        next: function () {
            if (this.index + 1 > this.images.length - 1) {
                if (this.options.loop) {
                    this.change(0);
                } else {
                    this.stop();
                }
            } else {
                this.change(this.index + 1);
            }
        },

        nextTimeout: function (time) {
            this.clearTimeout();
            this.timeout = window.setTimeout($.proxy(this.next, this), time || this.options.interval);
        },
        
        //------------------------------------------------------------
        // CHANGE
        //------------------------------------------------------------
        change: function (index, instant) {
            ///////////////////////////////////////////
            // setup required vars
            ///////////////////////////////////////////
            index = parseInt(index, 10);
            if (index > this.images.length - 1) {
                index = this.images.length - 1;
            }
            if (index < 0) {
                index = 0;
            }
            var slide = $(this.images[index]),
                o = this.options,
                dir = index > this.index ? 1 : -1;
                

            
            ///////////////////////////////////////////            
            // validate required vars
            ///////////////////////////////////////////
            if ((o.transition.strict && this.animating) || index === this.index || slide.length === 0) {
                return;
            }


            ///////////////////////////////////////////
            // set instance values
            ///////////////////////////////////////////
            this.index = index;
            this.currentSlide = slide;
            this.element.append(slide);
//            
//            if (o.autoHeight) {
//            	console.log(slide)
//            	autoHeight = function() {
//            		slide.height( slide.width() / slide.attr('data-width') * slide.height() );
//            	};
//            	if (slide.attr('data-width')) {
//            		autoHeight();
//            	}
//            	else {
//            		this.bind('imgLoaded', autoHeight);
//            	}
//            	
//            }


            ///////////////////////////////////////////
            // apply layout functions to the slide
            ///////////////////////////////////////////
            if (o.allowStretching !== true) {
                this.preventStretching(slide);
            }
            this.fitContent(slide, this.element);


            ///////////////////////////////////////////
            // trigger event and callback
            ///////////////////////////////////////////
            this.trigger('changeBegin', this.index);
            if (o.onChangeBegin) {
                o.onChangeBegin(this.index);
            }



            ///////////////////////////////////////////
            // animate
            //////////////////////////////////////////
            if (instant) {
                this.animateInComplete();
            } else {
                this.animating = true;
                if (o.transition.animateIn) {
                    o.transition.animateIn.apply(this, [slide, o.easing, dir]);
                }
                if (o.transition.animateOut) {
                    o.transition.animateOut.apply(this, [slide.prev(), o.easing, -dir]);
                }
            }
        },

        animateInComplete: function (slide) {
        	var o = this.options;
        	/*
             clean up old slides
            */

            if ($(slide).length === 0 || Number($(slide).attr('data-index')) === this.index) {
                this.animating = false;
                this.cleanup(slide);
            }

        	/*
             trigger event and callback
            */
            this.trigger('change', this.index);
            if (o.onChange) {
                o.onChange(this.index);
            }

            /*
             show the next slide if active
            */
            if (this.active) {
                this.nextTimeout();
            }
        },


        /**
         * Removes unneeded slides.
         */
        cleanup: function () {
            while (this.element.find('.slide').length > 1) {
                this.element.find('.slide:eq(0)').remove();
            }
        },
        
        
        /**
         * Sets the true image size as the maximum size of the image.
         */
        preventStretching: function (img) {
            if (img.attr('data-width')) {
                return;
            }
            var apply = function (t, w, h) {
                    t.attr('data-width', w);
                    t.attr('data-height', h);
                    t.css({
                        'max-width': w,
                        'max-height': h
                    });
                },
                img_width = img.width(),
                img_height = img.height();

            if (img_height > 0) {
                apply(img, img_width, img_height);
            } else {
                img.load(function () {
                    apply($(this), $(this).width(), $(this).height());
                });
            }
        },


        clearTimeout: function () {
            if (this.timeout) {
                window.clearTimeout(this.timeout);
            }
        },

        /*
         * Scales the image so that it fits the area without stretching.
         */
        _fitContent: function () {
        	/*
            var self = this,
                slide = this.currentSlide,
                img = slide.find('img'),
                img_css = {
                    position: 'relative'
                },
                img_rat = img.width() / img.height(),
                slide_rat = slide.width() / slide.height(),
                side_pri = (img_rat > slide_rat) ? 'width' : 'height',
                side_sec = (side_pri === 'width') ? 'height' : 'width';

            if (img[side_pri]() === 0) {
                window.setTimeout($.proxy(self.fitContent, self), 10);
                return;
            }
            img_css[side_pri] = slide[side_pri]();
            img_css[side_sec] = 'auto';
            img.css(img_css);
            img.css('left', 0.5 * (slide.width() - img.width()));
            img.css('top', 0.5 * (slide.height() - img.height()));
            */

        },
        
        fitContent: function(img, container) {
			var o = this.options,
				
				imgwidth = img.width(),
				imgheight = img.height(),
	
				winwidth = $(container).width(),
				winheight = $(container).height(),
	
				widthratio = winwidth / imgwidth,
				heightratio = winheight / imgheight,
	
				widthdiff = heightratio * imgwidth,
				heightdiff = widthratio * imgheight,
				fullw, fullh, center;
	
			if (imgheight === 0) {
				return img.bind('load.fullBg', $.proxy(function() { this.fitContent(img, container); }, this));
			}
			img.unbind('load.fullBg');
			
			center = function(){
				img.css({
					left: 0.5 * (winwidth - img.width()),
					top:0.5 * (winheight - img.height())
				});
			};
			fullw = function() {
				img.css({
					width : winwidth + 'px',
					height : heightdiff + 'px'
				}); 
			};
			fullh = function( ){
				img.css({
					width : widthdiff + 'px',
					height : winheight + 'px'
				});
			};
			if (heightdiff > winheight) {
				fullw();
			} else {
				fullh();
			}

			if (o.centeredV) {
				center();
			}
			this.element.css({
				width: winwidth,
				height: winheight
			});
		},
		
        capitalize: function (string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        },
        
        fullBgEnable: function() {
        	var resize = $.proxy(function() {
				this.fitContent(this.currentSlide, window);
			});
			$(window).bind(this.ns('resize', 'fullBg'), resize);
			this.bind(this.ns('changeBegin', 'fullBg'), resize);
			resize();
		},
		
		fullBgDisable: function() {
			$(window).unbind(this.ns('resize', 'fullBg'));
			this.unbind(this.ns('changeBegin', 'fullBg'));			
		},
		
		
		destroy: function() {
			var o = this.options,
				el = this.element;
			
			this.stop();
            while (this.images.length) {
                $(this.images[0]).find('img').attr('src', '').remove();
                this.images[0] = null;
                this.images.shift();
            }
            this.currentSlide = null;
			
			el.data(this.classname, null);
			$(this.images).each(function() {
				$(this).find(o.imgSelector).appendTo(el);
			});
			$(window).unbind(this.ns());
			return this.element;
		}
		
	};
	al.defineClass('al.ui.Slideshow', Slideshow);

	// jQuery plugin
	$.fn.Slideshow = function(o) {
		var args = arguments;
		return $(this).each(function() {
			var slideshow = $(this).data('Slideshow');
			if (slideshow && args[0] && typeof slideshow[args[0]] === 'function') {
				return slideshow[args[0]](args[1]);
			}
			return new al.ui.Slideshow(this, args[0]);				
		});
	};
	
	//------------------------------------------------------------
    // TRANSITIONS
    //------------------------------------------------------------

    /* 
     * Transitions
     * A transition is defined as an object with at least one property and two functions:
     * strict - Boolean value
     * animateIn()
     * animateOut()
     * 
     * We define only the default transition here, additional transitions are defined in slideshow-transitions.js
     */
	SlideshowTransitions = { /* fades the new slide over the old one. the old slide is not animated */
        fade: {
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
            animateOut: null
        }
    };
	al.ui.SlideshowTransitions = SlideshowTransitions;
	
}(jQuery));