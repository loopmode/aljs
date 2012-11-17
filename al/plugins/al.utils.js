/*global window*/
(function($, al) {
	"use strict";
	al.utils = {

		// Makes a string's first character uppercase  
		// 
		// version: 1109.2015
		// discuss at: http://phpjs.org/functions/ucfirst
		// +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		// +   bugfixed by: Onno Marsman
		// +   improved by: Brett Zamir (http://brett-zamir.me)
		// *     example 1: ucfirst('kevin van zonneveld');
		// *     returns 1: 'Kevin van zonneveld'
		ucfirst: function(str) {
		    str += '';
		    var f = str.charAt(0).toUpperCase();
		    return f + str.substr(1);
		},
		
		
		nopx: function(v) {
			if (v && typeof v === 'string' && v.match(/px/)) {
				return Number(v.split('px')[0]);
			} 
			return v;
		},
		
		/**
		 * http://stackoverflow.com/questions/487073/check-if-element-is-visible-after-scrolling
		 */
		inView: function(elem, container, complete)
		{
			complete = (arguments.length === 2 && typeof container === 'boolean') ? container : complete;
			
		    var docViewTop = $(container || window).scrollTop();
		    var docViewBottom = docViewTop + $(container || window).height();

		    var elemTop = $(elem).position().top;
		    var elemBottom = elemTop + $(elem).height();
		    
		    if (complete) {
			    return ((elemBottom >= docViewTop) && (elemTop <= docViewBottom)
			      && (elemBottom <= docViewBottom) &&  (elemTop >= docViewTop) );
		    }
		    return (elemBottom <= docViewBottom) &&  (elemTop >= docViewTop);
		},
		
		/**
		 * Function : dump()
		 * Arguments: The data - array,hash(associative array),object
		 *    The level - OPTIONAL
		 * Returns  : The textual representation of the array.
		 * This function was inspired by the print_r function of PHP.
		 * This will accept some data as the argument and return a
		 * text that will be a more readable version of the
		 * array/hash/object that is given.
		 * Docs: http://www.openjs.com/scripts/others/dump_function_php_print_r.php
		 */
		dump: function(arr,level) {
			var dumped_text = "";
			if(!level) level = 0;
			
			//The padding given at the beginning of the line.
			var level_padding = "";
			for(var j=0;j<level+1;j++) level_padding += "    ";
			
			if(typeof(arr) == 'object') { //Array/Hashes/Objects 
				for(var item in arr) {
					var value = arr[item];
					
					if(typeof(value) == 'object') { //If it is an array,
						dumped_text += level_padding + "'" + item + "' ...\n";
						dumped_text += al.utils.dump(value,level+1);
					} else {
						dumped_text += level_padding + "'" + item + "' => \"" + value + "\"\n";
					}
				}
			} else { //Stings/Chars/Numbers etc.
				dumped_text = "===>"+arr+"<===("+typeof(arr)+")";
			}
			return dumped_text;
		},
		
		/**
		 * Cleans linebreaks, tabs and unneccessary whitespace from a string and returns the cleaned version.
		 */
		cleanupHtml: function(str) {
			// trim white left/right
			str = $.trim(str);
			// remove whitespace
			str = str.replace(/^\s+|\s+$/, '').replace('/\s\s+/', ' ');
			// remove newlines
			str = str.replace(/(\r\n|\n|\r|\t)/gm,"");
			
			return str;
		}
	
	};
	
}(window.jQuery, window.al));