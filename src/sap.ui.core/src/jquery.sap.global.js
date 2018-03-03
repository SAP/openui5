/*!
 * ${copyright}
 */

/*global ActiveXObject, alert, confirm, console, document, ES6Promise, localStorage, jQuery, performance, URI, Promise, XMLHttpRequest, Proxy */

/**
 * Provides base functionality of the SAP jQuery plugin as extension of the jQuery framework.<br/>
 * See also <a href="http://api.jquery.com/jQuery/">jQuery</a> for details.<br/>
 * Although these functions appear as static ones, they are meant to be used on jQuery instances.<br/>
 * If not stated differently, the functions follow the fluent interface paradigm and return the jQuery instance for chaining of statements.
 *
 * Example for usage of an instance method:
 * <pre>
 *   var oRect = jQuery("#myDiv").rect();
 *   alert("Top Position: " + oRect.top);
 * </pre>
 *
 * @namespace jQuery
 * @public
 */

(function(jQuery, Device, window) {
	"use strict";

	if ( !jQuery ) {
		throw new Error("Loading of jQuery failed");
	}

	// ensure not to initialize twice
	if (jQuery.sap) {
		return;
	}

	// The native Promise in MS Edge and Apple Safari is not fully compliant with the ES6 spec for promises.
	// MS Edge executes callbacks as tasks, not as micro tasks (see https://connect.microsoft.com/IE/feedback/details/1658365).
	// We therefore enforce the use of the es6-promise polyfill also in MS Edge and Safari, which works properly.
	// @see jQuery.sap.promise
	if (Device.browser.edge || Device.browser.safari) {
		window.Promise = undefined; // if not unset, the polyfill assumes that the native Promise is fine
	}

	// Enable promise polyfill if native promise is not available
	if (!window.Promise) {
		ES6Promise.polyfill();
	}

	// early logging support
	var _earlyLogs = [];
	function _earlyLog(sLevel, sMessage) {
		_earlyLogs.push({
			level: sLevel,
			message: sMessage
		});
	}

	/**
	 * Resolves the given url relative to the given base or relative to the document base
	 * if base is <code>undefined</code>. If the document base is used, its query parameters
	 * will be suppressed.
	 *
	 * @param {string} url URL to resolve
	 * @param {string} [base=document.baseURI] Base URL (optional)
	 * @returns {string} Absolute URL
	 */
	function resolveURL(url, base) {
		if ( base === undefined ) {
			base = new URI(document.baseURI).search(""); // suppress query portion of document base
		}
		return new URI(url, base).toString();
	}

	var _sBootstrapUrl;

	// -------------------------- VERSION -------------------------------------

	var rVersion = /^[0-9]+(?:\.([0-9]+)(?:\.([0-9]+))?)?(.*)$/;

	/**
	 * Returns a Version instance created from the given parameters.
	 *
	 * This function can either be called as a constructor (using <code>new</code>) or as a normal function.
	 * It always returns an immutable Version instance.
	 *
	 * The parts of the version number (major, minor, patch, suffix) can be provided in several ways:
	 * <ul>
	 * <li>Version("1.2.3-SNAPSHOT")    - as a dot-separated string. Any non-numerical char or a dot followed
	 *                                    by a non-numerical char starts the suffix portion. Any missing major,
	 *                                    minor or patch versions will be set to 0.</li>
	 * <li>Version(1,2,3,"-SNAPSHOT")   - as individual parameters. Major, minor and patch must be integer numbers
	 *                                    or empty, suffix must be a string not starting with digits.</li>
	 * <li>Version([1,2,3,"-SNAPSHOT"]) - as an array with the individual parts. The same type restrictions apply
	 *                                    as before.</li>
	 * <li>Version(otherVersion)        - as a Version instance (cast operation). Returns the given instance instead
	 *                                    of creating a new one.</li>
	 * </ul>
	 *
	 * To keep the code size small, this implementation mainly validates the single string variant.
	 * All other variants are only validated to some degree. It is the responsibility of the caller to
	 * provide proper parts.
	 *
	 * @param {int|string|any[]|jQuery.sap.Version} vMajor the major part of the version (int) or any of the single
	 *        parameter variants explained above.
	 * @param {int} iMinor the minor part of the version number
	 * @param {int} iPatch the patch part of the version number
	 * @param {string} sSuffix the suffix part of the version number
	 * @return {jQuery.sap.Version} the version object as determined from the parameters
	 *
	 * @class Represents a version consisting of major, minor, patch version and suffix, e.g. '1.2.7-SNAPSHOT'.
	 *
	 * @public
	 * @since 1.15.0
	 * @alias jQuery.sap.Version
	 */
	function Version(vMajor, iMinor, iPatch, sSuffix) {
		if ( vMajor instanceof Version ) {
			// note: even a constructor may return a value different from 'this'
			return vMajor;
		}
		if ( !(this instanceof Version) ) {
			// act as a cast operator when called as function (not as a constructor)
			return new Version(vMajor, iMinor, iPatch, sSuffix);
		}

		var m;
		if (typeof vMajor === "string") {
			m = rVersion.exec(vMajor);
		} else if (Array.isArray(vMajor)) {
			m = vMajor;
		} else {
			m = arguments;
		}
		m = m || [];

		function norm(v) {
			v = parseInt(v,10);
			return isNaN(v) ? 0 : v;
		}
		vMajor = norm(m[0]);
		iMinor = norm(m[1]);
		iPatch = norm(m[2]);
		sSuffix = String(m[3] || "");

		/**
		 * Returns a string representation of this version.
		 *
		 * @return {string} a string representation of this version.
		 * @public
		 * @since 1.15.0
		 */
		this.toString = function() {
			return vMajor + "." + iMinor + "." + iPatch + sSuffix;
		};

		/**
		 * Returns the major version part of this version.
		 *
		 * @return {int} the major version part of this version
		 * @public
		 * @since 1.15.0
		 */
		this.getMajor = function() {
			return vMajor;
		};

		/**
		 * Returns the minor version part of this version.
		 *
		 * @return {int} the minor version part of this version
		 * @public
		 * @since 1.15.0
		 */
		this.getMinor = function() {
			return iMinor;
		};

		/**
		 * Returns the patch (or micro) version part of this version.
		 *
		 * @return {int} the patch version part of this version
		 * @public
		 * @since 1.15.0
		 */
		this.getPatch = function() {
			return iPatch;
		};

		/**
		 * Returns the version suffix of this version.
		 *
		 * @return {string} the version suffix of this version
		 * @public
		 * @since 1.15.0
		 */
		this.getSuffix = function() {
			return sSuffix;
		};

		/**
		 * Compares this version with a given one.
		 *
		 * The version with which this version should be compared can be given as a <code>jQuery.sap.Version</code> instance,
		 * as a string (e.g. <code>v.compareto("1.4.5")</code>). Or major, minor, patch and suffix values can be given as
		 * separate parameters (e.g. <code>v.compareTo(1, 4, 5)</code>) or in an array (e.g. <code>v.compareTo([1, 4, 5])</code>).
		 *
		 * @return {int} 0, if the given version is equal to this version, a negative value if the given other version is greater
		 *               and a positive value otherwise
		 * @public
		 * @since 1.15.0
		 */
		this.compareTo = function() {
			var vOther = Version.apply(window, arguments);
			/*eslint-disable no-nested-ternary */
			return vMajor - vOther.getMajor() ||
					iMinor - vOther.getMinor() ||
					iPatch - vOther.getPatch() ||
					((sSuffix < vOther.getSuffix()) ? -1 : (sSuffix === vOther.getSuffix()) ? 0 : 1);
			/*eslint-enable no-nested-ternary */
		};

	}

	/**
	 * Checks whether this version is in the range of the given interval (start inclusive, end exclusive).
	 *
	 * The boundaries against which this version should be checked can be given as  <code>jQuery.sap.Version</code>
	 * instances (e.g. <code>v.inRange(v1, v2)</code>), as strings (e.g. <code>v.inRange("1.4", "2.7")</code>)
	 * or as arrays (e.g. <code>v.inRange([1,4], [2,7])</code>).
	 *
	 * @param {string|any[]|jQuery.sap.Version} vMin the start of the range (inclusive)
	 * @param {string|any[]|jQuery.sap.Version} vMax the end of the range (exclusive)
	 * @return {boolean} <code>true</code> if this version is greater or equal to <code>vMin</code> and smaller
	 *                   than <code>vMax</code>, <code>false</code> otherwise.
	 * @public
	 * @since 1.15.0
	 */
	Version.prototype.inRange = function(vMin, vMax) {
		return this.compareTo(vMin) >= 0 && this.compareTo(vMax) < 0;
	};

	// -----------------------------------------------------------------------

	var oJQVersion = Version(jQuery.fn.jquery);
	if ( oJQVersion.compareTo("2.2.3") != 0 ) {
		// if the loaded jQuery version isn't SAPUI5's default version -> notify
		// the application
		_earlyLog("warning", "SAPUI5's default jQuery version is 2.2.3; current version is " + jQuery.fn.jquery + ". Please note that we only support version 2.2.3.");
	}

	// TODO move to a separate module? Only adds 385 bytes (compressed), but...
	if ( !jQuery.browser ) {
		// re-introduce the jQuery.browser support if missing (jQuery-1.9ff)
		jQuery.browser = (function( ua ) {

			var rwebkit = /(webkit)[ \/]([\w.]+)/,
				ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/,
				rmsie = /(msie) ([\w.]+)/,
				rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/,
				ua = ua.toLowerCase(),
				match = rwebkit.exec( ua ) ||
					ropera.exec( ua ) ||
					rmsie.exec( ua ) ||
					ua.indexOf("compatible") < 0 && rmozilla.exec( ua ) ||
					[],
				browser = {};

			if ( match[1] ) {
				browser[ match[1] ] = true;
				browser.version = match[2] || "0";
				if ( browser.webkit ) {
					browser.safari = true;
				}
			}

			return browser;

		}(window.navigator.userAgent));
	}

	// XHR overrides for IE
	if ( Device.browser.msie ) {

		// Fixes the CORS issue (introduced by jQuery 1.7) when loading resources
		// (e.g. SAPUI5 script) from other domains for IE browsers.
		// The CORS check in jQuery filters out such browsers who do not have the
		// property "withCredentials" which is the IE and Opera and prevents those
		// browsers to request data from other domains with jQuery.ajax. The CORS
		// requests are simply forbidden nevertheless if it works. In our case we
		// simply load our script resources from another domain when using the CDN
		// variant of SAPUI5. The following fix is also recommended by jQuery:
		jQuery.support = jQuery.support || {};
		jQuery.support.cors = true;

		// Fixes XHR factory issue (introduced by jQuery 1.11). In case of IE
		// it uses by mistake the ActiveXObject XHR. In the list of XHR supported
		// HTTP methods PATCH and MERGE are missing which are required for OData.
		// The related ticket is: #2068 (no downported to jQuery 1.x planned)
		// the fix will only be applied to jQuery >= 1.11.0 (only for jQuery 1.x)
		if ( window.ActiveXObject !== undefined && oJQVersion.inRange("1.11", "2") ) {
			var fnCreateStandardXHR = function() {
				try {
					return new XMLHttpRequest();
				} catch (e) { /* ignore */ }
			};
			var fnCreateActiveXHR = function() {
				try {
					return new ActiveXObject("Microsoft.XMLHTTP");
				} catch (e) { /* ignore */ }
			};
			jQuery.ajaxSettings = jQuery.ajaxSettings || {};
			jQuery.ajaxSettings.xhr = function() {
				return !this.isLocal ? fnCreateStandardXHR() : fnCreateActiveXHR();
			};
		}

	}

	//getComputedStyle polyfill for firefox
	if ( Device.browser.firefox ) {
		var fnGetComputedStyle = window.getComputedStyle;
		window.getComputedStyle = function(element, pseudoElt){
			var oCSS2Style = fnGetComputedStyle.call(this, element, pseudoElt);
			if (oCSS2Style === null) {
				//Copy StyleDeclaration of document.body
				return document.body.cloneNode(false).style;
			}
			return oCSS2Style;
		};
	}

	// XHR proxy for Firefox
	if ( Device.browser.firefox && window.Proxy ) {

		// Firefox has an issue with synchronous and asynchronous requests running in parallel,
		// where callbacks of the asynchronous call are executed while waiting on the synchronous
		// response, see https://bugzilla.mozilla.org/show_bug.cgi?id=697151
		// In UI5 in some cases it happens that application code is running, while the class loading
		// is still in process, so classes cannot be found. To overcome this issue we create a proxy
		// of the XHR object, which delays execution of the asynchronous event handlers, until
		// the synchronous request is completed.
		(function() {
			var bSyncRequestOngoing = false,
				bPromisesQueued = false;

			// Overwrite setTimeout and Promise handlers to delay execution after
			// synchronous request is completed
			var _then = Promise.prototype.then,
				_catch = Promise.prototype.catch,
				_timeout = window.setTimeout,
				_interval = window.setInterval,
				aQueue = [];
			function addPromiseHandler(fnHandler) {
				// Collect all promise handlers and execute within the same timeout,
				// to avoid them to be split among several tasks
				if (!bPromisesQueued) {
					bPromisesQueued = true;
					_timeout(function() {
						var aCurrentQueue = aQueue;
						aQueue = [];
						bPromisesQueued = false;
						aCurrentQueue.forEach(function(fnQueuedHandler) {
							fnQueuedHandler();
						});
					}, 0);
				}
				aQueue.push(fnHandler);
			}
			function wrapPromiseHandler(fnHandler, oScope, bCatch) {
				if (typeof fnHandler !== "function") {
					return fnHandler;
				}
				return function() {
					var aArgs = Array.prototype.slice.call(arguments);
					// If a sync request is ongoing or other promises are still queued,
					// the execution needs to be delayed
					if (bSyncRequestOngoing || bPromisesQueued) {
						return new Promise(function(resolve, reject) {
							// The try catch is needed to differentiate whether resolve or
							// reject needs to be called.
							addPromiseHandler(function() {
								var oResult;
								try {
									oResult = fnHandler.apply(window, aArgs);
									resolve(oResult);
								} catch (oException) {
									reject(oException);
								}
							});
						});
					}
					return fnHandler.apply(window, aArgs);
				};
			}
			/*eslint-disable no-extend-native*/
			Promise.prototype.then = function(fnThen, fnCatch) {
				var fnWrappedThen = wrapPromiseHandler(fnThen),
					fnWrappedCatch = wrapPromiseHandler(fnCatch);
				return _then.call(this, fnWrappedThen, fnWrappedCatch);
			};
			Promise.prototype.catch = function(fnCatch) {
				var fnWrappedCatch = wrapPromiseHandler(fnCatch);
				return _catch.call(this, fnWrappedCatch);
			};
			/*eslint-enable no-extend-native*/

			// If there are promise handlers waiting for execution at the time the
			// timeout fires, start another timeout to postpone timer execution after
			// promise execution.
			function wrapTimerHandler(fnHandler) {
				var fnWrappedHandler = function() {
					var aArgs;
					if (bPromisesQueued) {
						aArgs = [fnWrappedHandler, 0].concat(arguments);
						_timeout.apply(window, aArgs);
					} else {
						fnHandler.apply(window, arguments);
					}
				};
				return fnWrappedHandler;
			}
			// setTimeout and setInterval can have arbitrary number of additional
			// parameters, which are passed to the handler function when invoked.
			window.setTimeout = function(vHandler) {
				var aArgs = Array.prototype.slice.call(arguments),
					fnHandler = typeof vHandler === "string" ? new Function(vHandler) : vHandler, // eslint-disable-line no-new-func
					fnWrappedHandler = wrapTimerHandler(fnHandler);
				aArgs[0] = fnWrappedHandler;
				return _timeout.apply(window, aArgs);
			};
			window.setInterval = function(vHandler) {
				var aArgs = Array.prototype.slice.call(arguments),
					fnHandler = typeof vHandler === "string" ? new Function(vHandler) : vHandler, // eslint-disable-line no-new-func
					fnWrappedHandler = wrapTimerHandler(fnHandler, true);
				aArgs[0] = fnWrappedHandler;
				return _interval.apply(window, aArgs);
			};

			// Replace the XMLHttpRequest object with a proxy, that overrides the constructor to
			// return a proxy of the XHR instance
			window.XMLHttpRequest = new Proxy(window.XMLHttpRequest, {
				construct: function(oTargetClass, aArguments, oNewTarget) {
					var oXHR = new oTargetClass(),
						bSync = false,
						bDelay = false,
						iReadyState = 0,
						oProxy;

					// Return a wrapped handler function for the given function, which checks
					// whether a synchronous request is currently in progress.
					function wrapHandler(fnHandler) {
						var fnWrappedHandler = function(oEvent) {
							// The ready state at the time the event is occurring needs to
							// be preserved, to restore it when the handler is called delayed
							var iCurrentState = oXHR.readyState;
							function callHandler() {
								iReadyState = iCurrentState;
								// Only if the event has not been removed in the meantime
								// the handler needs to be called after the timeout
								if (fnWrappedHandler.active) {
									return fnHandler.call(oProxy, oEvent);
								}
							}
							// If this is an asynchronous request and a sync request is ongoing,
							// the execution of all following handler calls needs to be delayed
							if (!bSync && bSyncRequestOngoing) {
								bDelay = true;
							}
							if (bDelay) {
								_timeout(callHandler, 0);
								return true;
							}
							return callHandler();
						};
						fnHandler.wrappedHandler = fnWrappedHandler;
						fnWrappedHandler.active = true;
						return fnWrappedHandler;
					}

					// To be able to remove an event listener, we need to get access to the
					// wrapped handler, which has been used to add the listener internally
					// in the XHR.
					function unwrapHandler(fnHandler) {
						return deactivate(fnHandler.wrappedHandler);
					}

					// When an event handler is removed synchronously, it needs to be deactivated
					// to avoid the situation, where the handler has been triggered while
					// the sync request was ongoing, but removed afterwards.
					function deactivate(fnWrappedHandler) {
						if (typeof fnWrappedHandler === "function") {
							fnWrappedHandler.active = false;
						}
						return fnWrappedHandler;
					}

					// Create a proxy of the XHR instance, which overrides the necessary functions
					// to deal with event handlers and readyState
					oProxy = new Proxy(oXHR, {
						get: function(oTarget, sPropName, oReceiver) {
							var vProp = oTarget[sPropName];
							switch (sPropName) {
								// When an event handler is called with setTimeout, the readyState
								// of the internal XHR is already completed, but we need to have
								// have the readyState at the time the event was fired.
								case "readyState":
									return iReadyState;
								// When events are added, the handler function needs to be wrapped
								case "addEventListener":
									return function(sName, fnHandler, bCapture) {
										vProp.call(oTarget, sName, wrapHandler(fnHandler), bCapture);
									};
								// When events are removed, the wrapped handler function must be used,
								// to remove it on the internal XHR object
								case "removeEventListener":
									return function(sName, fnHandler, bCapture) {
										vProp.call(oTarget, sName, unwrapHandler(fnHandler), bCapture);
									};
								// Whether a request is asynchronous or synchronous is defined when
								// calling the open method.
								case "open":
									return function(sMethod, sUrl, bAsync) {
										bSync = bAsync === false;
										vProp.apply(oTarget, arguments);
										iReadyState = oTarget.readyState;
									};
								// The send method is where the actual request is triggered. For sync
								// requests we set a boolean flag to detect a request is in progress
								// in the wrapped handlers.
								case "send":
									return function() {
										bSyncRequestOngoing = bSync;
										vProp.apply(oTarget, arguments);
										iReadyState = oTarget.readyState;
										bSyncRequestOngoing = false;
									};
							}
							// All functions need to be wrapped, so they are called on the correct object
							// instance
							if (typeof vProp === "function") {
								return function() {
									return vProp.apply(oTarget, arguments);
								};
							}
							// All other properties can just be returned
							return vProp;
						},
						set: function(oTarget, sPropName, vValue) {
							// All properties starting with "on" (event handler functions) need to be wrapped
							// when they are set
							if (sPropName.indexOf("on") === 0) {
								// In case there already is a function set on this property, it needs to be
								// deactivated
								deactivate(oTarget[sPropName]);
								if (typeof vValue === "function") {
									oTarget[sPropName] = wrapHandler(vValue);
									return true;
								}
							}
							// All other properties can just be set on the inner XHR object
							oTarget[sPropName] = vValue;
							return true;
						}
					});
					// add dummy readyStateChange listener to make sure readyState is updated properly
					oProxy.addEventListener("readystatechange", function() {});
					return oProxy;
				}
			});
		})();

	}

	/**
	 * Find the script URL where the SAPUI5 is loaded from and return an object which
	 * contains the identified script-tag and resource root
	 */
	var _oBootstrap = (function() {
		var oTag, sUrl, sResourceRoot,
			reConfigurator = /^(.*\/)?download\/configurator[\/\?]/,
			reBootScripts = /^(.*\/)?(sap-ui-(core|custom|boot|merged)(-.*)?)\.js([?#]|$)/,
			reResources = /^(.*\/)?resources\//;

		// check all script tags that have a src attribute
		jQuery("script[src]").each(function() {
			var src = this.getAttribute("src"),
				m;
			if ( (m = src.match(reConfigurator)) !== null ) {
				// guess 1: script tag src contains "/download/configurator[/?]" (for dynamically created bootstrap files)
				oTag = this;
				sUrl = src;
				sResourceRoot = (m[1] || "") + "resources/";
				return false;
			} else if ( (m = src.match(reBootScripts)) !== null ) {
				// guess 2: src contains one of the well known boot script names
				oTag = this;
				sUrl = src;
				sResourceRoot = m[1] || "";
				return false;
			} else if ( this.id == 'sap-ui-bootstrap' && (m = src.match(reResources)) ) {
				// guess 2: script tag has well known id and src contains "resources/"
				oTag = this;
				sUrl = src;
				sResourceRoot = m[0];
				return false;
			}
		});
		return {
			tag: oTag,
			url: sUrl,
			resourceRoot: sResourceRoot
		};
	})();

	/**
	 * Determine whether sap-bootstrap-debug is set, run debugger statement and allow
	 * to restart the core from a new URL
	 */
	(function() {
		if (/sap-bootstrap-debug=(true|x|X)/.test(location.search)) {
			// Dear developer, the way to reload UI5 from a different location has changed: it can now be directly configured in the support popup (Ctrl-Alt-Shift-P),
			// without stepping into the debugger.
			// However, for convenience or cases where this popup is disabled, or for other usages of an early breakpoint, the "sap-bootstrap-debug" URL parameter option is still available.
			// To reboot an alternative core just step down a few lines and set sRebootUrl
			/*eslint-disable no-debugger */
			debugger;
			/*eslint-enable no-debugger */
		}

		// Check local storage for booting a different core
		var sRebootUrl;
		try { // Necessary for FF when Cookies are disabled
			sRebootUrl = window.localStorage.getItem("sap-ui-reboot-URL");
			window.localStorage.removeItem("sap-ui-reboot-URL"); // only reboot once from there (to avoid a deadlock when the alternative core is broken)
		} catch (e) { /* no warning, as this will happen on every startup, depending on browser settings */ }

		if (sRebootUrl && sRebootUrl !== "undefined") { // sic! It can be a string.
			/*eslint-disable no-alert*/
			var bUserConfirmed = confirm("WARNING!\n\nUI5 will be booted from the URL below.\nPress 'Cancel' unless you have configured this.\n\n" + sRebootUrl);
			/*eslint-enable no-alert*/

			if (bUserConfirmed) {
				// replace the bootstrap tag with a newly created script tag to enable restarting the core from a different server
				var oScript = _oBootstrap.tag,
					sScript = "<script src=\"" + sRebootUrl + "\"";
				jQuery.each(oScript.attributes, function(i, oAttr) {
					if (oAttr.nodeName.indexOf("data-sap-ui-") == 0) {
						sScript += " " + oAttr.nodeName + "=\"" + oAttr.nodeValue.replace(/"/g, "&quot;") + "\"";
					}
				});
				sScript += "></script>";
				oScript.parentNode.removeChild(oScript);

				// clean up cachebuster stuff
				jQuery("#sap-ui-bootstrap-cachebusted").remove();
				window["sap-ui-config"] && window["sap-ui-config"].resourceRoots && (window["sap-ui-config"].resourceRoots[""] = undefined);

				document.write(sScript);

				// now this core commits suicide to enable clean loading of the other core
				var oRestart = new Error("This is not a real error. Aborting UI5 bootstrap and rebooting from: " + sRebootUrl);
				oRestart.name = "Restart";
				throw oRestart;
			}
		}
	})();

	/**
	 * Determine whether to use debug sources depending on URL parameter and local storage
	 * and load debug library if necessary
	 */
	(function() {
		// check URI param
		var mUrlMatch = /(?:^|\?|&)sap-ui-debug=([^&]*)(?:&|$)/.exec(location.search),
			vDebugInfo = mUrlMatch && decodeURIComponent(mUrlMatch[1]);

		// check local storage
		try {
			vDebugInfo = vDebugInfo || window.localStorage.getItem("sap-ui-debug");
		} catch (e) {
			// access to localStorage might be disallowed
		}

		// normalize vDebugInfo; afterwards, it either is a boolean or a string not representing a boolean
		if ( typeof vDebugInfo === 'string' ) {
			if ( /^(?:false|true|x|X)$/.test(vDebugInfo) ) {
				vDebugInfo = vDebugInfo !== 'false';
			}
		} else {
			vDebugInfo = !!vDebugInfo;
		}

		window["sap-ui-debug"] = vDebugInfo;

		// if bootstrap URL already contains -dbg URL, just set sap-ui-loaddbg
		if (/-dbg\.js([?#]|$)/.test(_oBootstrap.url)) {
			window["sap-ui-loaddbg"] = true;
			window["sap-ui-debug"] = vDebugInfo = vDebugInfo || true;
		}

		if ( window["sap-ui-optimized"] && vDebugInfo ) {
			// if current sources are optimized and any debug sources should be used, enable the "-dbg" suffix
			window["sap-ui-loaddbg"] = true;
			// if debug sources should be used in general, restart with debug URL
			if ( vDebugInfo === true ) {
				var sDebugUrl = _oBootstrap.url.replace(/\/(?:sap-ui-cachebuster\/)?([^\/]+)\.js/, "/$1-dbg.js");
				window["sap-ui-optimized"] = false;
				document.write("<script type=\"text/javascript\" src=\"" + sDebugUrl + "\"></script>");
				var oRestart = new Error("This is not a real error. Aborting UI5 bootstrap and restarting from: " + sDebugUrl);
				oRestart.name = "Restart";
				throw oRestart;
			}
		}

	})();

	/*
	 * Merged, raw (un-interpreted) configuration data from the following sources
	 * (last one wins)
	 * <ol>
	 * <li>global configuration object <code>window["sap-ui-config"]</code> (could be either a string/url or a configuration object)</li>
	 * <li><code>data-sap-ui-config</code> attribute of the bootstrap script tag</li>
	 * <li>other <code>data-sap-ui-<i>xyz</i></code> attributes of the bootstrap tag</li>
	 * </ol>
	 */
	var oCfgData = window["sap-ui-config"] = (function() {

		function normalize(o) {
			jQuery.each(o, function(i, v) {
				var il = i.toLowerCase();
				if ( !o.hasOwnProperty(il) ) {
					o[il] = v;
					delete o[i];
				}
			});
			return o;
		}

		var oScriptTag = _oBootstrap.tag,
			oCfg = window["sap-ui-config"],
			sCfgFile = "sap-ui-config.json";

		// load the configuration from an external JSON file
		if (typeof oCfg === "string") {
			_earlyLog("warning", "Loading external bootstrap configuration from \"" + oCfg + "\". This is a design time feature and not for productive usage!");
			if (oCfg !== sCfgFile) {
				_earlyLog("warning", "The external bootstrap configuration file should be named \"" + sCfgFile + "\"!");
			}
			jQuery.ajax({
				url : oCfg,
				dataType : 'json',
				async : false,
				success : function(oData, sTextStatus, jqXHR) {
					oCfg = oData;
				},
				error : function(jqXHR, sTextStatus, oError) {
					_earlyLog("error", "Loading externalized bootstrap configuration from \"" + oCfg + "\" failed! Reason: " + oError + "!");
					oCfg = undefined;
				}
			});
			oCfg = oCfg || {};
			oCfg.__loaded = true;
		}

		oCfg = normalize(oCfg || {});
		oCfg.resourceroots = oCfg.resourceroots || {};
		oCfg.themeroots = oCfg.themeroots || {};
		oCfg.resourceroots[''] = oCfg.resourceroots[''] || _oBootstrap.resourceRoot;

		oCfg['xx-loadallmode'] = /(^|\/)(sap-?ui5|[^\/]+-all).js([?#]|$)/.test(_oBootstrap.url);

		// if a script tag has been identified, collect its configuration info
		if ( oScriptTag ) {
			// evaluate the config attribute first - if present
			var sConfig = oScriptTag.getAttribute("data-sap-ui-config");
			if ( sConfig ) {
				try {
					/*eslint-disable no-new-func */
					jQuery.extend(oCfg, normalize((new Function("return {" + sConfig + "};"))())); // TODO jQuery.parseJSON would be better but imposes unwanted restrictions on valid syntax
					/*eslint-enable no-new-func */
				} catch (e) {
					// no log yet, how to report this error?
					_earlyLog("error", "failed to parse data-sap-ui-config attribute: " + (e.message || e));
				}
			}

			// merge with any existing "data-sap-ui-" attributes
			jQuery.each(oScriptTag.attributes, function(i, attr) {
				var m = attr.name.match(/^data-sap-ui-(.*)$/);
				if ( m ) {
					// the following (deactivated) conversion would implement multi-word names like "resource-roots"
					m = m[1].toLowerCase(); // .replace(/\-([a-z])/g, function(s,w) { return w.toUpperCase(); })
					if ( m === 'resourceroots' ) {
						// merge map entries instead of overwriting map
						jQuery.extend(oCfg[m], jQuery.parseJSON(attr.value));
					} else if ( m === 'theme-roots' ) {
						// merge map entries, but rename to camelCase
						jQuery.extend(oCfg.themeroots, jQuery.parseJSON(attr.value));
					} else if ( m !== 'config' ) {
						oCfg[m] = attr.value;
					}
				}
			});
		}

		return oCfg;
	}());

	var syncCallBehavior = 0; // ignore
	if ( oCfgData['xx-nosync'] === 'warn' || /(?:\?|&)sap-ui-xx-nosync=(?:warn)/.exec(window.location.search) ) {
		syncCallBehavior = 1;
	}
	if ( oCfgData['xx-nosync'] === true || oCfgData['xx-nosync'] === 'true' || /(?:\?|&)sap-ui-xx-nosync=(?:x|X|true)/.exec(window.location.search) ) {
		syncCallBehavior = 2;
	}

	if ( syncCallBehavior && oCfgData.__loaded ) {
		_earlyLog(syncCallBehavior === 1 ? "warning" : "error", "[nosync]: configuration loaded via sync XHR");
	}

	// check whether noConflict must be used...
	if ( oCfgData.noconflict === true || oCfgData.noconflict === "true"  || oCfgData.noconflict === "x" ) {
		jQuery.noConflict();
	}

	/**
	 * Root Namespace for the jQuery plug-in provided by SAP SE.
	 *
	 * @version ${version}
	 * @namespace
	 * @public
	 * @static
	 */
	jQuery.sap = {};

	// -------------------------- VERSION -------------------------------------

	jQuery.sap.Version = Version;

	// -------------------------- PERFORMANCE NOW -------------------------------------
	/**
	 * Returns a high resolution timestamp for measurements.
	 * The timestamp is based on 01/01/1970 00:00:00 as float with microsecond precision or
	 * with millisecond precision, if high resolution timestamps are not available.
	 * The fractional part of the timestamp represents fractions of a millisecond.
	 * Converting to a <code>Date</code> is possible using <code>new Date(jQuery.sap.now())</code>
	 *
	 * @returns {float} high resolution timestamp for measurements
	 * @public
	 */
	jQuery.sap.now = !(window.performance && performance.now && performance.timing) ? Date.now : (function() {
		var iNavigationStart = performance.timing.navigationStart;
		return function perfnow() {
			return iNavigationStart + performance.now();
		};
	}());

	// -------------------------- supportability helpers that use localStorage -------------------------------------

	// Reads the value for the given key from the localStorage or writes a new value to it.
	function makeLocalStorageAccessor(key, type, callback) {
		return function(value) {
			try {
				if ( value != null || type === 'string' ) {
					if (value) {
						localStorage.setItem(key, type === 'boolean' ? 'X' : value);
					} else {
						localStorage.removeItem(key);
					}
					callback(value);
				}
				value = localStorage.getItem(key);
				return type === 'boolean' ? value === 'X' : value;
			} catch (e) {
				jQuery.sap.log.warning("Could not access localStorage while accessing '" + key + "' (value: '" + value + "', are cookies disabled?): " + e.message);
			}
		};
	}

	jQuery.sap.debug = makeLocalStorageAccessor('sap-ui-debug', '', function reloadHint(vDebugInfo) {
		/*eslint-disable no-alert */
		alert("Usage of debug sources is " + (vDebugInfo ? "on" : "off") + " now.\nFor the change to take effect, you need to reload the page.");
		/*eslint-enable no-alert */
	});

	/**
	 * Sets the URL to reboot this app from, the next time it is started. Only works with localStorage API available
	 * (and depending on the browser, if cookies are enabled, even though cookies are not used).
	 *
	 * @param {string} sRebootUrl the URL to sap-ui-core.js, from which the application should load UI5 on next restart; undefined clears the restart URL
	 * @returns the current reboot URL or undefined in case of an error or when the reboot URL has been cleared
	 *
	 * @private
	 */
	jQuery.sap.setReboot = makeLocalStorageAccessor('sap-ui-reboot-URL', 'string', function rebootUrlHint(sRebootUrl) { // null-ish clears the reboot request
		if ( sRebootUrl ) {
			/*eslint-disable no-alert */
			alert("Next time this app is launched (only once), it will load UI5 from:\n" + sRebootUrl + ".\nPlease reload the application page now.");
			/*eslint-enable no-alert */
		}
	});

	jQuery.sap.statistics = makeLocalStorageAccessor('sap-ui-statistics', 'boolean', function gatewayStatsHint(bUseStatistics) {
		/*eslint-disable no-alert */
		alert("Usage of Gateway statistics " + (bUseStatistics ? "on" : "off") + " now.\nFor the change to take effect, you need to reload the page.");
		/*eslint-enable no-alert */
	});

	// -------------------------- Logging -------------------------------------

	(function() {

		var FATAL = 0, ERROR = 1, WARNING = 2, INFO = 3, DEBUG = 4, TRACE = 5,

		/**
		 * Unique prefix for this instance of the core in a multi-frame environment.
		 */
			sWindowName = (window.top == window) ? "" : "[" + window.location.pathname.split('/').slice(-1)[0] + "] ",
		// Note: comparison must use type coercion (==, not ===), otherwise test fails in IE

		/**
		 * The array that holds the log entries that have been recorded so far
		 */
			aLog = [],

		/**
		 * Maximum log level to be recorded (per component).
		 */
			mMaxLevel = { '' : ERROR },

		/**
		 * Registered listener to be informed about new log entries.
		 */
			oListener = null,

		/**
		 * Additional support information delivered by callback should be logged
		 */
			bLogSupportInfo = false;

		function pad0(i,w) {
			return ("000" + String(i)).slice(-w);
		}

		function level(sComponent) {
			return (!sComponent || isNaN(mMaxLevel[sComponent])) ? mMaxLevel[''] : mMaxLevel[sComponent];
		}

		function listener(){
			if (!oListener) {
				oListener = {
					listeners: [],
					onLogEntry: function(oLogEntry){
						for (var i = 0; i < oListener.listeners.length; i++) {
							if (oListener.listeners[i].onLogEntry) {
								oListener.listeners[i].onLogEntry(oLogEntry);
							}
						}
					},
					attach: function(oLogger, oLstnr){
						if (oLstnr) {
							oListener.listeners.push(oLstnr);
							if (oLstnr.onAttachToLog) {
								oLstnr.onAttachToLog(oLogger);
							}
						}
					},
					detach: function(oLogger, oLstnr){
						for (var i = 0; i < oListener.listeners.length; i++) {
							if (oListener.listeners[i] === oLstnr) {
								if (oLstnr.onDetachFromLog) {
									oLstnr.onDetachFromLog(oLogger);
								}
								oListener.listeners.splice(i,1);
								return;
							}
						}
					}
				};
			}
			return oListener;
		}

		/**
		 * Creates a new log entry depending on its level and component.
		 *
		 * If the given level is higher than the max level for the given component
		 * (or higher than the global level, if no component is given),
		 * then no entry is created and <code>undefined</code> is returned.
		 *
		 * @param {jQuery.sap.log.Level} iLevel One of the log levels FATAL, ERROR, WARNING, INFO, DEBUG, TRACE
		 * @param {string} sMessage The message to be logged
		 * @param {string} [sDetails] The optional details for the message
		 * @param {string} [sComponent] The log component under which the message should be logged
		 * @param {function} [fnSupportInfo] Callback that returns an additional support object to be logged in support mode.
		 *   This function is only called if support info mode is turned on with <code>logSupportInfo(true)</code>.
		 *   To avoid negative effects regarding execution times and memory consumption, the returned object should be a simple
		 *   immutable JSON object with mostly static and stable content.
		 * @returns {object} The log entry as an object or <code>undefined</code> if no entry was created
		 * @private
		 */
		function log(iLevel, sMessage, sDetails, sComponent, fnSupportInfo) {
			if (iLevel <= level(sComponent) ) {
				if (bLogSupportInfo) {
					if (!fnSupportInfo && !sComponent && typeof sDetails === "function") {
						fnSupportInfo = sDetails;
						sDetails = "";
					}
					if (!fnSupportInfo && typeof sComponent === "function") {
						fnSupportInfo = sComponent;
						sComponent = "";
					}
				}
				var fNow =  jQuery.sap.now(),
					oNow = new Date(fNow),
					iMicroSeconds = Math.floor((fNow - Math.floor(fNow)) * 1000),
					oLogEntry = {
						time     : pad0(oNow.getHours(),2) + ":" + pad0(oNow.getMinutes(),2) + ":" + pad0(oNow.getSeconds(),2) + "." + pad0(oNow.getMilliseconds(),3) + pad0(iMicroSeconds,3),
						date     : pad0(oNow.getFullYear(),4) + "-" + pad0(oNow.getMonth() + 1,2) + "-" + pad0(oNow.getDate(),2),
						timestamp: fNow,
						level    : iLevel,
						message  : String(sMessage || ""),
						details  : String(sDetails || ""),
						component: String(sComponent || "")
					};
				if (bLogSupportInfo && typeof fnSupportInfo === "function") {
					oLogEntry.supportInfo = fnSupportInfo();
				}
				aLog.push( oLogEntry );
				if (oListener) {
					oListener.onLogEntry(oLogEntry);
				}

				/*
				 * Console Log, also tries to log to the window.console, if available.
				 *
				 * Unfortunately, the support for window.console is quite different between the UI5 browsers. The most important differences are:
				 * - in IE (checked until IE9), the console object does not exist in a window, until the developer tools are opened for that window.
				 *   After opening the dev tools, the console remains available even when the tools are closed again. Only using a new window (or tab)
				 *   restores the old state without console.
				 *   When the console is available, it provides most standard methods, but not debug and trace
				 * - in FF3.6 the console is not available, until FireBug is opened. It disappears again, when fire bug is closed.
				 *   But when the settings for a web site are stored (convenience), the console remains open
				 *   When the console is available, it supports all relevant methods
				 * - in FF9.0, the console is always available, but method assert is only available when firebug is open
				 * - in Webkit browsers, the console object is always available and has all required methods
				 *   - Exception: in the iOS Simulator, console.info() does not exist
				 */
				/*eslint-disable no-console */
				if (window.console) { // in IE and FF, console might not exist; in FF it might even disappear
					var logText = oLogEntry.date + " " + oLogEntry.time + " " + sWindowName + oLogEntry.message + " - " + oLogEntry.details + " " + oLogEntry.component;
					switch (iLevel) {
					case FATAL:
					case ERROR: console.error(logText); break;
					case WARNING: console.warn(logText); break;
					case INFO: console.info ? console.info(logText) : console.log(logText); break;    // info not available in iOS simulator
					case DEBUG: console.debug ? console.debug(logText) : console.log(logText); break; // debug not available in IE, fallback to log
					case TRACE: console.trace ? console.trace(logText) : console.log(logText); break; // trace not available in IE, fallback to log (no trace)
					// no default
					}
					if (console.info && oLogEntry.supportInfo) {
						console.info(oLogEntry.supportInfo);
					}
				}
				/*eslint-enable no-console */
				return oLogEntry;
			}
		}

		/**
		 * Creates a new Logger instance which will use the given component string
		 * for all logged messages without a specific component.
		 *
		 * @param {string} sDefaultComponent The component to use
		 *
		 * @class A Logger class
		 * @alias jQuery.sap.log.Logger
		 * @since 1.1.2
		 * @public
		 */
		function Logger(sDefaultComponent) {

			/**
			 * Creates a new fatal-level entry in the log with the given message, details and calling component.
			 *
			 * @param {string} sMessage Message text to display
			 * @param {string} [sDetails=''] Details about the message, might be omitted
			 * @param {string} [sComponent=''] Name of the component that produced the log entry
			 * @param {function} [fnSupportInfo] Callback that returns an additional support object to be logged in support mode.
			 *   This function is only called if support info mode is turned on with <code>logSupportInfo(true)</code>.
			 *   To avoid negative effects regarding execution times and memory consumption, the returned object should be a simple
			 *   immutable JSON object with mostly static and stable content.
			 * @return {jQuery.sap.log.Logger} The log instance for method chaining
			 * @public
			 * @SecSink {0 1 2|SECRET} Could expose secret data in logs
			 */
			this.fatal = function (sMessage, sDetails, sComponent, fnSupportInfo) {
				log(FATAL, sMessage, sDetails, sComponent || sDefaultComponent, fnSupportInfo);
				return this;
			};

			/**
			 * Creates a new error-level entry in the log with the given message, details and calling component.
			 *
			 * @param {string} sMessage Message text to display
			 * @param {string} [sDetails=''] Details about the message, might be omitted
			 * @param {string} [sComponent=''] Name of the component that produced the log entry
			 * @param {function} [fnSupportInfo] Callback that returns an additional support object to be logged in support mode.
			 *   This function is only called if support info mode is turned on with <code>logSupportInfo(true)</code>.
			 *   To avoid negative effects regarding execution times and memory consumption, the returned object should be a simple
			 *   immutable JSON object with mostly static and stable content.
			 * @return {jQuery.sap.log.Logger} The log instance
			 * @public
			 * @SecSink {0 1 2|SECRET} Could expose secret data in logs
			 */
			this.error = function error(sMessage, sDetails, sComponent, fnSupportInfo) {
				log(ERROR, sMessage, sDetails, sComponent || sDefaultComponent, fnSupportInfo);
				return this;
			};

			/**
			 * Creates a new warning-level entry in the log with the given message, details and calling component.
			 *
			 * @param {string} sMessage Message text to display
			 * @param {string} [sDetails=''] Details about the message, might be omitted
			 * @param {string} [sComponent=''] Name of the component that produced the log entry
			 * @param {function} [fnSupportInfo] Callback that returns an additional support object to be logged in support mode.
			 *   This function is only called if support info mode is turned on with <code>logSupportInfo(true)</code>.
			 *   To avoid negative effects regarding execution times and memory consumption, the returned object should be a simple
			 *   immutable JSON object with mostly static and stable content.
			 * @return {jQuery.sap.log.Logger} The log instance
			 * @public
			 * @SecSink {0 1 2|SECRET} Could expose secret data in logs
			 */
			this.warning = function warning(sMessage, sDetails, sComponent, fnSupportInfo) {
				log(WARNING, sMessage, sDetails, sComponent || sDefaultComponent, fnSupportInfo);
				return this;
			};

			/**
			 * Creates a new info-level entry in the log with the given message, details and calling component.
			 *
			 * @param {string} sMessage Message text to display
			 * @param {string} [sDetails=''] Details about the message, might be omitted
			 * @param {string} [sComponent=''] Name of the component that produced the log entry
			 * @param {function} [fnSupportInfo] Callback that returns an additional support object to be logged in support mode.
			 *   This function is only called if support info mode is turned on with <code>logSupportInfo(true)</code>.
			 *   To avoid negative effects regarding execution times and memory consumption, the returned object should be a simple
			 *   immutable JSON object with mostly static and stable content.
			 * @return {jQuery.sap.log.Logger} The log instance
			 * @public
			 * @SecSink {0 1 2|SECRET} Could expose secret data in logs
			 */
			this.info = function info(sMessage, sDetails, sComponent, fnSupportInfo) {
				log(INFO, sMessage, sDetails, sComponent || sDefaultComponent, fnSupportInfo);
				return this;
			};
			/**
			 * Creates a new debug-level entry in the log with the given message, details and calling component.
			 *
			 * @param {string} sMessage Message text to display
			 * @param {string} [sDetails=''] Details about the message, might be omitted
			 * @param {string} [sComponent=''] Name of the component that produced the log entry
			 * @param {function} [fnSupportInfo] Callback that returns an additional support object to be logged in support mode.
			 *   This function is only called if support info mode is turned on with <code>logSupportInfo(true)</code>.
			 *   To avoid negative effects regarding execution times and memory consumption, the returned object should be a simple
			 *   immutable JSON object with mostly static and stable content.
			 * @return {jQuery.sap.log.Logger} The log instance
			 * @public
			 * @SecSink {0 1 2|SECRET} Could expose secret data in logs
			 */
			this.debug = function debug(sMessage, sDetails, sComponent, fnSupportInfo) {
				log(DEBUG, sMessage, sDetails, sComponent || sDefaultComponent, fnSupportInfo);
				return this;
			};

			/**
			 * Creates a new trace-level entry in the log with the given message, details and calling component.
			 *
			 * @param {string} sMessage Message text to display
			 * @param {string} [sDetails=''] Details about the message, might be omitted
			 * @param {string} [sComponent=''] Name of the component that produced the log entry
			 * @param {function} [fnSupportInfo] Callback that returns an additional support object to be logged in support mode.
			 *   This function is only called if support info mode is turned on with <code>logSupportInfo(true)</code>.
			 *   To avoid negative effects regarding execution times and memory consumption, the returned object should be a simple
			 *   immutable JSON object with mostly static and stable content.
			 * @return {jQuery.sap.log.Logger} The log-instance
			 * @public
			 * @SecSink {0 1 2|SECRET} Could expose secret data in logs
			 */
			this.trace = function trace(sMessage, sDetails, sComponent, fnSupportInfo) {
				log(TRACE, sMessage, sDetails, sComponent || sDefaultComponent, fnSupportInfo);
				return this;
			};

			/**
			 * Defines the maximum <code>jQuery.sap.log.Level</code> of log entries that will be recorded.
			 * Log entries with a higher (less important) log level will be omitted from the log.
			 * When a component name is given, the log level will be configured for that component
			 * only, otherwise the log level for the default component of this logger is set.
			 * For the global logger, the global default level is set.
			 *
			 * <b>Note</b>: Setting a global default log level has no impact on already defined
			 * component log levels. They always override the global default log level.
			 *
			 * @param {jQuery.sap.log.Level} iLogLevel The new log level
			 * @param {string} [sComponent] The log component to set the log level for
			 * @return {jQuery.sap.log.Logger} This logger object to allow method chaining
			 * @public
			 */
			this.setLevel = function setLevel(iLogLevel, sComponent) {
				sComponent = sComponent || sDefaultComponent || '';
				mMaxLevel[sComponent] = iLogLevel;
				var mBackMapping = [];
				jQuery.each(jQuery.sap.log.LogLevel, function(idx, v){
					mBackMapping[v] = idx;
				});
				log(INFO, "Changing log level " + (sComponent ? "for '" + sComponent + "' " : "") + "to " + mBackMapping[iLogLevel], "", "jQuery.sap.log");
				return this;
			};

			/**
			 * Returns the log level currently effective for the given component.
			 * If no component is given or when no level has been configured for a
			 * given component, the log level for the default component of this logger is returned.
			 *
			 * @param {string} [sComponent] Name of the component to retrieve the log level for
			 * @return {int} The log level for the given component or the default log level
			 * @public
			 * @since 1.1.2
			 */
			this.getLevel = function getLevel(sComponent) {
				return level(sComponent || sDefaultComponent);
			};

			/**
			 * Checks whether logging is enabled for the given log level,
			 * depending on the currently effective log level for the given component.
			 *
			 * If no component is given, the default component of this logger will be taken into account.
			 *
			 * @param {int} [iLevel=Level.DEBUG] The log level in question
			 * @param {string} [sComponent] Name of the component to check the log level for
			 * @return {boolean} Whether logging is enabled or not
			 * @public
			 * @since 1.13.2
			 */
			this.isLoggable = function (iLevel, sComponent) {
				return (iLevel == null ? DEBUG : iLevel) <= level(sComponent || sDefaultComponent);
			};

		}

		/**
		 * A Logging API for JavaScript.
		 *
		 * Provides methods to manage a client-side log and to create entries in it. Each of the logging methods
		 * {@link jQuery.sap.log.debug}, {@link jQuery.sap.log.info}, {@link jQuery.sap.log.warning},
		 * {@link jQuery.sap.log.error} and {@link jQuery.sap.log.fatal} creates and records a log entry,
		 * containing a timestamp, a log level, a message with details and a component info.
		 * The log level will be one of {@link jQuery.sap.log.Level} and equals the name of the concrete logging method.
		 *
		 * By using the {@link jQuery.sap.log.setLevel} method, consumers can determine the least important
		 * log level which should be recorded. Less important entries will be filtered out. (Note that higher numeric
		 * values represent less important levels). The initially set level depends on the mode that UI5 is running in.
		 * When the optimized sources are executed, the default level will be {@link jQuery.sap.log.Level.ERROR}.
		 * For normal (debug sources), the default level is {@link jQuery.sap.log.Level.DEBUG}.
		 *
		 * All logging methods allow to specify a <b>component</b>. These components are simple strings and
		 * don't have a special meaning to the UI5 framework. However they can be used to semantically group
		 * log entries that belong to the same software component (or feature). There are two APIs that help
		 * to manage logging for such a component. With <code>{@link jQuery.sap.log.getLogger}(sComponent)</code>,
		 * one can retrieve a logger that automatically adds the given <code>sComponent</code> as component
		 * parameter to each log entry, if no other component is specified. Typically, JavaScript code will
		 * retrieve such a logger once during startup and reuse it for the rest of its lifecycle.
		 * Second, the {@link jQuery.sap.log.Logger#setLevel}(iLevel, sComponent) method allows to set the log level
		 * for a specific component only. This allows a more fine granular control about the created logging entries.
		 * {@link jQuery.sap.log.Logger#getLevel} allows to retrieve the currently effective log level for a given
		 * component.
		 *
		 * {@link jQuery.sap.log.getLogEntries} returns an array of the currently collected log entries.
		 *
		 * Furthermore, a listener can be registered to the log. It will be notified whenever a new entry
		 * is added to the log. The listener can be used for displaying log entries in a separate page area,
		 * or for sending it to some external target (server).
		 *
		 * @since 0.9.0
		 * @namespace
		 * @public
		 * @borrows jQuery.sap.log.Logger#fatal as fatal
		 * @borrows jQuery.sap.log.Logger#error as error
		 * @borrows jQuery.sap.log.Logger#warning as warning
		 * @borrows jQuery.sap.log.Logger#info as info
		 * @borrows jQuery.sap.log.Logger#debug as debug
		 * @borrows jQuery.sap.log.Logger#trace as trace
		 * @borrows jQuery.sap.log.Logger#getLevel as getLevel
		 * @borrows jQuery.sap.log.Logger#setLevel as setLevel
		 * @borrows jQuery.sap.log.Logger#isLoggable as isLoggable
		 */
		jQuery.sap.log = jQuery.extend(new Logger(), /** @lends jQuery.sap.log */ {

			/**
			 * Enumeration of the configurable log levels that a Logger should persist to the log.
			 *
			 * Only if the current LogLevel is higher than the level {@link jQuery.sap.log.Level} of the currently added log entry,
			 * then this very entry is permanently added to the log. Otherwise it is ignored.
			 * @see jQuery.sap.log.Logger#setLevel
			 * @enum {int}
			 * @public
			 */
			Level : {

				/**
				 * Do not log anything
				 * @public
				 */
				NONE : FATAL - 1,

				/**
				 * Fatal level. Use this for logging unrecoverable situations
				 * @public
				 */
				FATAL : FATAL,

				/**
				 * Error level. Use this for logging of erroneous but still recoverable situations
				 * @public
				 */
				ERROR : ERROR,

				/**
				 * Warning level. Use this for logging unwanted but foreseen situations
				 * @public
				 */
				WARNING : WARNING,

				/**
				 * Info level. Use this for logging information of purely informative nature
				 * @public
				 */
				INFO : INFO,

				/**
				 * Debug level. Use this for logging information necessary for debugging
				 * @public
				 */
				DEBUG : DEBUG,

				/**
				 * Trace level. Use this for tracing the program flow.
				 * @public
				 */
				TRACE : TRACE,

				/**
				 * Trace level to log everything.
				 */
				ALL : (TRACE + 1)
			},

			/**
			 * Returns a {@link jQuery.sap.log.Logger} for the given component.
			 *
			 * The method might or might not return the same logger object across multiple calls.
			 * While loggers are assumed to be light weight objects, consumers should try to
			 * avoid redundant calls and instead keep references to already retrieved loggers.
			 *
			 * The optional second parameter <code>iDefaultLogLevel</code> allows to specify
			 * a default log level for the component. It is only applied when no log level has been
			 * defined so far for that component (ignoring inherited log levels). If this method is
			 * called multiple times for the same component but with different log levels,
			 * only the first call one might be taken into account.
			 *
			 * @param {string} sComponent Component to create the logger for
			 * @param {int} [iDefaultLogLevel] a default log level to be used for the component,
			 *   if no log level has been defined for it so far.
			 * @return {jQuery.sap.log.Logger} A logger for the component.
			 * @public
			 * @static
			 * @since 1.1.2
			 */
			getLogger : function(sComponent, iDefaultLogLevel) {
				if ( !isNaN(iDefaultLogLevel) && mMaxLevel[sComponent] == null ) {
					mMaxLevel[sComponent] = iDefaultLogLevel;
				}
				return new Logger(sComponent);
			},

			/**
			 * Returns the logged entries recorded so far as an array.
			 *
			 * Log entries are plain JavaScript objects with the following properties
			 * <ul>
			 * <li>timestamp {number} point in time when the entry was created
			 * <li>level {int} LogLevel level of the entry
			 * <li>message {string} message text of the entry
			 * </ul>
			 *
			 * @return {object[]} an array containing the recorded log entries
			 * @public
			 * @static
			 * @since 1.1.2
			 */
			getLogEntries : function () {
				return aLog.slice();
			},

			/**
			 * Allows to add a new LogListener that will be notified for new log entries.
			 *
			 * The given object must provide method <code>onLogEntry</code> and can also be informed
			 * about <code>onDetachFromLog</code> and <code>onAttachToLog</code>
			 * @param {object} oListener The new listener object that should be informed
			 * @return {jQuery.sap.log} The global logger
			 * @public
			 * @static
			 */
			addLogListener : function(oListener) {
				listener().attach(this, oListener);
				return this;
			},

			/**
			 * Allows to remove a registered LogListener.
			 * @param {object} oListener The new listener object that should be removed
			 * @return {jQuery.sap.log} The global logger
			 * @public
			 * @static
			 */
			removeLogListener : function(oListener) {
				listener().detach(this, oListener);
				return this;
			},

			/**
			 * Enables or disables whether additional support information is logged in a trace.
			 * If enabled, logging methods like error, warning, info and debug are calling the additional
			 * optional callback parameter fnSupportInfo and store the returned object in the log entry property supportInfo.
			 *
			 * @param {boolean} bEnabled true if the support information should be logged
			 * @private
			 * @static
			 * @since 1.46.0
			 */
			logSupportInfo: function logSupportInfo(bEnabled) {
				bLogSupportInfo = bEnabled;
			}

		});

		/**
		 * Enumeration of levels that can be used in a call to {@link jQuery.sap.log.Logger#setLevel}(iLevel, sComponent).
		 *
		 * @deprecated Since 1.1.2. To streamline the Logging API a bit, the separation between Level and LogLevel has been given up.
		 * Use the (enriched) enumeration {@link jQuery.sap.log.Level} instead.
		 * @namespace
		 * @public
		 */
		jQuery.sap.log.LogLevel = jQuery.sap.log.Level;

		/**
		 * Retrieves the currently recorded log entries.
		 * @deprecated Since 1.1.2. To avoid confusion with getLogger, this method has been renamed to {@link jQuery.sap.log.getLogEntries}.
		 * @function
		 * @public
		 */
		jQuery.sap.log.getLog = jQuery.sap.log.getLogEntries;

		/**
		 * A simple assertion mechanism that logs a message when a given condition is not met.
		 *
		 * <b>Note:</b> Calls to this method might be removed when the JavaScript code
		 *              is optimized during build. Therefore, callers should not rely on any side effects
		 *              of this method.
		 *
		 * @param {boolean} bResult Result of the checked assertion
		 * @param {string|function} vMessage Message that will be logged when the result is <code>false</code>. In case this is a function, the return value of the function will be displayed. This can be used to execute complex code only if the assertion fails.
		 *
		 * @public
		 * @static
		 * @SecSink {1|SECRET} Could expose secret data in logs
		 */
		jQuery.sap.assert = function(bResult, vMessage) {
			if ( !bResult ) {
				var sMessage = typeof vMessage === "function" ? vMessage() : vMessage;
				/*eslint-disable no-console */
				if ( window.console && console.assert ) {
					console.assert(bResult, sWindowName + sMessage);
				} else {
					// console is not always available (IE, FF) and IE doesn't support console.assert
					jQuery.sap.log.debug("[Assertions] " + sMessage);
				}
				/*eslint-enable no-console */
			}
		};

		// against all our rules: use side effect of assert to differentiate between optimized and productive code
		jQuery.sap.assert( !!(mMaxLevel[''] = DEBUG), "will be removed in optimized version");

		// evaluate configuration
		oCfgData.loglevel = (function() {
			var m = /(?:\?|&)sap-ui-log(?:L|-l)evel=([^&]*)/.exec(window.location.search);
			return m && m[1];
		}()) || oCfgData.loglevel;
		if ( oCfgData.loglevel ) {
			jQuery.sap.log.setLevel(jQuery.sap.log.Level[oCfgData.loglevel.toUpperCase()] || parseInt(oCfgData.loglevel,10));
		}

		jQuery.sap.log.info("SAP Logger started.");
		// log early logs
		jQuery.each(_earlyLogs, function(i,e) {
			jQuery.sap.log[e.level](e.message);
		});
		_earlyLogs = null;

	}());

	// ---------------------------------------------------------------------------------------------------

	/**
	 * Returns a new constructor function that creates objects with
	 * the given prototype.
	 *
	 * As of 1.45.0, this method has been deprecated. Use the following code pattern instead:
	 * <pre>
	 *   function MyFunction() {
	 *   };
	 *   MyFunction.prototype = oPrototype;
	 * </pre>
	 * @param {object} oPrototype Prototype to use for the new objects
	 * @return {function} the newly created constructor function
	 * @public
	 * @static
	 * @deprecated As of 1.45.0, define your own function and assign <code>oPrototype</code> to its <code>prototype</code> property instead.
	 */
	jQuery.sap.factory = function factory(oPrototype) {
		jQuery.sap.assert(typeof oPrototype == "object", "oPrototype must be an object (incl. null)");
		function Factory() {}
		Factory.prototype = oPrototype;
		return Factory;
	};

	/**
	 * Returns a new object which has the given <code>oPrototype</code> as its prototype.
	 *
	 * If several objects with the same prototype are to be created,
	 * {@link jQuery.sap.factory} should be used instead.
	 *
	 * @param {object} oPrototype Prototype to use for the new object
	 * @return {object} new object
	 * @public
	 * @static
	 * @deprecated As of 1.45.0, use <code>Object.create(oPrototype)</code> instead.
	 */
	jQuery.sap.newObject = function newObject(oPrototype) {
		jQuery.sap.assert(typeof oPrototype == "object", "oPrototype must be an object (incl. null)");
		// explicitly fall back to null for best compatibility with old implementation
		return Object.create(oPrototype || null);
	};

	/**
	 * Returns a new function that returns the given <code>oValue</code> (using its closure).
	 *
	 * Avoids the need for a dedicated member for the value.
	 *
	 * As closures don't come for free, this function should only be used when polluting
	 * the enclosing object is an absolute "must-not" (as it is the case in public base classes).
	 *
	 * @param {object} oValue The value that the getter should return
	 * @returns {function} The new getter function
	 * @public
	 * @static
	 */
	jQuery.sap.getter = function getter(oValue) {
		return function() {
			return oValue;
		};
	};

	/**
	 * Returns a JavaScript object which is identified by a sequence of names.
	 *
	 * A call to <code>getObject("a.b.C")</code> has essentially the same effect
	 * as accessing <code>window.a.b.C</code> but with the difference that missing
	 * intermediate objects (a or b in the example above) don't lead to an exception.
	 *
	 * When the addressed object exists, it is simply returned. If it doesn't exists,
	 * the behavior depends on the value of the second, optional parameter
	 * <code>iNoCreates</code> (assuming 'n' to be the number of names in the name sequence):
	 * <ul>
	 * <li>NaN: if iNoCreates is not a number and the addressed object doesn't exist,
	 *          then <code>getObject()</code> returns <code>undefined</code>.
	 * <li>0 &lt; iNoCreates &lt; n: any non-existing intermediate object is created, except
	 *          the <i>last</i> <code>iNoCreates</code> ones.
	 * </ul>
	 *
	 * Example:
	 * <pre>
	 *   getObject()            -- returns the context object (either param or window)
	 *   getObject("a.b.C")     -- will only try to get a.b.C and return undefined if not found.
	 *   getObject("a.b.C", 0)  -- will create a, b, and C in that order if they don't exists
	 *   getObject("a.b.c", 1)  -- will create a and b, but not C.
	 * </pre>
	 *
	 * When a <code>oContext</code> is given, the search starts in that object.
	 * Otherwise it starts in the <code>window</code> object that this plugin
	 * has been created in.
	 *
	 * Note: Although this method internally uses <code>object["key"]</code> to address object
	 *       properties, it does not support all possible characters in a name.
	 *       Especially the dot ('.') is not supported in the individual name segments,
	 *       as it is always interpreted as a name separator.
	 *
	 * @param {string} sName  a dot separated sequence of names that identify the required object
	 * @param {int}    [iNoCreates=NaN] number of objects (from the right) that should not be created
	 * @param {object} [oContext=window] the context to execute the search in
	 * @returns {function} The value of the named object
	 *
	 * @public
	 * @static
	 */
	jQuery.sap.getObject = function getObject(sName, iNoCreates, oContext) {
		var oObject = oContext || window,
			aNames = (sName || "").split("."),
			l = aNames.length,
			iEndCreate = isNaN(iNoCreates) ? 0 : l - iNoCreates,
			i;

		if ( syncCallBehavior && oContext === window ) {
			jQuery.sap.log.error("[nosync] getObject called to retrieve global name '" + sName + "'");
		}

		for (i = 0; oObject && i < l; i++) {
			if (!oObject[aNames[i]] && i < iEndCreate ) {
				oObject[aNames[i]] = {};
			}
			oObject = oObject[aNames[i]];
		}
		return oObject;

	};

	/**
	 * Sets an object property to a given value, where the property is
	 * identified by a sequence of names (path).
	 *
	 * When a <code>oContext</code> is given, the path starts in that object.
	 * Otherwise it starts in the <code>window</code> object that this plugin
	 * has been created for.
	 *
	 * Note: Although this method internally uses <code>object["key"]</code> to address object
	 *       properties, it does not support all possible characters in a name.
	 *       Especially the dot ('.') is not supported in the individual name segments,
	 *       as it is always interpreted as a name separator.
	 *
	 * @param {string} sName  a dot separated sequence of names that identify the property
	 * @param {any}    vValue value to be set, can have any type
	 * @param {object} [oContext=window] the context to execute the search in
	 * @public
	 * @static
	 */
	jQuery.sap.setObject = function (sName, vValue, oContext) {
		var oObject = oContext || window,
			aNames = (sName || "").split("."),
			l = aNames.length, i;

		if ( l > 0 ) {
			for (i = 0; oObject && i < l - 1; i++) {
				if (!oObject[aNames[i]] ) {
					oObject[aNames[i]] = {};
				}
				oObject = oObject[aNames[i]];
			}
			oObject[aNames[l - 1]] = vValue;
		}
	};

	// ---------------------- performance measurement -----------------------------------------------------------

	function PerfMeasurement() {

		function Measurement(sId, sInfo, iStart, iEnd, aCategories) {
			this.id = sId;
			this.info = sInfo;
			this.start = iStart;
			this.end = iEnd;
			this.pause = 0;
			this.resume = 0;
			this.duration = 0; // used time
			this.time = 0; // time from start to end
			this.categories = aCategories;
			this.average = false; //average duration enabled
			this.count = 0; //average count
			this.completeDuration = 0; //complete duration
		}

		function matchCategories(aCategories) {
			if (!aRestrictedCategories) {
				return true;
			}
			if (!aCategories) {
				return aRestrictedCategories === null;
			}
			//check whether active categories and current categories match
			for (var i = 0; i < aRestrictedCategories.length; i++) {
				if (aCategories.indexOf(aRestrictedCategories[i]) > -1) {
					return true;
				}
			}
			return false;
		}

		function checkCategories(aCategories) {
			if (!aCategories) {
				aCategories = ["javascript"];
			}
			aCategories = typeof aCategories === "string" ? aCategories.split(",") : aCategories;
			if (!matchCategories(aCategories)) {
				return null;
			}
			return aCategories;
		}

		function hasCategory(oMeasurement, aCategories) {
			for (var i = 0; i < aCategories.length; i++) {
				if (oMeasurement.categories.indexOf(aCategories[i]) > -1) {
					return true;
				}
			}
			return aCategories.length === 0;
		}

		var bActive = false,
			fnAjax = jQuery.ajax,
			aRestrictedCategories = null,
			aAverageMethods = [],
			aOriginalMethods = [],
			mMethods = {},
			mMeasurements = {};

		/**
		 * Gets the current state of the perfomance measurement functionality
		 *
		 * @return {boolean} current state of the perfomance measurement functionality
		 * @name jQuery.sap.measure#getActive
		 * @function
		 * @public
		 */
		this.getActive = function() {
			return bActive;
		};

		/**
		 * Activates or deactivates the performance measure functionality
		 * Optionally a category or list of categories can be passed to restrict measurements to certain categories
		 * like "javascript", "require", "xmlhttprequest", "render"
		 * @param {boolean} bOn - state of the perfomance measurement functionality to set
		 * @param {string | string[]} aCategories - An optional list of categories that should be measured
		 *
		 * @return {boolean} current state of the perfomance measurement functionality
		 * @name jQuery.sap.measure#setActive
		 * @function
		 * @public
		 */
		this.setActive = function(bOn, aCategories) {
			//set restricted categories
			if (!aCategories) {
				aCategories = null;
			} else if (typeof aCategories === "string") {
				aCategories = aCategories.split(",");
			}
			aRestrictedCategories = aCategories;

			if (bActive === bOn) {
				return;
			}
			bActive = bOn;
			if (bActive) {

				//activate method implementations once
				for (var sName in mMethods) {
					this[sName] = mMethods[sName];
				}
				mMethods = {};
				// wrap and instrument jQuery.ajax
				jQuery.ajax = function(url, options) {

					if ( typeof url === 'object' ) {
						options = url;
						url = undefined;
					}
					options = options || {};

					var sMeasureId = resolveURL(url || options.url);
					jQuery.sap.measure.start(sMeasureId, "Request for " + sMeasureId, "xmlhttprequest");
					var fnComplete = options.complete;
					options.complete = function() {
						jQuery.sap.measure.end(sMeasureId);
						if (fnComplete) {
							fnComplete.apply(this, arguments);
						}
					};

					// strict mode: we potentially modified 'options', so we must not use 'arguments'
					return fnAjax.call(this, url, options);
				};
			} else if (fnAjax) {
				jQuery.ajax = fnAjax;
			}

			return bActive;
		};

		/**
		 * Starts a performance measure.
		 * Optionally a category or list of categories can be passed to allow filtering of measurements.
		 *
		 * @param {string} sId ID of the measurement
		 * @param {string} sInfo Info for the measurement
		 * @param {string | string[]} [aCategories = "javascript"] An optional list of categories for the measure
		 *
		 * @return {object} current measurement containing id, info and start-timestamp (false if error)
		 * @name jQuery.sap.measure#start
		 * @function
		 * @public
		 */
		mMethods["start"] = function(sId, sInfo, aCategories) {
			if (!bActive) {
				return;
			}

			aCategories = checkCategories(aCategories);
			if (!aCategories) {
				return;
			}

			var iTime = jQuery.sap.now(),
				oMeasurement = new Measurement( sId, sInfo, iTime, 0, aCategories);

			// create timeline entries if available
			/*eslint-disable no-console */
			if (jQuery.sap.log.getLevel("sap.ui.Performance") >= 4 && window.console && console.time) {
				console.time(sInfo + " - " + sId);
			}
			/*eslint-enable no-console */
//			jQuery.sap.log.info("Performance measurement start: "+ sId + " on "+ iTime);

			if (oMeasurement) {
				mMeasurements[sId] = oMeasurement;
				return this.getMeasurement(oMeasurement.id);
			} else {
				return false;
			}
		};

		/**
		 * Pauses a performance measure
		 *
		 * @param {string} sId ID of the measurement
		 * @return {object} current measurement containing id, info and start-timestamp, pause-timestamp (false if error)
		 * @name jQuery.sap.measure#pause
		 * @function
		 * @public
		 */
		mMethods["pause"] = function(sId) {
			if (!bActive) {
				return;
			}

			var iTime = jQuery.sap.now();
			var oMeasurement = mMeasurements[sId];
			if (oMeasurement && oMeasurement.end > 0) {
				// already ended -> no pause possible
				return false;
			}

			if (oMeasurement && oMeasurement.pause == 0) {
				// not already paused
				oMeasurement.pause = iTime;
				if (oMeasurement.pause >= oMeasurement.resume && oMeasurement.resume > 0) {
					oMeasurement.duration = oMeasurement.duration + oMeasurement.pause - oMeasurement.resume;
					oMeasurement.resume = 0;
				} else if (oMeasurement.pause >= oMeasurement.start) {
					oMeasurement.duration = oMeasurement.pause - oMeasurement.start;
				}
			}
//			jQuery.sap.log.info("Performance measurement pause: "+ sId + " on "+ iTime + " duration: "+ oMeasurement.duration);

			if (oMeasurement) {
				return this.getMeasurement(oMeasurement.id);
			} else {
				return false;
			}
		};

		/**
		 * Resumes a performance measure
		 *
		 * @param {string} sId ID of the measurement
		 * @return {object} current measurement containing id, info and start-timestamp, resume-timestamp (false if error)
		 * @name jQuery.sap.measure#resume
		 * @function
		 * @public
		 */
		mMethods["resume"] = function(sId) {
			if (!bActive) {
				return;
			}

			var iTime = jQuery.sap.now();
			var oMeasurement = mMeasurements[sId];
//			jQuery.sap.log.info("Performance measurement resume: "+ sId + " on "+ iTime + " duration: "+ oMeasurement.duration);

			if (oMeasurement && oMeasurement.pause > 0) {
				// already paused
				oMeasurement.pause = 0;
				oMeasurement.resume = iTime;
			}

			if (oMeasurement) {
				return this.getMeasurement(oMeasurement.id);
			} else {
				return false;
			}
		};

		/**
		 * Ends a performance measure
		 *
		 * @param {string} sId ID of the measurement
		 * @return {object} current measurement containing id, info and start-timestamp, end-timestamp, time, duration (false if error)
		 * @name jQuery.sap.measure#end
		 * @function
		 * @public
		 */
		mMethods["end"] = function(sId) {
			if (!bActive) {
				return;
			}

			var iTime = jQuery.sap.now();

			var oMeasurement = mMeasurements[sId];
//			jQuery.sap.log.info("Performance measurement end: "+ sId + " on "+ iTime);

			if (oMeasurement && !oMeasurement.end) {
				oMeasurement.end = iTime;
				if (oMeasurement.end >= oMeasurement.resume && oMeasurement.resume > 0) {
					oMeasurement.duration = oMeasurement.duration + oMeasurement.end - oMeasurement.resume;
					oMeasurement.resume = 0;
				} else if (oMeasurement.pause > 0) {
					// duration already calculated
					oMeasurement.pause = 0;
				} else if (oMeasurement.end >= oMeasurement.start) {
					if (oMeasurement.average) {
						oMeasurement.completeDuration += (oMeasurement.end - oMeasurement.start);
						oMeasurement.count++;
						oMeasurement.duration = oMeasurement.completeDuration / oMeasurement.count;
						oMeasurement.start = iTime;
					} else {
						oMeasurement.duration = oMeasurement.end - oMeasurement.start;
					}
				}
				if (oMeasurement.end >= oMeasurement.start) {
					oMeasurement.time = oMeasurement.end - oMeasurement.start;
				}
			}

			if (oMeasurement) {
				// end timeline entry
				/*eslint-disable no-console */
				if (jQuery.sap.log.getLevel("sap.ui.Performance") >= 4 && window.console && console.timeEnd) {
					console.timeEnd(oMeasurement.info + " - " + sId);
				}
				/*eslint-enable no-console */
				return this.getMeasurement(sId);
			} else {
				return false;
			}
		};

		/**
		 * Clears all performance measurements
		 *
		 * @name jQuery.sap.measure#clear
		 * @function
		 * @public
		 */
		mMethods["clear"] = function() {
			mMeasurements = {};
		};

		/**
		 * Removes a performance measure
		 *
		 * @param {string} sId ID of the measurement
		 * @name jQuery.sap.measure#remove
		 * @function
		 * @public
		 */
		mMethods["remove"] = function(sId) {
			delete mMeasurements[sId];
		};
		/**
		 * Adds a performance measurement with all data
		 * This is useful to add external measurements (e.g. from a backend) to the common measurement UI
		 *
		 * @param {string} sId ID of the measurement
		 * @param {string} sInfo Info for the measurement
		 * @param {int} iStart start timestamp
		 * @param {int} iEnd end timestamp
		 * @param {int} iTime time in milliseconds
		 * @param {int} iDuration effective time in milliseconds
		 * @param {string | string[]} [aCategories = "javascript"] An optional list of categories for the measure
		 * @return {object} [] current measurement containing id, info and start-timestamp, end-timestamp, time, duration, categories (false if error)
		 * @name jQuery.sap.measure#add
		 * @function
		 * @public
		 */
		mMethods["add"] = function(sId, sInfo, iStart, iEnd, iTime, iDuration, aCategories) {
			if (!bActive) {
				return;
			}
			aCategories = checkCategories(aCategories);
			if (!aCategories) {
				return false;
			}
			var oMeasurement = new Measurement( sId, sInfo, iStart, iEnd, aCategories);
			oMeasurement.time = iTime;
			oMeasurement.duration = iDuration;

			if (oMeasurement) {
				mMeasurements[sId] = oMeasurement;
				return this.getMeasurement(oMeasurement.id);
			} else {
				return false;
			}
		};

		/**
		 * Starts an average performance measure.
		 * The duration of this measure is an avarage of durations measured for each call.
		 * Optionally a category or list of categories can be passed to allow filtering of measurements.
		 *
		 * @param {string} sId ID of the measurement
		 * @param {string} sInfo Info for the measurement
		 * @param {string | string[]} [aCategories = "javascript"] An optional list of categories for the measure
		 * @return {object} current measurement containing id, info and start-timestamp (false if error)
		 * @name jQuery.sap.measure#average
		 * @function
		 * @public
		 */
		mMethods["average"] = function(sId, sInfo, aCategories) {
			if (!bActive) {
				return;
			}
			aCategories = checkCategories(aCategories);
			if (!aCategories) {
				return;
			}

			var oMeasurement = mMeasurements[sId],
				iTime = jQuery.sap.now();
			if (!oMeasurement || !oMeasurement.average) {
				this.start(sId, sInfo, aCategories);
				oMeasurement = mMeasurements[sId];
				oMeasurement.average = true;
			} else {
				if (!oMeasurement.end) {
					oMeasurement.completeDuration += (iTime - oMeasurement.start);
					oMeasurement.count++;
				}
				oMeasurement.start = iTime;
				oMeasurement.end = 0;
			}
			return this.getMeasurement(oMeasurement.id);
		};

		/**
		 * Gets a performance measure
		 *
		 * @param {string} sId ID of the measurement
		 * @return {object} current measurement containing id, info and start-timestamp, end-timestamp, time, duration (false if error)
		 * @name jQuery.sap.measure#getMeasurement
		 * @function
		 * @public
		 */
		this.getMeasurement = function(sId) {

			var oMeasurement = mMeasurements[sId];

			if (oMeasurement) {
				// create a flat copy
				var oCopy = {};
				for (var sProp in oMeasurement) {
					oCopy[sProp] = oMeasurement[sProp];
				}
				return oCopy;
			} else {
				return false;
			}
		};

		/**
		 * Gets all performance measurements
		 *
		 * @param {boolean} [bCompleted] Whether only completed measurements should be returned, if explicitly set to false only incomplete measurements are returned
		 * @return {object[]} current array with measurements containing id, info and start-timestamp, end-timestamp, time, duration, categories
		 * @name jQuery.sap.measure#getAllMeasurements
		 * @function
		 * @public
		 */
		this.getAllMeasurements = function(bCompleted) {
			return this.filterMeasurements(function(oMeasurement) {
				return oMeasurement;
			}, bCompleted);
		};

		/**
		 * Gets all performance measurements where a provided filter function returns a truthy value.
		 * If neither a filter function nor a category is provided an empty array is returned.
		 * To filter for certain properties of measurements a fnFilter can be implemented like this
		 * <code>
		 * function(oMeasurement) {
		 *     return oMeasurement.duration > 50;
		 * }</code>
		 *
		 * @param {function} [fnFilter] a filter function that returns true if the passed measurement should be added to the result
		 * @param {boolean|undefined} [bCompleted] Optional parameter to determine if either completed or incomplete measurements should be returned (both if not set or undefined)
		 * @param {string[]} [aCategories] The function returns only measurements which match these specified categories
		 *
		 * @return {object} [] filtered array with measurements containing id, info and start-timestamp, end-timestamp, time, duration, categories (false if error)
		 * @name jQuery.sap.measure#filterMeasurements
		 * @function
		 * @public
		 * @since 1.34.0
		 */
		this.filterMeasurements = function() {
			var oMeasurement, bValid,
				i = 0,
				aMeasurements = [],
				fnFilter = typeof arguments[i] === "function" ? arguments[i++] : undefined,
				bCompleted = typeof arguments[i] === "boolean" ? arguments[i++] : undefined,
				aCategories = Array.isArray(arguments[i]) ? arguments[i] : [];

			for (var sId in mMeasurements) {
				oMeasurement = this.getMeasurement(sId);
				bValid = (bCompleted === false && oMeasurement.end === 0) || (bCompleted !== false && (!bCompleted || oMeasurement.end));
				if (bValid && hasCategory(oMeasurement, aCategories) && (!fnFilter || fnFilter(oMeasurement))) {
					aMeasurements.push(oMeasurement);
				}
			}

			return aMeasurements;
		};

		/**
		 * Registers an average measurement for a given objects method
		 *
		 * @param {string} sId the id of the measurement
		 * @param {object} oObject the object of the method
		 * @param {string} sMethod the name of the method
		 * @param {string[]} [aCategories = ["javascript"]] An optional categories list for the measurement
		 *
		 * @returns {boolean} true if the registration was successful
		 * @name jQuery.sap.measure#registerMethod
		 * @function
		 * @public
		 * @since 1.34.0
		 */
		this.registerMethod = function(sId, oObject, sMethod, aCategories) {
			var fnMethod = oObject[sMethod];
			if (fnMethod && typeof fnMethod === "function") {
				var bFound = aAverageMethods.indexOf(fnMethod) > -1;
				if (!bFound) {
					aOriginalMethods.push({func : fnMethod, obj: oObject, method: sMethod, id: sId});
					oObject[sMethod] = function() {
						jQuery.sap.measure.average(sId, sId + " method average", aCategories);
						var result = fnMethod.apply(this, arguments);
						jQuery.sap.measure.end(sId);
						return result;
					};
					aAverageMethods.push(oObject[sMethod]);
					return true;
				}
			} else {
				jQuery.sap.log.debug(sMethod + " in not a function. jQuery.sap.measure.register failed");
			}
			return false;
		};

		/**
		 * Unregisters an average measurement for a given objects method
		 *
		 * @param {string} sId the id of the measurement
		 * @param {object} oObject the object of the method
		 * @param {string} sMethod the name of the method
		 *
		 * @returns {boolean} true if the unregistration was successful
		 * @name jQuery.sap.measure#unregisterMethod
		 * @function
		 * @public
		 * @since 1.34.0
		 */
		this.unregisterMethod = function(sId, oObject, sMethod) {
			var fnFunction = oObject[sMethod],
				iIndex = aAverageMethods.indexOf(fnFunction);
			if (fnFunction && iIndex > -1) {
				oObject[sMethod] = aOriginalMethods[iIndex].func;
				aAverageMethods.splice(iIndex, 1);
				aOriginalMethods.splice(iIndex, 1);
				return true;
			}
			return false;
		};

		/**
		 * Unregisters all average measurements
		 * @name jQuery.sap.measure#unregisterAllMethods
		 * @function
		 * @public
		 * @since 1.34.0
		 */
		this.unregisterAllMethods = function() {
			while (aOriginalMethods.length > 0) {
				var oOrig = aOriginalMethods[0];
				this.unregisterMethod(oOrig.id, oOrig.obj, oOrig.method);
			}
		};

		// ** Interaction measure **
		var aInteractions = [];
		var oPendingInteraction;

		/**
		 * Gets all interaction measurements
		 * @param {boolean} bFinalize finalize the current pending interaction so that it is contained in the returned array
		 * @return {object[]} all interaction measurements
		 * @name jQuery.sap.measure#getAllInteractionMeasurements
		 * @function
		 * @public
		 * @since 1.34.0
		 */
		this.getAllInteractionMeasurements = function(bFinalize) {
			if (bFinalize) {
				// force the finalization of the currently pending interaction
				jQuery.sap.measure.endInteraction(true);
			}
			return aInteractions;
		};

		/**
		 * Gets all interaction measurements for which a provided filter function returns a truthy value.
		 * To filter for certain categories of measurements a fnFilter can be implemented like this
		 * <code>
		 * function(oInteractionMeasurement) {
		 *     return oInteractionMeasurement.duration > 0
		 * }</code>
		 * @param {function} fnFilter a filter function that returns true if the passed measurement should be added to the result
		 * @return {object[]} all interaction measurements passing the filter function successfully
		 * @name jQuery.sap.measure#filterInteractionMeasurements
		 * @function
		 * @public
		 * @since 1.36.2
		 */
		this.filterInteractionMeasurements = function(fnFilter) {
			var aFilteredInteractions = [];
			if (fnFilter) {
				for (var i = 0, l = aInteractions.length; i < l; i++) {
					if (fnFilter(aInteractions[i])) {
						aFilteredInteractions.push(aInteractions[i]);
					}
				}
			}
			return aFilteredInteractions;
		};

		/**
		 * Gets the incomplete pending interaction
		 * @return {object} interaction measurement
		 * @name jQuery.sap.measure#getInteractionMeasurement
		 * @function
		 * @private
		 * @since 1.34.0
		 */
		this.getPendingInteractionMeasurement = function() {
			return oPendingInteraction;
		};

		/**
		 * Clears all interaction measurements
		 * @name jQuery.sap.measure#clearInteractionMeasurements
		 * @function
		 * @public
		 * @since 1.34.0
		 */
		this.clearInteractionMeasurements = function() {
			aInteractions = [];
		};

		function isCompleteMeasurement(oMeasurement) {
			if (oMeasurement.start > oPendingInteraction.start && oMeasurement.end < oPendingInteraction.end) {
				return oMeasurement;
			}
		}

		function isCompleteTiming(oRequestTiming) {
			return oRequestTiming.startTime > 0 &&
				oRequestTiming.startTime <= oRequestTiming.requestStart &&
				oRequestTiming.requestStart <= oRequestTiming.responseEnd;
		}

		function aggregateRequestTiming(oRequest) {
			// aggregate navigation and roundtrip with respect to requests overlapping and times w/o requests (gaps)
			this.end = oRequest.responseEnd > this.end ? oRequest.responseEnd : this.end;
			// sum up request time as a grand total over all requests
			oPendingInteraction.requestTime += (oRequest.responseEnd - oRequest.startTime);

			// if there is a gap between requests we add the times to the aggrgate and shift the lower limits
			if (this.roundtripHigherLimit <= oRequest.startTime) {
				oPendingInteraction.navigation += (this.navigationHigherLimit - this.navigationLowerLimit);
				oPendingInteraction.roundtrip += (this.roundtripHigherLimit - this.roundtripLowerLimit);
				this.navigationLowerLimit = oRequest.startTime;
				this.roundtripLowerLimit = oRequest.startTime;
			}

			// shift the limits if this request was completed later than the earlier requests
			if (oRequest.responseEnd > this.roundtripHigherLimit) {
				this.roundtripHigherLimit = oRequest.responseEnd;
			}
			if (oRequest.requestStart > this.navigationHigherLimit) {
				this.navigationHigherLimit = oRequest.requestStart;
			}
		}

		function aggregateRequestTimings(aRequests) {
			var oTimings = {
				start: aRequests[0].startTime,
				end: aRequests[0].responseEnd,
				navigationLowerLimit: aRequests[0].startTime,
				navigationHigherLimit: aRequests[0].requestStart,
				roundtripLowerLimit: aRequests[0].startTime,
				roundtripHigherLimit: aRequests[0].responseEnd
			};

			// aggregate all timings by operating on the oTimings object
			aRequests.forEach(aggregateRequestTiming, oTimings);
			oPendingInteraction.navigation += (oTimings.navigationHigherLimit - oTimings.navigationLowerLimit);
			oPendingInteraction.roundtrip += (oTimings.roundtripHigherLimit - oTimings.roundtripLowerLimit);

			// calculate average network time per request
			if (oPendingInteraction.networkTime) {
				var iTotalNetworkTime = oPendingInteraction.requestTime - oPendingInteraction.networkTime;
				oPendingInteraction.networkTime = iTotalNetworkTime / aRequests.length;
			} else {
				oPendingInteraction.networkTime = 0;
			}

			// in case processing is not determined, which means no re-rendering occured, take start to end
			if (oPendingInteraction.processing === 0) {
				var iRelativeStart = oPendingInteraction.start - window.performance.timing.fetchStart;
				oPendingInteraction.duration = oTimings.end - iRelativeStart;
				// calculate processing time of before requests start
				oPendingInteraction.processing = oTimings.start - iRelativeStart;
			}

		}

		function finalizeInteraction(iTime) {
			if (oPendingInteraction) {
				oPendingInteraction.end = iTime;
				oPendingInteraction.duration = oPendingInteraction.processing;
				oPendingInteraction.requests = jQuery.sap.measure.getRequestTimings();
				oPendingInteraction.incompleteRequests = 0;
				oPendingInteraction.measurements = jQuery.sap.measure.filterMeasurements(isCompleteMeasurement, true);

				var aCompleteRequestTimings = oPendingInteraction.requests.filter(isCompleteTiming);
				if (aCompleteRequestTimings.length > 0) {
					aggregateRequestTimings(aCompleteRequestTimings);
					oPendingInteraction.incompleteRequests = oPendingInteraction.requests.length - aCompleteRequestTimings.length;
				}

				// calculate real processing time if any processing took place
				// cannot be negative as then requests took longer than processing
				var iProcessing = oPendingInteraction.processing - oPendingInteraction.navigation - oPendingInteraction.roundtrip;
				oPendingInteraction.processing = iProcessing > -1 ? iProcessing : 0;

				aInteractions.push(oPendingInteraction);
				jQuery.sap.log.info("Interaction step finished: trigger: " + oPendingInteraction.trigger + "; duration: " + oPendingInteraction.duration + "; requests: " + oPendingInteraction.requests.length, "jQuery.sap.measure");
				oPendingInteraction = null;
			}
		}

		// component determination - heuristic
		function createOwnerComponentInfo(oSrcElement) {
			var sId, sVersion;
			if (oSrcElement) {
				var Component, oComponent;
				Component = sap.ui.require("sap/ui/core/Component");
				while (Component && oSrcElement && oSrcElement.getParent) {
					oComponent = Component.getOwnerComponentFor(oSrcElement);
					if (oComponent || oSrcElement instanceof Component) {
						oComponent = oComponent || oSrcElement;
						var oApp = oComponent.getManifestEntry("sap.app");
						// get app id or module name for FESR
						sId = oApp && oApp.id || oComponent.getMetadata().getName();
						sVersion = oApp && oApp.applicationVersion && oApp.applicationVersion.version;
					}
					oSrcElement = oSrcElement.getParent();
				}
			}
			return {
				id: sId ? sId : "undetermined",
				version: sVersion ? sVersion : ""
			};
		}

		/**
		 * Start an interaction measurements
		 *
		 * @param {string} sType type of the event which triggered the interaction
		 * @param {object} oSrcElement the control on which the interaction was triggered
		 *
		 * @name jQuery.sap.measure#startInteraction
		 * @function
		 * @public
		 * @since 1.34.0
		 */
		this.startInteraction = function(sType, oSrcElement) {
			var iTime = jQuery.sap.now();

			if (oPendingInteraction) {
				finalizeInteraction(iTime);
			}

			// clear request timings for new interaction
			this.clearRequestTimings();

			var oComponentInfo = createOwnerComponentInfo(oSrcElement);

			// setup new pending interaction
			oPendingInteraction = {
				event: sType, // event which triggered interaction
				trigger: oSrcElement && oSrcElement.getId ? oSrcElement.getId() : "undetermined", // control which triggered interaction
				component: oComponentInfo.id, // component or app identifier
				appVersion: oComponentInfo.version, // application version as from app descriptor
				start : iTime, // interaction start
				end: 0, // interaction end
				navigation: 0, // sum over all navigation times
				roundtrip: 0, // time from first request sent to last received response end - without gaps and ignored overlap
				processing: 0, // client processing time
				duration: 0, // interaction duration
				requests: [], // Performance API requests during interaction
				measurements: [], // jQuery.sap.measure Measurements
				sapStatistics: [], // SAP Statistics for OData, added by jQuery.sap.trace
				requestTime: 0, // summ over all requests in the interaction (oPendingInteraction.requests[0].responseEnd-oPendingInteraction.requests[0].requestStart)
				networkTime: 0, // request time minus server time from the header, added by jQuery.sap.trace
				bytesSent: 0, // sum over all requests bytes, added by jQuery.sap.trace
				bytesReceived: 0, // sum over all response bytes, added by jQuery.sap.trace
				requestCompression: undefined, // true if all responses have been sent gzipped
				busyDuration : 0 // summed GlobalBusyIndicator duration during this interaction
			};
			jQuery.sap.log.info("Interaction step started: trigger: " + oPendingInteraction.trigger + "; type: " + oPendingInteraction.event, "jQuery.sap.measure");
		};

		/**
		 * End an interaction measurements
		 *
		 * @param {boolean} bForce forces end of interaction now and ignores further re-renderings
		 *
		 * @name jQuery.sap.measure#endInteraction
		 * @function
		 * @public
		 * @since 1.34.0
		 */
		this.endInteraction = function(bForce) {
			if (oPendingInteraction) {
				// set provisionary processing time from start to end and calculate later
				if (!bForce) {
					oPendingInteraction.processing = jQuery.sap.now() - oPendingInteraction.start;
				} else {
					finalizeInteraction(jQuery.sap.now());
				}
			}
		};

		/**
		 * Sets the request buffer size for the measurement safely
		 *
		 * @param {int} iSize size of the buffer
		 *
		 * @name jQuery.sap.measure#setRequestBufferSize
		 * @function
		 * @public
		 * @since 1.34.0
		 */
		this.setRequestBufferSize = function(iSize) {
			if (!window.performance) {
				return;
			}
			if (window.performance.setResourceTimingBufferSize) {
				window.performance.setResourceTimingBufferSize(iSize);
			} else if (window.performance.webkitSetResourceTimingBufferSize) {
				window.performance.webkitSetResourceTimingBufferSize(iSize);
			}
		};

		/**
		 * Gets the current request timings array for type 'resource' safely
		 *
		 * @return {object[]} array of performance timing objects
		 * @name jQuery.sap.measure#getRequestTimings
		 * @function
		 * @public
		 * @since 1.34.0
		 */
		this.getRequestTimings = function() {
			if (window.performance && window.performance.getEntriesByType) {
				return window.performance.getEntriesByType("resource");
			}
			return [];
		};

		 /**
			 * Clears all request timings safely
			 *
			 * @name jQuery.sap.measure#clearRequestTimings
			 * @function
			 * @public
			 * @since 1.34.0
			 */
		this.clearRequestTimings = function() {
			if (!window.performance) {
				return;
			}
			if (window.performance.clearResourceTimings) {
				window.performance.clearResourceTimings();
			} else if (window.performance.webkitClearResourceTimings){
				window.performance.webkitClearResourceTimings();
			}
		};

		this.setRequestBufferSize(1000);

		var aMatch = location.search.match(/sap-ui-measure=([^\&]*)/);
		if (aMatch && aMatch[1]) {
			if (aMatch[1] === "true" || aMatch[1] === "x" || aMatch[1] === "X") {
				this.setActive(true);
			} else {
				this.setActive(true, aMatch[1]);
			}
		} else {
			var fnInactive = function() {
				//measure not active
				return null;
			};
			//deactivate methods implementations
			for (var sName in mMethods) {
				this[sName] = fnInactive;
			}
		}
	}

	/**
	 * Namespace for the jQuery performance measurement plug-in provided by SAP SE.
	 *
	 * @namespace
	 * @name jQuery.sap.measure
	 * @public
	 * @static
	 */
	jQuery.sap.measure = new PerfMeasurement();

	// ---------------------- sync point -------------------------------------------------------------

	/*
	 * Internal class that can help to synchronize a set of asynchronous tasks.
	 * Each task must be registered in the sync point by calling startTask with
	 * an (purely informative) title. The returned value must be used in a later
	 * call to finishTask.
	 * When finishTask has been called for all tasks that have been started,
	 * the fnCallback will be fired.
	 * When a timeout is given and reached, the callback is called at that
	 * time, no matter whether all tasks have been finished or not.
	 */
	function SyncPoint(sName, fnCallback, iTimeout) {
		var aTasks = [],
			iOpenTasks = 0,
			iFailures = 0,
			sTimer;

		this.startTask = function(sTitle) {
			var iId = aTasks.length;
			aTasks[iId] = { name : sTitle, finished : false };
			iOpenTasks++;
			return iId;
		};

		this.finishTask = function(iId, bSuccess) {
			if ( !aTasks[iId] || aTasks[iId].finished ) {
				throw new Error("trying to finish non existing or already finished task");
			}
			aTasks[iId].finished = true;
			iOpenTasks--;
			if ( bSuccess === false ) {
				iFailures++;
			}
			if ( iOpenTasks === 0 ) {
				jQuery.sap.log.info("Sync point '" + sName + "' finished (tasks:" + aTasks.length + ", open:" + iOpenTasks + ", failures:" + iFailures + ")");
				if ( sTimer ) {
					clearTimeout(sTimer);
					sTimer = null;
				}
				finish();
			}
		};

		function finish() {
			fnCallback && fnCallback(iOpenTasks, iFailures);
			fnCallback = null;
		}

		if ( !isNaN(iTimeout) ) {
			sTimer = setTimeout(function() {
				jQuery.sap.log.info("Sync point '" + sName + "' timed out (tasks:" + aTasks.length + ", open:" + iOpenTasks + ", failures:" + iFailures + ")");
				finish();
			}, iTimeout);
		}

		jQuery.sap.log.info("Sync point '" + sName + "' created" + (iTimeout ? "(timeout after " + iTimeout + " ms)" : ""));

	}

	/**
	 * Internal function to create a sync point.
	 * @private
	 */
	jQuery.sap.syncPoint = function(sName, fnCallback, iTimeout) {
		return new SyncPoint(sName, fnCallback, iTimeout);
	};

	// ---------------------- require/declare --------------------------------------------------------

	var getModuleSystemInfo = (function() {

		/**
		 * Local logger, by default only logging errors. Can be configured to DEBUG via config parameter.
		 * @private
		 */
		var log = jQuery.sap.log.getLogger("sap.ui.ModuleSystem",
				(/sap-ui-xx-debug(M|-m)odule(L|-l)oading=(true|x|X)/.test(location.search) || oCfgData["xx-debugModuleLoading"]) ? jQuery.sap.log.Level.DEBUG : jQuery.sap.log.Level.INFO
			),

		/**
		 * A map of URL prefixes keyed by the corresponding module name prefix.
		 * URL prefix can either be given as string or as object with properties url and final.
		 * When final is set to true, module name prefix cannot be overwritten.
		 * @see jQuery.sap.registerModulePath
		 *
		 * Note that the empty prefix ('') will always match and thus serves as a fallback.
		 * @private
		 */
			mUrlPrefixes = { '' : { 'url' : 'resources/' } },

		/**
		 * Module neither has been required nor preloaded not declared, but someone asked for it.
		 */
			INITIAL = 0,

		/**
		 * Module has been preloaded, but not required or declared
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
			NOT_YET_DETERMINED = {},

		/**
		 * Set of modules that have been loaded (required) so far.
		 *
		 * Each module is an object that can have the following members
		 * <ul>
		 * <li>{int} state one of the module states defined in this function
		 * <li>{string} url URL where the module has been loaded from
		 * <li>{any} data temp. raw content of the module (between loaded and ready)
		 * <li>{string} error an error description for state <code>FAILED</code>
		 * <li>{any} content the content of the module as exported via define()
		 * </ul>
		 * @private
		 */
			mModules = {},

			mPreloadModules = {},

		/**
		 * Whether sap.ui.define calls could be executed asynchronously in the current context.
		 *
		 * The initial value is determined by the preload flag. This is necessary to make
		 * hard coded script tags work when their scripts include an sap.ui.define call and if
		 * some later incline script expects the results of sap.ui.define.
		 * Most prominent example: unit tests that include QUnitUtils as a script tag and use qutils
		 * in one of their inline scripts.
		 */
			bGlobalAsyncMode = !( /(?:^|\?|&)sap-ui-(?:xx-)?preload=async(?:&|$)/.test(location.search) || oCfgData.preload === 'async' || oCfgData['xx-preload'] === 'async'),

		/* for future use
		/**
		 * Mapping from default AMD names to UI5 AMD names.
		 *
		 * For simpler usage in requireModule, the names are already converted to
		 * normalized resource names.
		 *
		 * /
			mAMDAliases = {
				'blanket.js': 'sap/ui/thirdparty/blanket.js',
				'crossroads.js': 'sap/ui/thirdparty/crossroads.js',
				'd3.js': 'sap/ui/thirdparty/d3.js',
				'handlebars.js': 'sap/ui/thirdparty/handlebars.js',
				'hasher.js': 'sap/ui/thirdparty/hasher.js',
				'IPv6.js': 'sap/ui/thirdparty/IPv6.js',
				'jquery.js': 'sap/ui/thirdparty/jquery.js',
				'jszip.js': 'sap/ui/thirdparty/jszip.js',
				'less.js': 'sap/ui/thirdparty/less.js',
				'OData.js': 'sap/ui/thirdparty/datajs.js',
				'punycode.js': 'sap/ui/thirdparty/punycode.js',
				'SecondLevelDomains.js': 'sap/ui/thirdparty/SecondLevelDomains.js',
				'sinon.js': 'sap/ui/thirdparty/sinon.js',
				'signals.js': 'sap/ui/thirdparty/signals.js',
				'URI.js': 'sap/ui/thirdparty/URI.js',
				'URITemplate.js': 'sap/ui/thirdparty/URITemplate.js',
				'esprima.js': 'sap/ui/demokit/js/esprima.js'
			},
		*/

		/**
		 * Information about third party modules, keyed by the module's resource name (including extension '.js').
		 *
		 * Note that the stored dependencies also include a '.js' for easier evaluation, but the
		 * <code>registerModuleShims</code> method expects all names without the extension for better
		 * compatibility with the requireJS configuration.
		 *
		 * @see jQuery.sap.registerModuleShims
		 * @private
		 */
			mAMDShim = {
				'sap/ui/thirdparty/blanket.js': {
					amd: true,
					exports: 'blanket' // '_blanket', 'esprima', 'falafel', 'inBrowser', 'parseAndModify'
				},
				'sap/ui/thirdparty/caja-html-sanitizer.js': {
					amd: false,
					exports: 'html' // 'html_sanitizer', 'html4'
				},
				'sap/ui/thirdparty/crossroads.js': {
					amd: true,
					exports: 'crossroads',
					deps: ['sap/ui/thirdparty/signals']
				},
				'sap/ui/thirdparty/d3.js': {
					amd: true,
					exports: 'd3'
				},
				'sap/ui/thirdparty/datajs.js': {
					amd: true,
					exports: 'OData' // 'datajs'
				},
				'sap/ui/thirdparty/es6-promise.js': {
					amd: true,
					exports: 'ES6Promise'
				},
				'sap/ui/thirdparty/flexie.js': {
					exports: 'Flexie'
				},
				'sap/ui/thirdparty/handlebars.js': {
					amd: true,
					exports: 'Handlebars'
				},
				'sap/ui/thirdparty/hasher.js': {
					amd: true,
					exports: 'hasher',
					deps: ['sap/ui/thirdparty/signals']
				},
				'sap/ui/thirdparty/IPv6.js': {
					amd: true,
					exports: 'IPv6'
				},
				'sap/ui/thirdparty/iscroll-lite.js': {
					exports: 'iScroll'
				},
				'sap/ui/thirdparty/iscroll.js': {
					exports: 'iScroll'
				},
				'sap/ui/thirdparty/jquery.js': {
					amd: true
				},
				'sap/ui/thirdparty/jquery-mobile-custom.js': {
					amd: true,
					exports: 'jQuery.mobile'
				},
				'sap/ui/thirdparty/jszip.js': {
					amd: true,
					exports: 'JSZip'
				},
				'sap/ui/thirdparty/less.js': {
					amd: true,
					exports: 'less'
				},
				'sap/ui/thirdparty/mobify-carousel.js': {
					exports: 'Mobify' // or Mobify.UI.Carousel?
				},
				'sap/ui/thirdparty/punycode.js': {
					amd: true,
					exports: 'punycode'
				},
				'sap/ui/thirdparty/require.js': {
					exports: 'define' // 'require', 'requirejs'
				},
				'sap/ui/thirdparty/SecondLevelDomains.js': {
					amd: true,
					exports: 'SecondLevelDomains'
				},
				'sap/ui/thirdparty/signals.js': {
					amd: true,
					exports: 'signals'
				},
				'sap/ui/thirdparty/sinon.js': {
					amd: true,
					exports: 'sinon'
				},
				'sap/ui/thirdparty/sinon-server.js': {
					amd: true,
					exports: 'sinon' // really sinon! sinon-server is a subset of server and uses the same global for export
				},
				'sap/ui/thirdparty/unorm.js': {
					exports: 'UNorm'
				},
				'sap/ui/thirdparty/unormdata.js': {
					exports: 'UNorm', // really 'UNorm'! module extends UNorm
					deps: ['sap/ui/thirdparty/unorm']
				},
				'sap/ui/thirdparty/URI.js': {
					amd: true,
					exports: 'URI'
				},
				'sap/ui/thirdparty/URITemplate.js': {
					amd: true,
					exports: 'URITemplate',
					deps: ['sap/ui/thirdparty/URI']
				},
				'sap/ui/thirdparty/vkbeautify.js': {
					exports: 'vkbeautify'
				},
				'sap/ui/thirdparty/zyngascroll.js': {
					exports: 'Scroller' // 'requestAnimationFrame', 'cancelRequestAnimationFrame', 'core'
				},
				'sap/ui/demokit/js/esprima.js': {
					amd: true,
					exports: 'esprima'
				},
				'sap/ui/thirdparty/RequestRecorder.js': {
					amd: true,
					exports: 'RequestRecorder',
					deps: ['sap/ui/thirdparty/URI', 'sap/ui/thirdparty/sinon']
				}
			},

		/**
		 * Stack of modules that are currently executed.
		 *
		 * Allows to identify the containing module in case of multi module files (e.g. sap-ui-core)
		 * @private
		 */
			_execStack = [ ],

		/**
		 * A prefix that will be added to module loading log statements and which reflects the nesting of module executions.
		 * @private
		 */
			sLogPrefix = "",

		// max size a script should have when executing it with execScript (IE). Otherwise fallback to eval
			MAX_EXEC_SCRIPT_LENGTH = 512 * 1024,

			FRAGMENT = "fragment",
			VIEW = "view",
			mKnownSubtypes = {
				js :  [VIEW, FRAGMENT, "controller", "designtime"],
				xml:  [VIEW, FRAGMENT],
				json: [VIEW, FRAGMENT],
				html: [VIEW, FRAGMENT]
			},

			rJSSubtypes = new RegExp("(\\.(?:" + mKnownSubtypes.js.join("|") + "))?\\.js$"),
			rTypes,
			rSubTypes;

		(function() {
			var s = "",
				sSub = "";

			jQuery.each(mKnownSubtypes, function(sType, aSubtypes) {
				s = (s ? s + "|" : "") + sType;
				sSub = (sSub ? sSub + "|" : "") + "(?:(?:" + aSubtypes.join("\\.|") + "\\.)?" + sType + ")";
			});
			s = "\\.(" + s + ")$";
			sSub = "\\.(?:" + sSub + "|[^./]+)$";
			log.debug("constructed regexp for file types :" + s);
			log.debug("constructed regexp for file sub-types :" + sSub);
			rTypes = new RegExp(s);
			rSubTypes = new RegExp(sSub);
		}());

		/**
		 * When defined, checks whether preload should be ignored for the given module.
		 * If undefined, all preloads will be used.
		 */
		var fnIgnorePreload;

		(function() {
			var vDebugInfo = window["sap-ui-debug"];

			function makeRegExp(sGlobPattern) {
				if ( !/\/\*\*\/$/.test(sGlobPattern) ) {
					sGlobPattern = sGlobPattern.replace(/\/$/, '/**/');
				}
				return sGlobPattern.replace(/\*\*\/|\*|[[\]{}()+?.\\^$|]/g, function(sMatch) {
					switch (sMatch) {
						case '**/' : return '(?:[^/]+/)*';
						case '*'   : return '[^/]*';
						default    : return '\\' + sMatch;
					}
				});
			}

			if ( typeof vDebugInfo === 'string' ) {
				var sPattern =  "^(?:" + vDebugInfo.split(/,/).map(makeRegExp).join("|") + ")",
					rFilter = new RegExp(sPattern);

				fnIgnorePreload = function(sModuleName) {
					return rFilter.test(sModuleName);
				};

				log.debug("Modules that should be excluded from preload: '" + sPattern + "'");

			} else if ( vDebugInfo === true ) {

				fnIgnorePreload = function() {
					return true;
				};

				log.debug("All modules should be excluded from preload");

			}
		})();

		/**
		 * A module/resource as managed by the module system.
		 *
		 * Each module is an object with the following properties
		 * <ul>
		 * <li>{int} state one of the module states defined in this function
		 * <li>{string} url URL where the module has been loaded from
		 * <li>{any} data temp. raw content of the module (between loaded and ready or when preloaded)
		 * <li>{string} group the bundle with which a resource was loaded or null
		 * <li>{string} error an error description for state <code>FAILED</code>
		 * <li>{any} content the content of the module as exported via define()
		 * </ul>
		 */
		function Module(name) {
			this.name = name;
			this.state = INITIAL;
			this.url =
			this.loaded =
			this.data =
			this.group = null;
			this.content = NOT_YET_DETERMINED;
		}

		Module.prototype.ready = function(url, content) {
			if ( this.state === INITIAL ) {
				this.state = READY;
				this.url = url;
				this.content = content;
			}
			return this;
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

		Module.get = function(sModuleName) {
			return mModules[sModuleName] || (mModules[sModuleName] = new Module(sModuleName));
		};

		/**
		 * Determines the value of this module.
		 *
		 * If the module hasn't been loaded or executed yet, <code>undefined</code> will be returned.
		 *
		 * @private
		 */
		Module.prototype.value = function() {

			if ( this.state === READY ) {
				if ( this.content === NOT_YET_DETERMINED ) {
					// Determine the module value lazily.
					// For AMD modules this has already been done on execution of the factory function.
					// For other modules that are required individually, it has been done after execution.
					// For the few remaining scenarios (like old-fashioned 'library-all' bundles), it is done here
					var oShim = mAMDShim[this.name],
						sExport = oShim && (Array.isArray(oShim.exports) ? oShim.exports[0] : oShim.exports);
					// best guess for thirdparty modules or legacy modules that don't use sap.ui.define
					this.content = jQuery.sap.getObject( sExport || urnToUI5(this.name) );
				}
				return this.content;
			}

			return; // undefined
		};

		// predefine already loaded modules to avoid redundant loading
		// Module.get("sap/ui/thirdparty/jquery.js").ready(_sBootstrapUrl, jQuery);
		Module.get("sap/ui/thirdparty/URI.js").ready(_sBootstrapUrl, URI);
		Module.get("sap/ui/Device.js").ready(_sBootstrapUrl, Device);
		Module.get("jquery.sap.global.js").ready(_sBootstrapUrl, jQuery);

		/**
		 * Name conversion function that converts a name in UI5 module name syntax to a name in requireJS module name syntax.
		 * @private
		 */
		function ui5ToRJS(sName) {
			if ( /^jquery\.sap\./.test(sName) ) {
				return sName;
			}
			return sName.replace(/\./g, "/");
		}

		/**
		 * Name conversion function that converts a name in unified resource name syntax to a name in UI5 module name syntax.
		 * If the name cannot be converted (e.g. doesn't end with '.js'), then <code>undefined</code> is returned.
		 *
		 * @private
		 */
		function urnToUI5(sName) {
			// UI5 module name syntax is only defined for JS resources
			if ( !/\.js$/.test(sName) ) {
				return;
			}

			sName = sName.slice(0, -3);
			if ( /^jquery\.sap\./.test(sName) ) {
				return sName; // do nothing
			}
			return sName.replace(/\//g, ".");
		}

		// find longest matching prefix for resource name
		function getResourcePath(sResourceName, sSuffix) {

			// split name into segments
			var aSegments = sResourceName.split(/\//),
				l, sNamePrefix, sResult, m;

			// if no suffix was given and if the name is not empty, try to guess the suffix from the last segment
			if ( arguments.length === 1  &&  aSegments.length > 0 ) {
				// only known types (and their known subtypes) are accepted
				m = rSubTypes.exec(aSegments[aSegments.length - 1]);
				if ( m ) {
					sSuffix = m[0];
					aSegments[aSegments.length - 1] = aSegments[aSegments.length - 1].slice(0, m.index);
				} else {
					sSuffix = "";
				}
			}

			// search for a defined name prefix, starting with the full name and successively removing one segment
			for (l = aSegments.length; l >= 0; l--) {
				sNamePrefix = aSegments.slice(0, l).join('/');
				if ( mUrlPrefixes[sNamePrefix] ) {
					sResult = mUrlPrefixes[sNamePrefix].url;
					if ( l < aSegments.length ) {
						sResult += aSegments.slice(l).join('/');
					}
					if ( sResult.slice(-1) === '/' ) {
						sResult = sResult.slice(0, -1);
					}
					return sResult + (sSuffix || '');
				}
			}

			jQuery.sap.assert(false, "should never happen");
		}

		function guessResourceName(sURL) {
			var sNamePrefix,
				sUrlPrefix,
				sResourceName;

			// Make sure to have an absolute URL to check against absolute prefix URLs
			sURL = resolveURL(sURL);

			for (sNamePrefix in mUrlPrefixes) {
				if ( mUrlPrefixes.hasOwnProperty(sNamePrefix) ) {

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

			// return undefined;
		}

		function extractStacktrace(oError) {
			if (!oError.stack) {
				try {
					throw oError;
				} catch (ex) {
					return ex.stack;
				}
			}
			return oError.stack;
		}

		function enhanceStacktrace(oError, oCausedByStack) {
			// concat the error stack for better traceability of loading issues
			// (ignore for PhantomJS since Error.stack is readonly property!)
			if (!Device.browser.phantomJS) {
				var oErrorStack = extractStacktrace(oError);
				if (oErrorStack && oCausedByStack) {
					oError.stack = oErrorStack + "\nCaused by: " + oCausedByStack;
				}
			}
			// for non Chrome browsers we log the caused by stack manually in the console
			if (window.console && !Device.browser.chrome) {
				/*eslint-disable no-console */
				console.error(oError.message + "\nCaused by: " + oCausedByStack);
				/*eslint-enable no-console */
			}
		}

		var rDotsAnywhere = /(?:^|\/)\.+/;
		var rDotSegment = /^\.*$/;

		/**
		 * Resolves relative module names that contain <code>./</code> or <code>../</code> segments to absolute names.
		 * E.g.: A name <code>../common/validation.js</code> defined in <code>sap/myapp/controller/mycontroller.controller.js</code>
		 * may resolve to <code>sap/myapp/common/validation.js</code>.
		 *
		 * When sBaseName is <code>null</code>, relative names are not allowed (e.g. for a <code>sap.ui.require</code> call)
		 * and their usage results in an error being thrown.
		 *
		 * @param {string|null} sBaseName name of a reference module
		 * @param {string} sModuleName the name to resolve
		 * @returns {string} resolved name
		 * @private
		 */
		function resolveModuleName(sBaseName, sModuleName) {

			var m = rDotsAnywhere.exec(sModuleName),
				aSegments,
				sSegment,
				i,j,l;

			// check whether the name needs to be resolved at all - if not, just return the sModuleName as it is.
			if ( !m ) {
				return sModuleName;
			}

			// if the name starts with a relative segments then there must be a base name (a global sap.ui.require doesn't support relative names)
			if ( m.index === 0 && sBaseName == null ) {
				throw new Error("relative name not supported ('" + sModuleName + "'");
			}

			// if relative name starts with a dot segment, then prefix it with the base path
			aSegments = (m.index === 0 ? sBaseName + sModuleName : sModuleName).split('/');

			// process path segments
			for (i = 0, j = 0, l = aSegments.length; i < l; i++) {

				var sSegment = aSegments[i];

				if ( rDotSegment.test(sSegment) ) {
					if (sSegment === '.' || sSegment === '') {
						// ignore '.' as it's just a pointer to current package. ignore '' as it results from double slashes (ignored by browsers as well)
						continue;
					} else if (sSegment === '..') {
						// move to parent directory
						if ( j === 0 ) {
							throw new Error("Can't navigate to parent of root (base='" + sBaseName + "', name='" + sModuleName + "'");//  sBaseNamegetPackagePath(), relativePath));
						}
						j--;
					} else {
						throw new Error("illegal path segment '" + sSegment + "'");
					}
				} else {

					aSegments[j++] = sSegment;

				}

			}

			aSegments.length = j;

			return aSegments.join('/');
		}

		function declareModule(sModuleName) {
			var oModule;

			// sModuleName must be a unified resource name of type .js
			jQuery.sap.assert(/\.js$/.test(sModuleName), "must be a Javascript module");

			oModule = Module.get(sModuleName);

			if ( oModule.state > INITIAL ) {
				return oModule;
			}

			if ( log.isLoggable() ) {
				log.debug(sLogPrefix + "declare module '" + sModuleName + "'");
			}

			// avoid cycles
			oModule.state = READY;

			// the first call to declareModule is assumed to identify the bootstrap module
			// Note: this is only a guess and fails e.g. when multiple modules are loaded via a script tag
			// to make it safe, we could convert 'declare' calls to e.g. 'subdeclare' calls at build time.
			if ( _execStack.length === 0 ) {
				_execStack.push(sModuleName);
				oModule.url = oModule.url || _sBootstrapUrl;
			}

			return oModule;
		}

		function requireModule(oRequestingModule, sModuleName, bAsync) {

			// TODO enable when preload has been adapted:
			// sModuleName = mAMDAliases[sModuleName] || sModuleName;

			var bLoggable = log.isLoggable(),
				m = rJSSubtypes.exec(sModuleName),
				oShim = mAMDShim[sModuleName],
				sBaseName, sType, oModule, aExtensions, i, sMsg;

			// only for robustness, should not be possible by design (all callers append '.js')
			if ( !m ) {
				throw new Error("can only require Javascript module, not " + sModuleName);
			}

			oModule = Module.get(sModuleName);

			if ( oShim && oShim.deps && !oShim.deps.requested ) {
				if ( bLoggable ) {
					log.debug("require dependencies of raw module " + sModuleName);
				}
				return requireAll(oModule, oShim.deps, function() {
					oShim.deps.requested = true;
					return requireModule(oRequestingModule, sModuleName, bAsync);
				}, bAsync);
			}

			// in case of having a type specified ignore the type for the module path creation and add it as file extension
			sBaseName = sModuleName.slice(0, m.index);
			sType = m[0]; // must be a normalized resource name of type .js sType can be one of .js|.view.js|.controller.js|.fragment.js|.designtime.js

			if ( bLoggable ) {
				log.debug(sLogPrefix + "require '" + sModuleName + "' of type '" + sType + "'");
			}

			// check if module has been loaded already
			if ( oModule.state !== INITIAL ) {
				if ( oModule.state === PRELOADED ) {
					oModule.state = LOADED;
					jQuery.sap.measure.start(sModuleName, "Require module " + sModuleName + " (preloaded)", ["require"]);
					execModule(sModuleName, bAsync);
					jQuery.sap.measure.end(sModuleName);
				}

				if ( oModule.state === READY ) {
					if ( bLoggable ) {
						log.debug(sLogPrefix + "module '" + sModuleName + "' has already been loaded (skipped).");
					}
					return oModule.value();
				} else if ( oModule.state === FAILED ) {
					var oError = new Error("found in negative cache: '" + sModuleName +  "' from " + oModule.url + ": " + oModule.errorMessage);
					enhanceStacktrace(oError, oModule.errorStack);
					throw oError;
				} else {
					// currently loading
					return;
				}
			}

			jQuery.sap.measure.start(sModuleName, "Require module " + sModuleName, ["require"]);

			// set marker for loading modules (to break cycles)
			oModule.state = LOADING;
			// if debug is enabled, try to load debug module first
			aExtensions = window["sap-ui-loaddbg"] ? ["-dbg", ""] : [""];
			for (i = 0; i < aExtensions.length && oModule.state !== LOADED; i++) {
				// create module URL for the current extension
				oModule.url = getResourcePath(sBaseName, aExtensions[i] + sType);
				if ( bLoggable ) {
					log.debug(sLogPrefix + "loading " + (aExtensions[i] ? aExtensions[i] + " version of " : "") + "'" + sModuleName + "' from '" + oModule.url + "'");
				}

				if ( !bAsync && syncCallBehavior && sModuleName !== 'sap/ui/core/Core.js' ) {
					sMsg = "[nosync] loading module '" + oModule.url + "'";
					if ( syncCallBehavior === 1 ) {
						log.error(sMsg);
					} else {
						throw new Error(sMsg);
					}
				}

				/*eslint-disable no-loop-func */
				jQuery.ajax({
					url : oModule.url,
					dataType : 'text',
					async : false,
					success : function(response, textStatus, xhr) {
						oModule.state = LOADED;
						oModule.data = response;
					},
					error : function(xhr, textStatus, error) {
						oModule.state = FAILED;
						oModule.errorMessage = xhr ? xhr.status + " - " + xhr.statusText : textStatus;
						oModule.errorStack = error && error.stack;
						oModule.loadError = true;
					}
				});
				/*eslint-enable no-loop-func */
			}
			// execute module __after__ loading it, this reduces the required stack space!
			if ( oModule.state === LOADED ) {
				execModule(sModuleName, bAsync);
			}

			jQuery.sap.measure.end(sModuleName);

			if ( oModule.state !== READY ) {

				//better error reporting for js errors in modules
				if (window["sap-ui-debug"]) {
					jQuery.sap.includeScript(oModule.url);
				}

				var oError = new Error("failed to load '" + sModuleName +  "' from " + oModule.url + ": " + oModule.errorMessage);
				enhanceStacktrace(oError, oModule.errorStack);
				oError.loadError = oModule.loadError;
				throw oError;
			}

			return oModule.value();
		}

		/**
		 * Executes the wrapper function around a preloaded, non-AMD module.
		 * The only purpose of this function is to isolate the execution time of function parsing in performance measurements.
		 * @no-rename
		 * @private
		 */
		function callPreloadWrapperFn(fn) {
			callPreloadWrapperFn.count++;
			return fn.call(window);
		}
		callPreloadWrapperFn.count = 0;

		/**
		 * Executes the factory function for an AMD-module.
		 * The only purpose of this function is to isolate the execution time of function parsing in performance measurements.
		 * @no-rename
		 * @private
		 */
		function applyAMDFactoryFn(fn, dep) {
			applyAMDFactoryFn.count++;
			return fn.apply(window, dep);
		}
		applyAMDFactoryFn.count = 0;

		/**
		 * Evaluates the script for a loaded or preloaded module.
		 * The only purpose of this function is to isolate the execution time of string parsing in performance measurements.
		 * @no-rename
		 * @private
		 */
		function evalModuleStr(script) {
			evalModuleStr.count++;
			return window.eval(script);
		}
		evalModuleStr.count = 0;

		// sModuleName must be a normalized resource name of type .js
		function execModule(sModuleName, bAsync) {

			var oModule = mModules[sModuleName],
				oShim = mAMDShim[sModuleName],
				bLoggable = log.isLoggable(),
				sOldPrefix, sScript, vAMD, oMatch, bOldGlobalAsyncMode;

			if ( oModule && oModule.state === LOADED && typeof oModule.data !== "undefined" ) {

				// check whether the module is known to use an existing AMD loader, remember the AMD flag
				vAMD = (oShim === true || (oShim && oShim.amd)) && typeof window.define === "function" && window.define.amd;
				bOldGlobalAsyncMode = bGlobalAsyncMode;

				try {

					if ( vAMD ) {
						// temp. remove the AMD Flag from the loader
						delete window.define.amd;
					}
					bGlobalAsyncMode = bAsync;

					if ( bLoggable ) {
						log.debug(sLogPrefix + "executing '" + sModuleName + "'");
						sOldPrefix = sLogPrefix;
						sLogPrefix = sLogPrefix + ": ";
					}

					// execute the script in the window context
					oModule.state = EXECUTING;
					_execStack.push(sModuleName);
					if ( typeof oModule.data === "function" ) {
						callPreloadWrapperFn(oModule.data);
					} else if ( Array.isArray(oModule.data) ) {
						sap.ui.define.apply(sap.ui, oModule.data);
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
							if ( oMatch && oMatch[1] && /[^/]+\.js\.map$/.test(oMatch[2]) ) {
								// found a sourcemap annotation with a typical UI5 generated relative URL
								sScript = sScript.slice(0, oMatch.index) + oMatch[0].slice(0, -oMatch[2].length) + URI(oMatch[2]).absoluteTo(oModule.url);
							} else if ( !oMatch ) {
								sScript += "\n//# sourceURL=" + resolveURL(oModule.url);
								if (Device.browser.safari || Device.browser.chrome) {
									sScript += "?eval";
								}
							}
						}

						// framework internal hook to intercept the loaded script and modify
						// it before executing the script - e.g. useful for client side coverage
						if (typeof jQuery.sap.require._hook === "function") {
							sScript = jQuery.sap.require._hook(sScript, sModuleName);
						}

						if (window.execScript && (!oModule.data || oModule.data.length < MAX_EXEC_SCRIPT_LENGTH) ) {
							try {
								oModule.data && window.execScript(sScript); // execScript fails if data is empty
							} catch (e) {
								_execStack.pop();
								// eval again with different approach - should fail with a more informative exception
								jQuery.sap.globalEval(oModule.data);
								throw e; // rethrow err in case globalEval succeeded unexpectedly
							}
						} else {
							evalModuleStr(sScript);
						}
					}
					_execStack.pop();
					oModule.state = READY;
					oModule.data = undefined;
					oModule.value(); // enforce determination of module value for non-AMD modules

					if ( bLoggable ) {
						sLogPrefix = sOldPrefix;
						log.debug(sLogPrefix + "finished executing '" + sModuleName + "'");
					}

				} catch (err) {
					oModule.state = FAILED;
					oModule.errorStack = err && err.stack;
					oModule.errorMessage = ((err.toString && err.toString()) || err.message) + (err.line ? "(line " + err.line + ")" : "" );
					oModule.data = undefined;
				} finally {

					// restore AMD flag
					if ( vAMD ) {
						window.define.amd = vAMD;
					}
					bGlobalAsyncMode = bOldGlobalAsyncMode;
				}
			}
		}

		function requireAll(oRequestingModule, aDependencies, fnCallback, bAsync) {

			var aModules = [],
				bLoggable = log.isLoggable(),
				sBaseName, i, sDepModName;

			// calculate the base name for relative module names
			sBaseName = oRequestingModule && oRequestingModule.name.slice(0, oRequestingModule.name.lastIndexOf('/') + 1);
			aDependencies = aDependencies.slice();
			for (i = 0; i < aDependencies.length; i++) {
				aDependencies[i] = resolveModuleName(sBaseName, aDependencies[i]) + ".js";
			}

			for (i = 0; i < aDependencies.length; i++) {
				sDepModName = aDependencies[i];
				if ( bLoggable ) {
					log.debug(sLogPrefix + "require '" + sDepModName + "'");
				}
				aModules[i] = requireModule(oRequestingModule, sDepModName, bAsync);
				if ( bLoggable ) {
					log.debug(sLogPrefix + "require '" + sDepModName + "': done.");
				}
			}

			return fnCallback(aModules);
		}

		/**
		 * Constructs a URL to load the module with the given name and file type (suffix).
		 *
		 * Searches the longest prefix of the given module name for which a registration
		 * exists (see {@link jQuery.sap.registerModulePath}) and replaces that prefix
		 * by the registered URL prefix.
		 *
		 * The remainder of the module name is appended to the URL, replacing any dot with a slash.
		 *
		 * Finally, the given suffix (typically a file name extension) is added (unconverted).
		 *
		 * The returned name (without the suffix) doesn't end with a slash.
		 *
		 * @param {string} sModuleName module name to detemrine the path for
		 * @param {string} sSuffix suffix to be added to the resulting path
		 * @return {string} calculated path (URL) to the given module
		 *
		 * @public
		 * @static
		 */
		jQuery.sap.getModulePath = function(sModuleName, sSuffix) {
			return getResourcePath(ui5ToRJS(sModuleName), sSuffix);
		};

		/**
		 * Determines the URL for a resource given its unified resource name.
		 *
		 * Searches the longest prefix of the given resource name for which a registration
		 * exists (see {@link jQuery.sap.registerResourcePath}) and replaces that prefix
		 * by the registered URL prefix.
		 *
		 * The remainder of the resource name is appended to the URL.
		 *
		 * <b>Unified Resource Names</b><br>
		 * Several UI5 APIs use <i>Unified Resource Names (URNs)</i> as naming scheme for resources that
		 * they deal with (e.h. Javascript, CSS, JSON, XML, ...). URNs are similar to the path
		 * component of a URL:
		 * <ul>
		 * <li>they consist of a non-empty sequence of name segments</li>
		 * <li>segments are separated by a forward slash '/'</li>
		 * <li>name segments consist of URL path segment characters only. It is recommended to use only ASCII
		 * letters (upper or lower case), digits and the special characters '$', '_', '-', '.')</li>
		 * <li>the empty name segment is not supported</li>
		 * <li>names consisting of dots only, are reserved and must not be used for resources</li>
		 * <li>names are case sensitive although the underlying server might be case-insensitive</li>
		 * <li>the behavior with regard to URL encoded characters is not specified, %ddd notation should be avoided</li>
		 * <li>the meaning of a leading slash is undefined, but might be defined in future. It therefore should be avoided</li>
		 * </ul>
		 *
		 * UI5 APIs that only deal with Javascript resources, use a slight variation of this scheme,
		 * where the extension '.js' is always omitted (see {@link sap.ui.define}, {@link sap.ui.require}).
		 *
		 *
		 * <b>Relationship to old Module Name Syntax</b><br>
		 *
		 * Older UI5 APIs that deal with resources (like {@link jQuery.sap.registerModulePath},
		 * {@link jQuery.sap.require} and {@link jQuery.sap.declare}) used a dot-separated naming scheme
		 * (called 'module names') which was motivated by object names in the global namespace in
		 * Javascript.
		 *
		 * The new URN scheme better matches the names of the corresponding resources (files) as stored
		 * in a server and the dot ('.') is no longer a forbidden character in a resource name. This finally
		 * allows to handle resources with different types (extensions) with the same API, not only JS files.
		 *
		 * Last but not least does the URN scheme better match the naming conventions used by AMD loaders
		 * (like <code>requireJS</code>).
		 *
		 * @param {string} sResourceName unified resource name of the resource
		 * @returns {string} URL to load the resource from
		 * @public
		 * @experimental Since 1.27.0
		 * @function
		 */
		jQuery.sap.getResourcePath = getResourcePath;

		/**
		 * Registers a URL prefix for a module name prefix.
		 *
		 * Before a module is loaded, the longest registered prefix of its module name
		 * is searched for and the associated URL prefix is used as a prefix for the request URL.
		 * The remainder of the module name is attached to the request URL by replacing
		 * dots ('.') with slashes ('/').
		 *
		 * The registration and search operates on full name segments only. So when a prefix
		 *
		 *    'sap.com'  ->  'http://www.sap.com/ui5/resources/'
		 *
		 * is registered, then it will match the name
		 *
		 *    'sap.com.Button'
		 *
		 * but not
		 *
		 *    'sap.commons.Button'
		 *
		 * Note that the empty prefix ('') will always match and thus serves as a fallback for
		 * any search.
		 *
		 * The prefix can either be given as string or as object which contains the url and a 'final' property.
		 * If 'final' is set to true, overwriting a module prefix is not possible anymore.
		 *
		 * @param {string} sModuleName module name to register a path for
		 * @param {string | object} vUrlPrefix path prefix to register, either a string literal or an object (e.g. {url : 'url/to/res', 'final': true})
		 * @param {string} [vUrlPrefix.url] path prefix to register
		 * @param {boolean} [vUrlPrefix.final] flag to avoid overwriting the url path prefix for the given module name at a later point of time
		 *
		 * @public
		 * @static
		 * @SecSink {1|PATH} Parameter is used for future HTTP requests
		 */
		jQuery.sap.registerModulePath = function registerModulePath(sModuleName, vUrlPrefix) {
			jQuery.sap.assert(!/\//.test(sModuleName), "module name must not contain a slash.");
			sModuleName = sModuleName.replace(/\./g, "/");
			// URL must not be empty
			vUrlPrefix = vUrlPrefix || '.';
			jQuery.sap.registerResourcePath(sModuleName, vUrlPrefix);
		};

		/**
		 * Registers a URL prefix for a resource name prefix.
		 *
		 * Before a resource is loaded, the longest registered prefix of its unified resource name
		 * is searched for and the associated URL prefix is used as a prefix for the request URL.
		 * The remainder of the resource name is attached to the request URL 1:1.
		 *
		 * The registration and search operates on full name segments only. So when a prefix
		 *
		 *    'sap/com'  ->  'http://www.sap.com/ui5/resources/'
		 *
		 * is registered, then it will match the name
		 *
		 *    'sap/com/Button'
		 *
		 * but not
		 *
		 *    'sap/commons/Button'
		 *
		 * Note that the empty prefix ('') will always match and thus serves as a fallback for
		 * any search.
		 *
		 * The url prefix can either be given as string or as object which contains the url and a final flag.
		 * If final is set to true, overwriting a resource name prefix is not possible anymore.
		 *
		 * @param {string} sResourceNamePrefix in unified resource name syntax
		 * @param {string | object} vUrlPrefix prefix to use instead of the sResourceNamePrefix, either a string literal or an object (e.g. {url : 'url/to/res', 'final': true})
		 * @param {string} [vUrlPrefix.url] path prefix to register
		 * @param {boolean} [vUrlPrefix.final] flag to avoid overwriting the url path prefix for the given module name at a later point of time
		 *
		 * @public
		 * @static
		 * @SecSink {1|PATH} Parameter is used for future HTTP requests
		 */
		jQuery.sap.registerResourcePath = function registerResourcePath(sResourceNamePrefix, vUrlPrefix) {

			function same(oPrefix1, oPrefix2) {
				return oPrefix1.url === oPrefix2.url && !oPrefix1["final"] === !oPrefix2["final"];
			}

			sResourceNamePrefix = String(sResourceNamePrefix || "");

			if ( typeof vUrlPrefix === 'string' || vUrlPrefix instanceof String ) {
				vUrlPrefix = { 'url' : vUrlPrefix };
			}

			var oOldPrefix = mUrlPrefixes[sResourceNamePrefix];

			if (oOldPrefix && oOldPrefix["final"] == true) {
				if ( !vUrlPrefix || !same(oOldPrefix, vUrlPrefix) ) {
					log.warning( "registerResourcePath with prefix " + sResourceNamePrefix + " already set as final to '" + oOldPrefix.url + "'. This call is ignored." );
				}
				return;
			}

			if ( !vUrlPrefix || vUrlPrefix.url == null ) {

				if ( oOldPrefix ) {
					delete mUrlPrefixes[sResourceNamePrefix];
					log.info("registerResourcePath ('" + sResourceNamePrefix + "') (registration removed)");
				}

			} else {

				vUrlPrefix.url = String(vUrlPrefix.url);

				// remove query parameters and/or hash
				var iQueryOrHashIndex = vUrlPrefix.url.search(/[?#]/);
				if (iQueryOrHashIndex !== -1) {
					vUrlPrefix.url = vUrlPrefix.url.slice(0, iQueryOrHashIndex);
				}

				// ensure that the prefix ends with a '/'
				if ( vUrlPrefix.url.slice(-1) != '/' ) {
					vUrlPrefix.url += '/';
				}

				// calculate absolute url
				// only to be used by 'guessResourceName'
				vUrlPrefix.absoluteUrl = resolveURL(vUrlPrefix.url);

				mUrlPrefixes[sResourceNamePrefix] = vUrlPrefix;

				if ( !oOldPrefix || !same(oOldPrefix, vUrlPrefix) ) {
					log.info("registerResourcePath ('" + sResourceNamePrefix + "', '" + vUrlPrefix.url + "')" + (vUrlPrefix['final'] ? " (final)" : ""));
				}
			}
		};

		/**
		 * Register information about third party modules that are not UI5 modules.
		 *
		 * The information maps the name of the module (without extension '.js') to an info object.
		 * Instead of a complete info object, only the value of the <code>deps</code> property can be given as an array.
		 *
		 * @param {object} mShims Map of shim configuration objects keyed by module names (withou extension '.js')
		 * @param {boolean} [mShims.any-module-name.amd=false]
		 *              Whether the module uses an AMD loader if present. If set to <code>true</code>, UI5 will disable
		 *              the AMD loader while loading such modules to force the modules to expose their content via global names.
		 * @param {string[]|string} [mShims.any-module-name.exports=undefined]
		 *              Global name (or names) that are exported by the module. If one ore multiple names are defined,
		 *              the first one will be read from the global object and will be used as value of the module.
		 *              Each name can be a dot separated hierarchial name (will be resolved with <code>jQuery.sap.getObject</code>)
		 * @param {string[]} [mShims.any-module-name.deps=undefined]
		 *              List of modules that the module depends on (requireJS syntax, no '.js').
		 *              The modules will be loaded first before loading the module itself.
		 *
		 * @private
		 */
		jQuery.sap.registerModuleShims = function(mShims) {
			jQuery.sap.assert( typeof mShims === 'object', "mShims must be an object");

			for ( var sName in mShims ) {
				var oShim = mShims[sName];
				if ( Array.isArray(oShim) ) {
					oShim = { deps : oShim };
				}
				mAMDShim[sName + ".js"] = oShim;
			}
		};

		/**
		 * Check whether a given module has been loaded / declared already.
		 *
		 * Returns true as soon as a module has been required the first time, even when
		 * loading/executing it has not finished yet. So the main assertion of a
		 * return value of <code>true</code> is that the necessary actions have been taken
		 * to make the module available in the near future. It does not mean, that
		 * the content of the module is already available!
		 *
		 * This fuzzy behavior is necessary to avoid multiple requests for the same module.
		 * As a consequence of the assertion above, a <i>preloaded</i> module does not
		 * count as <i>declared</i>. For preloaded modules, an explicit call to
		 * <code>jQuery.sap.require</code> is necessary to make them available.
		 *
		 * If a caller wants to know whether a module needs to be loaded from the server,
		 * it can set <code>bIncludePreloaded</code> to true. Then, preloaded modules will
		 * be reported as 'declared' as well by this method.
		 *
		 * @param {string} sModuleName name of the module to be checked
		 * @param {boolean} [bIncludePreloaded=false] whether preloaded modules should be reported as declared.
		 * @return {boolean} whether the module has been declared already
		 * @public
		 * @static
		 */
		jQuery.sap.isDeclared = function isDeclared(sModuleName, bIncludePreloaded) {
			sModuleName = ui5ToRJS(sModuleName) + ".js";
			return mModules[sModuleName] && (bIncludePreloaded || mModules[sModuleName].state !== PRELOADED);
		};

		/**
		 * Whether the given resource has been loaded (or preloaded).
		 * @param {string} sResourceName Name of the resource to check, in unified resource name format
		 * @returns {boolean} Whether the resource has been loaded already
		 * @private
		 * @sap-restricted sap.ui.core
		 */
		jQuery.sap.isResourceLoaded = function isResourceLoaded(sResourceName) {
			return !!mModules[sResourceName];
		};

		/**
		 * Returns the names of all declared modules.
		 * @return {string[]} the names of all declared modules
		 * @see jQuery.sap.isDeclared
		 * @public
		 * @static
		 */
		jQuery.sap.getAllDeclaredModules = function() {
			var aModules = [];
			jQuery.each(mModules, function(sURN, oModule) {
				// filter out preloaded modules
				if ( oModule && oModule.state !== PRELOADED ) {
					var sModuleName = urnToUI5(sURN);
					if ( sModuleName ) {
						aModules.push(sModuleName);
					}
				}
			});
			return aModules;
		};

		// take resource roots from configuration
		if ( oCfgData.resourceroots ) {
			jQuery.each(oCfgData.resourceroots, jQuery.sap.registerModulePath);
		}

		// dump the URL prefixes
		log.info("URL prefixes set to:");
		for (var n in mUrlPrefixes) {
			log.info("  " + (n ? "'" + n + "'" : "(default)") + " : " + mUrlPrefixes[n].url + ((mUrlPrefixes[n]['final']) ? " (final)" : "") );
		}

		/**
		 * Declares a module as existing.
		 *
		 * By default, this function assumes that the module will create a JavaScript object
		 * with the same name as the module. As a convenience it ensures that the parent
		 * namespace for that object exists (by calling jQuery.sap.getObject).
		 * If such an object creation is not desired, <code>bCreateNamespace</code> must be set to false.
		 *
		 * @param {string | object}  sModuleName name of the module to be declared
		 *                           or in case of an object {modName: "...", type: "..."}
		 *                           where modName is the name of the module and the type
		 *                           could be a specific dot separated extension e.g.
		 *                           <code>{modName: "sap.ui.core.Dev", type: "view"}</code>
		 *                           loads <code>sap/ui/core/Dev.view.js</code> and
		 *                           registers as <code>sap.ui.core.Dev.view</code>
		 * @param {boolean} [bCreateNamespace=true] whether to create the parent namespace
		 *
		 * @public
		 * @static
		 * @deprecated As of 1.52, UI5 modules and their dependencies should be defined using {@link sap.ui.define}.
		 *    For more details see {@link topic:91f23a736f4d1014b6dd926db0e91070 Modules and Dependencies} in the
		 *    documentation.
		 */
		jQuery.sap.declare = function(sModuleName, bCreateNamespace) {

			var sNamespaceObj = sModuleName;

			// check for an object as parameter for sModuleName
			// in case of this the object contains the module name and the type
			// which could be {modName: "sap.ui.core.Dev", type: "view"}
			if (typeof (sModuleName) === "object") {
				sNamespaceObj = sModuleName.modName;
				sModuleName = ui5ToRJS(sModuleName.modName) + (sModuleName.type ? "." + sModuleName.type : "") + ".js";
			} else {
				sModuleName = ui5ToRJS(sModuleName) + ".js";
			}

			declareModule(sModuleName);

			// ensure parent namespace even if module was declared already
			// (as declare might have been called by require)
			if (bCreateNamespace !== false) {
				// ensure parent namespace
				jQuery.sap.getObject(sNamespaceObj, 1);
			}

		};

		/**
		 * Ensures that the given module is loaded and executed before execution of the
		 * current script continues.
		 *
		 * By issuing a call to this method, the caller declares a dependency to the listed modules.
		 *
		 * Any required and not yet loaded script will be loaded and execute synchronously.
		 * Already loaded modules will be skipped.
		 *
		 * @param {...string | object}  vModuleName one or more names of modules to be loaded
		 *                              or in case of an object {modName: "...", type: "..."}
		 *                              where modName is the name of the module and the type
		 *                              could be a specific dot separated extension e.g.
		 *                              <code>{modName: "sap.ui.core.Dev", type: "view"}</code>
		 *                              loads <code>sap/ui/core/Dev.view.js</code> and
		 *                              registers as <code>sap.ui.core.Dev.view</code>
		 *
		 * @public
		 * @static
		 * @function
		 * @SecSink {0|PATH} Parameter is used for future HTTP requests
		 * @deprecated As of 1.52, UI5 modules and their dependencies should be defined using {@link sap.ui.define}.
		 *    When additional modules have to be loaded dynamically at a later point in time, the asynchronous API
		 *    {@link sap.ui.require} should be used. For more details, see {@link topic:91f23a736f4d1014b6dd926db0e91070
		 *    Modules and Dependencies} in the documentation.
		 */
		jQuery.sap.require = function(vModuleName) {

			if ( arguments.length > 1 ) {
				// legacy mode with multiple arguments, each representing a dependency
				for (var i = 0; i < arguments.length; i++) {
					jQuery.sap.require(arguments[i]);
				}
				return this;
			}

			// check for an object as parameter for sModuleName
			// in case of this the object contains the module name and the type
			// which could be {modName: "sap.ui.core.Dev", type: "view"}
			if (typeof (vModuleName) === "object") {
				jQuery.sap.assert(!vModuleName.type || mKnownSubtypes.js.indexOf(vModuleName.type) >= 0, "type must be empty or one of " + mKnownSubtypes.js.join(", "));
				vModuleName = ui5ToRJS(vModuleName.modName) + (vModuleName.type ? "." + vModuleName.type : "") + ".js";
			} else {
				vModuleName = ui5ToRJS(vModuleName) + ".js";
			}

			requireModule(null, vModuleName, /* bAsync = */ false);

		};

		window.sap = window.sap || {};
		sap.ui = sap.ui || {};

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
		sap.ui.define = function(sModuleName, aDependencies, vFactory, bExport) {
			var bLoggable = log.isLoggable(),
				sResourceName;

			// optional id
			if ( typeof sModuleName === 'string' ) {
				sResourceName = sModuleName + '.js';
			} else {
				// shift parameters
				bExport = vFactory;
				vFactory = aDependencies;
				aDependencies = sModuleName;
				sResourceName = _execStack[_execStack.length - 1];
			}

			// convert module name to UI5 module name syntax (might fail!)
			sModuleName = urnToUI5(sResourceName);

			// optional array of dependencies
			if ( !Array.isArray(aDependencies) ) {
				// shift parameters
				bExport = vFactory;
				vFactory = aDependencies;
				aDependencies = [];
			}

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
					var sPackage = sResourceName.split('/').slice(0,-1).join('.');
					if ( sPackage ) {
						jQuery.sap.getObject(sPackage, 0);
					}
				}

				if ( typeof vFactory === 'function' ) {
					oModule.content = applyAMDFactoryFn(vFactory, aModules);
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
						jQuery.sap.setObject(sModuleName, oModule.content);
					}
				}

			}, /* bAsync = */ bGlobalAsyncMode);

		};

		/**
		 * @private
		 */
		sap.ui.predefine = function(sModuleName, aDependencies, vFactory, bExport) {

			if ( typeof sModuleName !== 'string' ) {
				throw new Error("sap.ui.predefine requires a module name");
			}

			var sResourceName = sModuleName + '.js';
			Module.get(sResourceName).preload("<unknown>/" + sModuleName, [sModuleName, aDependencies, vFactory, bExport], null);

			// when a library file is preloaded, also mark its preload file as loaded
			// for normal library preload, this is redundant, but for non-default merged entities
			// like sap/fiori/core.js it avoids redundant loading of library preload files
			if ( sResourceName.match(/\/library\.js$/) ) {
				mPreloadModules[urnToUI5(sResourceName) + "-preload"] = true;
			}

		};

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
		sap.ui.require = function(vDependencies, fnCallback) {
			jQuery.sap.assert(typeof vDependencies === 'string' || Array.isArray(vDependencies), "dependency param either must be a single string or an array of strings");
			jQuery.sap.assert(fnCallback == null || typeof fnCallback === 'function', "callback must be a function or null/undefined");

			if ( typeof vDependencies === 'string' ) {

				return Module.get(vDependencies + '.js').value();

			}

			requireAll(null, vDependencies, function(aModules) {

				if ( typeof fnCallback === 'function' ) {
					// enforce asynchronous execution of callback
					setTimeout(function() {
						fnCallback.apply(window, aModules);
					},0);
				}

			}, /* bAsync = */ true);

			// return undefined;
		};

		/**
		 * @private
		 */
		sap.ui.require.stat = function(iState) {
			var i = 0;
			Object.keys(mModules).sort().forEach(function(sModule) {
				if ( mModules[sModule].state >= iState ) {
					log.info( (++i) + " " + sModule + " " + mModules[sModule].state);
				}
			});
			log.info("apply AMD factory function: #" + applyAMDFactoryFn.count);
			log.info("call preload wrapper function: #" + callPreloadWrapperFn.count);
			log.info("eval module string : #" + evalModuleStr.count);
		};

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
		sap.ui.requireSync = function(sModuleName) {
			return requireModule(null, sModuleName + ".js", /* bAsync = */ false);
		};

		/**
		 * @private
		 * @deprecated
		 */
		jQuery.sap.preloadModules = function(sPreloadModule, bAsync, oSyncPoint) {

			var sURL, iTask, sMsg;

			jQuery.sap.log.error("[Deprecated] jQuery.sap.preloadModules was never a public API and will be removed soon. Migrate to Core.loadLibraries()!");

			jQuery.sap.assert(!bAsync || oSyncPoint, "if mode is async, a syncpoint object must be given");

			if ( !bAsync && syncCallBehavior ) {
				sMsg = "[nosync] synchronous preload of '" + sPreloadModule + "'";
				if ( syncCallBehavior === 1 ) {
					log.warning(sMsg);
				} else {
					throw new Error(sMsg);
				}
			}

			if ( mPreloadModules[sPreloadModule] ) {
				return;
			}

			mPreloadModules[sPreloadModule] = true;

			sURL = jQuery.sap.getModulePath(sPreloadModule, ".json");

			log.debug("preload file " + sPreloadModule);
			iTask = oSyncPoint && oSyncPoint.startTask("load " + sPreloadModule);

			jQuery.ajax({
				dataType : "json",
				async : bAsync,
				url : sURL,
				success : function(data) {
					if ( data ) {
						jQuery.sap.registerPreloadedModules(data, sURL);
						// also preload dependencies
						if ( Array.isArray(data.dependencies) ) {
							data.dependencies.forEach(function(sDependency) {
								jQuery.sap.preloadModules(sDependency, bAsync, oSyncPoint);
							});
						}
					}
					oSyncPoint && oSyncPoint.finishTask(iTask);
				},
				error : function(xhr, textStatus, error) {
					log.error("failed to preload '" + sPreloadModule + "': " + (error || textStatus));
					oSyncPoint && oSyncPoint.finishTask(iTask, false);
				}
			});

		};

		/**
		 * Adds all resources from a preload bundle to the preload cache.
		 *
		 * When a resource exists already in the cache, the new content is ignored.
		 *
		 * @param {object} oData Preload bundle
		 * @param {string} [oData.url] URL from which the bundle has been loaded
		 * @param {string} [oData.name] Unique name of the bundle
		 * @param {string} [oData.version='1.0'] Format version of the preload bundle
		 * @param {object} oData.modules Map of resources keyed by their resource name; each resource must be a string or a function
		 *
		 * @private
		 * @sap-restricted sap.ui.core,preloadfiles
		 */
		jQuery.sap.registerPreloadedModules = function(oData) {

			var bOldSyntax = Version(oData.version || "1.0").compareTo("2.0") < 0;

			if ( log.isLoggable() ) {
				log.debug(sLogPrefix + "adding preloaded modules from '" + oData.url + "'");
			}

			if ( oData.name ) {
				mPreloadModules[oData.name] = true;
			}

			jQuery.each(oData.modules, function(sName, sContent) {
				sName = bOldSyntax ? ui5ToRJS(sName) + ".js" : sName;
				Module.get(sName).preload(oData.url + "/" + sName, sContent, oData.name);
				// when a library file is preloaded, also mark its preload file as loaded
				// for normal library preload, this is redundant, but for non-default merged entities
				// like sap/fiori/core.js it avoids redundant loading of library preload files
				if ( sName.match(/\/library\.js$/) ) {
					mPreloadModules[urnToUI5(sName) + "-preload"] = true;
				}
			});

		};

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
		jQuery.sap.unloadResources = function(sName, bPreloadGroup, bUnloadAll, bDeleteExports) {
			var aModules = [];

			if ( bPreloadGroup == null ) {
				bPreloadGroup = true;
			}

			if ( bPreloadGroup ) {
				// collect modules that belong to the given group
				jQuery.each(mModules, function(sURN, oModule) {
					if ( oModule && oModule.group === sName ) {
						aModules.push(sURN);
					}
				});
				// also remove a preload entry
				delete mPreloadModules[sName];

			} else {
				// single module
				if ( mModules[sName] ) {
					aModules.push(sName);
				}
			}

			jQuery.each(aModules, function(i, sURN) {
				var oModule = mModules[sURN];
				if ( oModule && bDeleteExports && sURN.match(/\.js$/) ) {
					jQuery.sap.setObject(urnToUI5(sURN), undefined); // TODO really delete property
				}
				if ( oModule && (bUnloadAll || oModule.state === PRELOADED) ) {
				  delete mModules[sURN];
				}
			});

		};

		/**
		 * Converts a UI5 module name to a unified resource name.
		 *
		 * Used by View and Fragment APIs to convert a given module name into a unified resource name.
		 * When the <code>sSuffix</code> is not given, the suffix '.js' is added. This fits the most
		 * common use case of converting a module name to the Javascript resource that contains the
		 * module. Note that an empty <code>sSuffix</code> is not replaced by '.js'. This allows to
		 * convert UI5 module names to requireJS module names with a call to this method.
		 *
		 * @param {string} sModuleName Module name as a dot separated name
		 * @param {string} [sSuffix='.js'] Suffix to add to the final resource name
		 * @private
		 * @sap-restricted sap.ui.core
		 */
		jQuery.sap.getResourceName = function(sModuleName, sSuffix) {
			return ui5ToRJS(sModuleName) + (sSuffix == null ? ".js" : sSuffix);
		};

		/**
		 * Retrieves the resource with the given name, either from the preload cache or from
		 * the server. The expected data type of the resource can either be specified in the
		 * options (<code>dataType</code>) or it will be derived from the suffix of the <code>sResourceName</code>.
		 * The only supported data types so far are xml, html, json and text. If the resource name extension
		 * doesn't match any of these extensions, the data type must be specified in the options.
		 *
		 * If the resource is found in the preload cache, it will be converted from text format
		 * to the requested <code>dataType</code> using a converter from <code>jQuery.ajaxSettings.converters</code>.
		 *
		 * If it is not found, the resource name will be converted to a resource URL (using {@link #getResourcePath})
		 * and the resulting URL will be requested from the server with a synchronous jQuery.ajax call.
		 *
		 * If the resource was found in the local preload cache and any necessary conversion succeeded
		 * or when the resource was retrieved from the backend successfully, the content of the resource will
		 * be returned. In any other case, an exception will be thrown, or if option failOnError is set to true,
		 * <code>null</code> will be returned.
		 *
		 * Future implementations of this API might add more options. Generic implementations that accept an
		 * <code>mOptions</code> object and propagate it to this function should limit the options to the currently
		 * defined set of options or they might fail for unknown options.
		 *
		 * For asynchronous calls the return value of this method is an ECMA Script 6 Promise object which callbacks are triggered
		 * when the resource is ready:
		 * If <code>failOnError</code> is <code>false</code> the catch callback of the promise is not called. The argument given to the fullfilled
		 * callback is null in error case.
		 * If <code>failOnError</code> is <code>true</code> the catch callback will be triggered. The argument is an Error object in this case.
		 *
		 * @param {string} [sResourceName] resourceName in unified resource name syntax
		 * @param {object} [mOptions] options
		 * @param {object} [mOptions.dataType] one of "xml", "html", "json" or "text". If not specified it will be derived from the resource name (extension)
		 * @param {string} [mOptions.name] unified resource name of the resource to load (alternative syntax)
		 * @param {string} [mOptions.url] url of a resource to load (alternative syntax, name will only be a guess)
		 * @param {string} [mOptions.headers] Http headers for an eventual XHR request
		 * @param {string} [mOptions.failOnError=true] whether to propagate load errors or not
		 * @param {string} [mOptions.async=false] whether the loading should be performed asynchronously.
		 * @return {string|Document|object|Promise} content of the resource. A string for text or html, an Object for JSON, a Document for XML. For asynchronous calls an ECMA Script 6 Promise object will be returned.
		 * @throws Error if loading the resource failed
		 * @private
		 * @experimental API is not yet fully mature and may change in future.
		 * @since 1.15.1
		 */
		jQuery.sap.loadResource = function(sResourceName, mOptions) {

			var sType,
				oData,
				sUrl,
				oError,
				oDeferred;

			if ( typeof sResourceName === "string" ) {
				mOptions = mOptions || {};
			} else {
				mOptions = sResourceName || {};
				sResourceName = mOptions.name;
				if ( !sResourceName && mOptions.url) {
					sResourceName = guessResourceName(mOptions.url);
				}
			}
			// defaulting
			mOptions = jQuery.extend({ failOnError: true, async: false }, mOptions);

			sType = mOptions.dataType;
			if ( sType == null && sResourceName ) {
				sType = (sType = rTypes.exec(sResourceName)) && sType[1];
			}

			jQuery.sap.assert(/^(xml|html|json|text)$/.test(sType), "type must be one of xml, html, json or text");

			oDeferred = mOptions.async ? new jQuery.Deferred() : null;

			function handleData(d, e) {
				if ( d == null && mOptions.failOnError ) {
					oError = e || new Error("no data returned for " + sResourceName);
					if (mOptions.async) {
						oDeferred.reject(oError);
						jQuery.sap.log.error(oError);
					}
					return null;
				}

				if (mOptions.async) {
					oDeferred.resolve(d);
				}

				return d;
			}

			function convertData(d) {
				var vConverter = jQuery.ajaxSettings.converters["text " + sType];
				if ( typeof vConverter === "function" ) {
					d = vConverter(d);
				}
				return handleData(d);
			}

			if ( sResourceName && mModules[sResourceName] ) {
				oData = mModules[sResourceName].data;
				mModules[sResourceName].state = LOADED;
			}

			if ( oData != null ) {

				if (mOptions.async) {
					//Use timeout to simulate async behavior for this sync case for easier usage
					setTimeout(function(){
						convertData(oData);
					}, 0);
				} else {
					oData = convertData(oData);
				}

			} else {

				if ( !mOptions.async && syncCallBehavior ) {
					if ( syncCallBehavior >= 1 ) { // temp. raise a warning only
						log.error("[nosync] loading resource '" + (sResourceName || mOptions.url) + "' with sync XHR");
					} else {
						throw new Error("[nosync] loading resource '" + (sResourceName || mOptions.url) + "' with sync XHR");
					}
				}

				jQuery.ajax({
					url : sUrl = mOptions.url || getResourcePath(sResourceName),
					async : mOptions.async,
					dataType : sType,
					headers: mOptions.headers,
					success : function(data, textStatus, xhr) {
						oData = handleData(data);
					},
					error : function(xhr, textStatus, error) {
						oError = new Error("resource " + sResourceName + " could not be loaded from " + sUrl + ". Check for 'file not found' or parse errors. Reason: " + error);
						oError.status = textStatus;
						oError.error = error;
						oError.statusCode = xhr.status;
						oData = handleData(null, oError);
					}
				});

			}

			if ( mOptions.async ) {
				return Promise.resolve(oDeferred);
			}

			if ( oError != null && mOptions.failOnError ) {
				throw oError;
			}

			return oData;
		};

		/*
		 * register a global event handler to detect script execution errors.
		 * Only works for browsers that support document.currentScript.
		 * /
		window.addEventListener("error", function(e) {
			if ( document.currentScript && document.currentScript.dataset.sapUiModule ) {
				var error = {
					message: e.message,
					filename: e.filename,
					lineno: e.lineno,
					colno: e.colno
				};
				document.currentScript.dataset.sapUiModuleError = JSON.stringify(error);
			}
		});
		*/

		/**
		 * Loads the given Javascript resource (URN) asynchronously via as script tag.
		 * Returns a promise that will be resolved when the load event is fired or reject
		 * when the error event is fired.
		 *
		 * Note: execution errors of the script are not reported as 'error'.
		 *
		 * This method is not a full implementation of require. It is intended only for
		 * loading "preload" files that do not define an own module / module value.
		 *
		 * Functionality might be removed/renamed in future, so no code outside the
		 * sap.ui.core library must use it.
		 *
		 * @experimental
		 * @private
		 * @sap-restricted sap.ui.core,sap.ushell
		 */
		jQuery.sap._loadJSResourceAsync = function(sResource, bIgnoreErrors) {

			var oModule = Module.get(sResource);

			if ( !oModule.loaded ) {

				var oScript;
				var fnCreateLoadScriptPromise = function(bRetryOnFailure){
					return new Promise(function(resolve, reject) {

						function onload(e) {
							jQuery.sap.log.info("Javascript resource loaded: " + sResource);
							// TODO either find a cross-browser solution to detect and assign execution errors or document behavior
							//var error = e.target.dataset.sapUiModuleError;
							//if ( error ) {
							//	oModule.state = FAILED;
							//	oModule.error = JSON.parse(error);
							//	jQuery.sap.log.error("failed to load Javascript resource: " + sResource + ":" + error);
							//	reject(oModule.error);
							//}
							oScript.removeEventListener('load', onload);
							oScript.removeEventListener('error', onerror);
							oModule.state = READY;
							// TODO oModule.data = ?
							resolve();
						}

						function onerror(e) {
							oScript.removeEventListener('load', onload);
							oScript.removeEventListener('error', onerror);
							if (bRetryOnFailure) {
								log.warning("retry loading Javascript resource: " + sResource);
							} else {
								log.error("failed to load Javascript resource: " + sResource);
								oModule.state = FAILED;
							}

							// TODO oModule.error = xhr ? xhr.status + " - " + xhr.statusText : textStatus;
							reject();
						}

						var sUrl = oModule.url = getResourcePath(sResource);
						oModule.state = LOADING;

						oScript = window.document.createElement('SCRIPT');
						oScript.src = sUrl;
						oScript.setAttribute("data-sap-ui-module", sResource); // IE9/10 don't support dataset :-(
						// oScript.setAttribute("data-sap-ui-module-error", '');
						oScript.addEventListener('load', onload);
						oScript.addEventListener('error', onerror);
						appendHead(oScript);
					});
				};
				oModule.loaded = fnCreateLoadScriptPromise(/* bRetryOnFailure= */ true).catch(function(e){
					if (oScript && oScript.parentNode) {
						oScript.parentNode.removeChild(oScript);
					}
					//try to load the resource again if it fails the first time
					return fnCreateLoadScriptPromise(/* bRetryOnFailure= */ false);
				});

			}

			if ( bIgnoreErrors ) {
				return oModule.loaded.catch(function() {
					return undefined;
				});
			}

			return oModule.loaded;
		};

		return function() {

			//remove final information in mUrlPrefixes
			var mFlatUrlPrefixes = {};
			jQuery.each(mUrlPrefixes, function(sKey,oUrlPrefix) {
				mFlatUrlPrefixes[sKey] = oUrlPrefix.url;
			});


			return { modules : mModules, prefixes : mFlatUrlPrefixes };
		};

	}());

	// --------------------- script and stylesheet handling --------------------------------------------------

	// appends a link object to the head
	function appendHead(oElement) {
		var head = window.document.getElementsByTagName("head")[0];
		if (head) {
			head.appendChild(oElement);
		}
	}

	function _includeScript(sUrl, mAttributes, fnLoadCallback, fnErrorCallback) {
		var oScript = window.document.createElement("script");
		oScript.src = sUrl;
		oScript.type = "text/javascript";
		if (mAttributes && typeof mAttributes === "object") {
			Object.keys(mAttributes).forEach(function(sKey) {
				if (mAttributes[sKey] != null) {
					oScript.setAttribute(sKey, mAttributes[sKey]);
				}
			});
		}

		if (fnLoadCallback) {
			jQuery(oScript).load(function() {
				fnLoadCallback();
				jQuery(oScript).off("load");
			});
		}

		if (fnErrorCallback) {
			jQuery(oScript).error(function() {
				fnErrorCallback();
				jQuery(oScript).off("error");
			});
		}

		// jQuery("head").append(oScript) doesn't work because they filter for the script
		// and execute them directly instead adding the SCRIPT tag to the head
		var oOld, sId = mAttributes && mAttributes.id;
		if ((sId && (oOld = jQuery.sap.domById(sId)) && oOld.tagName === "SCRIPT")) {
			jQuery(oOld).remove(); // replacing scripts will not trigger the load event
		}
		appendHead(oScript);
	}

	/**
	 * Includes the script (via &lt;script&gt;-tag) into the head for the
	 * specified <code>sUrl</code> and optional <code>sId</code>.
	 *
	 * @param {string|object}
	 *            vUrl the URL of the script to load or a configuration object
	 * @param {string}
	 *            vUrl.url the URL of the script to load
	 * @param {string}
	 *            [vUrl.id] id that should be used for the script tag
	 * @param {object}
	 *            [vUrl.attributes] map of attributes that should be used for the script tag
	 * @param {string|object}
	 *            [vId] id that should be used for the script tag or map of attributes
	 * @param {function}
	 *            [fnLoadCallback] callback function to get notified once the script has been loaded
	 * @param {function}
	 *            [fnErrorCallback] callback function to get notified once the script loading failed
	 * @return {void|Promise}
	 *            When using the configuration object a <code>Promise</code> will be returned. The
	 *            documentation for the <code>fnLoadCallback</code> applies to the <code>resolve</code>
	 *            handler of the <code>Promise</code> and the one for the <code>fnErrorCallback</code>
	 *            applies to the <code>reject</code> handler of the <code>Promise</code>.
	 *
	 * @public
	 * @static
	 * @SecSink {0|PATH} Parameter is used for future HTTP requests
	 */
	jQuery.sap.includeScript = function includeScript(vUrl, vId, fnLoadCallback, fnErrorCallback) {
		if (typeof vUrl === "string") {
			var mAttributes = typeof vId === "string" ? {id: vId} : vId;
			_includeScript(vUrl, mAttributes, fnLoadCallback, fnErrorCallback);
		} else {
			jQuery.sap.assert(typeof vUrl === 'object' && vUrl.url, "vUrl must be an object and requires a URL");
			if (vUrl.id) {
				vUrl.attributes = vUrl.attributes || {};
				vUrl.attributes.id = vUrl.id;
			}
			return new Promise(function(fnResolve, fnReject) {
				_includeScript(vUrl.url, vUrl.attributes, fnResolve, fnReject);
			});
		}
	};

	function _includeStyleSheet(sUrl, mAttributes, fnLoadCallback, fnErrorCallback) {

		var _createLink = function(sUrl, mAttributes, fnLoadCallback, fnErrorCallback){

			// create the new link element
			var oLink = document.createElement("link");
			oLink.type = "text/css";
			oLink.rel = "stylesheet";
			oLink.href = sUrl;
			if (mAttributes && typeof mAttributes === "object") {
				Object.keys(mAttributes).forEach(function(sKey) {
					if (mAttributes[sKey] != null) {
						oLink.setAttribute(sKey, mAttributes[sKey]);
					}
				});
			}

			var fnError = function() {
				jQuery(oLink).attr("data-sap-ui-ready", "false").off("error");
				if (fnErrorCallback) {
					fnErrorCallback();
				}
			};

			var fnLoad = function() {
				jQuery(oLink).attr("data-sap-ui-ready", "true").off("load");
				if (fnLoadCallback) {
					fnLoadCallback();
				}
			};

			// for IE / Edge we will check if the stylesheet contains any rule and then
			// either trigger the load callback or the error callback
			if ( Device.browser.msie || Device.browser.edge ) {
				var fnLoadOrg = fnLoad;
				fnLoad = function(oEvent) {
					var aRules;
					try {
						// in cross-origin scenarios IE / Edge can still access the rules of the stylesheet
						// if the stylesheet has been loaded properly
						aRules = oEvent.target && oEvent.target.sheet && oEvent.target.sheet.rules;
						// in cross-origin scenarios now the catch block will be executed because we
						// cannot access the rules of the stylesheet but for non cross-origin stylesheets
						// we will get an empty rules array and finally we cannot differ between
						// empty stylesheet or loading issue correctly => documented in JSDoc!
					} catch (ex) {
						// exception happens when the stylesheet could not be loaded from the server
						// we now ignore this and know that the stylesheet doesn't exists => trigger error
					}
					// no rules means error
					if (aRules && aRules.length > 0) {
						fnLoadOrg();
					} else {
						fnError();
					}
				};
			}

			jQuery(oLink).load(fnLoad);
			jQuery(oLink).error(fnError);
			return oLink;

		};

		// check for existence of the link
		var oOld = jQuery.sap.domById(mAttributes && mAttributes.id);
		var oLink = _createLink(sUrl, mAttributes, fnLoadCallback, fnErrorCallback);
		if (oOld && oOld.tagName === "LINK" && oOld.rel === "stylesheet") {
			// link exists, so we replace it - but only if a callback has to be attached or if the href will change. Otherwise don't touch it
			if (fnLoadCallback || fnErrorCallback || oOld.href !== resolveURL(sUrl)) {
				// if the attribute "data-sap-ui-foucmarker" exists and the value
				// matches the id of the new link the new link will be put
				// before the old link into the document and the id attribute
				// will be removed from the old link (to avoid FOUC)
				// => sap/ui/core/ThemeCheck removes these old links again once
				//    the new theme has been fully loaded
				if (oOld.getAttribute("data-sap-ui-foucmarker") === oLink.id) {
					jQuery(oOld).removeAttr("id").before(oLink);
				} else {
					jQuery(oOld).replaceWith(oLink);
				}
			} else {
				// in case of using without callbacks and applying the same URL
				// the foucmarker has to be removed as the link will not be
				// replaced with another link - otherwise the ThemeCheck would
				// remove this link
				if (oOld.getAttribute("data-sap-ui-foucmarker") === oLink.id) {
					oOld.removeAttribute("data-sap-ui-foucmarker");
				}
			}
		} else {
			oOld = jQuery('#sap-ui-core-customcss');
			if (oOld.length > 0) {
				oOld.first().before(oLink);
			} else {
				appendHead(oLink);
			}
		}

	}

	/**
	 * Includes the specified stylesheet via a &lt;link&gt;-tag in the head of the current document. If there is call to
	 * <code>includeStylesheet</code> providing the sId of an already included stylesheet, the existing element will be
	 * replaced.
	 *
	 * @param {string|object}
	 *          vUrl the URL of the stylesheet to load or a configuration object
	 * @param {string}
	 *          vUrl.url the URL of the stylesheet to load
	 * @param {string}
	 *          [vUrl.id] id that should be used for the link tag
	 * @param {object}
	 *          [vUrl.attributes] map of attributes that should be used for the script tag
	 * @param {string|object}
	 *          [vId] id that should be used for the link tag or map of attributes
	 * @param {function}
	 *          [fnLoadCallback] callback function to get notified once the stylesheet has been loaded
	 * @param {function}
	 *          [fnErrorCallback] callback function to get notified once the stylesheet loading failed.
	 *            In case of usage in IE the error callback will also be executed if an empty stylesheet
	 *            is loaded. This is the only option how to determine in IE if the load was successful
	 *            or not since the native onerror callback for link elements doesn't work in IE. The IE
	 *            always calls the onload callback of the link element.
	 * @return {void|Promise}
	 *            When using the configuration object a <code>Promise</code> will be returned. The
	 *            documentation for the <code>fnLoadCallback</code> applies to the <code>resolve</code>
	 *            handler of the <code>Promise</code> and the one for the <code>fnErrorCallback</code>
	 *            applies to the <code>reject</code> handler of the <code>Promise</code>.
	 *
	 * @public
	 * @static
	 * @SecSink {0|PATH} Parameter is used for future HTTP requests
	 */
	jQuery.sap.includeStyleSheet = function includeStyleSheet(vUrl, vId, fnLoadCallback, fnErrorCallback) {
		if (typeof vUrl === "string") {
			var mAttributes = typeof vId === "string" ? {id: vId} : vId;
			_includeStyleSheet(vUrl, mAttributes, fnLoadCallback, fnErrorCallback);
		} else {
			jQuery.sap.assert(typeof vUrl === 'object' && vUrl.url, "vUrl must be an object and requires a URL");
			if (vUrl.id) {
				vUrl.attributes = vUrl.attributes || {};
				vUrl.attributes.id = vUrl.id;
			}
			return new Promise(function(fnResolve, fnReject) {
				_includeStyleSheet(vUrl.url, vUrl.attributes, fnResolve, fnReject);
			});
		}
	};

	// --------------------- support hooks ---------------------------------------------------------

	// TODO should be in core, but then the 'callback' could not be implemented
	if ( !(oCfgData.productive === true || oCfgData.productive === "true"  || oCfgData.productive === "x") ) {
		// Check whether the left 'alt' key is used
		// The TechnicalInfo should be shown only when left 'alt' key is used
		// because the right 'alt' key is mapped to 'alt' + 'ctrl' on windows
		// in some languages for example German or Polish which makes right
		// 'alt' + 'shift' + S open the TechnicalInfo
		var bLeftAlt = false;

		document.addEventListener('keydown', function(e) {
			try {
				if (e.keyCode === 18) { // 'alt' Key
					bLeftAlt = (typeof e.location !== "number" /* location isn't supported */ || e.location === 1 /* left */);
					return;
				}

				if (e.shiftKey && e.altKey && e.ctrlKey && bLeftAlt) {
					// invariant: when e.altKey is true, there must have been a preceding keydown with keyCode === 18, so bLeftAlt is always up-to-date
					if ( e.keyCode === 80 ) { // 'P'
						sap.ui.require(['sap/ui/core/support/techinfo/TechnicalInfo'], function(TechnicalInfo) {
							TechnicalInfo.open(function() {
								var oInfo = getModuleSystemInfo();
								return { modules : oInfo.modules, prefixes : oInfo.prefixes, config: oCfgData };
							});
						});
					} else if ( e.keyCode === 83 ) { // 'S'
						sap.ui.require(['sap/ui/core/support/Support'], function(Support) {
							var oSupport = Support.getStub();
							if (oSupport.getType() != Support.StubType.APPLICATION) {
								return;
							}
							oSupport.openSupportTool();
						});
					}
				}
			} catch (oException) {
				// ignore any errors
			}
		});
	}

	// --------------------- feature detection, enriching jQuery.support  ----------------------------------------------------

	// this might go into its own file once there is more stuff added

	/**
	 * Holds information about the browser's capabilities and quirks.
	 * This object is provided and documented by jQuery.
	 * But it is extended by SAPUI5 with detection for features not covered by jQuery. This documentation ONLY covers the detection properties added by UI5.
	 * For the standard detection properties, please refer to the jQuery documentation.
	 *
	 * These properties added by UI5 are only available temporarily until jQuery adds feature detection on their own.
	 *
	 * @name jQuery.support
	 * @namespace
	 * @since 1.12
	 * @public
	 */

	if (!jQuery.support) {
		jQuery.support = {};
	}

	jQuery.extend(jQuery.support, {touch: Device.support.touch}); // this is also defined by jquery-mobile-custom.js, but this information is needed earlier

	var aPrefixes = ["Webkit", "ms", "Moz"];
	var oStyle = document.documentElement.style;

	var preserveOrTestCssPropWithPrefixes = function(detectionName, propName) {
		if (jQuery.support[detectionName] === undefined) {

			if (oStyle[propName] !== undefined) { // without vendor prefix
				jQuery.support[detectionName] = true;
				// If one of the flex layout properties is supported without the prefix, set the flexBoxPrefixed to false
				if (propName === "boxFlex" || propName === "flexOrder" || propName === "flexGrow") {
					// Exception for Chrome up to version 28
					// because some versions implemented the non-prefixed properties without the functionality
					if (!Device.browser.chrome || Device.browser.version > 28) {
						jQuery.support.flexBoxPrefixed = false;
					}
				}
				return;

			} else { // try vendor prefixes
				propName = propName.charAt(0).toUpperCase() + propName.slice(1);
				for (var i in aPrefixes) {
					if (oStyle[aPrefixes[i] + propName] !== undefined) {
						jQuery.support[detectionName] = true;
						return;
					}
				}
			}
			jQuery.support[detectionName] = false;
		}
	};

	/**
	 * Whether the current browser supports (2D) CSS transforms
	 * @type {boolean}
	 * @public
	 * @name jQuery.support.cssTransforms
	 */
	preserveOrTestCssPropWithPrefixes("cssTransforms", "transform");

	/**
	 * Whether the current browser supports 3D CSS transforms
	 * @type {boolean}
	 * @public
	 * @name jQuery.support.cssTransforms3d
	 */
	preserveOrTestCssPropWithPrefixes("cssTransforms3d", "perspective");

	/**
	 * Whether the current browser supports CSS transitions
	 * @type {boolean}
	 * @public
	 * @name jQuery.support.cssTransitions
	 */
	preserveOrTestCssPropWithPrefixes("cssTransitions", "transition");

	/**
	 * Whether the current browser supports (named) CSS animations
	 * @type {boolean}
	 * @public
	 * @name jQuery.support.cssAnimations
	 */
	preserveOrTestCssPropWithPrefixes("cssAnimations", "animationName");

	/**
	 * Whether the current browser supports CSS gradients. Note that ANY support for CSS gradients leads to "true" here, no matter what the syntax is.
	 * @type {boolean}
	 * @public
	 * @name jQuery.support.cssGradients
	 */
	if (jQuery.support.cssGradients === undefined) {
		var oElem = document.createElement('div'),
		oStyle = oElem.style;
		try {
			oStyle.backgroundImage = "linear-gradient(left top, red, white)";
			oStyle.backgroundImage = "-moz-linear-gradient(left top, red, white)";
			oStyle.backgroundImage = "-webkit-linear-gradient(left top, red, white)";
			oStyle.backgroundImage = "-ms-linear-gradient(left top, red, white)";
			oStyle.backgroundImage = "-webkit-gradient(linear, left top, right bottom, from(red), to(white))";
		} catch (e) {/* no support...*/}
		jQuery.support.cssGradients = (oStyle.backgroundImage && oStyle.backgroundImage.indexOf("gradient") > -1);

		oElem = null; // free for garbage collection
	}

	/**
	 * Whether the current browser supports only prefixed flexible layout properties
	 * @type {boolean}
	 * @public
	 * @name jQuery.support.flexBoxPrefixed
	 */
	jQuery.support.flexBoxPrefixed = true;	// Default to prefixed properties

	/**
	 * Whether the current browser supports the OLD CSS3 Flexible Box Layout directly or via vendor prefixes
	 * @type {boolean}
	 * @public
	 * @name jQuery.support.flexBoxLayout
	 */
	preserveOrTestCssPropWithPrefixes("flexBoxLayout", "boxFlex");

	/**
	 * Whether the current browser supports the NEW CSS3 Flexible Box Layout directly or via vendor prefixes
	 * @type {boolean}
	 * @public
	 * @name jQuery.support.newFlexBoxLayout
	 */
	preserveOrTestCssPropWithPrefixes("newFlexBoxLayout", "flexGrow");	// Use a new property that IE10 doesn't support

	/**
	 * Whether the current browser supports the IE10 CSS3 Flexible Box Layout directly or via vendor prefixes
	 * @type {boolean}
	 * @public
	 * @name jQuery.support.ie10FlexBoxLayout
	 * @since 1.12.0
	 */
	// Just using one of the IE10 properties that's not in the new FlexBox spec
	if (!jQuery.support.newFlexBoxLayout && oStyle.msFlexOrder !== undefined) {
		jQuery.support.ie10FlexBoxLayout = true;
	} else {
		jQuery.support.ie10FlexBoxLayout = false;
	}

	/**
	 * Whether the current browser supports any kind of Flexible Box Layout directly or via vendor prefixes
	 * @type {boolean}
	 * @public
	 * @name jQuery.support.hasFlexBoxSupport
	 */
	if (jQuery.support.flexBoxLayout || jQuery.support.newFlexBoxLayout || jQuery.support.ie10FlexBoxLayout) {
		jQuery.support.hasFlexBoxSupport = true;
	} else {
		jQuery.support.hasFlexBoxSupport = false;
	}

	// --------------------- frame protection -------------------------------------------------------

	/**
	 * FrameOptions class
	 */
	var FrameOptions = function(mSettings) {
		/* mSettings: mode, callback, whitelist, whitelistService, timeout, blockEvents, showBlockLayer, allowSameOrigin */
		this.mSettings = mSettings || {};
		this.sMode = this.mSettings.mode || FrameOptions.Mode.ALLOW;
		this.fnCallback = this.mSettings.callback;
		this.iTimeout = this.mSettings.timeout || 10000;
		this.bBlockEvents = this.mSettings.blockEvents !== false;
		this.bShowBlockLayer = this.mSettings.showBlockLayer !== false;
		this.bAllowSameOrigin = this.mSettings.allowSameOrigin !== false;
		this.sParentOrigin = '';
		this.bUnlocked = false;
		this.bRunnable = false;
		this.bParentUnlocked = false;
		this.bParentResponded = false;
		this.sStatus = "pending";
		this.aFPChilds = [];

		var that = this;

		this.iTimer = setTimeout(function() {
			if (that.bRunnable && that.bParentResponded && !that.bParentUnlocked) {
				jQuery.sap.log.error("Reached timeout of " + that.iTimeout + "ms waiting for the parent to be unlocked", "", "jQuery.sap.FrameOptions");
			} else {
				jQuery.sap.log.error("Reached timeout of " + that.iTimeout + "ms waiting for a response from parent window", "", "jQuery.sap.FrameOptions");
			}
			that._callback(false);
		}, this.iTimeout);

		var fnHandlePostMessage = function() {
			that._handlePostMessage.apply(that, arguments);
		};

		FrameOptions.__window.addEventListener('message', fnHandlePostMessage);

		if (FrameOptions.__parent === FrameOptions.__self || FrameOptions.__parent == null || this.sMode === FrameOptions.Mode.ALLOW) {
			// unframed page or "allow all" mode
			this._applyState(true, true);
		} else {
			// framed page

			this._lock();

			// "deny" mode blocks embedding page from all origins
			if (this.sMode === FrameOptions.Mode.DENY) {
				jQuery.sap.log.error("Embedding blocked because configuration mode is set to 'DENY'", "", "jQuery.sap.FrameOptions");
				this._callback(false);
				return;
			}

			if (this.bAllowSameOrigin) {

				try {
					var oParentWindow = FrameOptions.__parent;
					var bOk = false;
					var bTrue = true;
					do {
						var test = oParentWindow.document.domain;
						if (oParentWindow == FrameOptions.__top) {
							if (test != undefined) {
								bOk = true;
							}
							break;
						}
						oParentWindow = oParentWindow.parent;
					} while (bTrue);
					if (bOk) {
						this._applyState(true, true);
					}
				} catch (e) {
					// access to the top window is not possible
					this._sendRequireMessage();
				}

			} else {
				// same origin not allowed
				this._sendRequireMessage();
			}

		}

	};

	FrameOptions.Mode = {
		// only allow with same origin parent
		TRUSTED: 'trusted',

		// allow all kind of embedding (default)
		ALLOW: 'allow',

		// deny all kinds of embedding
		DENY: 'deny'
	};

	// Allow globals to be mocked in unit test
	FrameOptions.__window = window;
	FrameOptions.__parent = parent;
	FrameOptions.__self = self;
	FrameOptions.__top = top;

	// List of events to block while framing is unconfirmed
	FrameOptions._events = [
		"mousedown", "mouseup", "click", "dblclick", "mouseover", "mouseout",
		"touchstart", "touchend", "touchmove", "touchcancel",
		"keydown", "keypress", "keyup"
	];

	// check if string matches pattern
	FrameOptions.prototype.match = function(sProbe, sPattern) {
		if (!(/\*/i.test(sPattern))) {
			return sProbe == sPattern;
		} else {
			sPattern = sPattern.replace(/\//gi, "\\/"); // replace /   with \/
			sPattern = sPattern.replace(/\./gi, "\\."); // replace .   with \.
			sPattern = sPattern.replace(/\*/gi, ".*");  // replace *   with .*
			sPattern = sPattern.replace(/:\.\*$/gi, ":\\d*"); // replace :.* with :\d* (only at the end)

			if (sPattern.substr(sPattern.length - 1, 1) !== '$') {
				sPattern = sPattern + '$'; // if not already there add $ at the end
			}
			if (sPattern.substr(0, 1) !== '^') {
				sPattern = '^' + sPattern; // if not already there add ^ at the beginning
			}

			// sPattern looks like: ^.*:\/\/.*\.company\.corp:\d*$ or ^.*\.company\.corp$
			var r = new RegExp(sPattern, 'i');
			return r.test(sProbe);
		}
	};

	FrameOptions._lockHandler = function(oEvent) {
		oEvent.stopPropagation();
		oEvent.preventDefault();
	};

	FrameOptions.prototype._createBlockLayer = function() {
		if (document.readyState == "complete") {
			var lockDiv = document.createElement("div");
			lockDiv.style.position = "absolute";
			lockDiv.style.top = "-1000px";
			lockDiv.style.bottom = "-1000px";
			lockDiv.style.left = "-1000px";
			lockDiv.style.right = "-1000px";
			lockDiv.style.opacity = "0";
			lockDiv.style.backgroundColor = "white";
			lockDiv.style.zIndex = 2147483647; // Max value of signed integer (32bit)
			document.body.appendChild(lockDiv);
			this._lockDiv = lockDiv;
		}
	};

	FrameOptions.prototype._setCursor = function() {
		if (this._lockDiv) {
			this._lockDiv.style.cursor = this.sStatus == "denied" ? "not-allowed" : "wait";
		}
	};

	FrameOptions.prototype._lock = function() {
		var that = this;
		if (this.bBlockEvents) {
			for (var i = 0; i < FrameOptions._events.length; i++) {
				document.addEventListener(FrameOptions._events[i], FrameOptions._lockHandler, true);
			}
		}
		if (this.bShowBlockLayer) {
			this._blockLayer = function() {
				that._createBlockLayer();
				that._setCursor();
			};
			if (document.readyState == "complete") {
				this._blockLayer();
			} else {
				document.addEventListener("readystatechange", this._blockLayer);
			}
		}
	};

	FrameOptions.prototype._unlock = function() {
		if (this.bBlockEvents) {
			for (var i = 0; i < FrameOptions._events.length; i++) {
				document.removeEventListener(FrameOptions._events[i], FrameOptions._lockHandler, true);
			}
		}
		if (this.bShowBlockLayer) {
			document.removeEventListener("readystatechange", this._blockLayer);
			if (this._lockDiv) {
				document.body.removeChild(this._lockDiv);
				delete this._lockDiv;
			}
		}
	};

	FrameOptions.prototype._callback = function(bSuccess) {
		this.sStatus = bSuccess ? "allowed" : "denied";
		this._setCursor();
		clearTimeout(this.iTimer);
		if (typeof this.fnCallback === 'function') {
			this.fnCallback.call(null, bSuccess);
		}
	};

	FrameOptions.prototype._applyState = function(bIsRunnable, bIsParentUnlocked) {
		if (this.bUnlocked) {
			return;
		}
		if (bIsRunnable) {
			this.bRunnable = true;
		}
		if (bIsParentUnlocked) {
			this.bParentUnlocked = true;
		}
		if (!this.bRunnable || !this.bParentUnlocked) {
			return;
		}
		this._unlock();
		this._callback(true);
		this._notifyChildFrames();
		this.bUnlocked = true;
	};

	FrameOptions.prototype._applyTrusted = function(bTrusted) {
		if (bTrusted) {
			this._applyState(true, false);
		} else {
			this._callback(false);
		}
	};

	FrameOptions.prototype._check = function(bParentResponsePending) {
		if (this.bRunnable) {
			return;
		}
		var bTrusted = false;
		if (this.bAllowSameOrigin && this.sParentOrigin && FrameOptions.__window.document.URL.indexOf(this.sParentOrigin) == 0) {
			bTrusted = true;
		} else if (this.mSettings.whitelist && this.mSettings.whitelist.length != 0) {
			var sHostName = this.sParentOrigin.split('//')[1];
			sHostName = sHostName.split(':')[0];
			for (var i = 0; i < this.mSettings.whitelist.length; i++) {
				var match = sHostName.indexOf(this.mSettings.whitelist[i]);
				if (match != -1 && sHostName.substring(match) == this.mSettings.whitelist[i]) {
					bTrusted = true;
					break;
				}
			}
		}
		if (bTrusted) {
			this._applyTrusted(bTrusted);
		} else if (this.mSettings.whitelistService) {
			var that = this;
			var xmlhttp = new XMLHttpRequest();
			var url = this.mSettings.whitelistService + '?parentOrigin=' + encodeURIComponent(this.sParentOrigin);
			xmlhttp.onreadystatechange = function() {
				if (xmlhttp.readyState == 4) {
					that._handleXmlHttpResponse(xmlhttp, bParentResponsePending);
				}
			};
			xmlhttp.open('GET', url, true);
			xmlhttp.setRequestHeader('Accept', 'application/json');
			xmlhttp.send();
		} else {
			jQuery.sap.log.error("Embedding blocked because the whitelist or the whitelist service is not configured correctly", "", "jQuery.sap.FrameOptions");
			this._callback(false);
		}
	};

	FrameOptions.prototype._handleXmlHttpResponse = function(xmlhttp, bParentResponsePending) {
		if (xmlhttp.status === 200) {
			var bTrusted = false;
			var sResponseText = xmlhttp.responseText;
			var oRuleSet = JSON.parse(sResponseText);
			if (oRuleSet.active == false) {
				this._applyState(true, true);
			} else if (bParentResponsePending) {
				return;
			} else {
				if (this.match(this.sParentOrigin, oRuleSet.origin)) {
					bTrusted = oRuleSet.framing;
				}
				if (!bTrusted) {
					jQuery.sap.log.error("Embedding blocked because the whitelist service does not allow framing", "", "jQuery.sap.FrameOptions");
				}
				this._applyTrusted(bTrusted);
			}
		} else {
			jQuery.sap.log.error("The configured whitelist service is not available: " + xmlhttp.status, "", "jQuery.sap.FrameOptions");
			this._callback(false);
		}
	};

	FrameOptions.prototype._notifyChildFrames = function() {
		for (var i = 0; i < this.aFPChilds.length; i++) {
			this.aFPChilds[i].postMessage('SAPFrameProtection*parent-unlocked','*');
		}
	};

	FrameOptions.prototype._sendRequireMessage = function() {
		FrameOptions.__parent.postMessage('SAPFrameProtection*require-origin', '*');
		// If not postmessage response was received, send request to whitelist service
		// anyway, to check whether frame protection is enabled
		if (this.mSettings.whitelistService) {
			setTimeout(function() {
				if (!this.bParentResponded) {
					this._check(true);
				}
			}.bind(this), 10);
		}
	};

	FrameOptions.prototype._handlePostMessage = function(oEvent) {
		var oSource = oEvent.source,
			sData = oEvent.data;

		// For compatibility with previous version empty message from parent means parent-unlocked
		// if (oSource === FrameOptions.__parent && sData == "") {
		//	sData = "SAPFrameProtection*parent-unlocked";
		// }

		if (oSource === FrameOptions.__self || oSource == null ||
			typeof sData !== "string" || sData.indexOf("SAPFrameProtection*") === -1) {
			return;
		}
		if (oSource === FrameOptions.__parent) {
			this.bParentResponded = true;
			if (!this.sParentOrigin) {
				this.sParentOrigin = oEvent.origin;
				this._check();
			}
			if (sData == "SAPFrameProtection*parent-unlocked") {
				this._applyState(false, true);
			}
		} else if (oSource.parent === FrameOptions.__self && sData == "SAPFrameProtection*require-origin" && this.bUnlocked) {
			oSource.postMessage("SAPFrameProtection*parent-unlocked", "*");
		} else {
			oSource.postMessage("SAPFrameProtection*parent-origin", "*");
			this.aFPChilds.push(oSource);
		}
	};

	jQuery.sap.FrameOptions = FrameOptions;

}(jQuery, sap.ui.Device, window));

/**
 * Executes an 'eval' for its arguments in the global context (without closure variables).
 *
 * This is a synchronous replacement for <code>jQuery.globalEval</code> which in some
 * browsers (e.g. FireFox) behaves asynchronously.
 *
 * @type void
 * @public
 * @static
 * @SecSink {0|XSS} Parameter is evaluated
 */
jQuery.sap.globalEval = function() {
	"use strict";

	/*eslint-disable no-eval */
	eval(arguments[0]);
	/*eslint-enable no-eval */
};
