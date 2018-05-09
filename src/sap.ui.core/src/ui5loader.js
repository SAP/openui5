/*!
 * ${copyright}
 */

/*
 * IMPORTANT NOTICE
 * With 1.54, ui5loader.js and its new features are not yet a public API.
 * The loader must only be used via the well-known and documented UI5 APIs
 * such as sap.ui.define, sap.ui.require, etc.
 * Any direct usage of ui5loader.js or its features is not supported and
 * might break in future releases.
 */

/*global sap:true, console, document, ES6Promise, Promise, XMLHttpRequest */

(function(__global) {
	"use strict";

	// ---- polyfills -----------------------------------------------------------------------------

	// The native Promise in MS Edge and Apple Safari is not fully compliant with the ES6 spec for promises.
	// MS Edge executes callbacks as tasks, not as micro tasks (see https://connect.microsoft.com/IE/feedback/details/1658365).
	// We therefore enforce the use of the es6-promise polyfill also in MS Edge and Safari, which works properly.
	(function(ua) {
		// @evo-todo this is only a rough copy of the sap/ui/Device browser recognition code
		var match = /(edge)[ \/]([\w.]+)/.exec( ua ) || /(webkit)[ \/]([\w.]+)/ || [];
		if ( match[1] === 'edge' ||
			 match[1] === 'webkit' && ( /(Version|PhantomJS)\/(\d+\.\d+).*Safari/.test(ua) || /iPhone|iPad|iPod/.test(ua) ) ) {
			__global.Promise = undefined; // if not unset, the polyfill assumes that the native Promise is fine
		}
		// Enable promise polyfill if native promise is not available
		if (!__global.Promise) {
			ES6Promise.polyfill();
		}
	}(navigator.userAgent.toLowerCase()));

	/*
	 * Helper function that returns the document base URL without search parameters and hash.
	 */
	function docBase() {
		var href = document.baseURI,
			p = href.search(/[?#]/);
		return p < 0 ? href : href.slice(0, p);
	}

	/**
	 * Resolve a given URL, either against the base URL of the current document or against a given base URL.
	 *
	 * If no base URL is given, the URL will be resolved relative to the baseURI of the current document.
	 * If a base URL is given, that base will first be resolved relative to the document's baseURI,
	 * then the URL will be resolved relative to the resolved base.
	 *
	 * @param {string} sURI Relative or absolute URL that should be resolved
	 * @param {string} [sBase=document.baseURI] Base URL relative to which the URL should be resolved
	 * @returns {string} Resolved URL
	 */
	var resolveURL = (function(_URL) {

		// feature check: URI support
		// - can URL be used as a constructor (fails in IE 11)?
		// - does toString() return the expected URL string (fails in PhantomJS 2.1)?
		try {
			if ( !/localhost/.test(new _URL('index.html', 'http://localhost:8080/')) ) {
				_URL = null;
			}
		} catch (e) {
			_URL = null;
		}

		if ( _URL ) {
			return function(sURI, sBase) {
				// For a spec see https://url.spec.whatwg.org/
				// For browser support see https://developer.mozilla.org/en/docs/Web/API/URL
				return new _URL(sURI, sBase ? new _URL(sBase, docBase()) : docBase()).toString();
			};
		}

		// fallback for IE11 and PhantomJS: use a shadow document with <base> and <a>nchor tag
		var doc = document.implementation.createHTMLDocument("Dummy doc for resolveURI");
		var base = doc.createElement('base');
		base.href = docBase();
		doc.head.appendChild(base);
		var anchor = doc.createElement("A");
		doc.body.appendChild(anchor);

		return function (sURI, sBase) {
			base.href = docBase();
			if ( sBase != null ) {
				// first resolve sBase relative to location
				anchor.href = sBase;
				// then use it as base
				base.href = anchor.href;
			}
			anchor.href = sURI;
			// console.log("(" + sURI + "," + sBase + ") => (" + base.href + "," + anchor.href + ")");
			return anchor.href;
		};

	}(__global.URL || __global.webkitURL));

	// ---- helpers -------------------------------------------------------------------------------

	function noop() {}

	function forEach(obj, callback) {
		Object.keys(obj).forEach(function(key) {
			callback(key, obj[key]);
		});
	}

	// ---- hooks & configuration -----------------------------------------------------------------

	/**
	 * Log functionality.
	 *
	 * Can be set to an object with the methods shown below (subset of sap/base/Log).
	 * Logging methods never must fail. Should they ever throw errors, then the internal state
	 * of the loader will be broken.
	 *
	 * By default, all methods are implemented as NOOPs.
	 *
	 * @type {{debug:function(),info:function(),warning:function(),error:function(),isLoggable:function():boolean}}
	 * @private
	 */
	var log = {
		debug: noop,
		info: noop,
		warning: noop,
		error: noop,
		isLoggable: noop
	}; // Null Object pattern: dummy logger which is used as long as no logger is injected

	/**
	 * Basic assert functionality.
	 *
	 * Can be set to a function that gets a value (the expression t be asserted) as first
	 * parameter and a message as second parameter. When the expression coerces to false,
	 * the assertion is violated and the message should be emitted (logged, thrown, whatever).
	 *
	 * By default, this is implemented as a NOOP.
	 * @type {function(any,string)}
	 * @private
	 */
	var assert = noop; // Null Object pattern: dummy assert which is used as long as no assert is injected

	/**
	 * Callback for performance measurement.
	 *
	 * When set, it must be an object with methods <code>start</code> and <code>end</code>.
	 * @type {{start:function(string,any),end:function(string)}}
	 * @private
	 */
	var measure;

	/**
	 * Source code transformation hook.
	 *
	 * To be used by code coverage, only supported in sync mode.
	 * @private
	 */
	var translate;

	/**
	 * Whether asynchronous loading can be used at all.
	 * When activated, require will load asynchronously, else synchronously.
	 * @type {boolean}
	 * @private
	 */
	var bGlobalAsyncMode = false;

	/**
	 * How the loader should react to calls of sync APIs or when global names are accessed:
	 * 0: tolerate
	 * 1: warn
	 * 2: reject
	 * @type {int}
	 * @private
	 */
	var syncCallBehavior = 0;

	/**
	 * Default base URL for modules, used when no other configuration is provided.
	 * @const
	 * @type {string}
	 * @private
	 */
	var DEFAULT_BASE_URL = 'resources/';

	/**
	 * Temporarily saved reference to the original value of the global define variable.
	 *
	 * @type {any}
	 * @private
	 */
	var vOriginalDefine;

	/**
	 * Temporarily saved reference to the original value of the global require variable.
	 *
	 * @type {any}
	 * @private
	 */
	var vOriginalRequire;


	/**
	 * A map of URL prefixes keyed by the corresponding module name prefix.
	 * URL prefix can either be given as string or as object with properties url and final.
	 * When final is set to true, module name prefix cannot be overwritten.
	 *
	 * Note that the empty prefix ('') will always match and thus serves as a fallback.
	 * @type {Object.<string,{url:string,absoluteUrl:string}>}
	 * @see jQuery.sap.registerModulePath
	 * @private
	 */
	var mUrlPrefixes = Object.create(null);
	mUrlPrefixes[''] = {
		url: DEFAULT_BASE_URL,
		absoluteUrl: resolveURL(DEFAULT_BASE_URL)
	};

	/**
	 * Mapping of module IDs.
	 *
	 * Each entry is a map of its own, keyed by the module ID prefix for which it should be
	 * applied. Each contained map maps module ID prefixes to module ID prefixes.
	 *
	 * All module ID prefixes must not have extensions.
	 * @type {Object.<string,Object.<string,string>>}
	 * @private
	 */
	var mMaps = Object.create(null),

	/**
	 * Information about third party modules, keyed by the module's resource name (including extension '.js').
	 *
	 * Each module shim object can have the following properties:
	 * <ul>
	 * <li><i>boolean</i>: [amd=false] Whether the module uses an AMD loader if present. If set to <code>true</code>,
	 *     UI5 will disable an AMD loader while loading such a module to force the module to expose its content
	 *     via global names.</li>
	 * <li><i>string[]|string</i>: [exports=undefined] Global name (or names) that are exported by the module.
	 *     If one ore multiple names are defined, the first one will be read from the global object and will be
	 *     used as value of the module. Each name can be a dot separated hierarchical name (will be resolved with
	 *     <code>getGlobalProperty</code>)</li>
	 * <li><i>string[]</i>: [deps=undefined] List of modules that the module depends on. The modules will be loaded
	 *     first before loading the module itself. Note that the stored dependencies also include the extension '.js'
	 *     for easier evaluation, but <code>config({shim:...})</code> expects them without the extension for
	 *     compatibility with the AMD-JS specification.</li>
	 * </ul>
	 *
	 * @see config method
	 * @type {Object.<string,{amd:boolean,exports:(string|string[]),deps:string[]}>}
	 * @private
	 */
		mShims = Object.create(null),

	/**
	 * Dependency Cache information.
	 * Maps the name of a module to a list of its known dependencies.
	 * @type {Object.<string,string[]>}
	 * @private
	 */
		mDepCache = Object.create(null),

	/**
	 * Whether the loader should try to load debug sources.
	 * @type {boolean}
	 * @private
	 */
		bDebugSources = false,

	/**
	 * Indicates partial or total debug mode.
	 *
	 * Can be set to a function which checks whether preloads should be ignored for the given module.
	 * If undefined, all preloads will be used.
	 * @type {function(string):boolean|undefined}
	 * @private
	 */
		fnIgnorePreload;


	// ---- internal state ------------------------------------------------------------------------

	/**
	 * Map of modules that have been loaded or required so far, keyed by their name.
	 *
	 * @type {Object<string,Module>}
	 * @private
	 */
	var mModules = Object.create(null),

	/**
	 * Whether (sap.ui.)define calls must be executed synchronously in the current context.
	 *
	 * The initial value is <code>null</code>. During the execution of a module loading operation
	 * ((sap.ui.)require or (sap.ui.)define etc.), it is set to true or false depending on the
	 * legacy synchronicity behavior of the operation.
	 *
	 * Problem: when AMD modules are loaded with hard coded script tags and when some later inline
	 * script expects the module export synchronously, then the (sap.ui.)define must be executed
	 * synchronously.
	 * Most prominent example: unit tests that include QUnitUtils as a script tag and use qutils
	 * in one of their inline scripts.
	 * @type {boolean}
	 * @private
	 */
		bForceSyncDefines = null,

	/**
	 * Stack of modules that are currently being executed in case of synchronous processing.
	 *
	 * Allows to identify the executing module (e.g. when resolving dependencies or in case of
	 * in case of bundles like sap-ui-core).
	 *
	 * @type {Array.<{name:string,used:boolean}>}
	 * @private
	 */
		_execStack = [ ],

	/**
	 * A prefix that will be added to module loading log statements and which reflects the nesting of module executions.
	 * @type {string}
	 * @private
	 */
		sLogPrefix = "",

	/**
	 * Counter used to give anonymous modules a unique module ID.
	 * @type {int}
	 * @private
	 */
		iAnonymousModuleCount = 0,

	/**
	 * IE only: max size a script should have when executing it with execScript, otherwise fallback to eval.
	 * @type {int}
	 * @const
	 * @private
	 */
		MAX_EXEC_SCRIPT_LENGTH = 512 * 1024;


	// ---- Names and Paths -----------------------------------------------------------------------

	/**
	 * Name conversion function that converts a name in unified resource name syntax to a name in UI5 module name syntax.
	 * If the name cannot be converted (e.g. doesn't end with '.js'), then <code>undefined</code> is returned.
	 *
	 * @param {string} sName Name in unified resource name syntax
	 * @returns {string|undefined} Name in UI5 (legacy) module name syntax (dot separated)
	 *   or <code>undefined</code> when the name can't be converted
	 * @private
	 */
	function urnToUI5(sName) {
		// UI5 module name syntax is only defined for JS resources
		if ( !/\.js$/.test(sName) ) {
			return undefined;
		}

		sName = sName.slice(0, -3);
		if ( /^jquery\.sap\./.test(sName) ) {
			return sName; // do nothing
		}
		return sName.replace(/\//g, ".");
	}

	function urnToIDAndType(sResourceName) {
		var basenamePos = sResourceName.lastIndexOf('/'),
			dotPos = sResourceName.lastIndexOf('.');
		if ( dotPos > basenamePos ) {
			return {
				id: sResourceName.slice(0, dotPos),
				type: sResourceName.slice(dotPos)
			};
		}
		return {
			id: sResourceName,
			type: ''
		};
	}

	var rJSSubTypes = /(\.controller|\.fragment|\.view|\.designtime|\.support)?.js$/;

	function urnToBaseIDAndSubType(sResourceName) {
		var m = rJSSubTypes.exec(sResourceName);
		if ( m ) {
			return {
				baseID: sResourceName.slice(0, m.index),
				subType: m[0]
			};
		}
	}

	var rDotSegmentAnywhere = /(?:^|\/)\.+(?=\/|$)/;
	var rDotSegment = /^\.*$/;

	/**
	 * Normalizes a resource name by resolving any relative name segments.
	 *
	 * A segment consisting of a single dot <code>./</code>, when used at the beginning of a name refers
	 * to the containing package of the <code>sBaseName</code>. When used inside a name, it is ignored.
	 *
	 * A segment consisting of two dots <code>../</code> refers to the parent package. It can be used
	 * anywhere in a name, but the resolved name prefix up to that point must not be empty.
	 *
	 * Example: A name <code>../common/validation.js</code> defined in <code>sap/myapp/controller/mycontroller.controller.js</code>
	 * will resolve to <code>sap/myapp/common/validation.js</code>.
	 *
	 * When <code>sBaseName</code> is <code>null</code> (e.g. for a <code>sap.ui.require</code> call),
	 * the resource name must not start with a relative name segment or an error will be thrown.
	 *
	 * @param {string} sResourceName Name to resolve
	 * @param {string|null} sBaseName Name of a reference module relative to which the name will be resolved
	 * @returns {string} Resolved name
	 * @throws {Error} When a relative name should be resolved but not basename is given;
	 *   or when upward navigation (../) is requested on the root level
	 *   or when a name segment consists of 3 or more dots only
	 * @private
	 */
	function normalize(sResourceName, sBaseName) {

		var p = sResourceName.search(rDotSegmentAnywhere),
			aSegments,
			sSegment,
			i,j,l;

		// check whether the name needs to be resolved at all - if not, just return the sModuleName as it is.
		if ( p < 0 ) {
			return sResourceName;
		}

		// if the name starts with a relative segment then there must be a base name (a global sap.ui.require doesn't support relative names)
		if ( p === 0 ) {
			if ( sBaseName == null ) {
				throw new Error("relative name not supported ('" + sResourceName + "'");
			}
			// prefix module name with the parent package
			sResourceName = sBaseName.slice(0, sBaseName.lastIndexOf('/') + 1) + sResourceName;
		}

		aSegments = sResourceName.split('/');

		// process path segments
		for (i = 0, j = 0, l = aSegments.length; i < l; i++) {

			sSegment = aSegments[i];

			if ( rDotSegment.test(sSegment) ) {
				if (sSegment === '.' || sSegment === '') {
					// ignore '.' as it's just a pointer to current package. ignore '' as it results from double slashes (ignored by browsers as well)
					continue;
				} else if (sSegment === '..') {
					// move to parent directory
					if ( j === 0 ) {
						throw new Error("Can't navigate to parent of root ('" + sResourceName + "')");
					}
					j--;
				} else {
					throw new Error("Illegal path segment '" + sSegment + "' ('" + sResourceName + "')");
				}
			} else {
				aSegments[j++] = sSegment;
			}

		}

		aSegments.length = j;

		return aSegments.join('/');
	}

	function registerResourcePath(sResourceNamePrefix, sUrlPrefix) {
		sResourceNamePrefix = String(sResourceNamePrefix || "");

		if ( sUrlPrefix == null ) {

			// remove a registered URL prefix, if it wasn't for the empty resource name prefix
			if ( sResourceNamePrefix ) {
				if ( mUrlPrefixes[sResourceNamePrefix] ) {
					delete mUrlPrefixes[sResourceNamePrefix];
					log.info("registerResourcePath ('" + sResourceNamePrefix + "') (registration removed)");
				}
				return;
			}

			// otherwise restore the default
			sUrlPrefix = DEFAULT_BASE_URL;
			log.info("registerResourcePath ('" + sResourceNamePrefix + "') (default registration restored)");

		}

		sUrlPrefix = String(sUrlPrefix);

		// remove query parameters and/or hash
		var iQueryOrHashIndex = sUrlPrefix.search(/[?#]/);
		if (iQueryOrHashIndex !== -1) {
			sUrlPrefix = sUrlPrefix.slice(0, iQueryOrHashIndex);
		}

		// ensure that the prefix ends with a '/'
		if ( sUrlPrefix.slice(-1) !== '/' ) {
			sUrlPrefix += '/';
		}

		mUrlPrefixes[sResourceNamePrefix] = {
			url: sUrlPrefix,
			// calculate absolute URL, only to be used by 'guessResourceName'
			absoluteUrl: resolveURL(sUrlPrefix)
		};
	}

	// find longest matching prefix for resource name
	function getResourcePath(sResourceName, sSuffix) {

		var sNamePrefix = sResourceName,
			p = sResourceName.length,
			sPath;

		// search for a registered name prefix, starting with the full name and successively removing one segment
		while ( p > 0 && !mUrlPrefixes[sNamePrefix] ) {
			p = sNamePrefix.lastIndexOf('/');
			// Note: an empty segment at p = 0 (leading slash) will be ignored
			sNamePrefix = p > 0 ? sNamePrefix.slice(0, p) : '';
		}

		assert((p > 0 || sNamePrefix === '') && mUrlPrefixes[sNamePrefix], "there always must be a mapping");

		sPath = mUrlPrefixes[sNamePrefix].url + sResourceName.slice(p + 1); // also skips a leading slash!
		if ( sPath.slice(-1) === '/' ) {
			sPath = sPath.slice(0, -1);
		}
		return sPath + (sSuffix || '');

	}

	function guessResourceName(sURL) {
		var sNamePrefix,
			sUrlPrefix,
			sResourceName;

		// Make sure to have an absolute URL to check against absolute prefix URLs
		sURL = resolveURL(sURL);

		for (sNamePrefix in mUrlPrefixes) {

			// Note: configured URL prefixes are guaranteed to end with a '/'
			// But to support the legacy scenario promoted by the application tools ( "registerModulePath('Application','Application')" )
			// the prefix check here has to be done without the slash
			sUrlPrefix = mUrlPrefixes[sNamePrefix].absoluteUrl.slice(0, -1);

			if ( sURL.indexOf(sUrlPrefix) === 0 ) {

				// calc resource name
				sResourceName = sNamePrefix + sURL.slice(sUrlPrefix.length);
				// remove a leading '/' (occurs if name prefix is empty and if match was a full segment match
				if ( sResourceName.charAt(0) === '/' ) {
					sResourceName = sResourceName.slice(1);
				}

				if ( mModules[sResourceName] && mModules[sResourceName].data ) {
					return sResourceName;
				}
			}
		}
	}

	/**
	 * Find the most specific map config that matches the given context resource
	 * @param {string} sContext Resource name to be used as context
	 * @returns {Object<string,string>|undefined} Most specific map or <code>undefined</code>
	 */
	function findMapForContext(sContext) {
		var p, mMap;
		if ( sContext != null ) {
			// maps are defined on module IDs, reduce URN to module ID
			sContext = urnToIDAndType(sContext).id;
			p = sContext.length;
			mMap = mMaps[sContext];
			while ( p > 0 && mMap == null ) {
				p = sContext.lastIndexOf('/');
				if ( p > 0 ) { // Note: an empty segment at p = 0 (leading slash) will be ignored
					sContext = sContext.slice(0, p);
					mMap = mMaps[sContext];
				}
			}
		}
		// if none is found, fallback to '*' map
		return mMap || mMaps['*'];
	}

	function getMappedName(sResourceName, sRequestingResourceName) {

		var mMap = findMapForContext(sRequestingResourceName),
			sPrefix, p;

		// resolve relative names
		sResourceName = normalize(sResourceName, sRequestingResourceName);

		// if there's a map, search for the most specific matching entry
		if ( mMap != null ) {
			// start with the full ID and successively remove one segment
			sPrefix = urnToIDAndType(sResourceName).id;
			p = sPrefix.length;
			while ( p > 0 && mMap[sPrefix] == null ) {
				p = sPrefix.lastIndexOf('/');
				// Note: an empty segment at p = 0 (leading slash) will be ignored
				sPrefix = p > 0 ? sPrefix.slice(0, p) : '';
			}

			if ( p > 0 ) {
				if ( log.isLoggable() ) {
					log.debug('module ID ' + sResourceName + " mapped to " + mMap[sPrefix] + sResourceName.slice(p));
				}
				return mMap[sPrefix] + sResourceName.slice(p); // also skips a leading slash!
			}
		}

		return sResourceName;
	}

	function getGlobalObject(oObject, aNames, l, bCreate) {
		for (var i = 0; oObject && i < l; i++) {
			if (!oObject[aNames[i]] && bCreate ) {
				oObject[aNames[i]] = {};
			}
			oObject = oObject[aNames[i]];
		}
		return oObject;
	}

	function getGlobalProperty(sName) {
		var aNames = sName ? sName.split(".") : [];

		if ( syncCallBehavior && aNames.length > 1 ) {
			log.error("[nosync] getGlobalProperty called to retrieve global name '" + sName + "'");
		}

		return getGlobalObject(__global, aNames, aNames.length);
	}

	function setGlobalProperty(sName, vValue) {
		var aNames = sName ? sName.split(".") : [],
			oObject;
		if ( aNames.length > 0 ) {
			oObject = getGlobalObject(__global, aNames, aNames.length - 1, true);
			oObject[aNames[aNames.length - 1]] = vValue;
		}
	}

	// ---- Modules -------------------------------------------------------------------------------

	/**
	 * Module neither has been required nor preloaded nor declared, but someone asked for it.
	 */
	var INITIAL = 0,

	/**
	 * Module has been preloaded, but not required or declared.
	 */
		PRELOADED = -1,

	/**
	 * Module has been declared.
	 */
		LOADING = 1,

	/**
	 * Module has been loaded, but not yet executed.
	 */
		LOADED = 2,

	/**
	 * Module is currently being executed
	 */
		EXECUTING = 3,

	/**
	 * Module has been loaded and executed without errors.
	 */
		READY = 4,

	/**
	 * Module either could not be loaded or execution threw an error
	 */
		FAILED = 5,

	/**
	 * Special content value used internally until the content of a module has been determined
	 */
		NOT_YET_DETERMINED = {};

	/**
	 * A module/resource as managed by the module system.
	 *
	 * Each module is an object with the following properties
	 * <ul>
	 * <li>{int} state one of the module states defined in this function</li>
	 * <li>{string} url URL where the module has been loaded from</li>
	 * <li>{any} data temp. raw content of the module (between loaded and ready or when preloaded)</li>
	 * <li>{string} group the bundle with which a resource was loaded or null</li>
	 * <li>{string} error an error description for state <code>FAILED</code></li>
	 * <li>{any} content the content of the module as exported via define()<(li>
	 * </ul>
	 *
	 * @param {string} name Name of the module, including extension
	 */
	function Module(name) {
		this.name = name;
		this.state = INITIAL;
		this.url =
		this._deferred =
		this.data =
		this.group =
		this.error =
		this.pending = null;
		this.content = NOT_YET_DETERMINED;
	}

	Module.prototype.deferred = function() {
		if ( this._deferred == null ) {
			var deferred = this._deferred = {};
			deferred.promise = new Promise(function(resolve,reject) {
				deferred.resolve = resolve;
				deferred.reject = reject;
			});
			// avoid 'Uncaught (in promise)' log entries
			deferred.promise.catch(noop);
		}
		return this._deferred;
	};

	Module.prototype.api = function() {
		if ( this._api == null ) {
			this._exports = {};
			this._api = {
				id: this.name.slice(0,-3),
				exports: this._exports,
				url: this.url,
				config: noop
			};
		}
		return this._api;
	};

	/**
	 * Sets the module state to READY and either determines the value or sets
	 * it from the given parameter.
	 * @param {any} value Module value
	 */
	Module.prototype.ready = function(value) {
		this.state = READY;
		if ( arguments.length > 0 ) {
			// check arguments.length to allow a value of undefined
			this.content = value;
		}
		this.deferred().resolve(this.value());
		if ( this.aliases ) {
			value = this.value();
			this.aliases.forEach(function(alias) {
				Module.get(alias).ready(value);
			});
		}
	};

	Module.prototype.fail = function(err) {
		if ( this.state !== FAILED ) {
			this.state = FAILED;
			this.error = err;
			this.deferred().reject(err);
			if ( this.aliases ) {
				this.aliases.forEach(function(alias) {
					Module.get(alias).fail(err);
				});
			}
		}
	};

	Module.prototype.addAlias = function(sAliasName) {
		(this.aliases || (this.aliases = [])).push(sAliasName);
	};

	Module.prototype.preload = function(url, data, bundle) {
		if ( this.state === INITIAL && !(fnIgnorePreload && fnIgnorePreload(this.name)) ) {
			this.state = PRELOADED;
			this.url = url;
			this.data = data;
			this.group = bundle;
		}
		return this;
	};

	/**
	 * Determines the value of this module.
	 *
	 * If the module hasn't been loaded or executed yet, <code>undefined</code> will be returned.
	 *
	 * @returns {any} Export of the module or <code>undefined</code>
	 * @private
	 */
	Module.prototype.value = function() {

		if ( this.state === READY ) {
			if ( this.content === NOT_YET_DETERMINED ) {
				// Determine the module value lazily.
				// For AMD modules this has already been done on execution of the factory function.
				// For other modules that are required synchronously, it has been done after execution.
				// For the few remaining scenarios (like global scripts), it is done here
				var oShim = mShims[this.name],
					sExport = oShim && (Array.isArray(oShim.exports) ? oShim.exports[0] : oShim.exports);
				// best guess for thirdparty modules or legacy modules that don't use sap.ui.define
				this.content = getGlobalProperty( sExport || urnToUI5(this.name) );
			}
			return this.content;
		}

		return undefined;
	};

	/**
	 * Checks whether this module depends on the given module.
	 *
	 * When a module definition (define) is executed, the requested dependencies are added
	 * as 'pending' to the Module instance. This function checks if the oDependantModule is
	 * reachable from this module when following the pending dependency information.
	 *
	 * @param {Module} oDependantModule Module which has a dependency to <code>oModule</code>
	 * @returns {boolean} Whether this module depends on the given one.
	 * @private
	 */
	Module.prototype.dependsOn = function(oDependantModule) {
		var visited = Object.create(null);
		function visit(mod) {
			if ( !visited[mod.name] ) {
				visited[mod.name] = true;
				if ( Array.isArray(mod.pending) ) {
					if ( mod.pending.indexOf(oDependantModule.name) >= 0 ) {
						return true;
					}
					for ( var i = 0; i < mod.pending.length; i++ ) {
						if ( mModules[mod.pending[i]] && visit( mModules[mod.pending[i]] ) ) {
							return true;
						}
					}
				}
			}
			return false;
		}
		return this.name === oDependantModule.name || visit(this);
	};

	/**
	 * Find or create a module by its unified resource name.
	 *
	 * If the module doesn't exist yet, a new one is created in state INITIAL.
	 *
	 * @param {string} sModuleName Name of the module in URN syntax
	 * @returns {Module} Module with that name, newly created if it didn't exist yet
	 * @static
	 */
	Module.get = function(sModuleName) {
		return mModules[sModuleName] || (mModules[sModuleName] = new Module(sModuleName));
	};

	// --------------------------------------------------------------------------------------------

	function ensureStacktrace(oError) {
		if (!oError.stack) {
			try {
				throw oError;
			} catch (ex) {
				return ex;
			}
		}
		return oError;
	}

	function makeNestedError(msg, cause) {
		var oError = new Error(msg + ": " + cause.message);
		oError.cause = cause;
		oError.loadError = cause.loadError;
		ensureStacktrace(oError);
		ensureStacktrace(cause);
		// concat the error stack for better traceability of loading issues
		// (ignore for PhantomJS since Error.stack is readonly property!)
		if ( oError.stack && cause.stack ) {
			try {
				oError.stack = oError.stack + "\nCaused by: " + cause.stack;
			} catch (err) {
				// ignore
			}
		}
		// @evo-todo
		// for non Chrome browsers we log the caused by stack manually in the console
		// if (__global.console && !Device.browser.chrome) {
		// 	/*eslint-disable no-console */
		// 	console.error(oError.message + "\nCaused by: " + oCausedByStack);
		// 	/*eslint-enable no-console */
		// }
		return oError;
	}

	function declareModule(sModuleName) {
		var oModule;

		// sModuleName must be a unified resource name of type .js
		assert(/\.js$/.test(sModuleName), "must be a Javascript module");

		oModule = Module.get(sModuleName);

		if ( oModule.state > INITIAL ) {
			return oModule;
		}

		if ( log.isLoggable() ) {
			log.debug(sLogPrefix + "declare module '" + sModuleName + "'");
		}

		// avoid cycles
		oModule.state = READY;

		return oModule;
	}

	/**
	 * Queue of modules for which sap.ui.define has been called but for which the name has not been determined yet
	 * When loading modules via script tag, only the onload handler knows the relationship between executed sap.ui.define calls and
	 * module name. It then resolves the pending modules in the queue. Only one entry can get the name of the module
	 * if there are more entries, then this is an error
	 */
	var queue = new function ModuleDefinitionQueue() {
		var aQueue = [],
			iRun = 0,
			vTimer;

		this.push = function(name, deps, factory, _export) {
			log.debug("pushing define from " + (document.currentScript && document.currentScript.src) );
			aQueue.push({
				name: name,
				deps: deps,
				factory: factory,
				_export: _export,
				guess: document.currentScript && document.currentScript.getAttribute('data-sap-ui-module')
			});
			// trigger queue processing via a timer in case the currently executing script was not created by us
			if ( !vTimer ) {
				vTimer = setTimeout(this.process.bind(this, null));
			}
		};

		this.clear = function() {
			aQueue = [];
			if ( vTimer ) {
				clearTimeout(vTimer);
				vTimer = null;
			}
		};

		/**
		 * When called via timer, <code>oModule</code> will be undefined.
		 * @param {Module} [oModule] Module for which the current script was loaded.
		 */
		this.process = function(oModule) {
			var sModuleName, oEntry;

			// if a module execution error was detected, stop processing the queue
			if ( oModule && oModule.execError ) {
				if ( log.isLoggable() ) {
					log.debug("module execution error detected, ignoring queued define calls");
				}
				oModule.fail(oModule.execError);
				this.clear();
				return;
			}

			if ( aQueue.length === 0 ) {
				log.debug("define queue empty");
				if ( oModule ) {
					// might be a module in 'global' format
					oModule.data = undefined; // allow GC
					oModule.ready();
				}
				return;
			}

			iRun++;
			log.debug("processing define queue " + iRun);
			sModuleName = oModule && oModule.name;
			while ( aQueue.length > 0 ) {
				oEntry = aQueue.shift();
				if ( oEntry.name == null ) {
					if ( sModuleName != null ) {
						oEntry.name = sModuleName;
						sModuleName = null;
					} else {
						// multiple modules have been queued, but only one module can inherit the name from the require call
						throw new Error("module id missing in define call: " + oEntry.guess);
					}
				} else if ( sModuleName && oEntry.name !== sModuleName ) {
					if ( log.isLoggable() ) {
						log.debug("module names don't match: requested: " + sModuleName + ", defined: " + oEntry.name);
					}
					Module.get(oEntry.name).addAlias(sModuleName);
				}
				// start to resolve the dependencies
				defineModule(oEntry.name, oEntry.deps, oEntry.factory, oEntry._export, /* bAsync = */ true);
				log.debug("define called for " + oEntry.name);
			}

			if ( vTimer ) {
				clearTimeout(vTimer);
				vTimer = null;
			}
			log.debug("processing define queue done " + iRun);
		};
	}();

	/**
	 * Loads the source for the given module with a sync XHR.
	 * @param {Module} oModule Module to load the source for
	 * @throws {Error} When loading failed for some reason.
	 */
	function loadSyncXHR(oModule) {
		var xhr = new XMLHttpRequest();

		function enrichXHRError(error) {
			error = error || ensureStacktrace(new Error(xhr.status + " - " + xhr.statusText));
			error.status = xhr.status;
			error.statusText = xhr.statusText;
			error.loadError = true;
			return error;
		}

		xhr.addEventListener('load', function(e) {
			// File protocol (file://) always has status code 0
			if ( xhr.status === 200 || xhr.status === 0 ) {
				oModule.state = LOADED;
				oModule.data = xhr.responseText;
			} else {
				oModule.error = enrichXHRError();
			}
		});
		// Note: according to whatwg spec, error event doesn't fire for sync send(), instead an error is thrown
		// we register a handler, in case a browser doesn't follow the spec
		xhr.addEventListener('error', function(e) {
			oModule.error = enrichXHRError();
		});
		xhr.open('GET', oModule.url, false);
		try {
			xhr.send();
		} catch (error) {
			oModule.error = enrichXHRError(error);
		}
	}

	/**
	 * Global event handler to detect script execution errors.
	 * Only works for browsers that support <code>document.currentScript</code>.
	 * @private
	 */
	if ( 'currentScript' in document ) {
		window.addEventListener('error', function onUncaughtError(errorEvent) {
			var sModuleName = document.currentScript && document.currentScript.getAttribute('data-sap-ui-module');
			var oModule = sModuleName && Module.get(sModuleName);
			if ( oModule && oModule.execError == null ) {
				// if a currently executing module can be identified, attach the error to it and suppress reporting
				if ( log.isLoggable() ) {
					log.debug("unhandled exception occurred while executing " + sModuleName + ": " + errorEvent.message);
				}
				oModule.execError = errorEvent.error || {
					name: 'Error',
					message: errorEvent.message
				};
				return false;
			}
		});
	}

	function loadScript(oModule, bRetryOnFailure) {

		var oScript;

		function onload(e) {
			if ( log.isLoggable() ) {
				log.debug("Javascript resource loaded: " + oModule.name);
			}
			oScript.removeEventListener('load', onload);
			oScript.removeEventListener('error', onerror);
			queue.process(oModule);
		}

		function onerror(e) {
			oScript.removeEventListener('load', onload);
			oScript.removeEventListener('error', onerror);
			if (bRetryOnFailure) {
				log.warning("retry loading Javascript resource: " + oModule.name);
				if (oScript && oScript.parentNode) {
					oScript.parentNode.removeChild(oScript);
				}
				loadScript(oModule, /* bRetryOnFailure= */ false);
				return;
			}

			log.error("failed to load Javascript resource: " + oModule.name);
			oModule.fail(ensureStacktrace(new Error("script load error")));
		}

		oScript = document.createElement('SCRIPT');
		oScript.src = oModule.url;
		oScript.setAttribute("data-sap-ui-module", oModule.name);
		if ( bRetryOnFailure !== undefined ) {
			oScript.addEventListener('load', onload);
			oScript.addEventListener('error', onerror);
		}
		document.head.appendChild(oScript);

	}

	function preloadDependencies(sModuleName) {
		var knownDependencies = mDepCache[sModuleName];
		if ( Array.isArray(knownDependencies) ) {
			log.debug("preload dependencies for " + sModuleName + ": " + knownDependencies);
			knownDependencies.forEach(function(dep) {
				dep = getMappedName(dep, sModuleName);
				if ( /\.js$/.test(dep) ) {
					requireModule(null, dep, /* always async */ true);
				} // else: TODO handle non-JS resources, e.g. link rel=prefetch
			});
		}
	}

	/**
	 * Loads the given module if needed and returns the module export or a promise on it.
	 *
	 * If loading is still ongoing for the requested module and if there is a cycle detected between
	 * the requesting module and the module to be loaded, then <code>undefined</code> (or a promise on
	 * <code>undefined</code>) will be returned as intermediate module export to resolve the cycle.
	 *
	 * @param {Module} oRequestingModule The module in whose context the new module has to be loaded;
	 *           this is needed to detect cycles
	 * @param {string} sModuleName Name of the module to be loaded, in URN form and with '.js' extension
	 * @param {boolean} bAsync Whether the operation can be executed asynchronously
	 * @param {boolean} bSkipShimDeps Whether shim dependencies should be ignored
	 * @returns {any|Promise} Returns the module export in sync mode or a promise on it in async mode
	 * @throws {Error} When loading failed in sync mode
	 *
	 * @private
	 */
	function requireModule(oRequestingModule, sModuleName, bAsync, bSkipShimDeps) {

		var bLoggable = log.isLoggable(),
			oSplitName = urnToBaseIDAndSubType(sModuleName),
			oShim = mShims[sModuleName],
			oModule, aExtensions, i, sMsg, bExecutedNow;

		// only for robustness, should not be possible by design (all callers append '.js')
		if ( !oSplitName ) {
			throw new Error("can only require Javascript module, not " + sModuleName);
		}

		oModule = Module.get(sModuleName);

		// when there's a shim with dependencies for the module
		// resolve them first before requiring the module again with bSkipShimDeps = true
		if ( oShim && oShim.deps && !bSkipShimDeps ) {
			if ( bLoggable ) {
				log.debug("require dependencies of raw module " + sModuleName);
			}
			return requireAll(oModule, oShim.deps, function() {
				return requireModule(oRequestingModule, sModuleName, bAsync, /* bSkipShimDeps = */ true);
			}, function(oErr) {
				oModule.fail(oErr);
				if ( bAsync ) {
					return;
				}
				throw oErr;
			}, bAsync);
		}

		if ( bLoggable ) {
			log.debug(sLogPrefix + "require '" + sModuleName + "' of type '" + oSplitName.subType + "'");
		}

		// check if module has been loaded already
		if ( oModule.state !== INITIAL ) {
			if ( oModule.state === PRELOADED ) {
				oModule.state = LOADED;
				bExecutedNow = true;
				measure && measure.start(sModuleName, "Require module " + sModuleName + " (preloaded)", ["require"]);
				execModule(sModuleName, bAsync);
				measure && measure.end(sModuleName);
			}

			if ( oModule.state === READY ) {
				if ( bLoggable ) {
					log.debug(sLogPrefix + "module '" + sModuleName + "' has already been loaded (skipped).");
				}
				// Note: this intentionally does not return oModule.promise() as the export might be temporary in case of cycles
				return bAsync ? Promise.resolve(oModule.value()) : oModule.value();
			} else if ( oModule.state === FAILED ) {
				if ( bAsync ) {
					return oModule.deferred().promise;
				} else {
					throw (bExecutedNow
						? oModule.error
						: makeNestedError("found in negative cache: '" + sModuleName + "' from " + oModule.url, oModule.error));
				}
			} else {
				// currently loading
				if ( bAsync ) {
					// break up cyclic dependencies
					if ( oRequestingModule && oModule.dependsOn(oRequestingModule) ) {
						if ( log.isLoggable() ) {
							log.debug("cycle detected between '" + oRequestingModule.name + "' and '" + sModuleName + "', returning undefined for '" + sModuleName + "'");
						}
						return Promise.resolve(undefined);
					}
					return oModule.deferred().promise;
				}
				if ( !bAsync && !oModule.async ) {
					// sync pending, return undefined
					if ( log.isLoggable() ) {
						log.debug("cycle detected, returning undefined for '" + sModuleName + "'");
					}
					return undefined;
				}
				// async pending, load sync again
			}
		}

		measure && measure.start(sModuleName, "Require module " + sModuleName, ["require"]);

		// set marker for loading modules (to break cycles)
		oModule.state = LOADING;
		oModule.async = bAsync;

		// if debug is enabled, try to load debug module first
		aExtensions = bDebugSources ? ["-dbg", ""] : [""];
		if ( !bAsync ) {

			for (i = 0; i < aExtensions.length && oModule.state !== LOADED; i++) {
				// create module URL for the current extension
				oModule.url = getResourcePath(oSplitName.baseID, aExtensions[i] + oSplitName.subType);
				if ( bLoggable ) {
					log.debug(sLogPrefix + "loading " + (aExtensions[i] ? aExtensions[i] + " version of " : "") + "'" + sModuleName + "' from '" + oModule.url + "'");
				}

				if ( syncCallBehavior ) {
					sMsg = "[nosync] loading module '" + oModule.url + "'";
					if ( syncCallBehavior === 1 ) {
						log.error(sMsg);
					} else {
						throw new Error(sMsg);
					}
				}

				// call notification hook
				require.load({ completeLoad:noop, async: false }, oModule.url, oSplitName.baseID);

				loadSyncXHR(oModule);
			}

			if ( oModule.state === LOADING ) {
				// loading failed for some reason, load again as script for better error reporting
				// (but without further eventing)
				if ( fnIgnorePreload ) {
					loadScript(oModule);
				}
				// transition to FAILED
				oModule.fail(
					makeNestedError("failed to load '" + sModuleName +  "' from " + oModule.url, oModule.error));
			} else if ( oModule.state === LOADED ) {
				// execute module __after__ loading it, this reduces the required stack space!
				execModule(sModuleName, bAsync);
			}

			measure && measure.end(sModuleName);

			if ( oModule.state !== READY ) {
				throw oModule.error;
			}

			return oModule.value();

		} else {

			// @evo-todo support debug mode also in async mode
			oModule.url = getResourcePath(oSplitName.baseID, oSplitName.subType);
			// call notification hook
			require.load({ completeLoad:noop, async: true }, oModule.url, oSplitName.baseID);
			loadScript(oModule, /* bRetryOnFailure= */ true);

			// process dep cache info
			preloadDependencies(sModuleName);

			return oModule.deferred().promise;
		}
	}

	// sModuleName must be a normalized resource name of type .js
	function execModule(sModuleName, bAsync) {

		var oModule = mModules[sModuleName],
			oShim = mShims[sModuleName],
			bLoggable = log.isLoggable(),
			sOldPrefix, sScript, vAMD, oMatch, bOldForceSyncDefines;

		if ( oModule && oModule.state === LOADED && typeof oModule.data !== "undefined" ) {

			// check whether the module is known to use an existing AMD loader, remember the AMD flag
			vAMD = (oShim === true || (oShim && oShim.amd)) && typeof __global.define === "function" && __global.define.amd;
			bOldForceSyncDefines = bForceSyncDefines;

			try {

				if ( vAMD ) {
					// temp. remove the AMD Flag from the loader
					delete __global.define.amd;
				}
				bForceSyncDefines = !bAsync;

				if ( bLoggable ) {
					log.debug(sLogPrefix + "executing '" + sModuleName + "'");
					sOldPrefix = sLogPrefix;
					sLogPrefix = sLogPrefix + ": ";
				}

				// execute the script in the __global context
				oModule.state = EXECUTING;
				_execStack.push({
					name: sModuleName,
					used: false
				});
				if ( typeof oModule.data === "function" ) {
					oModule.data.call(__global);
				} else if ( Array.isArray(oModule.data) ) {
					define.apply(null, oModule.data);
				} else {

					sScript = oModule.data;

					// sourceURL: Firebug, Chrome, Safari and IE11 debugging help, appending the string seems to cost ZERO performance
					// Note: IE11 supports sourceURL even when running in IE9 or IE10 mode
					// Note: make URL absolute so Chrome displays the file tree correctly
					// Note: do not append if there is already a sourceURL / sourceMappingURL
					// Note: Safari fails, if sourceURL is the same as an existing XHR URL
					// Note: Chrome ignores debug files when the same URL has already been load via sourcemap of the bootstrap file (sap-ui-core)
					// Note: sourcemap annotations URLs in eval'ed sources are resolved relative to the page, not relative to the source
					if (sScript ) {
						oMatch = /\/\/[#@] source(Mapping)?URL=(.*)$/.exec(sScript);
						if ( oMatch && oMatch[1] && /^[^/]+\.js\.map$/.test(oMatch[2]) ) {
							// found a sourcemap annotation with a typical UI5 generated relative URL
							sScript = sScript.slice(0, oMatch.index) + oMatch[0].slice(0, -oMatch[2].length) + resolveURL(oMatch[2], oModule.url);
						}
						// @evo-todo use only sourceMappingURL, sourceURL or both?
						if ( !oMatch || oMatch[1] ) {
							// write sourceURL if no annotation was there or when it was a sourceMappingURL
							sScript += "\n//# sourceURL=" + resolveURL(oModule.url) + "?eval";
						}
					}

					// framework internal hook to intercept the loaded script and modify
					// it before executing the script - e.g. useful for client side coverage
					if (typeof translate === "function") {
						sScript = translate(sScript, sModuleName);
					}

					if (__global.execScript && (!oModule.data || oModule.data.length < MAX_EXEC_SCRIPT_LENGTH) ) {
						try {
							oModule.data && __global.execScript(sScript); // execScript fails if data is empty
						} catch (e) {
							_execStack.pop();
							// eval again with different approach - should fail with a more informative exception
							/* eslint-disable no-eval */
							eval(oModule.data);
							/* eslint-enable no-eval */
							throw e; // rethrow err in case globalEval succeeded unexpectedly
						}
					} else {
						__global.eval(sScript);
					}
				}
				_execStack.pop();
				queue.process(oModule);

				if ( bLoggable ) {
					sLogPrefix = sOldPrefix;
					log.debug(sLogPrefix + "finished executing '" + sModuleName + "'");
				}

			} catch (err) {
				if ( bLoggable ) {
					sLogPrefix = sOldPrefix;
				}
				oModule.data = undefined;
				oModule.fail(err);
			} finally {

				// restore AMD flag
				if ( vAMD ) {
					__global.define.amd = vAMD;
				}
				bForceSyncDefines = bOldForceSyncDefines;
			}
		}
	}

	function requireAll(oRequestingModule, aDependencies, fnCallback, fnErrCallback, bAsync) {

		var sBaseName, aModules = [],
			bLoggable = log.isLoggable(),
			i, sDepModName, oError, oPromise;

		try {
			// calculate the base name for relative module names
			if ( oRequestingModule instanceof Module ) {
				sBaseName = oRequestingModule.name;
			} else {
				sBaseName = oRequestingModule;
				oRequestingModule = null;
			}
			aDependencies = aDependencies.slice();
			for (i = 0; i < aDependencies.length; i++) {
				aDependencies[i] = getMappedName(aDependencies[i] + '.js', sBaseName);
			}
			if ( oRequestingModule ) {
				oRequestingModule.pending = aDependencies.filter(function(dep) {
					return !/^(require|exports|module)\.js$/.test(dep);
				});
			}

			for (i = 0; i < aDependencies.length; i++) {
				sDepModName = aDependencies[i];
				if ( bLoggable ) {
					log.debug(sLogPrefix + "require '" + sDepModName + "'");
				}
				if ( oRequestingModule ) {
					switch ( sDepModName ) {
					case 'require.js':
						aModules[i] = createContextualRequire(sBaseName);
						break;
					case 'module.js':
						aModules[i] = oRequestingModule.api();
						break;
					case 'exports.js':
						oRequestingModule.api();
						aModules[i] = oRequestingModule._exports;
						break;
					default:
						break;
					}
				}
				if ( !aModules[i] ) {
					aModules[i] = requireModule(oRequestingModule, sDepModName, bAsync);
				}
				if ( bLoggable ) {
					log.debug(sLogPrefix + "require '" + sDepModName + "': done.");
				}
			}

		} catch (err) {
			oError = err;
		}

		if ( bAsync ) {
			oPromise = oError ? Promise.reject(oError) : Promise.all(aModules);
			return oPromise.then(fnCallback, fnErrCallback);
		} else {
			if ( oError ) {
				fnErrCallback(oError);
			} else {
				return fnCallback(aModules);
			}
		}
	}

	function define(sModuleName, aDependencies, vFactory, bExport) {
		var sResourceName,
			oCurrentExecInfo;

		// optional id
		if ( typeof sModuleName === 'string' ) {
			sResourceName = sModuleName + '.js';
		} else {
			// shift parameters
			bExport = vFactory;
			vFactory = aDependencies;
			aDependencies = sModuleName;
			sResourceName = null;
		}

		// optional array of dependencies
		if ( !Array.isArray(aDependencies) ) {
			// shift parameters
			bExport = vFactory;
			vFactory = aDependencies;
			if ( typeof vFactory === 'function' && vFactory.length > 0 ) {
				aDependencies = ['require', 'exports', 'module'].slice(0, vFactory.length);
			} else {
				aDependencies = [];
			}
		}

		if ( bForceSyncDefines === false || (bForceSyncDefines == null && bGlobalAsyncMode) ) {
			queue.push(sResourceName, aDependencies, vFactory, bExport);
			return;
		}

		oCurrentExecInfo = _execStack.length > 0 ? _execStack[_execStack.length - 1] : null;
		if ( !sResourceName ) {

			if ( oCurrentExecInfo && !oCurrentExecInfo.used ) {
				sResourceName = oCurrentExecInfo.name;
				oCurrentExecInfo.used = true;
			} else {
				// give anonymous modules a unique pseudo ID
				sResourceName = '~anonymous~' + (++iAnonymousModuleCount) + '.js';
				if ( oCurrentExecInfo ) {
					sResourceName = oCurrentExecInfo.name.slice(0, oCurrentExecInfo.name.lastIndexOf('/') + 1) + sResourceName;
				}
				log.error(
					"Modules that use an anonymous define() call must be loaded with a require() call; " +
					"they must not be executed via script tag or nested into other modules. " +
					"All other usages will fail in future releases or when standard AMD loaders are used " +
					"or when ui5loader runs in async mode. Now using substitute name " + sResourceName);
			}
		} else if ( oCurrentExecInfo && !oCurrentExecInfo.used && sResourceName !== oCurrentExecInfo.name ) {
			log.debug("module names don't match: requested: " + sModuleName + ", defined: ", oCurrentExecInfo.name);
			Module.get(oCurrentExecInfo.name).addAlias(sModuleName);
		}
		defineModule(sResourceName, aDependencies, vFactory, bExport, /* bAsync = */ false);

	}

	function defineModule(sResourceName, aDependencies, vFactory, bExport, bAsync) {

		var bLoggable = log.isLoggable();
		sResourceName = normalize(sResourceName);

		if ( bLoggable ) {
			log.debug("define(" + sResourceName + ", " + "['" + aDependencies.join("','") + "']" + ")");
		}

		var oModule = declareModule(sResourceName);
		// avoid early evaluation of the module value
		oModule.content = undefined;

		// Note: dependencies will be resolved and converted from RJS to URN inside requireAll
		requireAll(oModule, aDependencies, function(aModules) {

			// factory
			if ( bLoggable ) {
				log.debug("define(" + sResourceName + "): calling factory " + typeof vFactory);
			}

			if ( bExport && syncCallBehavior !== 2 ) {
				// ensure parent namespace
				var aPackages = sResourceName.split('/');
				if ( aPackages.length > 1 ) {
					getGlobalObject(__global, aPackages, aPackages.length - 1, true);
				}
			}

			if ( typeof vFactory === 'function' ) {
				// from https://github.com/amdjs/amdjs-api/blob/master/AMD.md
				// "If the factory function returns a value (an object, function, or any value that coerces to true),
				//  then that value should be assigned as the exported value for the module."
				try {
					var exports = vFactory.apply(__global, aModules);
					if ( oModule._api && oModule._api.exports !== undefined && oModule._api.exports !== oModule._exports ) {
						exports = oModule._api.exports;
					} else if ( exports === undefined && oModule._exports ) {
						exports = oModule._exports;
					}
					oModule.content = exports;
				} catch (error) {
					oModule.fail(error);
					if ( bAsync ) {
						return;
					}
					throw error;
				}
			} else {
				oModule.content = vFactory;
			}

			// HACK: global export
			if ( bExport && syncCallBehavior !== 2 ) {
				if ( oModule.content == null ) {
					log.error("module '" + sResourceName + "' returned no content, but should be exported");
				} else {
					if ( bLoggable ) {
						log.debug("exporting content of '" + sResourceName + "': as global object");
					}
					// convert module name to UI5 module name syntax (might fail!)
					var sModuleName = urnToUI5(sResourceName);
					setGlobalProperty(sModuleName, oModule.content);
				}
			}

			oModule.ready();

		}, function(oErr) {
			// @evo-todo wrap error with current module?
			oModule.fail(oErr);
			if ( !bAsync ) {
				throw oErr;
			}
		}, /* bAsync = */ bAsync);

	}

	/**
	 * Create a require() function which acts in the context of the given resource.
	 *
	 * @param {string|null} sContextName Name of the context resource (module) in URN syntax, incl. extension
	 * @returns {function} Require function.
	 */
	function createContextualRequire(sContextName) {
		var fnRequire = function(vDependencies, fnCallback, fnErrCallback) {
			var sModuleName;

			assert(typeof vDependencies === 'string' || Array.isArray(vDependencies), "dependency param either must be a single string or an array of strings");
			assert(fnCallback == null || typeof fnCallback === 'function', "callback must be a function or null/undefined");
			assert(fnErrCallback == null || typeof fnErrCallback === 'function', "error callback must be a function or null/undefined");

			if ( typeof vDependencies === 'string' ) {
				sModuleName = getMappedName(vDependencies + '.js', sContextName);
				return Module.get(sModuleName).value();
			}

			requireAll(sContextName, vDependencies, function(aModules) {
				if ( typeof fnCallback === 'function' ) {
					if ( bGlobalAsyncMode ) {
						fnCallback.apply(__global, aModules);
					} else {
						// enforce asynchronous execution of callback even in sync mode
						setTimeout(function() {
							fnCallback.apply(__global, aModules);
						}, 0);
					}
				}
			}, function(oErr) {
				if ( typeof fnErrCallback === 'function' ) {
					if ( bGlobalAsyncMode ) {
						fnErrCallback.call(__global, oErr);
					} else {
						setTimeout(function() {
							fnErrCallback.call(__global, oErr);
						}, 0);
					}
				} else {
					throw oErr;
				}
			}, /* bAsync = */ bGlobalAsyncMode);

			// return undefined;
		};
		fnRequire.toUrl = function(sName) {
			sName = getMappedName(sName, sContextName);
			var oName = urnToIDAndType( sName );
			return getResourcePath(oName.id, oName.type);
		};
		return fnRequire;
	}

	/**
	 * Resolves one or more module dependencies.
	 *
	 * <b>Synchronous Retrieval of a Single Module Value</b>
	 *
	 * When called with a single string, that string is assumed to be the name of an already loaded
	 * module and the value of that module is returned. If the module has not been loaded yet,
	 * or if it is a Non-UI5 module (e.g. third party module), <code>undefined</code> is returned.
	 * This signature variant allows synchronous access to module values without initiating module loading.
	 *
	 * Sample:
	 * <pre>
	 *   var JSONModel = sap.ui.require("sap/ui/model/json/JSONModel");
	 * </pre>
	 *
	 * For modules that are known to be UI5 modules, this signature variant can be used to check whether
	 * the module has been loaded.
	 *
	 * <b>Asynchronous Loading of Multiple Modules</b>
	 *
	 * If an array of strings is given and (optionally) a callback function, then the strings
	 * are interpreted as module names and the corresponding modules (and their transitive
	 * dependencies) are loaded. Then the callback function will be called asynchronously.
	 * The module values of the specified modules will be provided as parameters to the callback
	 * function in the same order in which they appeared in the dependencies array.
	 *
	 * The return value for the asynchronous use case is <code>undefined</code>.
	 *
	 * <pre>
	 *   sap.ui.require(['sap/ui/model/json/JSONModel', 'sap/ui/core/UIComponent'], function(JSONModel,UIComponent) {
	 *
	 *     var MyComponent = UIComponent.extend('MyComponent', {
	 *       ...
	 *     });
	 *     ...
	 *
	 *   });
	 * </pre>
	 *
	 * This method uses the same variation of the {@link jQuery.sap.getResourcePath unified resource name}
	 * syntax that {@link sap.ui.define} uses: module names are specified without the implicit extension '.js'.
	 * Relative module names are not supported.
	 *
	 * @param {string|string[]} vDependencies dependency (dependencies) to resolve
	 * @param {function} [fnCallback] callback function to execute after resolving an array of dependencies
	 * @returns {any|undefined} a single module value or undefined
	 * @public
	 * @experimental Since 1.27.0 - not all aspects of sap.ui.require are settled yet. E.g. the return value
	 * of the asynchronous use case might change (currently it is undefined).
	 */
	var require = createContextualRequire(null);

	function requireSync(sModuleName) {
		sModuleName = getMappedName(sModuleName + '.js');
		return requireModule(null, sModuleName, /* bAsync = */ false);
	}

	/**
	 * Dumps information about the current set of modules and their state.
	 *
	 * @param {int} [iThreshold=-1] Earliest module state for which odules should be reported
	 * @private
	 */
	function dumpInternals(iThreshold) {

		var states = [PRELOADED, INITIAL, LOADED, READY, FAILED, EXECUTING, LOADING];
		var stateNames = {};
		stateNames[PRELOADED] = 'PRELOADED';
		stateNames[INITIAL] = 'INITIAL';
		stateNames[LOADING] = 'LOADING';
		stateNames[LOADED] = 'LOADED';
		stateNames[EXECUTING] = 'EXECUTING';
		stateNames[READY] = 'READY';
		stateNames[FAILED] = 'FAILED';

		if ( iThreshold == null ) {
			iThreshold = PRELOADED;
		}

		/*eslint-disable no-console */
		var info = log.isLoggable('INFO') ? log.info.bind(log) : console.info.bind(console);
		/*eslint-enable no-console */

		var aModuleNames = Object.keys(mModules).sort();
		states.forEach(function(state) {
			if ( state  < iThreshold ) {
				return;
			}
			var count = 0;
			info(stateNames[state] + ":");
			aModuleNames.forEach(function(sModule, idx) {
				var oModule = mModules[sModule];
				if ( oModule.state === state ) {
					var addtlInfo;
					if ( oModule.state === LOADING ) {
						var pending = oModule.pending && oModule.pending.reduce(function(acc, dep) {
							var oDepModule = Module.get(dep);
							if ( oDepModule.state !== READY ) {
								acc.push( dep + "(" + stateNames[oDepModule.state] + ")");
							}
							return acc;
						}, []);
						if ( pending && pending.length > 0 ) {
							addtlInfo = "waiting for " + pending.join(", ");
						}
					} else if ( oModule.state === FAILED ) {
						addtlInfo = (oModule.error.name || "Error") + ": " + oModule.error.message;
					}
					info("  " + (idx + 1) + " " + sModule + (addtlInfo ? " (" + addtlInfo + ")" : ""));
					count++;
				}
			});
			if ( count === 0 ) {
				info("  none");
			}
		});

	}

	/**
	 * Returns a flat copy of the current set of URL prefixes.
	 *
	 * @private
	 */
	function getUrlPrefixes() {
		var mUrlPrefixesCopy = Object.create(null);
		forEach(mUrlPrefixes, function(sNamePrefix, oUrlInfo) {
			mUrlPrefixesCopy[sNamePrefix] = oUrlInfo.url;
		});
		return mUrlPrefixesCopy;
	}

	/**
	 * Removes a set of resources from the resource cache.
	 *
	 * @param {string} sName unified resource name of a resource or the name of a preload group to be removed
	 * @param {boolean} [bPreloadGroup=true] whether the name specifies a preload group, defaults to true
	 * @param {boolean} [bUnloadAll] Whether all matching resources should be unloaded, even if they have been executed already.
	 * @param {boolean} [bDeleteExports] Whether exports (global variables) should be destroyed as well. Will be done for UI5 module names only.
	 * @experimental Since 1.16.3 API might change completely, apps must not develop against it.
	 * @private
	 */
	function unloadResources(sName, bPreloadGroup, bUnloadAll, bDeleteExports) {
		var aModules = [],
			sURN, oModule;

		if ( bPreloadGroup == null ) {
			bPreloadGroup = true;
		}

		if ( bPreloadGroup ) {
			// collect modules that belong to the given group
			for ( sURN in mModules ) {
				oModule = mModules[sURN];
				if ( oModule && oModule.group === sName ) {
					aModules.push(sURN);
				}
			}

		} else {
			// single module
			if ( mModules[sName] ) {
				aModules.push(sName);
			}
		}

		aModules.forEach(function(sURN) {
			var oModule = mModules[sURN];
			if ( oModule && bDeleteExports && sURN.match(/\.js$/) ) {
				// @evo-todo move to compat layer?
				setGlobalProperty(urnToUI5(sURN), undefined);
			}
			if ( oModule && (bUnloadAll || oModule.state === PRELOADED) ) {
			  delete mModules[sURN];
			}
		});

	}

	function getModuleContent(name, url) {
		if ( name ) {
			name = getMappedName(name);
		} else {
			name = guessResourceName(url);
		}
		var oModule = name && mModules[name];
		if ( oModule ) {
			oModule.state = LOADED;
			return oModule.data;
		} else {
			return undefined;
		}
	}

	/**
	 * Returns an info about all known resources keyed by their URN.
	 *
	 * If the URN can be converted to a UI5 module name, then the value in the map
	 * will be that name. Otherwise it will be null or undefined.
	 *
	 * @return {Object.<string,string>} Map of all module names keyed by their resource name
	 * @see isDeclared
	 * @private
	 */
	function getAllModules() {
		var mSnapshot = Object.create(null);
		forEach(mModules, function(sURN, oModule) {
			mSnapshot[sURN] = {
				state: oModule.state,
				ui5: urnToUI5(sURN)
			};
		});
		return mSnapshot;
	}

	function loadJSResourceAsync(sResource, bIgnoreErrors) {
		sResource = getMappedName(sResource);
		var promise = requireModule(null, sResource, /* bAsync = */ true);
		return bIgnoreErrors ? promise.catch(noop) : promise;
	}

	// ---- config --------------------------------------------------------------------------------

	var mConfigHandlers = {
		baseUrl: function(url) {
			registerResourcePath("", url);
		},
		paths: registerResourcePath, // has length 2
		shim: function(module, shim) {
			if ( Array.isArray(shim) ) {
				shim = { deps : shim };
			}
			mShims[module + '.js'] = shim;
		},
		async: function(async) {
			bGlobalAsyncMode = !!async;
		},
		debugSources: function(debug) {
			bDebugSources = !!debug;
		},
		depCache: function(module, deps) {
			mDepCache[module + '.js'] = deps.map(function(dep) { return dep + '.js'; });
		},
		depCacheUI5: function(module, deps) {
			mDepCache[module] = deps;
		},
		ignoreBundledResources: function(filter) {
			if ( filter == null || typeof filter === 'function' ) {
				fnIgnorePreload = filter;
			}
		},
		map: function(context, map) {
			// @evo-todo ignore empty context, empty prefix?
			if ( map == null ) {
				delete mMaps[context];
			} else if ( typeof map === 'string' ) {
				// SystemJS style config
				mMaps['*'][context] = map;
			} else {
				mMaps[context] = mMaps[context] || Object.create(null);
				forEach(map, function(alias, name) {
					mMaps[context][alias] = name;
				});
			}
		},
		reportSyncCalls: function(report) {
			if ( report === 0 || report === 1 || report === 2 ) {
				syncCallBehavior = report;
			}
		},
		noConflict: function(bValue) {
			if (bValue) {
				__global.define = vOriginalDefine;
				__global.require = vOriginalRequire;
			} else {
				__global.define = define;
				__global.require = require;
			}
		}
	};

	function config(oConfig) {
		forEach(oConfig, function(key, value) {
			var handler = mConfigHandlers[key];
			if ( typeof handler === 'function' ) {
				if ( handler.length === 1) {
					handler(value);
				} else if ( value != null ) {
					forEach(value, handler);
				}
			} else {
				log.warning("configuration option " + key + " not supported (ignored)");
			}
		});
	}

	// @evo-todo really use this hook for loading. But how to differentiate between sync and async?
	// for now, it is only a notification hook to attach load tests
	require.load = function(context, url, id) {
	};

	var ui5loader = {
		amdDefine: define,
		amdRequire: require,
		config: config,
		declareModule: function(sResourceName) {
			/* void */ declareModule( normalize(sResourceName) );
		},
		dump: dumpInternals,
		getAllModules: getAllModules,
		getModuleContent: getModuleContent,
		getModuleState: function(sResourceName) {
			return mModules[sResourceName] ? mModules[sResourceName].state : INITIAL;
		},
		getResourcePath: getResourcePath,
		getUrlPrefixes: getUrlPrefixes,
		loadJSResourceAsync: loadJSResourceAsync,
		resolveURL: resolveURL,
		toUrl: getResourcePath,
		unloadResources: unloadResources
	};
	Object.defineProperties(ui5loader, {
		logger: {
			get: function() {
				return log;
			},
			set: function(v) {
				log = v;
			}
		},
		measure: {
			get: function() {
				return measure;
			},
			set: function(v) {
				measure = v;
			}
		},
		assert: {
			get: function() {
				return assert;
			},
			set: function(v) {
				assert = v;
			}
		},
		translate: {
			get: function() {
				return translate;
			},
			set: function(v) {
				translate = v;
			}

		}
	});

	require.sync = requireSync;

	require.predefine = function(sModuleName, aDependencies, vFactory, bExport) {
		if ( typeof sModuleName !== 'string' ) {
			throw new Error("predefine requires a module name");
		}
		sModuleName = normalize(sModuleName);
		Module.get(sModuleName + '.js').preload("<unknown>/" + sModuleName, [sModuleName, aDependencies, vFactory, bExport], null);
	};

	require.preload = function(modules, group, url) {
		group = group || null;
		url = url || "<unknown>";
		for ( var name in modules ) {
			name = normalize(name);
			Module.get(name).preload(url + "/" + name, modules[name], group);
		}
	};

	if ( typeof ES6Promise !== 'undefined' ) {
		Module.get('sap/ui/thirdparty/es6-promise.js').ready(ES6Promise);
	}
	Module.get('sap/ui/thirdparty/es6-string-methods.js').ready(null); // no module value

	// Store current global define and require values
	vOriginalDefine = __global.define;
	vOriginalRequire = __global.require;

	__global.define = define;
	__global.require = require;

	__global.sap = __global.sap || {};
	sap.ui = sap.ui || {};

	/**
	 * Internal API of the UI5 loader.
	 *
	 * Must not be used by code outside sap.ui.core.
	 * @private
	 */
	sap.ui._ui5loader = ui5loader;

	/**
	 * Defines a Javascript module with its name, its dependencies and a module value or factory.
	 *
	 * The typical and only suggested usage of this method is to have one single, top level call to
	 * <code>sap.ui.define</code> in one Javascript resource (file). When a module is requested by its
	 * name for the first time, the corresponding resource is determined from the name and the current
	 * {@link jQuery.sap.registerResourcePath configuration}. The resource will be loaded and executed
	 * which in turn will execute the top level <code>sap.ui.define</code> call.
	 *
	 * If the module name was omitted from that call, it will be substituted by the name that was used to
	 * request the module. As a preparation step, the dependencies as well as their transitive dependencies,
	 * will be loaded. Then, the module value will be determined: if a static value (object, literal) was
	 * given as <code>vFactory</code>, that value will be the module value. If a function was given, that
	 * function will be called (providing the module values of the declared dependencies as parameters
	 * to the function) and its return value will be used as module value. The framework internally associates
	 * the resulting value with the module name and provides it to the original requester of the module.
	 * Whenever the module is requested again, the same value will be returned (modules are executed only once).
	 *
	 * <i>Example:</i><br>
	 * The following example defines a module "SomeClass", but doesn't hard code the module name.
	 * If stored in a file 'sap/mylib/SomeClass.js', it can be requested as 'sap/mylib/SomeClass'.
	 * <pre>
	 *   sap.ui.define(['./Helper', 'sap/m/Bar'], function(Helper,Bar) {
	 *
	 *     // create a new class
	 *     var SomeClass = function() {};
	 *
	 *     // add methods to its prototype
	 *     SomeClass.prototype.foo = function() {
	 *
	 *         // use a function from the dependency 'Helper' in the same package (e.g. 'sap/mylib/Helper' )
	 *         var mSettings = Helper.foo();
	 *
	 *         // create and return an sap.m.Bar (using its local name 'Bar')
	 *         return new Bar(mSettings);
	 *
	 *     }
	 *
	 *     // return the class as module value
	 *     return SomeClass;
	 *
	 *   });
	 * </pre>
	 *
	 * In another module or in an application HTML page, the {@link sap.ui.require} API can be used
	 * to load the Something module and to work with it:
	 *
	 * <pre>
	 * sap.ui.require(['sap/mylib/Something'], function(Something) {
	 *
	 *   // instantiate a Something and call foo() on it
	 *   new Something().foo();
	 *
	 * });
	 * </pre>
	 *
	 *
	 * <h3>Module Name Syntax</h3>
	 *
	 * <code>sap.ui.define</code> uses a simplified variant of the {@link jQuery.sap.getResourcePath
	 * unified resource name} syntax for the module's own name as well as for its dependencies.
	 * The only difference to that syntax is, that for <code>sap.ui.define</code> and
	 * <code>sap.ui.require</code>, the extension (which always would be '.js') has to be omitted.
	 * Both methods always add this extension internally.
	 *
	 * As a convenience, the name of a dependency can start with the segment './' which will be
	 * replaced by the name of the package that contains the currently defined module (relative name).
	 *
	 * It is best practice to omit the name of the defined module (first parameter) and to use
	 * relative names for the dependencies whenever possible. This reduces the necessary configuration,
	 * simplifies renaming of packages and allows to map them to a different namespace.
	 *
	 *
	 * <h3>Dependency to Modules</h3>
	 *
	 * If a dependencies array is given, each entry represents the name of another module that
	 * the currently defined module depends on. All dependency modules are loaded before the value
	 * of the currently defined module is determined. The module value of each dependency module
	 * will be provided as a parameter to a factory function, the order of the parameters will match
	 * the order of the modules in the dependencies array.
	 *
	 * <b>Note:</b> the order in which the dependency modules are <i>executed</i> is <b>not</b>
	 * defined by the order in the dependencies array! The execution order is affected by dependencies
	 * <i>between</i> the dependency modules as well as by their current state (whether a module
	 * already has been loaded or not). Neither module implementations nor dependents that require
	 * a module set must make any assumption about the execution order (other than expressed by
	 * their dependencies). There is, however, one exception with regard to third party libraries,
	 * see the list of limitations further down below.
	 *
	 * <b>Note:</b>a static module value (a literal provided to <code>sap.ui.define</code>) cannot
	 * depend on the module values of the dependency modules. Instead, modules can use a factory function,
	 * calculate the static value in that function, potentially based on the dependencies, and return
	 * the result as module value. The same approach must be taken when the module value is supposed
	 * to be a function.
	 *
	 *
	 * <h3>Asynchronous Contract</h3>
	 * <code>sap.ui.define</code> is designed to support real Asynchronous Module Definitions (AMD)
	 * in future, although it internally still uses the old synchronous module loading of UI5.
	 * Callers of <code>sap.ui.define</code> therefore must not rely on any synchronous behavior
	 * that they might observe with the current implementation.
	 *
	 * For example, callers of <code>sap.ui.define</code> must not use the module value immediately
	 * after invoking <code>sap.ui.define</code>:
	 *
	 * <pre>
	 *   // COUNTER EXAMPLE HOW __NOT__ TO DO IT
	 *
	 *   // define a class Something as AMD module
	 *   sap.ui.define('Something', [], function() {
	 *     var Something = function() {};
	 *     return Something;
	 *   });
	 *
	 *   // DON'T DO THAT!
	 *   // accessing the class _synchronously_ after sap.ui.define was called
	 *   new Something();
	 * </pre>
	 *
	 * Applications that need to ensure synchronous module definition or synchronous loading of dependencies
	 * <b>MUST</b> use the old {@link jQuery.sap.declare} and {@link jQuery.sap.require} APIs.
	 *
	 *
	 * <h3>(No) Global References</h3>
	 *
	 * To be in line with AMD best practices, modules defined with <code>sap.ui.define</code>
	 * should not make any use of global variables if those variables are also available as module
	 * values. Instead, they should add dependencies to those modules and use the corresponding parameter
	 * of the factory function to access the module value.
	 *
	 * As the current programming model and the documentation of UI5 heavily rely on global names,
	 * there will be a transition phase where UI5 enables AMD modules and local references to module
	 * values in parallel to the old global names. The fourth parameter of <code>sap.ui.define</code>
	 * has been added to support that transition phase. When this parameter is set to true, the framework
	 * provides two additional functionalities
	 *
	 * <ol>
	 * <li>Before the factory function is called, the existence of the global parent namespace for
	 *     the current module is ensured</li>
	 * <li>The module value will be automatically exported under a global name which is derived from
	 *     the name of the module</li>
	 * </ol>
	 *
	 * The parameter lets the framework know whether any of those two operations is needed or not.
	 * In future versions of UI5, a central configuration option is planned to suppress those 'exports'.
	 *
	 *
	 * <h3>Third Party Modules</h3>
	 * Although third party modules don't use UI5 APIs, they still can be listed as dependencies in
	 * a <code>sap.ui.define</code> call. They will be requested and executed like UI5 modules, but their
	 * module value will be <code>undefined</code>.
	 *
	 * If the currently defined module needs to access the module value of such a third party module,
	 * it can access the value via its global name (if the module supports such a usage).
	 *
	 * Note that UI5 temporarily deactivates an existing AMD loader while it executes third party modules
	 * known to support AMD. This sounds contradictorily at a first glance as UI5 wants to support AMD,
	 * but for now it is necessary to fully support UI5 applications that rely on global names for such modules.
	 *
	 * Example:
	 * <pre>
	 *   // module 'Something' wants to use third party library 'URI.js'
	 *   // It is packaged by UI5 as non-UI5-module 'sap/ui/thirdparty/URI'
	 *
	 *   sap.ui.define('Something', ['sap/ui/thirdparty/URI'], function(URIModuleValue) {
	 *
	 *     new URIModuleValue(); // fails as module value is undefined
	 *
	 *     //global URI // (optional) declare usage of global name so that static code checks don't complain
	 *     new URI(); // access to global name 'URI' works
	 *
	 *     ...
	 *   });
	 * </pre>
	 *
	 *
	 * <h3>Differences to Standard AMD</h3>
	 *
	 * The current implementation of <code>sap.ui.define</code> differs from the AMD specification
	 * (https://github.com/amdjs/amdjs-api) or from concrete AMD loaders like <code>requireJS</code>
	 * in several aspects:
	 * <ul>
	 * <li>The name <code>sap.ui.define</code> is different from the plain <code>define</code>.
	 * This has two reasons: first, it avoids the impression that <code>sap.ui.define</code> is
	 * an exact implementation of an AMD loader. And second, it allows the coexistence of an AMD
	 * loader (e.g. requireJS) and <code>sap.ui.define</code> in one application as long as UI5 or
	 * applications using UI5 are not fully prepared to run with an AMD loader.
	 * Note that the difference of the API names also implies that the UI5 loader can't be used
	 * to load 'real' AMD modules as they expect methods <code>define</code> and <code>require</code>
	 * to be available. Modules that use Unified Module Definition (UMD) syntax, can be loaded,
	 * but only when no AMD loader is present or when they expose their export also to the global
	 * namespace, even when an AMD loader is present (as e.g. jQuery does)</li>
	 * <li><code>sap.ui.define</code> currently loads modules with synchronous XHR calls. This is
	 * basically a tribute to the synchronous history of UI5.
	 * <b>BUT:</b> synchronous dependency loading and factory execution explicitly it not part of
	 * contract of <code>sap.ui.define</code>. To the contrary, it is already clear and planned
	 * that asynchronous loading will be implemented, at least as an alternative if not as the only
	 * implementation. Also check section <b>Asynchronous Contract</b> above.<br>
	 * Applications that need to ensure synchronous loading of dependencies <b>MUST</b> use the old
	 * {@link jQuery.sap.require} API.</li>
	 * <li><code>sap.ui.define</code> does not support plugins to use other file types, formats or
	 * protocols. It is not planned to support this in future</li>
	 * <li><code>sap.ui.define</code> does not support absolute URLs as module names (dependencies)
	 * nor does it allow module names that start with a slash. To refer to a module at an absolute
	 * URL, a resource root can be registered that points to that URL (or to a prefix of it).</li>
	 * <li><code>sap.ui.define</code> does <b>not</b> support the 'sugar' of requireJS where CommonJS
	 * style dependency declarations using <code>sap.ui.require("something")</code> are automagically
	 * converted into <code>sap.ui.define</code> dependencies before executing the factory function.</li>
	 * </ul>
	 *
	 *
	 * <h3>Limitations, Design Considerations</h3>
	 * <ul>
	 * <li><b>Limitation</b>: as dependency management is not supported for Non-UI5 modules, the only way
	 *     to ensure proper execution order for such modules currently is to rely on the order in the
	 *     dependency array. Obviously, this only works as long as <code>sap.ui.define</code> uses
	 *     synchronous loading. It will be enhanced when asynchronous loading is implemented.</li>
	 * <li>It was discussed to enforce asynchronous execution of the module factory function (e.g. with a
	 *     timeout of 0). But this would have invalidated the current migration scenario where a
	 *     sync <code>jQuery.sap.require</code> call can load a <code>sap.ui.define</code>'ed module.
	 *     If the module definition would not execute synchronously, the synchronous contract of the
	 *     require call would be broken (default behavior in existing UI5 applications)</li>
	 * <li>A single file must not contain multiple calls to <code>sap.ui.define</code>. Multiple calls
	 *     currently are only supported in the so called 'preload' files that the UI5 merge tooling produces.
	 *     The exact details of how this works might be changed in future implementations and are not
	 *     yet part of the API contract</li>
	 * </ul>
	 * @param {string} [sModuleName] name of the module in simplified resource name syntax.
	 *        When omitted, the loader determines the name from the request.
	 * @param {string[]} [aDependencies] list of dependencies of the module
	 * @param {function|any} vFactory the module value or a function that calculates the value
	 * @param {boolean} [bExport] whether an export to global names is required - should be used by SAP-owned code only
	 * @since 1.27.0
	 * @public
	 * @see https://github.com/amdjs/amdjs-api
	 * @experimental Since 1.27.0 - not all aspects of sap.ui.define are settled yet. If the documented
	 *        constraints and limitations are obeyed, SAP-owned code might use it. If the fourth parameter
	 *        is not used and if the asynchronous contract is respected, even Non-SAP code might use it.
	 */
	sap.ui.define = define;

	/**
	 * @private
	 */
	sap.ui.predefine = require.predefine;

	/**
	 * Resolves one or more module dependencies.
	 *
	 * <b>Synchronous Retrieval of a Single Module Value</b>
	 *
	 * When called with a single string, that string is assumed to be the name of an already loaded
	 * module and the value of that module is returned. If the module has not been loaded yet,
	 * or if it is a Non-UI5 module (e.g. third party module), <code>undefined</code> is returned.
	 * This signature variant allows synchronous access to module values without initiating module loading.
	 *
	 * Sample:
	 * <pre>
	 *   var JSONModel = sap.ui.require("sap/ui/model/json/JSONModel");
	 * </pre>
	 *
	 * For modules that are known to be UI5 modules, this signature variant can be used to check whether
	 * the module has been loaded.
	 *
	 * <b>Asynchronous Loading of Multiple Modules</b>
	 *
	 * If an array of strings is given and (optionally) a callback function, then the strings
	 * are interpreted as module names and the corresponding modules (and their transitive
	 * dependencies) are loaded. Then the callback function will be called asynchronously.
	 * The module values of the specified modules will be provided as parameters to the callback
	 * function in the same order in which they appeared in the dependencies array.
	 *
	 * The return value for the asynchronous use case is <code>undefined</code>.
	 *
	 * <pre>
	 *   sap.ui.require(['sap/ui/model/json/JSONModel', 'sap/ui/core/UIComponent'], function(JSONModel,UIComponent) {
	 *
	 *     var MyComponent = UIComponent.extend('MyComponent', {
	 *       ...
	 *     });
	 *     ...
	 *
	 *   });
	 * </pre>
	 *
	 * This method uses the same variation of the {@link jQuery.sap.getResourcePath unified resource name}
	 * syntax that {@link sap.ui.define} uses: module names are specified without the implicit extension '.js'.
	 * Relative module names are not supported.
	 *
	 * @param {string|string[]} vDependencies dependency (dependencies) to resolve
	 * @param {function} [fnCallback] callback function to execute after resolving an array of dependencies
	 * @returns {any|undefined} a single module value or undefined
	 * @public
	 * @experimental Since 1.27.0 - not all aspects of sap.ui.require are settled yet. E.g. the return value
	 * of the asynchronous use case might change (currently it is undefined).
	 */
	sap.ui.require = require;

	/**
	 * Load a single module synchronously and return its module value.
	 *
	 * Basically, this method is a combination of {@link jQuery.sap.require} and {@link sap.ui.require}.
	 * Its main purpose is to simplify the migration of modules to AMD style in those cases where some dependencies
	 * have to be loaded late (lazy) and synchronously.
	 *
	 * The method accepts a single module name in the same syntax that {@link sap.ui.define} and {@link sap.ui.require}
	 * already use (a simplified variation of the {@link jQuery.sap.getResourcePath unified resource name}:
	 * slash separated names without the implicit extension '.js'). As for <code>sap.ui.require</code>,
	 * relative names (using <code>./</code> or <code>../</code>) are not supported.
	 * If not loaded yet, the named module will be loaded synchronously and the value of the module will be returned.
	 * While a module is executing, a value of <code>undefined</code> will be returned in case it is required again during
	 * that period of time.
	 *
	 * <b>Note</b>: Applications are strongly encouraged to use this method only when synchronous loading is unavoidable.
	 * Any code that uses this method won't benefit from future performance improvements that require asynchronous
	 * module loading. And such code never can comply with stronger content security policies (CSPs) that forbid 'eval'.
	 *
	 * @param {string} sModuleName Module name in requireJS syntax
	 * @returns {any} value of the loaded module or undefined
	 * @private
	 */
	sap.ui.requireSync = require.sync;

}(window));