/*global window*/
/*jslint sloppy: true, white: true */
var al;
(function($) {
	
	// add location.origin to non-webkit browsers (very handy)
	if (!window.location.origin) {
		window.location.origin = window.location.protocol+"//"+window.location.host;
	}
	
	/**
	 * @memberOf window
	 * @name al
	 */
	al = {

		version : '0.0.1',
		debugging : false,

		classes : {

		},

		log : function() {
			this.consolefn('log', arguments);
		},

		warn : function() {
			this.consolefn('warn', arguments);
		},

		error : function() {
			this.consolefn('error', arguments);
			//if (window.jAlert) {
				//window.jAlert.apply(arguments);
			//}
		},

		debug : function() {
			if (this.debugging) {
				this.consolefn('log', arguments);
			}
		},

		consolefn : function(fn, args) {
			try {
				window.console[fn].apply(window.console, args);
			} catch (err) { 
				try {
					// IE
					window.console[fn]((args[0] || ''), (args[1] || ''), (args[2] || ''), (args[3] || ''));
				} catch (err) { /* empty */
				}
			}
		},

		/**
		 * Shortcut function for stopping events. 
		 * @example:
		 * <code>
		 * $('a').click(function(e) {
		 *	// do something
		 *	return al.prevent(e);
		 * });
		 * </code>
		 */
		prevent: function(e) {
			if (e && e.stopPropagation) {
				e.stopPropagation();
				e.preventDefault();
			}
			return false;
		},

		/**
		 * Returns the current hash value without the '#'.
		 * @return the address hash value
		 */
		gethash: function() {
			var hash = window.location.hash;
			if (hash) {
				if (hash.match(/\/\//)) {
					this.sethash(hash.replace('#/','').replace(/\/\//g,'/'));
				}
				return hash.replace('/','').replace('#','');
			}
		},
		
		/**
		 * sets the address hash value
		 * @param value the new hash
		 */
		sethash: function(/**String*/ value) {
			if (value && value.charAt(0) === '/') {
				value = value.substr(1, value.length);
			}
			value = value.replace(/\/\//g, '/');
			window.location.hash = value;
		},
		
		
		/**
		 * Defines a new class. The class is returned but it can also be later
		 * invoked using the provided namespace and classname. If the namespace
		 * is defined as a parameter passed to defineClass(), it must end with
		 * the name of the class; That classname can be prefixed by a
		 * dot-notation path that will represent the namespace or package of the
		 * class. The resulting class object will automatically receive
		 * 'classname' and 'namespace' properties and it will inherit from
		 * <code>al.Class</code>. If the objects specified in the namespace
		 * string (dot-notation) do not exist, they will be automatically
		 * created and a warning will be sent to the browser console. Event if
		 * you can define classes anonymously by passing a single object to th
		 * efunction, it is best to first define the class as a simple object
		 * and then pass it to the function separately. This way most IDEs will
		 * show the outline of the object as it will not be anonymous.
		 * 
		 * @example var obj;
		 *  // example A: namespace is defined as defineClass() param:
		 * var a = { init: function() { // ... } };
		 * al.defineClass('my.own.CustomClass', a);
		 * 
		 * obj = new my.own.CustomClass(); al.log(obj.namespace); // my.own
		 * al.log(obj.classname); // CustomClass
		 *  // example B: namespace is defined inside the class object var b = {
		 * namespace: 'my.own', init: function() { // ... } };
		 * al.defineClass('CustomClassB', b); obj = new my.own.CustomClassB();
		 * al.log(obj.namespace); // my.own al.log(obj.classname); //
		 * CustomClassB
		 *  // example C: namespace and classname defined inside the class
		 * object, only one param on defineClass() al.defineClass({ namespace:
		 * 'my.own', classname: 'CustomClassC', init: function() { // ... } });
		 * obj = new my.own.CustomClassC(); al.log(obj.namespace); // my.own
		 * al.log(obj.classname); // CustomClassC
		 * 
		 * @ns {string} The namespace literal for the class object. Must include
		 *     the name of the class, can be prefixed by a path in dot-notation.
		 * @c {object} Plain object that will be wrapped by
		 *    <code>al.Class</code>.
		 * @return {al.Class} The class
		 * @memberOf al
		 */
		defineClass : function(ns, c) {

			var ParentClass = this.Class, 
				result = null,
				tmp = {};

			if (arguments.length === 1) {
				tmp.c = ns;
				tmp.ns = tmp.c.namespace;
				c = tmp.c;
				ns = tmp.ns;
			}

			if (ns.match(/\./)) {
				// ---------------------------------
				// dot found, DOT-NOTATION ASSUMED
				// --------------------------------

				// define 'namespace' property on the class object (value:
				// everything before last dot).
				c.namespace = arguments.length === 1 ? ns : al.path.getPath(ns);

				// if no 'classname' property was defined on the class object,
				// we define it now (value: everything after last dot).
				c.classname = c.classname || al.path.getLast(ns);
			} else {
				c.classname = ns;
			}
			// if the namespace did not contain dots, the 'classname' and
			// 'namespace' properties are assumed to be already defined on the
			// class object.
			// however we will now test for their existance

			if (c.namespace && !al.isset(window, c.namespace)) {
				// if a namespace was defined on the class object, but the
				// namespace object itself does not exist yet,
				// we can output a warning in the browser console(may help
				// debugging typos in namespaces)
				//this.log('namespace does not exist:', c.namespace);
			}

			if (!c.namespace) {
				// 'namespace' property of class-object is empty or not defined
				this.error('Missing "namespace" property in class-object:', c);
				return;
			}

			if (!c.classname) {
				this.error('Missing classname in class-object:', c);
				return;
			}

			if (!al.isset(c.namespace)) {
				al.resolve(c.namespace);
				//this.log('namespace resolved: ', c.namespace);
			}

			// at this point the 'namespace' and 'classname' properties should
			// be reliable for the resolve() function.

			if (c['extends']) {
				ParentClass = al.path.getResolved(c['extends']);
				if (!ParentClass) {
					al.path.getResolved(c.namespace + '.' + c['extends']);
				}
			}

			try {
				result = this.resolve(c.namespace + '.' + c.classname,
						ParentClass.extend(c));
				// this.warn('->', c.namespace + '.' + c.classname )
				return result;
			} catch (err) {
				this.error('defineClass()', 'Error defining class:',
						c.namespace + '.' + c.classname, c);
			}
		},

		
		/**
		 * Resolves a string path to an object, if a match is found. If no second argument is passed, the function returns a reference to the specified object or property. 
		 * If there is a second argument, and the path can be resolved, the value will be assigned to the object or property.
		 * @example al.resolve('window.myobj.test', 'new value');
		 * @todo: missing documentation!
		 * @param path
		 * @param value
		 * @returns
		 */
		resolve : function(path, value) {
			var context=null, 
				curObjName=null, 
				recompose, 
				newObj = null, 
				newString = null;
			recompose = $.proxy(function(obj, string, val) {
				var parts = string.split('.');
				if (!obj && value) {
					// @todo: is 'value'correct here? should it be 'val'?
					obj = {};
					context[curObjName] = obj;
					context = obj;
				}
				curObjName = string.substr(0, string.indexOf('.'));

				if (obj) {
					newObj = obj[parts[0]];
					if (newObj) {
						context = newObj;
					} else if (!string.match(/\./) && val) {
						context[parts[0]] = val;
					} else {
						// create nonexisting object
						// @example al.resolve('my.custom.path')
						newObj = obj[parts[0]] = {};
					}
				}
				if (parts[1]) {
					parts.splice(0, 1);
					newString = parts.join('.');
					return recompose(newObj, newString, val);
				}
				return newObj;
			}, this);

			return recompose(window, path, value);
		},

		/**
		 * Safely retrieve a property deep in an object of objects/arrays such
		 * as userObj.contact.email
		 * 
		 * @usage var email=getprop(userObj, 'contact.email') This would
		 *        retrieve userObj.contact.email, or return FALSE without
		 *        throwing an error, if userObj or contact obj did not exist
		 * @param obj
		 *            OBJECT - the base object from which to retrieve the
		 *            property out of
		 * @param path_string
		 *            STRING - a string of dot notation of the property relative
		 *            to
		 * @return MIXED - value of obj.eval(path_string), OR FALSE
		 * @see http://stackoverflow.com/questions/5053572/how-to-check-if-a-variable-inside-an-object-thats-inside-another-object-is-set
		 * @todo merge common functionality with resolve()
		 */
		getprop : function(obj, path_string) {
			if (!path_string) {
				return obj;
			}
			var i, arr = path_string.split('.'), val = obj || window;

			for (i = 0; i < arr.length; i+=1) {
				val = val[arr[i]];
				if (val === undefined) {
					return false;
				}
				if (i === arr.length - 1) {
					if (val === "") {
						return false;
					}
					return val;
				}
			}
			return false;
		},

		/**
		 * Check if a proprety on an object exists
		 * 
		 * @return BOOL
		 * @see #getprop()
		 * @see http://stackoverflow.com/questions/5053572/how-to-check-if-a-variable-inside-an-object-thats-inside-another-object-is-set
		 */
		isset : function(obj, path_string) {
			if (arguments.length === 1 && typeof obj === 'string') {
				path_string = obj;
				obj = window;
			}
			return ((this.getprop(obj, path_string) === false) ? false : true);
		},
		
		isLocalhost: function() {
			var href = window.location.href;
			return href.match(/localhost/) || href.match(/http:\/\/192\.0\./);
		}
	};
	
	/* Simple JavaScript Inheritance
	 * By John Resig http://ejohn.org/
	 * MIT Licensed.
	 */
	(function(){var i=false,fnTest=/xyz/.test(function(){xyz;})?/\b_super\b/:/.*/;this.Class=function(){};Class.extend=function(e){var f=this.prototype;i=true;var g=new this;i=false;var h=null;for(h in e){g[h]=typeof e[h]=="function"&&typeof f[h]=="function"&&fnTest.test(e[h])?function(c,d){return function(){var a=this._super;this._super=f[c];var b=d.apply(this,arguments);this._super=a;return b;};}(h,e[h]):e[h];}function Class(){if(!i&&this.construct){this.construct.apply(this,arguments);}}Class.prototype=g;Class.prototype.constructor=Class;Class.extend=arguments.callee;return Class;};}());

	/** 
	 * Base class
	 * @todo missing documentation! 
	 * @memberOf al
	 * @name Class
	 */
	al.Class = window.Class.extend({

		classname : null,
		namespace : null,

		defaults : function() {
			return {

			};
		},

		options : null,

		construct : function(options) {
			this.options = this.extend(this.defaults(), options);
			this.uid = new Date().getTime() +  Math.round(Math.random()*10000);
		},

		log : function() {
			al.log.apply(al, this.clsprefix(arguments));
		},
		warn : function() {
			al.warn.apply(al, this.clsprefix(arguments));
		},
		error : function() {
			al.error.apply(al, this.clsprefix(arguments));
		},
		debug : function() {
			al.debug.apply(al, this.clsprefix(arguments));
		},
		clsprefix : function(args) {
			args = Array.prototype.slice.call(args);
			args.unshift(this.classname ? '[' + this.classname + ']' : this
					.toString());
			return args;
		},

		$ : function(selector) {
			return this.element ? this.element.find(selector) : $();
		},
		
		/**
		 * Namespaces a jquery event name.
		 * 
		 * Per default, the <code>classname</code> will be appended after a dot-separator.
		 * If a <code>namespace</code> property exists, it will be used like this:
		 * Any dots in the <code>namespace</code> string will be replaced by undescores, and it will be inserted in the after the dot and before the <code>classname</code>.
		 * 
		 * If no value is passed for the <code>eventName</code> param, only the event namespace is returned (The part after the dot-separator). 
		 * 
		 * @param {string} eventName The name of the event
		 * @return {string} The namespaced version of the <code>eventName</code> 
		 * @example
		 * this.bind(this.ns('click'), fn); 
		 * // 'click' will become 'click.{classname}' or 'click.{my_namespace_string}{classname}
		 * 
		 * $(window).bind(this.ns('click'), fn);
		 * $(window).bind(this.ns('resize'), fn);
		 * $(window).bind(this.ns('beforeunload'), fn);
		 * $(window).unbind(this.ns()); // all namespaced events are unbound for this object 
		 */
		ns : function(eventName) {
			if (!this.classname) {
				this
						.error('ns(' + eventName + ')',
								'classname is not defined!');
				return eventName;
			}
			var ns = this.namespace ? this.namespace.replace(/\./g, '_') + '_'
					: '';
			if (ns.substr(0, 2) === '$_') {
				ns = ns.substr(2, ns.length);
			}
			return (eventName || '') + '.' + ns + this.classname + '_' + this.uid;
		},
		extend : function(a, b) {
			return $.extend(true, {}, a, b);
		}
	});

	/**
	 * String-based functions related to paths. Supports dot-notation (object paths) and slash-notation (urls).
	 * Contains functions to access parts of a path and to resolve objects from paths.
	 * @author Jovica Aleksic
	 */

	al.path = {
		/**
		 * Returns part of a dot-path before the last dot.
		 * @param {string} value A dot-path
		 * @return {string} The path of the object specified in the dot-path
		 */
		getPath : function(value) {
			if (value && typeof value === 'string') {
				if (value.match(/\//)) {
					return value.substr(0, value.lastIndexOf('/'));
				}
				else {
					return value.substr(0, value.lastIndexOf('.'));
				}
			}
		},

		/**
		 * Returns the last part of a dot-path string
		 * @param {string} value A dot-path
		 * @return {string} The name of the last object specified in the dot-path
		 */
		getLast : function(value) {
			if (value && typeof value === 'string') {
				if (value.match(/\//)) {
					if (value.match(/#/)) {
						value = value.split('#')[0];
					}
					if(value.charAt( value.length-1 ) == "/") {
						value = value.slice(0, -1);
					}
					return value.substr(value.lastIndexOf('/') + 1, value.length);
				}
				else {
					if(value.charAt( value.length-1 ) == ".") {
						value = value.slice(0, -1);
					}
					return value.substr(value.lastIndexOf('.') + 1, value.length);
				}
			}
			return undefined;
		},

		/**
		 * Returns the first part of a dot-path string
		 * @param {string} value A dot-path
		 * @return {string} The name of the first object specified in the dot-path
		 */
		getFirst : function(value) {
			if (value && typeof value === 'string') {
				if (value.match(/\//)) {
					return value.substr(0, value.indexOf('/'));
				}
				else {
					return value.substr(0, value.indexOf('.'));
				}
			}
			return undefined;
		},

		/**
		 * Returns the part after the first dot.
		 * @param {string} value A dot-path
		 * @return {string} The part of the string after the first occurance of a dot
		 */
		getBehindFirst : function(value) {
			if (value && typeof value === 'string') {
				if (value.match(/\//)) {
					return value.substr(value.indexOf('/') + 1, value.length);
				}
				else {
					return value.substr(value.indexOf('.') + 1, value.length);
				}
			}
			return value;
		},

		/**
		 * Returns the resolved parent object of a dot-path.
		 * @example
		 *	window.test = {
		 *		inner: {
		 *			obj: {
		 *				fn:function() {}
		 *			}
		 *		}
		 *	};
		 *	al.path.getResolvedFirst('test.inner.obj.fn'); // returns the 'test' object
		 * @param {string} value A dot path
		 * @return The resolved object for the first part of the dot-path.
		 */
		getResolvedFirst : function(value) {
			var first = this.getFirst(value);
			if (first === 'window') {
				return window;
			} 
			return window[first];
		},

		/**
		 * @copy #getResolved()
		 */
		getResolvedLast : function(value) {
			return this.getResolved(value);
		},

		/**
		 * Returns the resolved object from a dot-path string.
		 * @param {string} value The dot path of an object
		 * @return The resolved object or undefined.
		 */
		getResolved : function(value) {
			value = this.clearPrefix('window.', value);
			if (al.isset(window, value)) {
				return al.resolve(value);
			} else {
				return undefined;
			}
		},

		/**
		 * Ensures that a string value does not begin with a given prefix.
		 * If the value does begin with the prefix, latter will be deleted from it.
		 * If the value does not begin with the prefix , it is returned unchanged.
		 * @example
		 *		var a = al.path.clearPrefix('window.', 'window.my.package'); // returns 'my.package'
		 *		var b = al.path.clearPrefix('window.', 'my.package'); // returns 'my.package' unchanged
		 * @param {string} prefix The prefix to be removed
		 * @param {string} value The string that should be cleaned from the prefix
		 * @return {string} The string without the prefix
		 */
		clearPrefix : function(prefix, value) {
			if (value.substr(0, prefix.length) === prefix) {
				value = value.substr(prefix.length, value.length);
			}
			return value;
		},

		/**
		 * Ensures that a string value begins with a given prefix.
		 * @example
		 * var a = al.path.enforceFirst('window.', 'window.my.package'); // returns 'window.my.package' unchanged
		 * var b = al.path.enforceFirst('window.', 'my.package'); // returns 'window.my.package'
		 * @param {string} prefix The prefix that is required in the string
		 * @param {string} value The string that should be prefixed
		 * @return {string} The prefixed string
		 */
		ensurePrefix : function(prefix, value) {
			if (value.substr(0, prefix.length) !== prefix) {
				value = prefix + value;
			}
			return value;
		}

	};
}(window.jQuery));
