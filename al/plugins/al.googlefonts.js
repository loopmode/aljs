/*global window, jQuery*/
/* @require jQuery.jStorage */
/*jslint white: true, nomen: true*/
(function($, al) {
	"use strict";
	/**
	 * helper functions and utilities for working with the google fonts api.
	 * useful when you need the full google font list.
	 * less usefull in combination with CKEditor - all (hundrets of) fonts will be loaded simoultanously when CKEditor opens up.
	 */
	var GoogleFonts = {
		
			
		/** @type {object} */
		defaults: function() {
			return {
				listUrl: 'https://www.googleapis.com/webfonts/v1/webfonts?sort=alpha&key={key}',
				embedUrl: 'http://fonts.googleapis.com/css?family={f}',
				storageName: 'GoogleFontCache',
				excludeFamilies: 'Molle,Buda,Coda Caption,Open Sans Condensed,Sniglet,UnifrakturCook',
				apiKey: '',
				editor: null,
				autoload: true,
				ckKeepFonts: false
			};
		},
 
		/** @type {object} */
		options: null,
		
		/**
		 * @constructor
		 * @memberOf al.GoogleFonts
		 */
		construct: function(options) {
			this.options = this.extend(this.defaults(), options);
			if (this.options.autoload) {
				if (this.getData()) {
					this.loadDataDone(this.getData());
				}
				else {
					this.loadData();
				}
			}
		},
		ready: function(fn) {
			var data = this.getData();
			if (data) {
				fn(data);
			}
			else {
				$(this).bind('loaded', fn);
			}
		},
		getData: function() {
			return $.jStorage.get(this.options.storageName);
		},
		flushLocal: function() {
			$.jStorage.set(this.options.storageName, null);
		},
		loadData: function() {
			var o = this.options,
				key = o.apiKey,
				url = o.listUrl.replace('{key}', key);
			if ($.browser.msie) {
				// IE has crossdomain issues with google fonts. we retrieve them via php
				url = './actions/fontlist.php?url='+url;
			}
			this.log('loadData', url);
			$.getJSON(url)
			.done($.proxy(this.loadDataDone, this))
			.fail($.proxy(this.loadDataFail, this));
			
		},
		loadDataDone: function(res) {
			
			var fnInject = this['inject'+this.options.editor],
				filteredNames = [],
				filteredItems = [],
				blacklist = this.options.excludeFamilies.split(','),
				items = res.items,
				i = 0, t = items.length;
			while (i < t) {
				if (blacklist.indexOf(items[i].family) === -1) {
					filteredItems.push(items[i]);
					filteredNames.push(items[i].family);
				}
				i = i+1;
			}
			
			this.data = res;
			this.data.items = filteredItems;
			this._f = filteredNames.join(',').toLowerCase();
			$.jStorage.set(this.options.storageName, this.data);
			if (typeof fnInject === 'function') {
				fnInject.apply(this);
			}
			$(this).trigger('loaded');
		},
		loadDataFail: function(res) {
			this.error(new Error('Failed retrieving font list from Google'), arguments, this);
		},
		
		/**
		 * Whether a fontname was loaded from the fonts API
		 */
		containsFamily: function(f) {
			return this._f.indexOf( (f||'').toLowerCase().replace(/'/g, '').replace(/\+/g, ' ') ) > -1;
		},
		
		/**
		 * Creates a link tag and embeds a font stylesheet.
		 * @param f The font family
		 * @param o Options object; o.fixCase:Boolean, o.className:String 
		 * @return {boolean} whether the stylesheet was embedded or not. False if the font already was embedded.
		 */
		embed: function(f, o) {
			var url = this.options.embedUrl.replace('{f}', (o && o.fixCase) ? this.toProperCase(f) : f);
			if ($('link[href="'+url+'"]').length === 0) {
				$('<link class="' + ( (o && o.className) ||'') + '" type="text/css" rel="stylesheet" href="'+url.replace(/ /g, '+')+'">').appendTo('head');
				return true;
			}
			return false;
		},
		
		/**
		 * Creates a combined request that includes multiple fonts from Google.
		 * Based on optimization tips on http://googlewebfonts.blogspot.de/2010/09/optimizing-use-of-google-font-api.html
		 * @param urls {array} An array containing multiple font embed urls
		 * @return {string} A string that embeds all fonts at once
		 * @example 
		 * var urls = ['http://fonts.googleapis.com/css?family=Dorsa','http://fonts.googleapis.com/css?family=Chango'];
		 * console.log( this.fonts.combine(urls) ); // prints "http://fonts.googleapis.com/css?family=Dorsa|Chango"
		 */
		combine: function(urls) {
			var families = [];
			$(urls).each(function() {
				var f = this.split('family=')[1];
				if (f) {
					families.push( f.replace(/ /g, '+') );
				}
			});
			return this.options.embedUrl.replace('{f}', families.join('|'));
		},
		
		
		normalize: function(str) {
			return $.trim(str.split(':')[0].replace(/\+/g, ' ').replace(/\'/g, '').replace(/\\n/g, ''));
		},
		toProperCase: function(f) {
			var data, items, result=null, i, t;
			data = this.getData();
			if (data && data.items) {
				items = data.items;
				t = items.length;
				i = 0;
				f = f.toLowerCase().replace(/'/g, '');
				while (i < t && !result) {
					if (f === items[i].family.toLowerCase()) {
						result = items[i].family;
					}
					i = i+1;
				}
			}
			return result;
		},
		
		injectCKE: function() {
			if (window.CKEDITOR.alInjectedFlag) {
				return;
			}
			var o = this.options,
				ckConfig = window.CKEDITOR.config,
				items, names = '', embeds = null;
			try {
				if (this.data && this.data.items) {
					items = this.data.items;
					embeds = [];
					$(items).each(function(i) {
						names += items[i].family.replace(/\+/g, ' ').split(':')[0] + ';' ;
						embeds.push( o.embedUrl.replace('{f}', items[i].family) );
					});
				}
				//this.log(embeds);
				ckConfig.font_names = o.ckKeepFonts ? ckConfig.font_names + ';' + names : names;
				ckConfig.contentsCss = [ckConfig.contentsCss].concat(embeds);
				
				window.CKEDITOR.alInjectedFlag = true;
			}
			catch (error) {
				this.error(new Error('injectCKE() failed'), error);
			}
		}
		
	};
	
	
	
	al.defineClass('al.GoogleFonts', GoogleFonts);
	
}(jQuery, window.al));