/*global window, Image, jQuery, al*/
/*jslint nomen: true*/
(function($, al) {
	
	"use strict";
	
	/**
	 * Scale9FillExtension
	 * 
	 * Mutates the <code>al.ui.Scale9</code> class.
	 * 
	 * Enables Scale9 grids to use background images that are smaller than the displayed grids
	 * by creating additional slices to fill upthe remaining gaps.
	 * 
	 * @todo: Rename and refactor 'min_fills_width' and 'min_fills_height'. They are too ambigious. They should be 'requiredHorizontalFills' and 'requiredVerticalFills' or something like that.
	 * @todo: Try to put all caching variables into a 'fillCache' object
	 */
	
	var Scale9FillExtension = {
			
		/**
		 * Stores created slice elements. 
		 * An object containing up to three arrays: 'width', 'height', 'center'.
		 * Each of these arrays contains slices that are created to fill the grid
		 * @type {object}
		 */
		fills: null,
		
		/**
		 * An Image object that loads the actual image file. Required to determine the image's dimensions later on.
		 * @type {Image}
		 */
		img: null,
		
		/* 
		 * ------------------------------------------------------------------------------------------
		 * Camelcase is avoided on the next round of private vars. 
		 * This way we can construct their names at runtime 
		 * based on the property names 'width' and 'height' without having to uppercase them.
		 * Also, the next values are just cache placeholders for values we need across functions during one cycle.
		 * ------------------------------------------------------------------------------------------
		 */
		
		/*
		 * Cached value. Width of the original Element.
		 * @type {number} 
		 */
		element_width: 0,
		
		/*
		 * Cached value. Height of the original Element. 
		 * @type {number}
		 */
		element_height: 0,
		
		/**
		 * Cached value. Amount of required fill slices on the horizontal axis.
		 * @type {number}
		 */
		min_fills_width: 0,
		
		
		/**
		 * Cached value. Amount of required fill slices on the vertical axis.
		 * @type {number}
		 */
		min_fills_height: 0,
		
		/**
		 * Cached value. Shortcut variable for the double cornersize
		 * @type {number}
		 */
		dblcs: 0,
		
		
		
		/**
		 * Initializes the Scale9FillExtension. Creates an Image object anf loads the background image so we can determine the dimensions of the original image.
		 * @memberOf Scale9FillExtension
		 */
		initialize: function() {
			this._super();
			
			this.dblcs = 2 * this.options.cornerSize;
			
			this.img = new Image();
			this.img.onload = $.proxy(function() {
				this.img.loaded = true;
				this.fillsUpdate();
			}, this);
			this.img.src = this.options.src.replace(/"/g,"").replace(/url\(|\)$/ig, "");

		},
		
		/**
		 * Adds a call to <code>fillsUpdate()</code> to the original <code>resize()</code> method.
		 * @see #fillsUpdate()
		 */
		resize: function() {
			this._super();
			this.fillsUpdate();
		},
		
		/**
		 * Checks whether fill slices are required and creates or updates elements accordingly.
		 * Three separate operations check the 1) horizontal edges, 2) the vertical edges and the 3) content area in the center.
		 * Each of these operations ensures that required fills exist and have proper layout. unneccessary fill slices are removed automatically.
		 * the function itself does only conditional checks and delegates the actual operations to class methods.
		 */
		fillsUpdate: function() {
			
			if (!this.img || !this.img.loaded) {
				return;
			}
			
			this.wrapper.remove();
			
			this.element_width = this.element.width();
			this.element_height = this.element.height();
			this.min_fills_width = Math.ceil( (this.element_width - this.dblcs) / (this.img.width - this.dblcs) - 1);
			this.min_fills_height = Math.ceil( (this.element_height - this.dblcs) / (this.img.height - this.dblcs) - 1);
			
			
			/* variable names:
			 * nw, nh, nc -> needs width slices, needs height slices, needs center slices
			 * hw, hh, hc -> has width slices, has height slices, has center slices
			 */
			var nw = this.fillsRequired('width'),
				hw = this.fillsExist('width'),
				nh = this.fillsRequired('height'),
				hh = this.fillsExist('height'),
				nc = nw || nh,
				hc = this.fillsExist('center')
			;

//				var debug = 'nw: '+ nw+', nh: '+nh+' nc: '+nc+', fills: '+this.min_fills_width + ' x ' + this.min_fills_height;
//				var debug = this.min_fills_width + ' x ' + this.min_fills_height;
//				debug += '<div>'+(this.element_width - this.dblcs)+' / ' + (this.img.width - this.dblcs)+' = '+((this.element_width - this.dblcs) / (this.img.width - this.dblcs))+'</div>';
//				debug += this.min_fills_width;
//				
//				this.element.not('.special').find('.contents').html(debug);
					
			//---------------------------------------
			// width
			//---------------------------------------
			
			if (nw) {
				if (hw){
					this.fillsLayoutEdges('width');
				}
				else {
					this.fillsCreateEdges('width');
					this.fillsLayoutEdges('width');
				}
				
			}
			else {
				this.fillsDestroyEdges('width');
			}
			
			//---------------------------------------
			// height
			//---------------------------------------
			
			if (nh) {
				if (hh){
					this.fillsLayoutEdges('height');
				}
				else {
					this.fillsCreateEdges('height');
					this.fillsLayoutEdges('height');
				}
				
			}
			else {
				this.fillsDestroyEdges('height');
			}

			//---------------------------------------
			// center fill
			//---------------------------------------
			
			if (nc) {
				if (hc) {
					this.fillsLayoutCenter();
				}
				else {
					this.fillsCreateCenter();
					this.fillsLayoutCenter();
				}
			}
			else {
				this.fillsDestroyCenter();
			}


			this.wrapper.prependTo(this.element);
		},
		
		/**
		 * Whether or not fill slices are required on a given axis.
		 * This is the case when the grid is larger on that axis than the actual image is.
		 * @param {string} side The side of operation. Allowed values are 'w' for with or 'h' for height.
		 * @return {boolean}
		 */
		fillsRequired: function(side) {
			if (!this.element || !this.img || !this.img.loaded) {
				return false;
			}
			return this.img[side] <  this['element_'+side];
		},

		/**
		 * Returns true if the exact required amount of fill slices exists on an axis, false otherwise. 
		 * Used to check whether we need to re-create the fill slices for that side.
		 * Note: The function name is somewhat ambigious. Not only does the function check whether any fills for the particular side exist, as the
		 * function name suggests. Moreover, it also checks whether the amount of fills equals the amount of neccessary fills. 
		 * So the function returns false if fills exist, but there is more of them than neccessary. 
		 * @param {string} side The side of operation. Allowed values are 'w' for with or 'h' for height.
		 * @return {boolean}
		 */
		fillsExist: function(side) {
			if (side === 'center') {
				return this.fills && this.fills.center && this.fills.center.length === (this.min_fills_width + 1 ) * (this.min_fills_height + 1);
			}
			else {
				return this.fills && this.fills[side] && this.fills[side].length === 2*this['min_fills_'+side];
			}
		},
		
		
		/**
		 * Creates the fill slices required on one axis of the grid.
		 * If the axis (specified by the 'side' argument) is 'width', the top and bottom edge fills are created.
		 * If the axis is 'height', the left and right edge fills are created.
		 * Any previously existing fill slices for the side are removed before the new ones are created. 
		 * @param side
		 */
		fillsCreateEdges: function(side) {
			var o = this.options,
				requiredNum = this['min_fills_'+side],
				slice = null,
				fills = null
			;
			if (!this.fills) {this.fills = {};}
			fills = this.fills[side] = [];
			
			this.wrapper.children('.slice-fill-' + side).remove();
			while (fills.length < requiredNum * 2) {
				slice = $('<div class="scale9-slice slice-fill slice-fill-' + side + ' slice-fill-' + side + '-' + fills.length+'">');
				slice.css({
					'position': 'absolute',
					'background-image': o.src
				});
				this.wrapper.append( slice );
				fills.push(slice[0]);
			}
		},
		
		
		/**
		 * Creates fill slices to cover the center area.
		 */
		fillsCreateCenter: function(){
			var o = this.options,
				req = (this.min_fills_width + 1) * (this.min_fills_height + 1),
				slice = null,
				fills = null
			;
			
			if (!this.fills) {this.fills = {};}
			
			fills = this.fills.center = [];
			
			this.wrapper.children('.slice-fill-center').remove();
			while (fills.length < req) {
				slice = $('<div class="scale9-slice slice-fill slice-fill-center slice-fill-center-' + fills.length+'">');
				slice.css({
					'position': 'absolute',
					'background-image': o.src,
					'background-position': 'center center'
				});
				this.wrapper.append( slice );
				fills.push(slice[0]);
			}
		},
		
		


		/**
		 * Applies layout to the edge fill slices for an axis (specified by the 'side' argument).
		 * The function sets the position and size of the fills, as well as their background image.
		 * @param {string} side The side of operation. Allowed values are 'w' for with or 'h' for height.
		 */
		fillsLayoutEdges: function(side) {
			var o = this.options,
				otherSide = side === 'width' ? 'height' : 'width',
				size = this.img[side] - this.dblcs,
				pos = side === 'width' ? 'left' : 'top',
				otherPos = side === 'width' ? 'top' : 'left',
				gridSize = this['element_' + side],
				gridOtherSize = this['element_' + otherSide],
				fills = null,
				styles = null,
				i = 0, t = 0
			;
			
			
			//======================================================================================================
			
			// reduce width or height of the default grid edges to the size of the source image's usable segment
			if (side === 'height') {
				// left edge ----------------------------
				this.slices[3].style[side] = size + 'px';
				// right edge ---------------------------
				this.slices[5].style[side] = size + 'px';
			}
			else if (side === 'width') {
				// top edge -----------------------------
				this.slices[1].style[side] = size + 'px';
				// bottom edge --------------------------
				this.slices[7].style[side] = size + 'px';
			}
			
			//======================================================================================================
			
			// set position and size of each fill slice
			fills = this.fills[side];
			t = fills.length;
			i = 0;
			
			while (i < t) {
				styles = {};
				styles[pos] = (0.5 * i * size) + o.cornerSize + size;
				styles[side] = size;
				styles[otherSide] = o.cornerSize;
				
				if (styles[pos] + styles[side] > gridSize - o.cornerSize) {
					styles[side] = gridSize - styles[pos] - o.cornerSize;
				}
				
				styles[otherPos] = 0;
				styles.backgroundPosition = side === 'width' ? 'center top' : 'left center';
				this.applyCSS(fills[i], styles);

				styles[otherPos] = gridOtherSize - o.cornerSize;
				styles.backgroundPosition =  side === 'width' ? 'center bottom' : 'right center';
				this.applyCSS(fills[i+1], styles);
				
				i = i+2;
			}
		},

		
		/**
		 * Applies layout to the fill slices in the center area.
		 * Contrary to the edges, where we only have to repeat in one direction, 
		 * we need to create a grid of fills here to cover the full content area of the grid.
		 */
		fillsLayoutCenter: function() {
			
			this.slices[4].style.display = 'none';
			var o = this.options,
				cs = o.cornerSize,
				fills = this.fills.center,
				gridW = this.element.width() - cs,
				gridH = this.element.height() - cs,
				w = Math.min(gridW, this.img.width - this.dblcs),
				h = Math.min(gridH, this.img.height - this.dblcs),
				x = cs, 
				y = cs,
				i = 0,
				t = fills.length,
				styles = null,
				nl = false
			;
			

			//======================================================================================================
			
			while(i < t) {
				
				styles = {
					width: w,
					height: h,
					top: y,
					left: x
				};
			
				if (styles.left + styles.width > gridW) {
					styles.width = gridW - styles.left;
					nl = true;
				}
				
				if (styles.top + styles.height > gridH) {
					styles.height = gridH - styles.top;
				}
				
				if (nl) {
					// newline
					x = cs;
					y = y + h;
					nl = false;
				}
				else {
					// continue to the right side without newline
					x = x + w;
				}
				
				this.applyCSS(fills[i], styles);
				
				i = i+1;
			}
			
			

			
		},

		
		
		/**
		 * Destroys all edge fill slices on an axis.
		 * @param {string} side The side of operation. Allowed values are 'w' for with or 'h' for height.
		 */
		fillsDestroyEdges: function(side) {
			if (this.fills) { this.fills[side] = []; }
			this.wrapper.children('.slice-fill-' + side).remove();
		},

		/**
		 * Destroys all center fill slices.
		 */
		fillsDestroyCenter: function() {
			if (this.fills) { this.fills.center = []; }
			this.wrapper.children('.slice-fill-center').remove();
			this.slices[4].style.display = 'block';
		}

	};
	
	al.ui.Scale9 = al.ui.Scale9.extend(Scale9FillExtension);
	
}(jQuery, al));