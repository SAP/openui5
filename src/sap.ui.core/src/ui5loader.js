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

/*global sap:true, Blob, console, document, Promise, URL */

(function(__global) {
	"use strict";

	/*
	 * Helper function that removes any query and/or hash parts from the given URL.
	 *
	 * @param {string} href URL to remove query and hash from
	 * @returns {string}
	 */
	function pathOnly(href) {
		const p = href.search(/[?#]/);
		return p < 0 ? href : href.slice(0, p);
	}

	/**
	 * Resolve a given URL, either against the base URL of the current document or against a given base URL.
	 *
	 * If no base URL is given, the URL will be resolved relative to the baseURI of the current document.
	 * If a base URL is given, that base will first be resolved relative to the document's baseURI,
	 * then the URL will be resolved relative to the resolved base.
	 *
	 * Search parameters or a hash of the chosen base will be ignored.
	 *
	 * @param {string} sURI Relative or absolute URL that should be resolved
	 * @param {string} [sBase=document.baseURI] Base URL relative to which the URL should be resolved
	 * @returns {string} Resolved URL
	 */
	function resolveURL(sURI, sBase) {
		sBase = pathOnly(sBase ? resolveURL(sBase) : document.baseURI);
		return new URL(sURI, sBase).href;
	}

	// ---- helpers -------------------------------------------------------------------------------

	function noop() {}

	function forEach(obj, callback) {
		Object.keys(obj).forEach((key) => callback(key, obj[key]));
	}

	function executeInSeparateTask(fn) {
		setTimeout(fn, 0);
	}

	function executeInMicroTask(fn) {
		Promise.resolve().then(fn);
	}

	// ---- hooks & configuration -----------------------------------------------------------------

	const aEarlyLogs = [];

	function earlyLog(level, message) {
		aEarlyLogs.push({
			level,
			message
		});
	}

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

	let log = {
		debug: earlyLog.bind(this, 'debug'),
		info: earlyLog.bind(this, 'info'),
		warning: earlyLog.bind(this, 'warning'),
		error: earlyLog.bind(this, 'error'),
		isLoggable: noop
	};

	/**
	 * Basic assert functionality.
	 *
	 * Can be set to a function that gets a value (the expression to be asserted) as first
	 * parameter and a message as second parameter. When the expression coerces to false,
	 * the assertion is violated and the message should be emitted (logged, thrown, whatever).
	 *
	 * By default, this is implemented as a NOOP.
	 * @type {function(any,string)}
	 * @private
	 */
	let assert = noop; // Null Object pattern: dummy assert which is used as long as no assert is injected

	/**
	 * Callback for performance measurement.
	 *
	 * When set, it must be an object with methods <code>start</code> and <code>end</code>.
	 * @type {{start:function(string,any),end:function(string)}}
	 * @private
	 */
	let measure;

	/**
	 * Method used by sap.ui.require to simulate asynchronous behavior.
	 *
	 * The default executes the given function in a separate browser task.
	 * Can be changed to execute in a micro task to save idle time in case of
	 * many nested sap.ui.require calls.
	 */
	let simulateAsyncCallback = executeInSeparateTask;

	/*
	 * Activates strictest possible compliance with AMD spec
	 * - no multiple executions of the same module
	 * - at most one anonymous module definition per file, zero for adhoc definitions
	 */
	const strictModuleDefinitions = true;


	/**
	 * Whether ui5loader currently exposes its AMD implementation as global properties
	 * <code>define</code> and <code>require</code>. Defaults to <code>false</code>.
	 * @type {boolean}
	 * @private
	 */
	let bExposeAsAMDLoader = false;

	/**
	 * How the loader should react to calls of sync APIs or when global names are accessed:
	 * 0: tolerate
	 * 1: warn
	 * 2: reject
	 * @type {int}
	 * @private
	 */
	let syncCallBehavior = 0;

	/**
	 * Default base URL for modules, used when no other configuration is provided.
	 * In case the base url is removed via <code>registerResourcePath("", null)</code>
	 * it will be reset to this URL instead.
	 * @const
	 * @type {string}
	 * @private
	 */
	const DEFAULT_BASE_URL = "./";

	/**
	 * Temporarily saved reference to the original value of the global define variable.
	 *
	 * @type {any}
	 * @private
	 */
	let vOriginalDefine;

	/**
	 * Temporarily saved reference to the original value of the global require variable.
	 *
	 * @type {any}
	 * @private
	 */
	let vOriginalRequire;


	/**
	 * A map of URL prefixes keyed by the corresponding module name prefix.
	 *
	 * Note that the empty prefix ('') will always match and thus serves as a fallback.
	 * See {@link sap.ui.loader.config}, option <code>paths</code>.
	 * @type {Object<string,{url:string,absoluteUrl:string}>}
	 * @private
	 */
	const mUrlPrefixes = Object.create(null);
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
	const mMaps = Object.create(null);

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
	const mShims = Object.create(null);

	/**
	 * Dependency Cache information.
	 * Maps the name of a module to a list of its known dependencies.
	 * @type {Object.<string,string[]>}
	 * @private
	 */
	const mDepCache = Object.create(null);

	/**
	 * Whether the loader should try to load debug sources.
	 * @type {boolean}
	 * @private
	 */
	let bDebugSources = false;

	/**
	 * Indicates partial or total debug mode.
	 *
	 * Can be set to a function which checks whether preloads should be ignored for the given module.
	 * If undefined, all preloads will be used.
	 * @type {function(string):boolean|undefined}
	 * @private
	 */
	let fnIgnorePreload;

	/**
	 * Whether the loader should try to load the debug variant
	 * of a module.
	 * This takes the standard and partial debug mode into account.
	 *
	 * @param {string} sModuleName Name of the module to be loaded
	 * @returns {boolean} Whether the debug variant should be loaded
	 */
	function shouldLoadDebugVariant(sModuleName) {
		if (fnIgnorePreload) {
			// if preload is ignored (= partial debug mode), load the debug module first
			if (fnIgnorePreload(sModuleName)) {
				return true;
			} else {
				// partial debug mode is active, but not for this module
				return false;
			}
		} else {
			// no debug mode or standard debug mode
			return bDebugSources;
		}
	}

	// ---- internal state ------------------------------------------------------------------------

	/**
	 * Map of modules that have been loaded or required so far, keyed by their name.
	 *
	 * @type {Object<string,Module>}
	 * @private
	 */
	const mModules = Object.create(null);

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
	 * @type {boolean|null}
	 * @private
	 */
	let bForceSyncDefines = null;

	/**
	 * Stack of modules that are currently being executed in case of synchronous processing.
	 *
	 * Allows to identify the executing module (e.g. when resolving dependencies or in case of
	 * bundles like sap-ui-core).
	 *
	 * @type {Array.<{name:string,used:boolean}>}
	 * @private
	 */
	const _execStack = [ ];

	/**
	 * A prefix that will be added to module loading log statements and which reflects the nesting of module executions.
	 * @type {string}
	 * @private
	 */
	let sLogPrefix = "";

	/**
	 * Counter used to give anonymous modules a unique module ID.
	 * @type {int}
	 * @private
	 */
	let iAnonymousModuleCount = 0;

	// ---- break preload execution into tasks ----------------------------------------------------

	/**
	 * Default value for `iMaxTaskDuration`.
	 *
	 * A value of -1 switched the scheduling off, a value of zero postpones each execution
	 */
	const DEFAULT_MAX_TASK_DURATION = -1; // off

	/**
	 * Maximum accumulated task execution time (threshold)
	 * Can be configured via the private API property `maxTaskDuration`.
	 */
	let iMaxTaskDuration = DEFAULT_MAX_TASK_DURATION;

	/**
	 * The earliest elapsed time at which a new browser task will be enforced.
	 * Will be updated when a new task starts.
	 */
	let iMaxTaskTime = Date.now() + iMaxTaskDuration;

	/**
	 * A promise that fulfills when the new browser task has been reached.
	 * All postponed callback executions will be executed after this promise.
	 * `null` as long as the elapsed time threshold is not reached.
	 */
	let pWaitForNextTask;

	/**
	 * Message channel which will be used to create a new browser task
	 * without being subject to timer throttling.
	 * Will be created lazily on first usage.
	 */
	let oNextTaskMessageChannel;

	/**
	 * Update elapsed time threshold.
	 *
	 * The threshold will be updated only if executions currently are not postponed.
	 * Otherwise, the next task will anyhow update the threshold.
	 */
	function updateMaxTaskTime() {
		if ( pWaitForNextTask == null ) {
			iMaxTaskTime = Date.now() + iMaxTaskDuration;
		}
	}

	/**
	 * Update duration limit and elapsed time threshold.
	 */
	function updateMaxTaskDuration(v) {
		v = Number(v);

		const iBeginOfCurrentTask = iMaxTaskTime - iMaxTaskDuration;

		// limit to range [-1 ... Infinity], any other value incl. NaN restores the default
		iMaxTaskDuration = v >= -1 ? v : DEFAULT_MAX_TASK_DURATION;

		// Update the elapsed time threshold only if executions currently are not postponed.
		// Otherwise, the next task will be the first to honor the new maximum duration.
		if ( pWaitForNextTask == null ) {
			iMaxTaskTime = iBeginOfCurrentTask + iMaxTaskDuration;
		}
	}

	function waitForNextTask() {
		if ( pWaitForNextTask == null ) {
			/**
			 * Post a message to a MessageChannel to create a new task, without suffering from timer throttling
			 * In the new task, use a setTimeout(,0) to allow for better queuing of other events (like CSS loading)
			 */
			pWaitForNextTask = new Promise(function(resolve) {
				if ( oNextTaskMessageChannel == null ) {
					oNextTaskMessageChannel = new MessageChannel();
					oNextTaskMessageChannel.port2.start();
				}
				oNextTaskMessageChannel.port2.addEventListener("message", function() {
					setTimeout(function() {
						pWaitForNextTask = null;
						iMaxTaskTime = Date.now() + iMaxTaskDuration;
						resolve();
					}, 0);
				}, {
					once: true
				});
				oNextTaskMessageChannel.port1.postMessage(null);
			});
		}
		return pWaitForNextTask;
	}

	/**
	 * Creates a function which schedules the execution of the given callback.
	 *
	 * The scheduling tries to limit the duration of browser tasks. When the configurable
	 * limit is reached, the creation of a new browser task is triggered and all subsequently
	 * scheduled callbacks will be postponed until the new browser task starts executing.
	 * In the new browser task, scheduling starts anew.
	 *
	 * The limit for the duration of browser tasks is configured via `iMaxTaskDuration`.
	 * By setting `iMaxTaskDuration` to a negative value, the whole scheduling mechanism is
	 * switched off. In that case, the returned function will execute the callback immediately.
	 *
	 * If a value of zero is set, each callback will be executed in a separate browser task.
	 * For preloaded modules, this essentially mimics the browser behavior of single file loading,
	 * but without the network and server delays.
	 *
	 * For larger values, at least one callback will be executed in each new browser task. When,
	 * after the execution of the callback, the configured threshold has been reached, all further
	 * callbacks will be postponed.
	 *
	 * Note: This is a heuristic only. Neither is the measurement of the task duration accurate,
	 * nor is there a way to know in advance the execution time of a callback.
	 *
	 * @param {function(any):void} fnCallback
	 *    Function to schedule
	 * @returns {function(any):void}
	 *    A function to call instead of the original callback; it takes care of scheduling
	 *    and executing the original callback.
	 * @private
	 */
	function scheduleExecution(fnCallback) {
		if ( iMaxTaskDuration < 0 ) {
			return fnCallback;
		}
		return function() {
			if ( pWaitForNextTask == null ) {
				fnCallback.call(undefined, arguments[0]);

				// if time limit is reached now, postpone future task
				if ( Date.now() >= iMaxTaskTime ) {
					waitForNextTask();
				}
				return;
			}
			pWaitForNextTask.then(scheduleExecution(fnCallback).bind(undefined, arguments[0]));
		};
	}

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
		const basenamePos = sResourceName.lastIndexOf('/');
		const dotPos = sResourceName.lastIndexOf('.');

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

	const rJSSubTypes = /(\.controller|\.fragment|\.view|\.designtime|\.support)?.js$/;

	function urnToBaseIDAndSubType(sResourceName) {
		const m = rJSSubTypes.exec(sResourceName);
		if ( m ) {
			return {
				baseID: sResourceName.slice(0, m.index),
				subType: m[0]
			};
		}
	}

	const rDotSegmentAnywhere = /(?:^|\/)\.+(?=\/|$)/;
	const rDotSegment = /^\.*$/;

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

		const p = sResourceName.search(rDotSegmentAnywhere);

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

		const aSegments = sResourceName.split('/');

		// process path segments
		let j = 0;
		const l = aSegments.length;
		for (let i = 0; i < l; i++) {

			const sSegment = aSegments[i];

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

	/**
	 * Adds a resource path to the resources map.
	 *
	 * @param {string} sResourceNamePrefix prefix is used as map key
	 * @param {string} sUrlPrefix path to the resource
	 */
	function registerResourcePath(sResourceNamePrefix, sUrlPrefix) {
		sResourceNamePrefix = String(sResourceNamePrefix || "");

		if ( sUrlPrefix == null ) {

			// remove a registered URL prefix, if it wasn't for the empty resource name prefix
			if ( sResourceNamePrefix ) {
				if ( mUrlPrefixes[sResourceNamePrefix] ) {
					delete mUrlPrefixes[sResourceNamePrefix];
					log.info(`registerResourcePath ('${sResourceNamePrefix}') (registration removed)`);
				}
				return;
			}

			// otherwise restore the default
			sUrlPrefix = DEFAULT_BASE_URL;
			log.info(`registerResourcePath ('${sResourceNamePrefix}') (default registration restored)`);

		}

		// cast to string and remove query parameters and/or hash
		sUrlPrefix = pathOnly(String(sUrlPrefix));

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

	/**
	 * Retrieves path to a given resource by finding the longest matching prefix for the resource name
	 *
	 * @param {string} sResourceName name of the resource stored in the resources map
	 * @param {string} sSuffix url suffix
	 *
	 * @returns {string} resource path
	 */
	function getResourcePath(sResourceName, sSuffix) {

		let sNamePrefix = sResourceName;
		let p = sResourceName.length;

		// search for a registered name prefix, starting with the full name and successively removing one segment
		while ( p > 0 && !mUrlPrefixes[sNamePrefix] ) {
			p = sNamePrefix.lastIndexOf('/');
			// Note: an empty segment at p = 0 (leading slash) will be ignored
			sNamePrefix = p > 0 ? sNamePrefix.slice(0, p) : '';
		}

		assert((p > 0 || sNamePrefix === '') && mUrlPrefixes[sNamePrefix], "there always must be a mapping");

		let sPath = mUrlPrefixes[sNamePrefix].url + sResourceName.slice(p + 1); // also skips a leading slash!

		//remove trailing slash
		if ( sPath.slice(-1) === '/' ) {
			sPath = sPath.slice(0, -1);
		}
		return sPath + (sSuffix || '');

	}

	/**
	 * Returns the reporting mode for synchronous calls
	 *
	 * @returns {int} sync call behavior
	 */
	function getSyncCallBehavior() {
		return syncCallBehavior;
	}

	/**
	 * Try to find a resource name that would be mapped to the given URL.
	 *
	 * If multiple path mappings would create a match, the returned name is not necessarily
	 * the best (longest) match. The first match which is found, will be returned.
	 *
	 * When <code>bLoadedResourcesOnly</code> is set, only those resources will be taken
	 * into account for which content has been loaded already.
	 *
	 * @param {string} sURL URL to guess the resource name for
	 * @param {boolean} [bLoadedResourcesOnly=false] Whether the guess should be limited to already loaded resources
	 * @returns {string|undefined} Resource name or <code>undefined</code> if no matching name could be found
	 * @private
	 */
	function guessResourceName(sURL, bLoadedResourcesOnly) {
		// Make sure to have an absolute URL without query parameters or hash
		// to check against absolute prefix URLs
		sURL = pathOnly(resolveURL(sURL));

		for (const sNamePrefix in mUrlPrefixes) {

			// Note: configured URL prefixes are guaranteed to end with a '/'
			// But to support the legacy scenario promoted by the application tools ( "registerModulePath('Application','Application')" )
			// the prefix check here has to be done without the slash
			const sUrlPrefix = mUrlPrefixes[sNamePrefix].absoluteUrl.slice(0, -1);

			if ( sURL.startsWith(sUrlPrefix) ) {

				// calc resource name
				let sResourceName = sNamePrefix + sURL.slice(sUrlPrefix.length);
				// remove a leading '/' (occurs if name prefix is empty and if match was a full segment match
				if ( sResourceName.charAt(0) === '/' ) {
					sResourceName = sResourceName.slice(1);
				}

				if ( !bLoadedResourcesOnly || mModules[sResourceName]?.data != undefined ) {
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
		let p, mMap;
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

		const mMap = findMapForContext(sRequestingResourceName);

		// resolve relative names
		sResourceName = normalize(sResourceName, sRequestingResourceName);

		// if there's a map, search for the most specific matching entry
		if ( mMap != null ) {
			// start with the full ID and successively remove one segment
			let sPrefix = urnToIDAndType(sResourceName).id;
			let p = sPrefix.length;
			while ( p > 0 && mMap[sPrefix] == null ) {
				p = sPrefix.lastIndexOf('/');
				// Note: an empty segment at p = 0 (leading slash) will be ignored
				sPrefix = p > 0 ? sPrefix.slice(0, p) : '';
			}

			if ( p > 0 ) {
				const sMappedResourceName = mMap[sPrefix] + sResourceName.slice(p);
				if ( log.isLoggable() ) {
					log.debug(`module ID ${sResourceName} mapped to ${sMappedResourceName}`);
				}
				return sMappedResourceName; // also skips a leading slash!
			}
		}

		return sResourceName;
	}

	function getGlobalObject(oObject, aNames, l, bCreate) {
		for (let i = 0; oObject && i < l; i++) {
			if (!oObject[aNames[i]] && bCreate ) {
				oObject[aNames[i]] = {};
			}
			oObject = oObject[aNames[i]];
		}
		return oObject;
	}

	function getGlobalProperty(sName) {
		const aNames = sName ? sName.split(".") : [];

		if ( syncCallBehavior && aNames.length > 1 ) {
			log.error("[nosync] getGlobalProperty called to retrieve global name '" + sName + "'");
		}

		return getGlobalObject(__global, aNames, aNames.length);
	}

	function setGlobalProperty(sName, vValue) {
		const aNames = sName ? sName.split(".") : [];

		if ( aNames.length > 0 ) {
			const oObject = getGlobalObject(__global, aNames, aNames.length - 1, true);
			oObject[aNames[aNames.length - 1]] = vValue;
		}
	}

	// ---- Modules -------------------------------------------------------------------------------

	function wrapExport(value) {
		return { moduleExport: value };
	}

	function unwrapExport(wrapper) {
		return wrapper.moduleExport;
	}

	/**
	 * Module neither has been required nor preloaded nor declared, but someone asked for it.
	 */
	const INITIAL = 0,

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
	 * Each module has the following properties
	 * <ul>
	 * <li>{int} state one of the module states defined in this function</li>
	 * <li>{string} url URL where the module has been loaded from</li>
	 * <li>{any} data temp. raw content of the module (between loaded and ready or when preloaded)</li>
	 * <li>{string} group the bundle with which a resource was loaded or null</li>
	 * <li>{string} error an error description for state <code>FAILED</code></li>
	 * <li>{any} content the content of the module as exported via define()<(li>
	 * </ul>
	 */
	class Module {

		/**
		 * Creates a new Module.
		 *
		 * @param {string} name Name of the module, including extension
		 */
		constructor(name) {
			this.name = name;
			this.state = INITIAL;
			/*
			* Whether processing of the module is complete.
			* This is very similar to, but not the same as state >= READY because declareModule() sets state=READY very early.
			* That state transition is 'legacy' from the library-all files; it needs to be checked whether it can be removed.
			*/
			this.settled = false;
			this.url =
			this._deferred =
			this.data =
			this.group =
			this.error =
			this.pending = null;
			this.content = NOT_YET_DETERMINED;
		}

		deferred() {
			if ( this._deferred == null ) {
				const deferred = this._deferred = {};
				deferred.promise = new Promise(function(resolve,reject) {
					deferred.resolve = resolve;
					deferred.reject = reject;
				});
				// avoid 'Uncaught (in promise)' log entries
				deferred.promise.catch(noop);
			}
			return this._deferred;
		}

		api() {
			this._api ??= {
				id: this.name.slice(0,-3),
				exports: this._exports = {},
				url: this.url,
				config: noop
			};
			return this._api;
		}

		/**
		 * Sets the module state to READY and either determines the value or sets
		 * it from the given parameter.
		 * @param {any} value Module value
		 */
		ready(value) {
			// should throw, but some tests and apps would fail
			assert(!this.settled, `Module ${this.name} is already settled`);
			this.state = READY;
			this.settled = true;
			if ( arguments.length > 0 ) {
				// check arguments.length to allow a value of undefined
				this.content = value;
			}
			this.deferred().resolve(wrapExport(this.value()));
			if ( this.aliases ) {
				value = this.value();
				this.aliases.forEach((alias) => Module.get(alias).ready(value));
			}
		}

		failWith(msg, cause) {
			const err = makeModuleError(msg, this, cause);
			this.fail(err);
			return err;
		}

		fail(err) {
			// should throw, but some tests and apps would fail
			assert(!this.settled, `Module ${this.name} is already settled`);
			this.settled = true;
			if ( this.state !== FAILED ) {
				this.state = FAILED;
				this.error = err;
				this.deferred().reject(err);
				this.aliases?.forEach((alias) => Module.get(alias).fail(err));
			}
		}

		addPending(sDependency) {
			(this.pending ??= []).push(sDependency);
		}

		addAlias(sAliasName) {
			(this.aliases ??= []).push(sAliasName);
			// add this module as pending dependency to the original
			Module.get(sAliasName).addPending(this.name);
		}

		preload(url, data, bundle) {
			if ( this.state === INITIAL && !fnIgnorePreload?.(this.name) ) {
				this.state = PRELOADED;
				this.url = url;
				this.data = data;
				this.group = bundle;
			}
			return this;
		}

		/**
		 * Determines the value of this module.
		 *
		 * If the module hasn't been loaded or executed yet, <code>undefined</code> will be returned.
		 *
		 * @returns {any} Export of the module or <code>undefined</code>
		 * @private
		 */
		value() {
			if ( this.state === READY ) {
				if ( this.content === NOT_YET_DETERMINED ) {
					// Determine the module value lazily.
					// For AMD modules this has already been done on execution of the factory function.
					// For other modules that are required synchronously, it has been done after execution.
					// For the few remaining scenarios (like global scripts), it is done here
					const oShim = mShims[this.name],
						sExport = oShim && (Array.isArray(oShim.exports) ? oShim.exports[0] : oShim.exports);
					// best guess for thirdparty modules or legacy modules that don't use sap.ui.define
					this.content = getGlobalProperty( sExport || urnToUI5(this.name) );
				}
				return this.content;
			}

			return undefined;
		}

		/**
		 * Checks whether this module depends on the given module.
		 *
		 * When a module definition (define) is executed, the requested dependencies are added
		 * as 'pending' to the Module instance. This function checks if the oDependantModule is
		 * reachable from this module when following the pending dependency information.
		 *
		 * Note: when module aliases are introduced (all module definitions in a file use an ID that differs
		 * from the request module ID), then the alias module is also added as a "pending" dependency.
		 *
		 * @param {Module} oDependantModule Module which has a dependency to <code>oModule</code>
		 * @returns {boolean} Whether this module depends on the given one.
		 * @private
		 */
		dependsOn(oDependantModule) {
			const dependant = oDependantModule.name,
				visited = Object.create(null),
				stack = log.isLoggable() ? [this.name, dependant] : undefined;

			// log.debug("checking for a cycle between", this.name, "and", dependant);
			function visit(mod) {
				if ( !visited[mod] ) {
					// log.debug("  ", mod);
					visited[mod] = true;
					const pending = mModules[mod]?.pending;
					if (Array.isArray(pending) &&
						(pending.includes(dependant) || pending.some(visit)) ) {
						stack?.push(mod);
						return true;
					}
				}
				return false;
			}

			const result = this.name === dependant || visit(this.name);
			if ( result && stack ) {
				log.error("Dependency cycle detected: ",
					stack.reverse().map((entry, idx) => `${"".padEnd(idx)} -> ${entry}`).join("\n").slice(4)
				);
			}
			return result;
		}

		/**
		 * Find or create a module by its unified resource name.
		 *
		 * If the module doesn't exist yet, a new one is created in state INITIAL.
		 *
		 * @param {string} sModuleName Name of the module in URN syntax
		 * @returns {Module} Module with that name, newly created if it didn't exist yet
		 */
		static get(sModuleName) {
			const oModule = mModules[sModuleName] ??= new Module(sModuleName);
			return oModule;
		}

	}

	/*
	 * Determines the currently executing module.
	 */
	function getExecutingModule() {
		if ( _execStack.length > 0 ) {
			return _execStack[_execStack.length - 1].name;
		}
		return document.currentScript?.getAttribute("data-sap-ui-module");
	}

	// --------------------------------------------------------------------------------------------

	let _globalDefine,
		_globalDefineAMD;

	function updateDefineAndInterceptAMDFlag(newDefine) {

		// no change, do nothing
		if ( _globalDefine === newDefine ) {
			return;
		}

		// first cleanup on an old loader
		if ( _globalDefine ) {
			_globalDefine.amd = _globalDefineAMD;
			_globalDefine =
			_globalDefineAMD = undefined;
		}

		// remember the new define
		_globalDefine = newDefine;

		// intercept access to the 'amd' property of the new define, if it's not our own define
		if ( newDefine && !newDefine.ui5 ) {
			_globalDefineAMD = _globalDefine.amd;

			Object.defineProperty(_globalDefine, "amd", {
				get: function() {
					const sCurrentModule = getExecutingModule();
					if ( sCurrentModule && mShims[sCurrentModule]?.amd ) {
						log.debug(`suppressing define.amd for ${sCurrentModule}`);
						return undefined;
					}
					return _globalDefineAMD;
				},
				set: function(newDefineAMD) {
					_globalDefineAMD = newDefineAMD;
					log.debug(`define.amd became ${newDefineAMD ? "active" : "unset"}`);
				},
				configurable: true // we have to allow a redefine for debug mode or restart from CDN etc.
			});
		}
	}

	try {
		Object.defineProperty(__global, "define", {
			get: function() {
				return _globalDefine;
			},
			set: function(newDefine) {
				updateDefineAndInterceptAMDFlag(newDefine);
				log.debug(`define became ${newDefine ? "active" : "unset"}`);
			},
			configurable: true // we have to allow a redefine for debug mode or restart from CDN etc.
		});
	} catch (e) {
		log.warning("could not intercept changes to window.define, ui5loader won't be able to a change of the AMD loader");
	}

	updateDefineAndInterceptAMDFlag(__global.define);

	// --------------------------------------------------------------------------------------------

	function isModuleError(err) {
		return err?.name === "ModuleError";
	}

	/**
	 * Wraps the given 'cause' in a new error with the given message and with name 'ModuleError'.
	 *
	 * The new message and the message of the cause are combined. The stacktrace of the
	 * new error and of the cause are combined (with a separating 'Caused by').
	 *
	 * Instead of the final message string, a template is provided which can contain placeholders
	 * for the module ID ({id}) and module URL ({url}). Providing a template without concrete
	 * values allows to detect the repeated nesting of the same error. In such a case, only
	 * the innermost cause will be kept (affects both, stack trace as well as the cause property).
	 * The message, however, will contain the full chain of module IDs.
	 *
	 * @param {string} template Message string template with placeholders
	 * @param {Module} module Module for which the error occurred
	 * @param {Error} cause original error
	 * @returns {Error} New module error
	 */
	function makeModuleError(template, module, cause) {
		let modules = `'${module.name}'`;

		if (isModuleError(cause)) {
			// update the chain of modules (increasing the indent)
			modules += `\n -> ${cause._modules.replace(/ -> /g, "  -> ")}`;
			// omit repeated occurrences of the same kind of error
			if ( template === cause._template ) {
				cause = cause.cause;
			}
		}

		// create the message string from the template and the cause's message
		const message =
			template.replace(/\{id\}/, modules).replace(/\{url\}/, module.url)
			+ (cause ? ": " + cause.message : "");

		const error = new Error(message);
		error.name = "ModuleError";
		error.cause = cause;
		if ( cause?.stack ) {
			error.stack = error.stack + "\nCaused by: " + cause.stack;
		}
		// the following properties are only for internal usage
		error._template = template;
		error._modules = modules;
		return error;
	}

	function declareModule(sModuleName, fnDeprecationMessage) {
		// sModuleName must be a unified resource name of type .js
		assert(/\.js$/.test(sModuleName), "must be a Javascript module");

		const oModule = Module.get(sModuleName);

		if ( oModule.state > INITIAL ) {
			return oModule;
		}

		if ( log.isLoggable() ) {
			log.debug(`${sLogPrefix}declare module '${sModuleName}'`);
		}

		// avoid cycles
		oModule.state = READY;
		oModule.deprecation = fnDeprecationMessage || undefined;

		return oModule;
	}

	/**
	 * Define an already loaded module synchronously.
	 * Finds or creates a module by its unified resource name and resolves it with the given value.
	 *
	 * @param {string} sResourceName Name of the module in URN syntax
	 * @param {any} vValue Content of the module
	 */
	function defineModuleSync(sResourceName, vValue) {
		Module.get(sResourceName).ready(vValue);
	}

	/**
	 * Queue of modules for which sap.ui.define has been called (in async mode), but which have not been executed yet.
	 * When loading modules via script tag, only the onload handler knows the relationship between executed sap.ui.define calls and
	 * module name. It then resolves the pending modules in the queue. Only one entry can get the name of the module
	 * if there are more entries, then this is an error
	 *
	 * @param {boolean} [nested] Whether this is a nested queue used during sync execution of a module
	 */
	function ModuleDefinitionQueue(nested) {
		let aQueue = [],
			iRun = 0,
			vTimer;

		this.push = function(name, deps, factory, _export) {
			if ( log.isLoggable() ) {
				log.debug(sLogPrefix + "pushing define() call"
					+ (document.currentScript ? " from " + document.currentScript.src : "")
					+ " to define queue #" + iRun);
			}

			const sModule = document.currentScript?.getAttribute('data-sap-ui-module');
			aQueue.push({
				name: name,
				deps: deps,
				factory: factory,
				_export: _export,
				guess: sModule
			});

			// trigger queue processing via a timer in case the currently executing script is not managed by the loader
			if ( !vTimer && !nested && sModule == null ) {
				vTimer = setTimeout(this.process.bind(this, null, "timer"));
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
		 * Process the queue of module definitions, assuming that the original request was for
		 * <code>oRequestedModule</code>. If there is an unnamed module definition, it is assumed to be
		 * the one for the requested module.
		 *
		 * When called via timer, <code>oRequestedModule</code> will be undefined.
		 *
		 * @param {Module} [oRequestedModule] Module for which the current script was loaded.
		 * @param {string} [sInitiator] A string describing the caller of <code>process</code>
		 */
		this.process = function(oRequestedModule, sInitiator) {
			const bLoggable = log.isLoggable();
			const aQueueCopy = aQueue;
			const iCurrentRun = iRun++;
			let sModuleName = null;

			// clear the queue and timer early, we've already taken a copy of the queue
			this.clear();


			// if a module execution error was detected, stop processing the queue
			if ( oRequestedModule?.execError ) {
				if ( bLoggable ) {
					log.debug(`module execution error detected, ignoring queued define calls (${aQueueCopy.length})`);
				}
				oRequestedModule.fail(oRequestedModule.execError);
				return;
			}

			/*
			 * Name of the requested module, null when unknown or already consumed.
			 *
			 *  - when no module request is known (e.g. script was embedded in the page as an unmanaged script tag),
			 *    then no name is known and unnamed module definitions will be reported as an error
			 *  - multiple unnamed module definitions also are reported as an error
			 *  - when the name of a named module definition matches the name of requested module, the name is 'consumed'.
			 *    Any later unnamed module definition will be reported as an error, too
			 */
			sModuleName = oRequestedModule?.name;

			// check whether there's a module definition for the requested module
			aQueueCopy.forEach((oEntry) => {
				if ( oEntry.name == null ) {
					if ( sModuleName != null ) {
						oEntry.name = sModuleName;
						sModuleName = null;
					} else {
						// multiple modules have been queued, but only one module can inherit the name from the require call
						if ( strictModuleDefinitions ) {
							const oError = new Error(
								"Modules that use an anonymous define() call must be loaded with a require() call; " +
								"they must not be executed via script tag or nested into other modules. ");
							if ( oRequestedModule ) {
								oRequestedModule.fail(oError);
							} else {
								throw oError;
							}
						}
						// give anonymous modules a unique pseudo ID
						oEntry.name = `~anonymous~${++iAnonymousModuleCount}.js`;
						log.error(
							"Modules that use an anonymous define() call must be loaded with a require() call; " +
							"they must not be executed via script tag or nested into other modules. " +
							"All other usages will fail in future releases or when standard AMD loaders are used. " +
							"Now using substitute name " + oEntry.name);
					}
				} else if ( oRequestedModule && oEntry.name === oRequestedModule.name ) {
					if ( sModuleName == null && !strictModuleDefinitions ) {
						// if 'strictModuleDefinitions' is active, double execution will be reported anyhow
						log.error(
							"Duplicate module definition: both, an unnamed module and a module with the expected name exist." +
							"This use case will fail in future releases or when standard AMD loaders are used. ");
					}
					sModuleName = null;
				}
			});

			// if not, assign an alias if there's at least one queued module definition
			if ( sModuleName && aQueueCopy.length > 0 ) {
				if ( bLoggable ) {
					log.debug(
						"No queued module definition matches the ID of the request. " +
						`Now assuming that the first definition '${aQueueCopy[0].name}' is an alias of '${sModuleName}'`);
				}
				Module.get(aQueueCopy[0].name).addAlias(sModuleName);
				sModuleName = null;
			}

			if ( bLoggable ) {
				log.debug(sLogPrefix + "[" + sInitiator + "] "
					+ "processing define queue #" + iCurrentRun
					+ (oRequestedModule ? " for '" + oRequestedModule.name + "'" : "")
					+ ` with entries [${aQueueCopy.map((entry) => `'${entry.name}'`)}]`);
			}

			aQueueCopy.forEach((oEntry) => {
				// start to resolve the dependencies
				executeModuleDefinition(oEntry.name, oEntry.deps, oEntry.factory, oEntry._export, /* bAsync = */ true);
			});

			if ( sModuleName != null && !oRequestedModule.settled ) {
				// module name still not consumed, might be a non-UI5 module (e.g. in 'global' format)
				if ( bLoggable ) {
					log.debug(sLogPrefix + "no queued module definition for the requested module found, assume the module to be ready");
				}
				oRequestedModule.data = undefined; // allow GC
				oRequestedModule.ready(); // no export known, has to be retrieved via global name
			}

			if ( bLoggable ) {
				log.debug(sLogPrefix + `processing define queue #${iCurrentRun} done`);
			}
		};
	}

	let queue = new ModuleDefinitionQueue();

	/**
	 * Global event handler to detect script execution errors.
	 * @private
	 */
	window.addEventListener('error', function onUncaughtError(errorEvent) {
		var sModuleName = document.currentScript?.getAttribute('data-sap-ui-module');
		var oModule = sModuleName && Module.get(sModuleName);
		if ( oModule && oModule.execError == null ) {
			// if a currently executing module can be identified, attach the error to it and suppress reporting
			if ( log.isLoggable() ) {
				log.debug(`unhandled exception occurred while executing ${sModuleName}: ${errorEvent.message}`);
			}
			oModule.execError = errorEvent.error || {
				name: 'Error',
				message: errorEvent.message
			};
			return false;
		}
	});

	function loadScript(oModule, sAlternativeURL) {

		const oScript = document.createElement('SCRIPT');
		// Accessing the 'src' property of the script in this strange way prevents Safari 12 (or WebKit) from
		// wrongly optimizing access. SF12 seems to check at optimization time whether there's a setter for the
		// property and optimize accordingly. When a setter is defined or changed at a later point in time (e.g.
		// by the AppCacheBuster), then the optimization seems not to be updated and the new setter is ignored
		// BCP 1970035485
		oScript["s" + "rc"] = oModule.url;
		//oScript.src = oModule.url;
		oScript.setAttribute("data-sap-ui-module", oModule.name);

		function onload(e) {
			updateMaxTaskTime();
			if ( log.isLoggable() ) {
				log.debug(`JavaScript resource loaded: ${oModule.name}`);
			}
			oScript.removeEventListener('load', onload);
			oScript.removeEventListener('error', onerror);
			queue.process(oModule, "onload");
		}

		function onerror(e) {
			updateMaxTaskTime();
			oScript.removeEventListener('load', onload);
			oScript.removeEventListener('error', onerror);
			if (sAlternativeURL) {
				log.warning(`retry loading JavaScript resource: ${oModule.name}`);
				oScript?.parentNode?.removeChild(oScript);
				oModule.url = sAlternativeURL;
				loadScript(oModule, /* sAlternativeURL= */ null);
				return;
			}

			log.error(`failed to load JavaScript resource: ${oModule.name}`);
			oModule.failWith("failed to load {id} from {url}", new Error("script load error"));
		}

		if ( sAlternativeURL !== undefined ) {
			if ( mShims[oModule.name]?.amd ) {
				oScript.setAttribute("data-sap-ui-module-amd", "true");
			}
			oScript.addEventListener('load', onload);
			oScript.addEventListener('error', onerror);
		}
		document.head.appendChild(oScript);

	}

	/**
	 * If we have knowledge about the dependencies of the given module,
	 * we require them upfront, in parallel to the request for the module or
	 * its containing bundle.
	 *
	 * Note: a dependency is required even when it is in state PRELOADED already.
	 * Reason is that its transitive dependencies might not have been required yet.
	 */
	function requireDependenciesUpfront(sModuleName) {
		const knownDependencies = mDepCache[sModuleName];
		if ( Array.isArray(knownDependencies) ) {
			mDepCache[sModuleName] = undefined;
			const missingDeps = [];
			knownDependencies.forEach((dep) => {
				dep = getMappedName(dep, sModuleName);
				// even if a module is PRELOADED, its transitive dependencies might not
				if ( Module.get(dep).state <= INITIAL ) {
					missingDeps.push(dep);
				}
			});
			if ( missingDeps.length > 0 ) {
				log.info(`preload missing dependencies for ${sModuleName}: ${missingDeps}`);
				missingDeps.forEach((dep) => {
					if (/\.js$/.test(dep)) {
						// The resulting promise is ignored here intentionally.
						// Error handling will happen while module `sModuleName`` is processed
						requireModule(null, dep, /* always async */ true);
					} // else: TODO handle non-JS resources, e.g. link rel=prefetch
				});
			}
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
		 * @param {boolean} [bSkipShimDeps=false] Whether shim dependencies should be ignored (used by recursive calls)
		 * @param {boolean} [bSkipBundle=false] Whether bundle information should be ignored (used by recursive calls)
		 * @returns {any|Promise} Returns the module export in sync mode or a promise on it in async mode
		 * @throws {Error} When loading failed in sync mode
		 *
		 * @private
		 */
	function requireModule(oRequestingModule, sModuleName, _bAsync, bSkipShimDeps, bSkipBundle) {
		// only for robustness, should not be possible by design (all callers append '.js')
		const oSplitName = urnToBaseIDAndSubType(sModuleName);
		if ( !oSplitName ) {
			throw new Error(`can only require Javascript module, not ${sModuleName}`);
		}

		// Module names should not start with a "/"
		if (sModuleName[0] == "/") {
			log.error("Module names that start with a slash should not be used, as they are reserved for future use.");
		}

		const bLoggable = log.isLoggable();

		const oModule = Module.get(sModuleName);
		const oShim = mShims[sModuleName];

		if (oModule.deprecation) {
			const msg = typeof oModule.deprecation === "function" ? oModule.deprecation() : oModule.deprecation;
			log.error((oRequestingModule ? "(dependency of '" + oRequestingModule.name + "') " : "") + msg);
		}

		// when there's a shim with dependencies for the module
		// resolve them first before requiring the module again with bSkipShimDeps = true
		if ( oShim?.deps && !bSkipShimDeps ) {
			if ( bLoggable ) {
				log.debug("require dependencies of raw module " + sModuleName);
			}
			return requireAll(oModule, oShim.deps, function() {
				// set bSkipShimDeps to true to prevent endless recursion
				return requireModule(oRequestingModule, sModuleName, true, /* bSkipShimDeps = */ true, bSkipBundle);
			}, function(oErr) {
				// Note: in async mode, this 'throw' will reject the promise returned by requireAll
				throw oModule.failWith("Failed to resolve dependencies of {id}", oErr);
			}, true);
		}

		// when there's bundle information for the module
		// require the bundle first before requiring the module again with bSkipBundle = true
		if ( oModule.state === INITIAL && oModule.group && oModule.group !== sModuleName && !bSkipBundle ) {
			if ( log.isLoggable(/* INFO */ 3) && Module.get(oModule.group).state === INITIAL ) {
				log.info(`${sLogPrefix}require bundle '${oModule.group}' containing '${sModuleName}'`);
			}
			{
				const pResult = requireModule(null, oModule.group, true).catch(noop).then(function() {
					// set bSkipBundle to true to prevent endless recursion
					return requireModule(oRequestingModule, sModuleName, true, bSkipShimDeps, /* bSkipBundle = */ true);
				});
				// start loading of dependencies in parallel
				requireDependenciesUpfront(sModuleName);
				return pResult;
			}
		}

		if ( bLoggable ) {
			log.debug(sLogPrefix + "require '" + sModuleName + "'"
					+ (oRequestingModule ? " (dependency of '" + oRequestingModule.name + "')" : ""));
		}

		// check if module has been loaded already
		if ( oModule.state !== INITIAL ) {
			let bExecutedNow = false;

			if ( oModule.state === PRELOADED ) {
				oModule.state = LOADED;
				oModule.async = true;
				bExecutedNow = true;
				measure && measure.start(sModuleName, "Require module " + sModuleName + " (preloaded)", ["require"]);
				execModule(sModuleName, true);
				measure && measure.end(sModuleName);
			}

			if ( oModule.state === READY ) {
				if ( !bExecutedNow && bLoggable ) {
					log.debug(sLogPrefix + "module '" + sModuleName + "' has already been loaded (skipped).");
				}
				// Note: this intentionally does not return oModule.promise() as the export might be temporary in case of cycles
				// or it might have changed after repeated module execution
				return Promise.resolve(wrapExport(oModule.value()));
			} else if ( oModule.state === FAILED ) {
				return oModule.deferred().promise;
			} else {
				// break up cyclic dependencies
				if ( oRequestingModule && oModule.dependsOn(oRequestingModule) ) {
					if ( log.isLoggable() ) {
						log.debug("cycle detected between '" + oRequestingModule.name + "' and '" + sModuleName + "', returning undefined for '" + sModuleName + "'");
					}
					// Note: this must be a separate promise as the fulfillment is not the final one
					return Promise.resolve(wrapExport(undefined));
				}
				return oModule.deferred().promise;
			}
		}

		measure && measure.start(sModuleName, "Require module " + sModuleName, ["require"]);

		// set marker for loading modules (to break cycles)
		oModule.state = LOADING;
		oModule.async = true;

		// if debug is enabled, try to load debug module first
		const aExtensions = shouldLoadDebugVariant(sModuleName) ? ["-dbg", ""] : [""];

		{

			oModule.url = getResourcePath(oSplitName.baseID, aExtensions[0] + oSplitName.subType);
			// in debug mode, fall back to the non-dbg source, otherwise try the same source again (for SSO re-connect)
			const sAltUrl = aExtensions.length === 2 ? getResourcePath(oSplitName.baseID, aExtensions[1] + oSplitName.subType) : oModule.url;

			if ( log.isLoggable() ) {
				log.debug(sLogPrefix + "loading '" + sModuleName + "' from '" + oModule.url + "' (using <script>)");
			}

			// call notification hook only once
			ui5Require.load({ completeLoad:noop, async: true }, sAltUrl, oSplitName.baseID);
			loadScript(oModule, /* sAlternativeURL= */ sAltUrl);

			// process dep cache info, if this was not done already together with the bundle
			if ( !bSkipBundle ) {
				requireDependenciesUpfront(sModuleName);
			}

			return oModule.deferred().promise;
		}
	}

	/**
		 * Note: `sModuleName` must be a normalized resource name of type .js
		 * @private
		 */
	function execModule(sModuleName) {

		const oModule = mModules[sModuleName];

		if ( oModule && oModule.state === LOADED && typeof oModule.data !== "undefined" ) {

			const bLoggable = log.isLoggable();
			const bOldForceSyncDefines = bForceSyncDefines;
			const oOldQueue = queue;
			let sOldPrefix, sScript;

			try {

				bForceSyncDefines = false;
				queue = new ModuleDefinitionQueue(true);

				if ( bLoggable ) {
					if ( typeof oModule.data === "string" ) {
						log.warning(sLogPrefix + "executing '" + sModuleName + "' (using eval)");
					} else {
						log.debug(sLogPrefix + "executing '" + sModuleName + "'");
					}
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
					ui5Define.apply(null, oModule.data);
				} else {
					sScript = oModule.data;

					// sourceURL: Firebug, Chrome and Safari debugging help, appending the string seems to cost ZERO performance
					// Note: make URL absolute so Chrome displays the file tree correctly
					// Note: do not append if there is already a sourceURL / sourceMappingURL
					// Note: Safari fails, if sourceURL is the same as an existing XHR URL
					// Note: Chrome ignores debug files when the same URL has already been load via sourcemap of the bootstrap file (sap-ui-core)
					// Note: sourcemap annotations URLs in eval'ed sources are resolved relative to the page, not relative to the source
					if (sScript ) {
						const oMatch = /\/\/[#@] source(Mapping)?URL=(.*)$/.exec(sScript);
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

					// eval the source in the global context (preventing access to the closure of this function)
					__global.eval(sScript);
				}
				queue.process(oModule, "after eval");

			} catch (err) {
				oModule.data = undefined;
				if (isModuleError(err)) {
					// don't wrap a ModuleError again
					oModule.fail(err);
				} else {
					if (err instanceof SyntaxError && sScript) {
						// Module execution failed with a syntax error.
						// If in debug mode, load the script code again via script tag for better error reporting
						// (but without reacting to load/error events)
						if (fnIgnorePreload) {
							oModule.url = URL.createObjectURL(new Blob([sScript], {type: 'text/javascript'}));
							loadScript(oModule);
						} else {
							log.error("A syntax error occurred while evaluating '" + sModuleName + "'"
								+ ", restarting the app with sap-ui-debug=x might reveal the error location");
						}
					}
					oModule.failWith("Failed to execute {id}", err);
				}
			} finally {

				_execStack.pop();

				if ( bLoggable ) {
					sLogPrefix = sOldPrefix;
					log.debug(sLogPrefix + "finished executing '" + sModuleName + "'");
				}

				queue = oOldQueue;
				bForceSyncDefines = bOldForceSyncDefines;
			}
		}
	}

	/**
		 * @private
		 */
	function requireAll(oRequestingModule, aDependencies, fnCallback, fnErrCallback) {
		const aModules = [];
		let sBaseName,
			oError;

		try {
			// calculate the base name for relative module names
			if ( oRequestingModule instanceof Module ) {
				sBaseName = oRequestingModule.name;
			} else {
				sBaseName = oRequestingModule;
				oRequestingModule = null;
			}
			aDependencies = aDependencies.slice();
			for (let i = 0; i < aDependencies.length; i++) {
				aDependencies[i] = getMappedName(aDependencies[i] + '.js', sBaseName);
			}
			if ( oRequestingModule ) {
				// remember outgoing dependencies to be able to detect cycles, but ignore pseudo-dependencies
				aDependencies.forEach((dep) => {
					if ( !/^(require|exports|module)\.js$/.test(dep) ) {
						oRequestingModule.addPending(dep);
					}
				});
			}

			for (let i = 0; i < aDependencies.length; i++) {
				const sDepModName = aDependencies[i];
				if ( oRequestingModule ) {
					switch ( sDepModName ) {
					case 'require.js':
						// the injected local require should behave like the Standard require (2nd argument = true)
						aModules[i] = wrapExport(createContextualRequire(sBaseName, true));
						break;
					case 'module.js':
						aModules[i] = wrapExport(oRequestingModule.api());
						break;
					case 'exports.js':
						oRequestingModule.api();
						aModules[i] = wrapExport(oRequestingModule._exports);
						break;
					default:
						break;
					}
				}
				if ( !aModules[i] ) {
					aModules[i] = requireModule(oRequestingModule, sDepModName, true);
				}
			}

		} catch (err) {
			oError = err;
		}

		{
			const oPromise = oError ? Promise.reject(oError) : Promise.all(aModules);
			return oPromise.then(fnCallback, fnErrCallback);
		}
	}

	/**
		 * @private
		 */
	function executeModuleDefinition(sResourceName, aDependencies, vFactory) {
		const bLoggable = log.isLoggable();
		sResourceName = normalize(sResourceName);

		if ( bLoggable ) {
			log.debug(sLogPrefix + "define('" + sResourceName + "', " + "['" + aDependencies.join("','") + "']" + ")");
		}

		const oModule = declareModule(sResourceName);

		let repeatedExecutionReported = false;

		function shouldSkipExecution() {
			if ( oModule.settled ) {
				// avoid double execution of the module, e.g. when async/sync conflict occurred before queue processing
				if ( oModule.state >= READY && oModule.async === false ) {
					log.warning("Repeated module execution skipped after async/sync conflict for " + oModule.name);
					return true;
				}

				// when an inline module definition is executed repeatedly, this is reported but not prevented
				// Standard AMD loaders don't support this scenario, it needs to be fixed on caller side
				if ( strictModuleDefinitions ) {
					log.warning("Module '" + oModule.name + "' has been defined more than once. " +
							"All but the first definition will be ignored, don't try to define the same module again.");
					return true;
				}

				if ( !repeatedExecutionReported ) {
					log.error(
						"Module '" + oModule.name + "' is executed more than once. " +
						"This is an unsupported scenario and will fail in future versions of UI5 or " +
						"when a standard AMD loader is used. Don't define the same module again.");
					repeatedExecutionReported = true;
				}
			}
		}

		if ( shouldSkipExecution() ) {
			return;
		}

		// avoid early evaluation of the module value
		oModule.content = undefined;

		function onSuccess(aModules) {
			// avoid double execution of the module, e.g. when async/sync conflict occurred while waiting for dependencies
			if ( shouldSkipExecution() ) {
				return;
			}

			// factory
			if ( bLoggable ) {
				log.debug(sLogPrefix + "define('" + sResourceName + "'): dependencies resolved, calling factory " + typeof vFactory);
			}

			if ( typeof vFactory === 'function' ) {
				// from https://github.com/amdjs/amdjs-api/blob/master/AMD.md
				// "If the factory function returns a value (an object, function, or any value that coerces to true),
				//  then that value should be assigned as the exported value for the module."
				try {
					aModules = aModules.map(unwrapExport);
					let exports = vFactory.apply(__global, aModules);
					if ( oModule._api?.exports !== undefined && oModule._api.exports !== oModule._exports ) {
						exports = oModule._api.exports;
					} else if ( exports === undefined && oModule._exports ) {
						exports = oModule._exports;
					}
					oModule.content = exports;
				} catch (error) {
					oModule.failWith("failed to execute module factory for '{id}'", error);
					// Note: in async mode, the error is reported via the oModule's promise
					return;
				}
			} else {
				oModule.content = vFactory;
			}

			oModule.ready();
		}

		// Note: dependencies will be resolved and converted from RJS to URN inside requireAll
		requireAll(oModule, aDependencies, oModule.data ? scheduleExecution(onSuccess) : onSuccess, function(oErr) {
			oModule.failWith("Failed to resolve dependencies of {id}", oErr);
		}, true);

	}

	/**
		 * @private
		 */
	function ui5Define(sModuleName, aDependencies, vFactory) {
		let sResourceName;

		// optional id
		if ( typeof sModuleName === 'string' ) {
			sResourceName = sModuleName + '.js';
		} else {
			vFactory = aDependencies;
			aDependencies = sModuleName;
			sResourceName = null;
		}

		// optional array of dependencies
		if ( !Array.isArray(aDependencies) ) {
			vFactory = aDependencies;
			if ( typeof vFactory === 'function' && vFactory.length > 0 ) {
				aDependencies = ['require', 'exports', 'module'].slice(0, vFactory.length);
			} else {
				aDependencies = [];
			}
		}

		if ( bForceSyncDefines === false || (bForceSyncDefines == null) ) {
			queue.push(sResourceName, aDependencies, vFactory, false);
			if ( sResourceName != null ) {
				const oModule = Module.get(sResourceName);
				// change state of PRELOADED or INITIAL modules to prevent further requests/executions
				if ( oModule.state <= INITIAL ) {
					oModule.state = EXECUTING;
					oModule.async = true;
				}
			}
			return;
		}

		// immediate, synchronous execution
		const oCurrentExecInfo = _execStack.length > 0 ? _execStack[_execStack.length - 1] : null;
		if ( !sResourceName ) {

			if ( oCurrentExecInfo && !oCurrentExecInfo.used ) {
				sResourceName = oCurrentExecInfo.name;
				oCurrentExecInfo.used = true;
			} else {
				// give anonymous modules a unique pseudo ID
				sResourceName = `~anonymous~${++iAnonymousModuleCount}.js`;
				if ( oCurrentExecInfo ) {
					sResourceName = oCurrentExecInfo.name.slice(0, oCurrentExecInfo.name.lastIndexOf('/') + 1) + sResourceName;
				}
				log.error(
					"Modules that use an anonymous define() call must be loaded with a require() call; " +
					"they must not be executed via script tag or nested into other modules. " +
					"All other usages will fail in future releases or when standard AMD loaders are used " +
					"or when ui5loader runs in async mode. Now using substitute name " + sResourceName);
			}
		} else if ( oCurrentExecInfo?.used && sResourceName !== oCurrentExecInfo.name ) {
			log.debug(`module names don't match: requested: ${sModuleName}, defined: ${oCurrentExecInfo.name}`);
			Module.get(oCurrentExecInfo.name).addAlias(sModuleName);
		}
		executeModuleDefinition(sResourceName, aDependencies, vFactory, false, /* bAsync = */ false);

	}

	/**
	 * The amdDefine() function is closer to the AMD spec, as opposed to sap.ui.define.
	 * It's later assigned as the global define() if the loader is running in amd=true
	 * mode (has to be configured explicitly).
	 */
	function amdDefine(sModuleName, aDependencies, vFactory) {
		let oArgs = arguments;
		const bExportIsSet = typeof oArgs[oArgs.length - 1] === "boolean";

		// bExport parameter is proprietary and should not be used for an AMD compliant define()
		if (bExportIsSet) {
			oArgs = Array.prototype.slice.call(oArgs, 0, oArgs.length - 1);
		}

		ui5Define.apply(this, oArgs);
	}
	amdDefine.amd = {}; // identify as AMD-spec compliant loader
	amdDefine.ui5 = {}; // identify as ui5loader


	/**
	 * Create a require() function which acts in the context of the given resource.
	 *
	 * @param {string|null} sContextName Name of the context resource (module) in URN syntax, incl. extension
	 * @param {boolean} bAMDCompliance If set to true, the behavior of the require() function is closer to the AMD specification.
	 * @returns {function} Require function.
	 */
	function createContextualRequire(sContextName, bAMDCompliance) {
		const fnRequire = function(vDependencies, fnCallback, fnErrCallback) {
			assert(typeof vDependencies === 'string' || Array.isArray(vDependencies), "dependency param either must be a single string or an array of strings");
			assert(fnCallback == null || typeof fnCallback === 'function', "callback must be a function or null/undefined");
			assert(fnErrCallback == null || typeof fnErrCallback === 'function', "error callback must be a function or null/undefined");

			// Probing for existing module
			if ( typeof vDependencies === 'string' ) {
				const sModuleName = getMappedName(vDependencies + '.js', sContextName);
				const oModule = Module.get(sModuleName);

				if (oModule.deprecation) {
					const msg = typeof oModule.deprecation === "function" ? oModule.deprecation() : oModule.deprecation;
					log.error(msg);
				}

				// check the modules internal state
				// everything from PRELOADED to LOADED (incl. FAILED) is considered erroneous
				if (bAMDCompliance && oModule.state !== EXECUTING && oModule.state !== READY) {
					throw new Error(
						"Module '" + sModuleName + "' has not been loaded yet. " +
						"Use require(['" + sModuleName + "']) to load it."
					);
				}

				// Module is in state READY or EXECUTING; or require() was called from sap.ui.require().
				// A modules value might be undefined (no return statement) even though the state is READY.
				return oModule.value();
			}

			requireAll(sContextName, vDependencies, function(aModules) {
				aModules = aModules.map(unwrapExport);
				if ( typeof fnCallback === 'function' ) {
					fnCallback.apply(__global, aModules);
				}
			}, function(oErr) {
				if ( typeof fnErrCallback === 'function' ) {
					fnErrCallback.call(__global, oErr);
				} else {
					throw oErr;
				}
			}, true);

			// return undefined;
		};
		fnRequire.toUrl = function(sName) {
			const sMappedName = ensureTrailingSlash(getMappedName(sName, sContextName), sName);
			return toUrl(sMappedName);
		};
		return fnRequire;
	}

	function ensureTrailingSlash(sName, sInput) {
		//restore trailing slash
		if (sInput.slice(-1) === "/" && sName.slice(-1) !== "/") {
			return sName + "/";
		}
		return sName;
	}

	function toUrl(sName) {
		if (sName.indexOf("/") === 0) {
			throw new Error(`The provided argument '${sName}' may not start with a slash`);
		}
		return ensureTrailingSlash(getResourcePath(sName), sName);
	}

	/*
	 * UI5 version of require (sap.ui.require)
	 */
	const ui5Require = createContextualRequire(null, false);

	/*
	 * AMD version of require (window.require)
	 *
	 * Difference between require (sap.ui.require) and amdRequire (window.require):
	 * - require("my/module"), returns undefined if the module was not loaded yet
	 * - amdRequire("my/module"), throws an error if the module was not loaded yet
	 */
	const amdRequire = createContextualRequire(null, true);

	/**
		 * @private
		 */
	function predefine(sModuleName, aDependencies, vFactory) {
		if ( typeof sModuleName !== 'string' ) {
			throw new Error("predefine requires a module name");
		}
		sModuleName = normalize(sModuleName);
		Module.get(sModuleName + '.js').preload("<unknown>/" + sModuleName, [sModuleName, aDependencies, vFactory, false], null);
	}

	function preload(modules, group, url) {
		group = group || null;
		url = url || "<unknown>";
		for ( let name in modules ) {
			name = normalize(name);
			Module.get(name).preload(url + "/" + name, modules[name], group);
		}
	}

	/**
	 * Dumps information about the current set of modules and their state.
	 *
	 * @param {int} [iThreshold=-1] Earliest module state for which modules should be reported
	 * @private
	 */
	function dumpInternals(iThreshold) {

		const states = [PRELOADED, INITIAL, LOADED, READY, FAILED, EXECUTING, LOADING];
		const stateNames = {
			[PRELOADED]: 'PRELOADED',
			[INITIAL]:'INITIAL',
			[LOADING]: 'LOADING',
			[LOADED]: 'LOADED',
			[EXECUTING]: 'EXECUTING',
			[READY]: 'READY',
			[FAILED]: 'FAILED'
		};

		if ( iThreshold == null ) {
			iThreshold = PRELOADED;
		}

		/*eslint-disable no-console */
		const info = log.isLoggable('INFO') ? log.info.bind(log) : console.info.bind(console);
		/*eslint-enable no-console */

		const aModuleNames = Object.keys(mModules).sort();
		states.forEach((state) => {
			if ( state  < iThreshold ) {
				return;
			}
			let count = 0;
			info(stateNames[state] + ":");
			aModuleNames.forEach((sModule, idx) => {
				const oModule = mModules[sModule];
				if ( oModule.state === state ) {
					let addtlInfo;
					if ( oModule.state === LOADING ) {
						const pending = oModule.pending?.reduce((acc, dep) => {
							const oDepModule = Module.get(dep);
							if ( oDepModule.state !== READY ) {
								acc.push( dep + "(" + stateNames[oDepModule.state] + ")");
							}
							return acc;
						}, []);
						if ( pending?.length > 0 ) {
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
		const mUrlPrefixesCopy = Object.create(null);
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
		const aModules = [];

		if ( bPreloadGroup == null ) {
			bPreloadGroup = true;
		}

		if ( bPreloadGroup ) {
			// collect modules that belong to the given group
			for ( const sURN in mModules ) {
				const oModule = mModules[sURN];
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

		aModules.forEach((sURN) => {
			const oModule = mModules[sURN];
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
			name = guessResourceName(url, true);
		}
		const oModule = name && mModules[name];
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
		const mSnapshot = Object.create(null);
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
		const promise = requireModule(null, sResource, /* bAsync = */ true).then(unwrapExport);
		return bIgnoreErrors ? promise.catch(noop) : promise;
	}

	// ---- config --------------------------------------------------------------------------------

	const mUI5ConfigHandlers = {
		baseUrl(url) {
			registerResourcePath("", url);
		},
		paths: registerResourcePath, // has length 2
		shim(module, shim) {
			if ( Array.isArray(shim) ) {
				shim = { deps : shim };
			}
			mShims[module + '.js'] = shim;
		},
		amd(bValue) {
			bValue = !!bValue;
			if ( bExposeAsAMDLoader !== bValue ) {
				bExposeAsAMDLoader = bValue;
				if (bValue) {
					vOriginalDefine = __global.define;
					vOriginalRequire = __global.require;
					__global.define = amdDefine;
					__global.require = amdRequire;
				} else {
					__global.define = vOriginalDefine;
					__global.require = vOriginalRequire;
					// NOTE: Do not set async mode back to false when amd mode gets deactivated
				}
			}
		},
		async(async) {
			if (!async) {
				throw new Error("Changing the ui5loader config from async to sync is not supported. Only a change from sync to async is allowed.");
			}
		},
		bundles(bundle, modules) {
			bundle += '.js';
			modules.forEach(
				(module) => { Module.get(module + '.js').group = bundle; }
			);
		},
		bundlesUI5(bundle, resources) {
			resources.forEach(
				(module) => { Module.get(module).group = bundle; }
			);
		},
		debugSources(debug) {
			bDebugSources = !!debug;
		},
		depCache(module, deps) {
			mDepCache[module + '.js'] = deps.map((dep) => dep + '.js');
		},
		depCacheUI5(module, deps) {
			mDepCache[module] = deps;
		},
		ignoreBundledResources(filter) {
			if ( filter == null || typeof filter === 'function' ) {
				fnIgnorePreload = filter;
			}
		},
		map(context, map) {
			// @evo-todo ignore empty context, empty prefix?
			if ( map == null ) {
				delete mMaps[context];
			} else if ( typeof map === 'string' ) {
				// SystemJS style config
				mMaps['*'][context] = map;
			} else {
				mMaps[context] ||= Object.create(null);
				forEach(map, function(alias, name) {
					mMaps[context][alias] = name;
				});
			}
		},
		reportSyncCalls(report) {
			if ( report === 0 || report === 1 || report === 2 ) {
				syncCallBehavior = report;
			}
		},
		noConflict(bValue) {
			log.warning("Config option 'noConflict' has been deprecated, use option 'amd' instead, if still needed.");
			mUI5ConfigHandlers.amd(!bValue);
		}
	};

	/**
	 * Config handlers used when amd mode is enabled.
	 * References only methods defined in the AMD spec.
	 */
	const mAMDConfigHandlers = {
		baseUrl: mUI5ConfigHandlers.baseUrl,
		paths(module, url) {
			registerResourcePath(module, resolveURL(url, getResourcePath("") + "/"));
		},
		map: mUI5ConfigHandlers.map,
		shim: mUI5ConfigHandlers.shim
	};

	/**
	 * Executes all available handlers which are defined in the config object
	 *
	 * @param {object} oCfg config to handle
	 * @param {Object<string,function>} mHandlers all available handlers
	 */
	function handleConfigObject(oCfg, mHandlers) {

		function processConfig(key, value) {
			const handler = mHandlers[key];
			if ( typeof handler === 'function' ) {
				if ( handler.length === 1) {
					handler(value);
				} else if ( value != null ) {
					forEach(value, handler);
				}
			} else {
				log.warning(`configuration option ${key} not supported (ignored)`);
			}
		}

		// Make sure the 'baseUrl' handler is called first as
		// other handlers (e.g. paths) depend on it
		if (oCfg.baseUrl) {
			processConfig("baseUrl", oCfg.baseUrl);
		}

		forEach(oCfg, function(key, value) {
			// Ignore "baseUrl" here as it will be handled above
			if (key !== "baseUrl") {
				processConfig(key, value);
			}
		});
	}

	function ui5Config(cfg) {
		if ( cfg === undefined ) {
			return {
				amd: bExposeAsAMDLoader,
				async: true,
				noConflict: !bExposeAsAMDLoader // TODO needed?
			};
		}
		handleConfigObject(cfg, mUI5ConfigHandlers);
	}

	function amdConfig(cfg) {
		if ( cfg === undefined ) {
			return undefined;
		}
		handleConfigObject(cfg, mAMDConfigHandlers);
	}

	// expose preload function as property of sap.ui.require
	ui5Require.preload = preload;

	// @evo-todo really use this hook for loading. But how to differentiate between sync and async?
	// for now, it is only a notification hook to attach load tests
	ui5Require.load = function(context, url, id) {
	};

	const privateAPI = {
		// properties
		get assert() {
			return assert;
		},

		set assert(v) {
			assert = v;
		},

		get logger() {
			return log;
		},

		set logger(v) {
			log = v;
			aEarlyLogs.forEach(({level, message}) => log[level](message));
		},

		get measure() {
			return measure;
		},

		set measure(v) {
			measure = v;
		},

		get callbackInMicroTask() {
			return simulateAsyncCallback === executeInMicroTask;
		},

		set callbackInMicroTask(v) {
			simulateAsyncCallback = v ? executeInMicroTask : executeInSeparateTask;
		},

		get maxTaskDuration() {
			return iMaxTaskDuration;
		},

		set maxTaskDuration(v) {
			updateMaxTaskDuration(v);
		},

		// methods
		amdDefine,

		amdRequire,
		config: ui5Config,
		defineModuleSync,
		dump: dumpInternals,
		getAllModules,
		getModuleContent,

		getModuleState(sResourceName) {
			return mModules[sResourceName] ? mModules[sResourceName].state : INITIAL;
		},

		getResourcePath,
		getSyncCallBehavior,
		getUrlPrefixes,
		loadJSResourceAsync,
		resolveURL,
		guessResourceName,
		toUrl,
		unloadResources
	};


	// establish APIs in the sap.ui namespace

	/**
	 * Root namespace for JavaScript functionality provided by SAP SE.
	 *
	 * @version ${version}
	 * @namespace
	 * @public
	 * @name sap
	 */

	__global.sap = __global.sap || {};
	sap.ui = sap.ui || {};

	/**
	 * Provides access to UI5 loader configuration.
	 *
	 * The configuration is used by {@link sap.ui.require} and {@link sap.ui.define}.
	 *
	 * @public
	 * @namespace
	 * @ui5-global-only
	 */
	sap.ui.loader = {

		/**
		 * Sets the configuration for the UI5 loader. The configuration can be updated multiple times.
		 * Later changes do not impact modules that have been loaded before.
		 *
		 * If no parameter is given, a partial copy of UI5 loader configuration in use is returned.
		 *
		 * The configuration options are aligned with the "Common Config" draft of the AMD spec
		 * (https://github.com/amdjs/amdjs-api/blob/master/CommonConfig.md).
		 *
		 * The following code shows an example of what a UI5 loader configuration might look like:
		 * <pre>
		 *
		 *   sap.ui.loader.config({
		 *
		 *     // location from where to load all modules by default
		 *     baseUrl: '../../resources/',
		 *
		 *     paths: {
		 *       // load modules whose ID equals to or starts with 'my/module' from example.com
		 *       'my/module': 'https://example.com/resources/my/module'
		 *     },
		 *
		 *     map: {
		 *       // if any module requires 'sinon', load module 'sap/ui/thirdparty/sinon-4'
		 *       '*': {
		 *         'sinon': 'sap/ui/thirdparty/sinon-4'
		 *       },
		 *       // but if a module whose ID equals to or starts with 'app' requires 'sinon'
		 *       // then load a legacy version instead
		 *       "app": {
		 *         'sinon': 'sap/ui/legacy/sinon'
		 *       }
		 *     },
		 *
		 *     // define two bundles that consists of JS modules only
		 *     bundles: {
		 *       bundle1: ['module1', 'module2'],
		 *       bundle2: ['moduleX', 'moduleY']
		 *     },
		 *
		 *     // define a bundle that also contains non-JS resources
		 *     bundlesUI5: {
		 *       'all.js': ['Component.js', 'manifest.json',
		 *                  'App.controller.js', 'App.view.xml']
		 *     },
		 *
		 *     // activate real async loading and module definitions
		 *     async: true,
		 *
		 *     // provide dependency and export metadata for non-UI5 modules
		 *     shim: {
		 *       'sap/ui/thirdparty/blanket': {
		 *         amd: true,
		 *         exports: 'blanket'
		 *       }
		 *     }
		 *
		 *   });
		 *
		 * </pre>
		 *
		 * @param {object} [cfg]
		 *   The provided configuration gets merged with the UI5 loader configuration in use.
		 *   If <code>cfg</code> is omitted or <code>undefined</code>, a copy of the current configuration
		 *   gets returned, containing at least the properties <code>amd</code> and <code>async</code>.
		 *
		 * @param {string} [cfg.baseUrl='./']
		 *   Default location to load modules from. If none of the configured <code>paths</code> prefixes
		 *   matches a module ID, the module will be loaded from the concatenation of the <code>baseUrl</code>
		 *   and the module ID.
		 *
		 *   If the <code>baseUrl</code> itself is a relative URL, it is evaluated relative to <code>document.baseURI</code>.
		 *
		 * @param {Object.<string, string>} [cfg.paths]
		 *   A map of resource locations keyed by a corresponding module ID prefix.
		 *   When a module is to be loaded, the longest key in <code>paths</code> is searched that is a
		 *   prefix of the module ID. The module will be loaded from the concatenation of the corresponding
		 *   value in <code>paths</code> and the remainder of the module ID (after the prefix). If no entry
		 *   in <code>paths</code> matches, then the module will be loaded from the <code>baseUrl</code>.
		 *
		 *   The prefixes (keys) must not contain relative segments (./ or ../), a trailing slash will be
		 *   removed, and only full name segment matches are considered a match (prefix 'sap/m' does not
		 *   match a module ID 'sap/main').
		 *
		 *   <b>Note</b>: In contrast to the "Common Config" of the AMD spec, the paths (values in the map)
		 *   are interpreted relative to <code>document.baseURI</code>, not relative to <code>cfg.baseUrl</code>.
		 *
		 * @param {Object.<string, Object.<string, string>>} [cfg.map]
		 *   A map of maps that defines how to map module IDs to other module IDs (inner maps)
		 *   in the context of a specific set of modules (keys of outer map).
		 *
		 *   Each key of the outer map represents a module ID prefix that describes the context for which
		 *   its value (inner map) has to be used. The special key <code>*</code> describes the default
		 *   context which applies for any module. Only the most specific matching context will be taken
		 *   into account.
		 *
		 *   Each inner map maps a module ID or module ID prefix to another module ID or module ID prefix.
		 *   Again, only the most specific match is taken into account and only one mapping is evaluated
		 *   (the evaluation of the mappings is not done recursively).
		 *
		 *   Matches are always complete matches, a prefix 'a/b/c' does not match the module ID 'a/b/com'.
		 *
		 * @param {Object.<string, {amd: boolean, deps: string[], exports: (string|string[])}>} [cfg.shim]
		 *   Defines additional metadata for modules for which the normal behavior of the AMD APIs is
		 *   not sufficient.
		 *
		 *   A typical example are scripts that don't use <code>define</code> or <code>sap.ui.define</code>,
		 *   but export to a global name. With the <code>exports</code> property, one or more export
		 *   names can be specified, and the loader can retrieve the exported value after executing the
		 *   corresponding module. If such a module has dependencies, they can be specified in the
		 *   <code>deps</code> array and are loaded and executed before executing the module.
		 *
		 *   The <code>amd</code> flag of a shim is a ui5loader-specific extension of the standard AMD shims.
		 *   If set, the ui5loader hides a currently active AMD loader before executing the module
		 *   and restores it afterwards. Otherwise, it might miss the export of third party modules that
		 *   check for an AMD loader and register with it instead of exporting to a global name. A future
		 *   version of the ui5loader might ignore this flag when it acts as an AMD loader by itself.
		 *
		 *   <b>Note:</b> The ui5loader does not support the <code>init</code> option described by the
		 *   "Common Config" section of the AMD spec.
		 *
		 * @param {Object.<string, string[]>} [cfg.bundles]
		 *   A map of arrays that each define the modules contained in a bundle.
		 *
		 *   Each key of the map represents the module ID of a bundle file. The array value represents
		 *   the set of JavaScript modules (their module IDs) that are contained in the bundle.
		 *
		 *   When a module is required that has not been loaded yet, and for which a containing bundle is
		 *   known, that bundle will be required first. Only then the original module will be required
		 *   again and usually be taken from the just loaded bundle.
		 *
		 *   A bundle will be loaded asynchronously only when the loader is in asynchronous mode and when
		 *   the request for the contained module originates from an asynchronous API. In all other cases,
		 *   the bundle has to be loaded synchronously to fulfill API contracts.
		 *
		 *   <b>Note:</b> The loader only supports one containing bundle per module. If a module is declared
		 *   to be part of multiple bundles, only the last one will be taken into account.
		 *
		 *   This configuration option is basically provided to be compatible with requireJS or SystemJS
		 *   configuration.
		 *
		 * @param {Object.<string, string[]>} [cfg.bundlesUI5]
		 *   A map of arrays that each define the resources contained in a bundle.
		 *
		 *   This is similar to <code>bundles</code>, but all strings are unified resource names including
		 *   a file type extension, not only module IDs. This allows to represent more than just JavaScript
		 *   modules.
		 *
		 *   Each key of the map represents the resource name (in unified resource name syntax) of a bundle
		 *   file. The array value represents the set of resources (also in unified resource name syntax)
		 *   that are contained in the bundle. The array can contain JavaScript as well as other textual
		 *   resource types (e.g. *.xml or *.json resources).
		 *
		 *   When a module is required that has not been loaded yet, and for which a containing bundle is
		 *   known, that bundle will be required first. Only then the original module will be required
		 *   again and usually be taken from the just loaded bundle.
		 *
		 *   A bundle will be loaded asynchronously only when the loader is in asynchronous mode and when
		 *   the request for the contained module originates from an asynchronous API. In all other cases,
		 *   the bundle has to be loaded synchronously to fulfill API contracts.
		 *
		 *   <b>Note:</b> The loader only supports one containing bundle per module. If a module is declared
		 *   to be part of multiple bundles, only the last one will be taken into account.
		 *
		 *   <b>Note:</b> Although non-JS resources can be declared to be part of a bundle, only requests for
		 *   JavaScript modules will currently trigger the loading of a bundle.
		 *
		 * @param {boolean} [cfg.async=false]
		 *   When set to true, <code>sap.ui.require</code> loads modules asynchronously via script tags and
		 *   <code>sap.ui.define</code> executes asynchronously. To enable this feature, it is recommended to
		 *   set the attribute <code>data-sap-ui-async="true"</code> on the application bootstrap tag.
		 *
		 *   <b>Note:</b> Switching back from async to sync is not supported and trying to do so will throw
		 *   an <code>Error</code>
		 *
		 * @param {boolean} [cfg.amd=false]
		 *   When set to true, the ui5loader will overwrite the global properties <code>define</code>
		 *   and <code>require</code> with its own implementations. Any previously active AMD loader will
		 *   be remembered internally and can be restored by setting <code>amd</code> to false again.
		 *
		 *   <b>Note:</b> Switching to the <code>amd</code> mode, the ui5loader will set <code>async</code>
		 *   to true implicitly for activating asynchronous loading. Once the loading behaviour has been
		 *   defined to be asynchronous, it can not be changed to synchronous behaviour again, also not
		 *   via setting <code>amd</code> to false.
		 *
		 * @returns {{amd: boolean, async: boolean, noConflict: boolean}|undefined} UI5 loader configuration in use.
		 * @throws {Error} When trying to switch back from async mode to sync mode.
		 * @public
		 * @since 1.56.0
		 * @function
		 * @ui5-global-only
		 */
		config: ui5Config,

		/**
		 * Internal API of the UI5 loader.
		 *
		 * Must not be used by code outside sap.ui.core.
		 * @private
		 * @ui5-restricted sap.ui.core
		 */
		_: privateAPI
	};

	/**
	 * Sets the configuration of the ui5loader. The configuration can be updated multiple times.
	 * Later changes do not impact modules that have been loaded before.
	 *
	 * Setting the <code>amd</code> option of the sap.ui.loader.config to <code>true</code> is a
	 * prerequisite to use the <code>require.config</code> function
	 * (see {@link sap.ui.loader.config sap.ui.loader.config option amd}).
	 *
	 * The ui5loader acts more AMD compliant in relation to resolution of paths defined as
	 * part of the <code>paths</code> configuration option.
	 *
	 * @param {object} cfg The provided configuration gets merged with the UI5 loader configuration in use.
	 *
	 * @param {string} [cfg.baseUrl='./']
	 *   Default location to load modules from. If none of the configured <code>paths</code> prefixes
	 *   matches a module ID, the module will be loaded from the concatenation of the <code>baseUrl</code>
	 *   and the module ID.
	 *
	 *   If the <code>baseUrl</code> itself is a relative URL, it is evaluated relative to <code>document.baseURI</code>.
	 *
	 * @param {object} [cfg.paths]
	 *   A map of resource locations keyed by a corresponding module ID prefix.
	 *   When a module is to be loaded, the longest key in <code>paths</code> is searched that is a
	 *   prefix of the module ID. The module will be loaded from the concatenation of the corresponding
	 *   value in <code>paths</code> and the remainder of the module ID (after the prefix). If no entry
	 *   in <code>paths</code> matches, then the module will be loaded from the <code>baseUrl</code>.
	 *
	 *   The prefixes (keys) must not contain relative segments (./ or ../), a trailing slash will be
	 *   removed, and only full name segment matches are considered a match (prefix 'sap/m' does not
	 *   match a module ID 'sap/main').
	 *
	 *   <b>Note</b>: In contrast to the {@link sap.ui.loader.config sap.ui.loader.config option paths},
	 *   the paths (values in the map) are interpreted relative to <code>cfg.baseUrl</code>,
	 *   not relative to <code>document.baseURI</code>. The behaviour is exactly as described in the "Common Config" draft
	 *   of the AMD spec (https://github.com/amdjs/amdjs-api/blob/master/CommonConfig.md).
	 *
	 * @param {Object.<string, Object.<string, string>>} [cfg.map]
	 *   A map of maps that defines how to map module IDs to other module IDs (inner maps)
	 *   in the context of a specific set of modules (keys of outer map).
	 *
	 *   Each key of the outer map represents a module ID prefix that describes the context for which
	 *   its value (inner map) has to be used. The special key <code>*</code> describes the default
	 *   context which applies for any module. Only the most specific matching context will be taken
	 *   into account.
	 *
	 *   Each inner map maps a module ID or module ID prefix to another module ID or module ID prefix.
	 *   Again, only the most specific match is taken into account and only one mapping is evaluated
	 *   (the evaluation of the mappings is not done recursively).
	 *
	 *   Matches are always complete matches, a prefix 'a/b/c' does not match the module ID 'a/b/com'.
	 *
	 * @param {Object.<string, {deps: string[], exports: (string|string[])}>} [cfg.shim]
	 *   Defines additional metadata for modules for which the normal behavior of the AMD APIs is
	 *   not sufficient.
	 *
	 *   A typical example are scripts that don't use <code>define</code> or <code>sap.ui.define</code>,
	 *   but export to a global name. With the <code>exports</code> property, one or more export
	 *   names can be specified, and the loader can retrieve the exported value after executing the
	 *   corresponding module. If such a module has dependencies, they can be specified in the
	 *   <code>deps</code> array and are loaded and executed before executing the module.
	 *
	 *   <b>Note:</b> The ui5loader does not support the <code>init</code> option described by the
	 *   "Common Config" section of the AMD spec.
	 *
	 * @returns {undefined}
	 * @public
	 * @name require_config
	 * @function
	 */
	amdRequire.config = amdConfig;

	/**
	 * Defines a JavaScript module with its ID, its dependencies and a module export value or factory.
	 *
	 * The typical and only suggested usage of this method is to have one single, top level call to
	 * <code>sap.ui.define</code> in one JavaScript resource (file). When a module is requested by its
	 * module ID for the first time, the corresponding resource is determined from the ID and the current
	 * {@link sap.ui.loader.config configuration}. The resource will be loaded and executed
	 * which in turn will execute the top level <code>sap.ui.define</code> call.
	 *
	 * If the module ID was omitted from that call, it will be substituted by the ID that was used to
	 * request the module. As a preparation step, the dependencies as well as their transitive dependencies,
	 * will be loaded. Then, the module value (its export) will be determined: if a static value (object, literal)
	 * was given as <code>vFactory</code>, that value will be the module value. If a function was given, that
	 * function will be called (providing the module exports of the declared dependencies as parameters
	 * to the function) and its return value will be used as module export value. The framework internally
	 * associates the resulting value with the module ID and provides it to the original requester of the module.
	 * Whenever the module is requested again, the same export value will be returned (modules are executed only once).
	 *
	 * <i>Example:</i><br>
	 * The following example defines a module, but doesn't hard code the module ID.
	 * If stored in a file 'sap/mylib/SomeClass.js', it can be requested with the ID 'sap/mylib/SomeClass'.
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
	 * to load the sap/mylib/Something module and to work with it:
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
	 * the currently defined module depends on. All dependency modules are loaded before the export
	 * of the currently defined module is determined. The module export of each dependency module
	 * will be provided as a parameter to a factory function, the order of the parameters will match
	 * the order of the modules in the dependencies array.
	 *
	 * <b>Note:</b> The order in which the dependency modules are <i>executed</i> is <b>not</b>
	 * defined by the order in the dependencies array! The execution order is affected by dependencies
	 * <i>between</i> the dependency modules as well as by their current state (whether a module
	 * already has been loaded or not). Neither module implementations nor dependents that require
	 * a module set must make any assumption about the execution order (other than expressed by
	 * their dependencies).
	 *
	 * <b>Note:</b> A static module export (a literal provided to <code>sap.ui.define</code>) cannot
	 * depend on the module exports of the dependency modules as it has to be calculated before
	 * the dependencies are resolved. As an alternative, modules can define a factory function,
	 * calculate a static export value in that function, potentially based on the dependencies, and
	 * return the result as module export value. The same approach must be taken when the module
	 * export is supposed to be a function.
	 *
	 *
	 * <h3>Asynchronous Contract</h3>
	 *
	 * <code>sap.ui.define</code> is designed to support real Asynchronous Module Definitions (AMD)
	 * in future, although it internally still might use synchronous module loading, depending on
	 * configuration and context. However, callers of <code>sap.ui.define</code> must never rely on
	 * any synchronous behavior that they might observe in a specific test scenario.
	 *
	 * For example, callers of <code>sap.ui.define</code> must not use the module export value
	 * immediately after invoking <code>sap.ui.define</code>:
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
	 *
	 * </pre>
	 *
	 * Applications that need to ensure synchronous module definition or synchronous loading of dependencies
	 * <b>MUST</b> use the deprecated legacy APIs {@link jQuery.sap.declare} and {@link jQuery.sap.require}.
	 *
	 *
	 * <h3>(No) Global References</h3>
	 *
	 * To be in line with AMD best practices, modules defined with <code>sap.ui.define</code>
	 * should not make any use of global variables if those variables are also available as module
	 * exports. Instead, they should add dependencies to those modules and use the corresponding parameter
	 * of the factory function to access the module exports.
	 *
	 * As the current programming model and the documentation of UI5 heavily rely on global names,
	 * there will be a transition phase where UI5 enables AMD modules and local references to module
	 * exports in parallel to the old global names. The fourth parameter of <code>sap.ui.define</code>
	 * has been added to support that transition phase. When this parameter is set to true, the framework
	 * provides two additional features
	 *
	 * <ol>
	 * <li>Before the factory function is called, the existence of the global parent namespace for
	 *     the current module is ensured</li>
	 * <li>The module export returned by the module's factory function will be automatically exported
	 *     under the global name which is derived from the ID of the module</li>
	 * </ol>
	 *
	 * The parameter lets the framework know whether any of those two operations is needed or not.
	 * In future versions of UI5, a central configuration option is planned to suppress those 'exports'.
	 *
	 *
	 * <h3>Third Party Modules</h3>
	 * Although third party modules don't use UI5 APIs, they still can be listed as dependencies in
	 * a <code>sap.ui.define</code> call. They will be requested and executed like UI5 modules, but to
	 * make their exports available, so called <em>shims</em> have to be defined.
	 *
	 * Note that UI5 temporarily deactivates an existing AMD loader while it executes third party modules
	 * known to support AMD. This sounds contradictorily at a first glance as UI5 wants to support AMD,
	 * but for now it is necessary to fully support UI5 applications that rely on global names for such modules.
	 *
	 * For third-party modules that UI5 delivers (e.g. those in namespace <code>sap/ui/thirdparty/</code>),
	 * the necessary shims are defined by UI5 itself by executing the private module <code>ui5loader-autoconfig.js</code>
	 * during bootstrap.
	 *
	 * Example:
	 * <pre>
	 *   // module 'Something' wants to use third party library 'URI.js'
	 *   // It is packaged by UI5 as non-UI5-module 'sap/ui/thirdparty/URI'
	 *   // the following shim helps UI5 to correctly load URI.js and to retrieve the module's export value
	 *   // Apps don't have to define that shim, it is already applied by ui5loader-autoconfig.js
	 *   sap.ui.loader.config({
	 *     shim: {
	 *       'sap/ui/thirdparty/URI': {
	 *          amd: true, // URI.js reacts on an AMD loader, this flag lets UI5 temp. disable such loaders
	 *          exports: 'URI' // name of the global variable under which URI.js exports its module value
	 *       }
	 *     }
	 *   });
	 *
	 *   // now the module can be retrieved like other modules
	 *   sap.ui.define('Something', ['sap/ui/thirdparty/URI'], function(URIModuleValue) {
	 *
	 *     new URIModuleValue(...); // same as the global 'URI' name: new URI(...)
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
	 * namespace, even when an AMD loader is present (as e.g. jQuery does) or when a shim is
	 * defined for them using the <code>amd:true</code> flag (see example above)</li>
	 * <li>Depending on configuration and the current context, <code>sap.ui.define</code> loads
	 * the dependencies of a module either synchronously using a sync XHR call + eval or asynchronously
	 * via script tags. The sync loading is basically a tribute to the synchronous history of UI5.
	 * There's no way for a module developer to enforce synchronous loading of the dependencies and
	 * on the long run, sync loading will be faded out.
	 * Applications that need to ensure synchronous loading of dependencies <b>MUST</b> use the
	 * deprecated legacy APIs like {@link jQuery.sap.require}.</li>
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
	 * <h3>Restrictions, Design Considerations</h3>
	 * <ul>
	 * <li><b>Restriction</b>: as dependency management is not supported for Non-UI5 modules, the only way
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
	 *     part of the API contract</li>
	 * </ul>
	 * @param {string} [sModuleName] ID of the module in simplified resource name syntax.
	 *        When omitted, the loader determines the ID from the request.
	 * @param {string[]} [aDependencies] List of dependencies of the module
	 * @param {function|any} vFactory The module export value or a function that calculates that value
	 * @param {boolean} [bExport] Whether an export to global names is required - should be used by SAP-owned code only
	 * @since 1.27.0
	 * @public
	 * @see https://github.com/amdjs/amdjs-api
	 * @function
	 * @ui5-global-only
	 */
	sap.ui.define = ui5Define;

	/**
	 * @private
	 * @ui5-restricted bundles created with UI5 tooling
	 * @function
	 * @ui5-global-only
	 */
	sap.ui.predefine = predefine;

	/**
	 * Resolves one or more module dependencies.
	 *
	 * <h3>Synchronous Retrieval of a Single Module Export Value (Probing)</h3>
	 *
	 * When called with a single string, that string is assumed to be the ID of an already loaded
	 * module and the export of that module is returned. If the module has not been loaded yet,
	 * or if it is a Non-UI5 module (e.g. third-party module) without a shim, <code>undefined</code>
	 * is returned.
	 *
	 * This signature variant allows synchronous access to module exports without initiating module loading.
	 *
	 * Sample:
	 * <pre>
	 *   var JSONModel = sap.ui.require("sap/ui/model/json/JSONModel");
	 * </pre>
	 *
	 * For modules that are known to be UI5 modules, this signature variant can be used to check whether
	 * the module has been loaded.
	 *
	 *
	 * <h3>Asynchronous Loading of Multiple Modules</h3>
	 *
	 * If an array of strings is given and (optionally) a callback function, then the strings
	 * are interpreted as module IDs and the corresponding modules (and their transitive
	 * dependencies) are loaded. Then the callback function will be called asynchronously.
	 * The module exports of the specified modules will be provided as parameters to the callback
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
	 * @param {string|string[]} vDependencies Dependency (dependencies) to resolve
	 * @param {function} [fnCallback] Callback function to execute after resolving an array of dependencies
	 * @param {function(Error)} [fnErrback] Callback function to execute if an error was detected while loading the
	 *                      dependencies or executing the factory function. Note that due to browser restrictions
	 *                      not all errors will be reported via this callback. In general, module loading is
	 *                      designed for the non-error case. Error handling is not complete.
	 * @returns {any|undefined} A single module export value (sync probing variant) or <code>undefined</code> (async loading variant)
	 * @public
	 * @function
	 * @ui5-global-only
	 */
	sap.ui.require = ui5Require;

	/**
		 * Calculates a URL from the provided resource name.
		 *
		 * The calculation takes any configured ID mappings or resource paths into account
		 * (see {@link sap.ui.loader.config config options map and paths}. It also supports relative
		 * segments such as <code>./</code> and <code>../</code> within the path, but not at its beginning.
		 * If relative navigation would cross the root namespace (e.g. <code>sap.ui.require.toUrl("../")</code>)
		 * or when the resource name starts with a slash or with a relative segment, an error is thrown.
		 *
		 * <b>Note:</b> <code>toUrl</code> does not resolve the returned URL; whether it is an absolute
		 * URL or a relative URL depends on the configured <code>baseUrl</code> and <code>paths</code>.
		 *
		 * @example
		 *   sap.ui.loader.config({
		 *     baseUrl: "/home"
		 *   });
		 *
		 *   sap.ui.require.toUrl("app/data")              === "/home/app/data"
		 *   sap.ui.require.toUrl("app/data.json")         === "/home/app/data.json"
		 *   sap.ui.require.toUrl("app/data/")             === "/home/app/data/"
		 *   sap.ui.require.toUrl("app/.config")           === "/home/app/.config"
		 *   sap.ui.require.toUrl("app/test/../data.json") === "/home/data.json"
		 *   sap.ui.require.toUrl("app/test/./data.json")  === "/home/test/data.json"
		 *   sap.ui.require.toUrl("app/../../data")        throws Error because root namespace is left
		 *   sap.ui.require.toUrl("/app")                  throws Error because first character is a slash
		 *
		 * @param {string} sName Name of a resource e.g. <code>'app/data.json'</code>
		 * @returns {string} Path to the resource, e.g. <code>'/home/app/data.json'</code>
		 * @see https://github.com/amdjs/amdjs-api/wiki/require#requiretourlstring-
		 * @throws {Error} If the input name is absolute (starts with a slash character <code>'/'</code>),
		 *   starts with a relative segment or if resolving relative segments would cross the root
		 *   namespace
		 * @public
		 * @name sap.ui.require.toUrl
		 * @function
		 * @ui5-global-only
		 */
}(globalThis));
