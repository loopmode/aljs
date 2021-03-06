/*global window, jQuery, al*/
/*jslint nomen: true, white: true */

/*
 * Scale9 grid
 * @author Jovica Aleksic
 */
(function($) {
	"use strict";
	
	var Scale9 = {
		
		element: null,
		wrapper: null,
		
		/**
		 * Array containing a DOM Element for each of the 9 slices
		 */
		slices: null,
		
		
		defaults: function() {
			return this.extend(this._super(), {
				cornerSize: 30
			});
		},
		
		/**
		 * @memberOf Scale9
		 */
		construct: function(el, o) {
			this._super(o);
			this.element = $(el);


			this.element.data('scale9', this);
			this.options.src = this.options.src ? 'url('+o.src+')' : this.element.css('background-image');
			
			this.initialize();
			this.resize();
			
			
			//this.log(this.element.css('width'))
		},
		
		initialize: function() {
			var slice;
			
			this.element.find('.scale9-wrapper').remove();
			this.wrapper = $('<div class="scale9-wrapper">').css({
				position: 'relative',
				width: 0,
				height: 0,
				zIndex: -1
			}).prependTo(this.element);
			
			this.slices = [];
			while (this.slices.length < 9) {
				slice = $('<div class="scale9-slice slice-'+this.slices.length+'">');
				this.wrapper.append( slice );
				this.slices.push(slice[0]);
			}		

			this.element.css({backgroundImage: 'none'});
		},
		
		applyCSS: function(el, obj) {
			var p = null,
				val = null;
			for (p in obj) {
				if (obj.hasOwnProperty(p)) {
					val = obj[p];
					if (typeof val === 'number') {
						val = val + 'px';
					}
					el.style[p] = val;
				}
			}				
		},
		
		resize: function() {
			
			var el = this.element,
				wrap = this.wrapper,
				o = this.options,
				cs = o.cornerSize,
				w = el.width(),
				h = el.height(),
				s = this.slices,
				css = this.applyCSS
			;
			
			wrap.remove();
			

			//---------------------------------------
			// CORNER SLICES
			//---------------------------------------
				
			
			// top-left
			//---------------------------------------
			
			css(s[0], {
				left: 0,
				top: 0,
				width: cs,
				height: cs,
				backgroundPosition: 'left top' 
			});
			
			// top-right
			//---------------------------------------
			css(s[2], {
				left: w - cs,
				top: 0,
				width: cs,
				height: cs,
				backgroundPosition: 'right top' 
			});
			

			// bottom-left
			//---------------------------------------
			css(s[6], {
				left: 0,
				top: h - cs,
				width: cs,
				height: cs,
				backgroundPosition: 'left bottom' 
			});

			// bottom-right
			//---------------------------------------
			css(s[8], {
				left: w - cs,
				top: h - cs,
				width: cs,
				height: cs,
				backgroundPosition: 'right bottom' 
			});
			

			//---------------------------------------
			// EDGE SLICES
			//---------------------------------------
			

			// top
			//---------------------------------------
			css(s[1], {
				left: cs,
				top: 0,
				width: w - 2*cs, 
				height: cs,
				backgroundPosition: 'center top' 
			});

			// right
			//---------------------------------------
			css(s[5], {
				left: w - cs,
				top: cs,
				height: h - 2*cs, 
				width: cs,
				backgroundPosition: 'right center' 
			});
			
			// bottom
			//---------------------------------------
			css(s[7], {
				left: cs,
				top: h - cs,
				width: w - 2*cs,
				height: cs,
				backgroundPosition: 'center bottom' 
			});
			
			// left
			//---------------------------------------
			css(s[3], {
				left: 0,
				top: cs,
				width: cs,
				height: h - 2*cs,
				backgroundPosition: 'left center' 
			});

			
			//---------------------------------------
			// CENTER SLICE
			//---------------------------------------
			
			css(s[4], {
				left: cs,
				top: cs,
				width: w - 2*cs,
				height: h - 2*cs,
				backgroundPosition: 'center center' 
			});

			
			//---------------------------------------
			// ALL SLICES
			//---------------------------------------

			wrap.children('.scale9-slice').css({
				backgroundImage: o.src,
				position: 'absolute'
			});
			
			
			wrap.prependTo(el);
		},
		
		destroy: function() {
			this.element.css({
				backgroundImage: this.options.src
			})
			.data('scale9', null);
			this.wrapper.remove();
			$(window).unbind(this.ns());
			return this.element;
		},
		
		
		/**
		 * Sets the cornersize value. This will be the width and height of the corner slices.
		 * @param {number} value The new corner size.
		 */
		cornerSize: function(value) {
			this.options.cornerSize = value;
			this.resize();
		},
		
		
		/**
		 * Enables automatic resize when the browser size changes. 
		 * @param {boolean} value true or false, activate or deactivate the feature 
		 * @returns
		 */
		autoResize: function(value) {
			if (value !== undefined) {
				$(window).unbind(this.ns('resize'));
				this.autoResizeEnabled = value;
				if (value === true) {
					$(window).bind(this.ns('resize'), $.proxy(this.resize, this));
				}
			}
			else {
				return this.autoResizeEnabled;
			}
		}
		
	};
	al.defineClass('al.ui.Scale9', Scale9);
	
	// jQuery plugin
	$.fn.scale9 = function(o) {
		var args = arguments;
		return $(this).each(function() {
			var scale9 = $(this).data('scale9');
			if (scale9 && args[0] && typeof scale9[args[0]] === 'function') {
				return scale9[args[0]](args[1]);
			}
			return new al.ui.Scale9(this, args[0]);				
		});
	};
}(jQuery));