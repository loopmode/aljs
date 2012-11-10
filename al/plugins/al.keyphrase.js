(function($, al) {
	
	/**
	 * The Keyphrase class can be used to detect when the user has typed a certain phrase on his keyboard.
	 */
	var Keyphrase = {
		
		classname: 'Keyphrase',
	 
		/** @type {object} */
		defaults: function() {
			return {
				
				/**
				 * The element that needs to have focus so the keyphrase is captured.
				 * Per default, this is the <code>document</code>, so any keypress will be captured.
				 */
				element: window.document,
				
				/**
				 * Maximum time between keystrokes 
				 * @type {number}
				 */
				timeout: 250,
				
				/**
				 * Whether the Keyphrase instance should be destroyed once the callback has been executed
				 * @type {boolean}
				 */
				once: false
				
			}
		},
 
		/** @type {object} */
		options: null,
		
		/** @type {string} */
		phrase: null,
		
		/** @type {function} */
		callback: null,
		
		/**
		 * Timestamp of the last keydown event
		 */
		lastKeyTime: null,
		
		
		/**
		 * The character that was pressed on the last keypress event.
		 */
		lastKeyChar: null,

		/**
		 * The current character position within the phrase.
		 * This will be incremented whenever the user types within the time defined in <code>options.timeout</code>.
		 * It will be set back to 0 when <code>options.timeout</code> elapses or the user 
		 * types a character that is not part of our phrase.
		 * 
		 * @type {number}
		 */
		pos: 0,
		
		/**
		 * The returned value of the last window.setTimeout call
		 */
		timeout: null,
		
		
		/**
		 * @constructor
		 * @memberOf al.classes.Keyphrase
		 */
		init: function(phrase, callback, options) {
			this._super();
			
			this.phrase = phrase;
			this.callback = callback;
			this.options = this.extend(this.defaults(), options);
			
			var el = $(this.options.element);
			if (el[0] instanceof window.Element && 	!el.is('input') && typeof el.attr('tabindex') === 'undefined') {
				el.attr('tabindex',0);
			}

			$(this.options.element).bind(this.ns('keypress'), $.proxy(this.handleKeyUp, this));
		},
		
		handleKeyUp: function(e) {

			var char = String.fromCharCode(e.which),
				time = new Date().getTime();
			
			if (char === this.phrase[this.pos]) {

				if (this.pos === 0 || (!this.lastKeyTime || this.lastKeyTime + this.options.timeout > time) ) {
					
					if (this.timeout) {
						window.clearTimeout(this.timeout);
					}
					
					this.timeout = window.setTimeout($.proxy(function() {
						this.pos = 0;
					}, this), this.options.timeout);
					
					this.pos += 1;
					
					if (this.pos === this.phrase.length && this.callback) {
						this.callback();
						
						if (this.options.once) {
							this.destroy();
						}
					}
				}
				
			}
			else {
				this.pos = 0;
			}
			
			this.lastKeyChar = char;
			this.lastKeyTime = time;
			
		},
	 
		destroy: function() { 
			$(this.options.element).unbind(this.ns('keypress'));
		}
		
	};
	
	
	
	Keyphrase = al.defineClass('al.classes.Keyphrase', Keyphrase);
	$.extend(al, {
		keyphrase: function(phrase, callback, options) {
			return new al.classes.Keyphrase(phrase, callback, options);
		}	
	});
	
}(jQuery, window.al));