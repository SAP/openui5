/*!
 * ${copyright}
 */

/**
 * Device and Feature Detection API of the SAP UI5 Library.
 *
 * @version ${version}
 * @namespace
 * @name sap.ui.Device
 * @public
 */

/*global console */

//Declare Module if API is available
if (window.jQuery && window.jQuery.sap && window.jQuery.sap.declare) {
	window.jQuery.sap.declare("sap.ui.Device", false);
}

//Introduce namespace if it does not yet exist
if (typeof window.sap !== "object" && typeof window.sap !== "function" ) {
	  window.sap = {};
}
if (typeof window.sap.ui !== "object") {
	window.sap.ui = {};
}

(function() {

	//Skip initialization if API is already available
	if (typeof window.sap.ui.Device === "object" || typeof window.sap.ui.Device === "function" ) {
		var apiVersion = "${version}";
		window.sap.ui.Device._checkAPIVersion(apiVersion);
		return;
	}

	var device = {};

////-------------------------- Logging -------------------------------------
	/* since we cannot use the logging from jquery.sap.global.js, we need to come up with a seperate
	 * solution for the device API
	 */
	// helper function for date formatting
	function pad0(i,w) {
		return ("000" + String(i)).slice(-w);
	}

	var FATAL = 0, ERROR = 1, WARNING = 2, INFO = 3, DEBUG = 4, TRACE = 5;

	var deviceLogger = function() {
		this.defaultComponent = 'DEVICE';
		this.sWindowName = (window.top == window) ? "" : "[" + window.location.pathname.split('/').slice(-1)[0] + "] ";
	// Creates a new log entry depending on its level and component.
		this.log = function (iLevel, sMessage, sComponent) {
			sComponent = sComponent || this.defaultComponent  || '';
				var oNow = new Date(),
					oLogEntry = {
						time     : pad0(oNow.getHours(),2) + ":" + pad0(oNow.getMinutes(),2) + ":" + pad0(oNow.getSeconds(),2),
						date     : pad0(oNow.getFullYear(),4) + "-" + pad0(oNow.getMonth() + 1,2) + "-" + pad0(oNow.getDate(),2),
						timestamp: oNow.getTime(),
						level    : iLevel,
						message  : sMessage || "",
						component: sComponent || ""
					};
				/*eslint-disable no-console */
				if (window.console) { // in IE and FF, console might not exist; in FF it might even disappear
					var logText = oLogEntry.date + " " + oLogEntry.time + " " + this.sWindowName + oLogEntry.message + " - " + oLogEntry.component;
					switch (iLevel) {
					case FATAL:
					case ERROR: console.error(logText); break;
					case WARNING: console.warn(logText); break;
					case INFO: console.info ? console.info(logText) : console.log(logText); break;    // info not available in iOS simulator
					case DEBUG: console.debug ? console.debug(logText) : console.log(logText); break; // debug not available in IE, fallback to log
					case TRACE: console.trace ? console.trace(logText) : console.log(logText); break; // trace not available in IE, fallback to log (no trace)
					}
				}
				/*eslint-enable no-console */
				return oLogEntry;
		};
	};
// instantiate new logger
	var logger = new deviceLogger();
	logger.log(INFO, "Device API logging initialized");


//******** Version Check ********

	//Only used internal to make clear when Device API is loaded in wrong version
	device._checkAPIVersion = function(sVersion){
		var v = "${version}";
		if (v != sVersion) {
			logger.log(WARNING, "Device API version differs: " + v + " <-> " + sVersion);
		}
	};


//******** Event Management ******** (see Event Provider)

	var mEventRegistry = {};

	function attachEvent(sEventId, fnFunction, oListener) {
		if (!mEventRegistry[sEventId]) {
			mEventRegistry[sEventId] = [];
		}
		mEventRegistry[sEventId].push({oListener: oListener, fFunction:fnFunction});
	}

	function detachEvent(sEventId, fnFunction, oListener) {
		var aEventListeners = mEventRegistry[sEventId];

		if (!aEventListeners) {
			return this;
		}

		for (var i = 0, iL = aEventListeners.length; i < iL; i++) {
			if (aEventListeners[i].fFunction === fnFunction && aEventListeners[i].oListener === oListener) {
				aEventListeners.splice(i,1);
				break;
			}
		}
		if (aEventListeners.length == 0) {
			delete mEventRegistry[sEventId];
		}
	}

	function fireEvent(sEventId, mParameters) {
		var aEventListeners = mEventRegistry[sEventId], oInfo;
		if (aEventListeners) {
			aEventListeners = aEventListeners.slice();
			for (var i = 0, iL = aEventListeners.length; i < iL; i++) {
				oInfo = aEventListeners[i];
				oInfo.fFunction.call(oInfo.oListener || window, mParameters);
			}
		}
	}

//******** OS Detection ********

	/**
	 * Contains information about the operating system of the device.
	 *
	 * @namespace
	 * @name sap.ui.Device.os
	 * @public
	 */
	/**
	 * Enumeration containing the names of known operating systems.
	 *
	 * @namespace
	 * @name sap.ui.Device.os.OS
	 * @public
	 */
	/**
	 * The name of the operating system.
	 *
	 * @see sap.ui.Device.os#OS
	 * @name sap.ui.Device.os#name
	 * @type String
	 * @public
	 */
	/**
	 * The version as string. Might be empty if no version can be determined.
	 *
	 * @name sap.ui.Device.os#versionStr
	 * @type String
	 * @public
	 */
	/**
	 * The version as float. Might be -1 if no version can be determined.
	 *
	 * @name sap.ui.Device.os#version
	 * @type float
	 * @public
	 */
	/**
	 * Flag indicating the Windows operating system.
	 *
	 * @name sap.ui.Device.os#windows
	 * @type boolean
	 * @public
	 */
	/**
	 * Flag indicating the Linux operating system.
	 *
	 * @name sap.ui.Device.os#linux
	 * @type boolean
	 * @public
	 */
	/**
	 * Flag indicating the MAC operating system.
	 *
	 * @name sap.ui.Device.os#macintosh
	 * @type boolean
	 * @public
	 */
	/**
	 * Flag indicating the iOS operating system.
	 *
	 * @name sap.ui.Device.os#ios
	 * @type boolean
	 * @public
	 */
	/**
	 * Flag indicating the Android operating system.
	 *
	 * @name sap.ui.Device.os#android
	 * @type boolean
	 * @public
	 */
	/**
	 * Flag indicating the Blackberry operating system.
	 *
	 * @name sap.ui.Device.os#blackberry
	 * @type boolean
	 * @public
	 */
	/**
	 * Flag indicating the Windows Phone operating system.
	 *
	 * @name sap.ui.Device.os#windows_phone
	 * @type boolean
	 * @public
	 */

	/**
	 * Windows operating system name.
	 *
	 * @see sap.ui.Device.os#name
	 * @name sap.ui.Device.os.OS#WINDOWS
	 * @public
	 */
	/**
	 * MAC operating system name.
	 *
	 * @see sap.ui.Device.os#name
	 * @name sap.ui.Device.os.OS#MACINTOSH
	 * @public
	 */
	/**
	 * Linux operating system name.
	 *
	 * @see sap.ui.Device.os#name
	 * @name sap.ui.Device.os.OS#LINUX
	 * @public
	 */
	/**
	 * iOS operating system name.
	 *
	 * @see sap.ui.Device.os#name
	 * @name sap.ui.Device.os.OS#IOS
	 * @public
	 */
	/**
	 * Android operating system name.
	 *
	 * @see sap.ui.Device.os#name
	 * @name sap.ui.Device.os.OS#ANDROID
	 * @public
	 */
	/**
	 * Blackberry operating system name.
	 *
	 * @see sap.ui.Device.os#name
	 * @name sap.ui.Device.os.OS#BLACKBERRY
	 * @public
	 */
	/**
	 * Windows Phone operating system name.
	 *
	 * @see sap.ui.Device.os#name
	 * @alias sap.ui.Device.os.OS#WINDOWS_PHONE
	 * @public
	 */

	var OS = {
		"WINDOWS": "win",
		"MACINTOSH": "mac",
		"LINUX": "linux",
		"IOS": "iOS",
		"ANDROID": "Android",
		"BLACKBERRY": "bb",
		"WINDOWS_PHONE": "winphone"
	};

	function getOS(userAgent){ // may return null!!

		userAgent = userAgent || navigator.userAgent;

		var platform, // regular expression for platform
			result;

		function getDesktopOS(){
			var pf = navigator.platform;
			if (pf.indexOf("Win") != -1 ) {
				// userAgent in windows 7 contains: windows NT 6.1
				// userAgent in windows 8 contains: windows NT 6.2 or higher
				// userAgent since windows 10: Windows NT 10[...]
				var rVersion = /Windows NT (\d+).(\d)/i;
				var uaResult = userAgent.match(rVersion);
				var sVersionStr = "";
				if (uaResult[1] == "6") {
					if (uaResult[2] == 1) {
						sVersionStr = "7";
					} else if (uaResult[2] > 1) {
						sVersionStr = "8";
					}
				} else {
					sVersionStr = uaResult[1];
				}
				return {"name": OS.WINDOWS, "versionStr": sVersionStr};
			} else if (pf.indexOf("Mac") != -1) {
				return {"name": OS.MACINTOSH, "versionStr": ""};
			} else if (pf.indexOf("Linux") != -1) {
				return {"name": OS.LINUX, "versionStr": ""};
			}
			logger.log(INFO, "OS detection returned no result");
			return null;
		}

		// Windows Phone. User agent includes other platforms and therefore must be checked first:
		platform = /Windows Phone (?:OS )?([\d.]*)/;
		result = userAgent.match(platform);
		if (result) {
			return ({"name": OS.WINDOWS_PHONE, "versionStr": result[1]});
		}

		// BlackBerry 10:
		if (userAgent.indexOf("(BB10;") > 0) {
			platform = /\sVersion\/([\d.]+)\s/;
			result = userAgent.match(platform);
			if (result) {
				return {"name": OS.BLACKBERRY, "versionStr": result[1]};
			} else {
				return {"name": OS.BLACKBERRY, "versionStr": '10'};
			}
		}

		// iOS, Android, BlackBerry 6.0+:
		platform = /\(([a-zA-Z ]+);\s(?:[U]?[;]?)([\D]+)((?:[\d._]*))(?:.*[\)][^\d]*)([\d.]*)\s/;
		result = userAgent.match(platform);
		if (result) {
			var appleDevices = /iPhone|iPad|iPod/;
			var bbDevices = /PlayBook|BlackBerry/;
			if (result[0].match(appleDevices)) {
				result[3] = result[3].replace(/_/g, ".");
				//result[1] contains info of devices
				return ({"name": OS.IOS, "versionStr": result[3]});
			} else if (result[2].match(/Android/)) {
				result[2] = result[2].replace(/\s/g, "");
				return ({"name": OS.ANDROID, "versionStr": result[3]});
			} else if (result[0].match(bbDevices)) {
				return ({"name": OS.BLACKBERRY, "versionStr": result[4]});
			}
		}

		// Desktop
		return getDesktopOS();
	}

	function setOS() {
		device.os = getOS() || {};
		device.os.OS = OS;
		device.os.version = device.os.versionStr ? parseFloat(device.os.versionStr) : -1;

		if (device.os.name) {
			for (var b in OS) {
				if (OS[b] === device.os.name) {
					device.os[b.toLowerCase()] = true;
				}
			}
		}
	}
	setOS();



//******** Browser Detection ********

	/**
	 * Contains information about the used browser.
	 *
	 * @namespace
	 * @name sap.ui.Device.browser
	 * @public
	 */

	/**
	 * Enumeration containing the names of known browsers.
	 *
	 * @namespace
	 * @name sap.ui.Device.browser.BROWSER
	 * @public
	 */

	/**
	 * The name of the browser.
	 *
	 * @see sap.ui.Device.browser#BROWSER
	 * @name sap.ui.Device.browser#name
	 * @type String
	 * @public
	 */
	/**
	 * The version as string. Might be empty if no version can be determined.
	 *
	 * @name sap.ui.Device.browser#versionStr
	 * @type String
	 * @public
	 */
	/**
	 * The version as float. Might be -1 if no version can be determined.
	 *
	 * @name sap.ui.Device.browser#version
	 * @type float
	 * @public
	 */
	/**
	 * Flag indicating whether the mobile variant of the browser is used.
	 *
	 * @name sap.ui.Device.browser#mobile
	 * @type boolean
	 * @public
	 */
	/**
	 * Flag indicating the Internet Explorer browser.
	 *
	 * @name sap.ui.Device.browser#internet_explorer
	 * @type boolean
	 * @deprecated since 1.20: use sap.ui.Device.browser.msie
	 * @public
	 */
	/**
	 * Flag indicating the Internet Explorer browser.
	 *
	 * @name sap.ui.Device.browser#msie
	 * @type boolean
	 * @since 1.20.0
	 * @public
	 */
	/**
	 * Flag indicating the Edge browser.
	 *
	 * @name sap.ui.Device.browser#edge
	 * @type boolean
	 * @since 1.30.0
	 * @experimental
	 * @public
	 */
	/**
	 * Flag indicating the Firefox browser.
	 *
	 * @name sap.ui.Device.browser#firefox
	 * @type boolean
	 * @public
	 */
	/**
	 * Flag indicating the Chrome browser.
	 *
	 * @name sap.ui.Device.browser#chrome
	 * @type boolean
	 * @public
	 */
	/**
	 * Flag indicating the Safari browser.
	 *
	 * @name sap.ui.Device.browser#safari
	 * @type boolean
	 * @public
	 */
	/**
	 * Flag indicating a Webkit browser.
	 *
	 * @name sap.ui.Device.browser#webkit
	 * @type boolean
	 * @since 1.20.0
	 * @public
	 */
	/**
	 * Flag indicating a Mozilla browser.
	 *
	 * @name sap.ui.Device.browser#mozilla
	 * @type boolean
	 * @since 1.20.0
	 * @public
	 */
	/**
	 * Internet Explorer browser name.
	 *
	 * @see sap.ui.Device.browser#name
	 * @name sap.ui.Device.browser.BROWSER#INTERNET_EXPLORER
	 * @public
	 */
	/**
	 * Firefox browser name.
	 *
	 * @see sap.ui.Device.browser#name
	 * @name sap.ui.Device.browser.BROWSER#FIREFOX
	 * @public
	 */
	/**
	 * Chrome browser name.
	 *
	 * @see sap.ui.Device.browser#name
	 * @name sap.ui.Device.browser.BROWSER#CHROME
	 * @public
	 */
	/**
	 * Safari browser name.
	 *
	 * @see sap.ui.Device.browser#name
	 * @name sap.ui.Device.browser.BROWSER#SAFARI
	 * @public
	 */
	/**
	 * Android stock browser name.
	 *
	 * @see sap.ui.Device.browser#name
	 * @alias sap.ui.Device.browser.BROWSER#ANDROID
	 * @public
	 */

	var BROWSER = {
		"INTERNET_EXPLORER": "ie",
		"EDGE": "ed",
		"FIREFOX": "ff",
		"CHROME": "cr",
		"SAFARI": "sf",
		"ANDROID": "an"
	};

	var ua = navigator.userAgent;

	/*!
	 * Taken from jQuery JavaScript Library v1.7.1
	 * http://jquery.com/
	 *
	 * Copyright 2011, John Resig
	 * Dual licensed under the MIT or GPL Version 2 licenses.
	 * http://jquery.org/license
	 *
	 * Includes Sizzle.js
	 * http://sizzlejs.com/
	 * Copyright 2011, The Dojo Foundation
	 * Released under the MIT, BSD, and GPL Licenses.
	 *
	 * Date: Mon Nov 21 21:11:03 2011 -0500
	 */
	function calcBrowser(customUa){
		var _ua = (customUa || ua).toLowerCase(); // use custom user-agent if given

		var rwebkit = /(webkit)[ \/]([\w.]+)/;
		var ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/;
		var rmsie = /(msie) ([\w.]+)/;
		var rmsie11 = /(trident)\/[\w.]+;.*rv:([\w.]+)/;
		var redge = /(edge)[ \/]([\w.]+)/;
		var rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/;

		// WinPhone IE11 and MS Edge userAgents contain "WebKit" and "Mozilla" and therefore must be checked first
		var browserMatch = redge.exec( _ua ) ||
					rmsie11.exec( _ua ) ||
					rwebkit.exec( _ua ) ||
					ropera.exec( _ua ) ||
					rmsie.exec( _ua ) ||
					_ua.indexOf("compatible") < 0 && rmozilla.exec( _ua ) ||
					[];

		var res = { browser: browserMatch[1] || "", version: browserMatch[2] || "0" };
		res[res.browser] = true;
		return res;
	}

	function getBrowser(customUa) {
		var b = calcBrowser(customUa);
		var _ua = customUa || ua;

		// jQuery checks for user agent strings. We differentiate between browsers
		var oExpMobile;
		if ( b.mozilla ) {
			oExpMobile = /Mobile/;
			if ( _ua.match(/Firefox\/(\d+\.\d+)/) ) {
				var version = parseFloat(RegExp.$1);
				return {
					name: BROWSER.FIREFOX,
					versionStr: "" + version,
					version: version,
					mozilla: true,
					mobile: oExpMobile.test(_ua)
				};
			} else {
				// unknown mozilla browser
				return {
					mobile: oExpMobile.test(_ua),
					mozilla: true
				};
			}
		} else if ( b.webkit ) {
			// webkit version is needed for calculation if the mobile android device is a tablet (calculation of other mobile devices work without)
			var regExpWebkitVersion = _ua.toLowerCase().match(/webkit[\/]([\d.]+)/);
			var webkitVersion;
			if (regExpWebkitVersion) {
				webkitVersion = regExpWebkitVersion[1];
			}
			oExpMobile = /Mobile/;
			if ( _ua.match(/(Chrome|CriOS)\/(\d+\.\d+).\d+/)) {
				var version = parseFloat(RegExp.$2);
				return {
					name: BROWSER.CHROME,
					versionStr: "" + version,
					version: version,
					mobile: oExpMobile.test(_ua),
					webkit: true,
					webkitVersion: webkitVersion
				};
			} else if ( _ua.match(/Android .+ Version\/(\d+\.\d+)/) ) {
				var version = parseFloat(RegExp.$1);
				return {
					name: BROWSER.ANDROID,
					versionStr: "" + version,
					version: version,
					mobile: oExpMobile.test(_ua),
					webkit: true,
					webkitVersion: webkitVersion
				};
			} else { // Safari might have an issue with _ua.match(...); thus changing
				var oExp = /(Version|PhantomJS)\/(\d+\.\d+).*Safari/;
				if (oExp.test(_ua)) {
					var aParts = oExp.exec(_ua);
					var version = parseFloat(aParts[2]);
					return {
						name: BROWSER.SAFARI,
						versionStr: "" + version,
						version: version,
						mobile: oExpMobile.test(_ua),
						webkit: true,
						webkitVersion: webkitVersion,
						phantomJS: aParts[1] === "PhantomJS"
					};
				} else {
					// unknown webkit browser
					return {
						mobile: oExpMobile.test(_ua),
						webkit: true,
						webkitVersion: webkitVersion
					};
				}
			}
		} else if ( b.msie || b.trident ) {
			var version;
			// recognize IE8 when running in compat mode (only then the documentMode property is there)
			if (document.documentMode && !customUa) { // only use the actual documentMode when no custom user-agent was given
				if (document.documentMode === 7) { // OK, obviously we are IE and seem to be 7... but as documentMode is there this cannot be IE7!
					version = 8.0;
				} else {
					version = parseFloat(document.documentMode);
				}
			} else {
				version = parseFloat(b.version);
			}
			return {
				name: BROWSER.INTERNET_EXPLORER,
				versionStr: "" + version,
				version: version,
				msie: true,
				mobile: false // TODO: really?
			};
		} else if ( b.edge ) {
			logger.log(WARNING, "New MS Edge browser detected. Be aware that this browser is not yet officially supported by UI5.", _ua);
			var version = version = parseFloat(b.version);
			return {
				name: BROWSER.EDGE,
				versionStr: "" + version,
				version: version,
				edge: true
			};
		}
		return {
			name: "",
			versionStr: "",
			version: -1,
			mobile: false
		};
	}
	device._testUserAgent = getBrowser; // expose the user-agent parsing (mainly for testing), but don't let it be overwritten

	function setBrowser() {
		device.browser = getBrowser();
		device.browser.BROWSER = BROWSER;

		if (device.browser.name) {
			for (var b in BROWSER) {
				if (BROWSER[b] === device.browser.name) {
					device.browser[b.toLowerCase()] = true;
				}
			}
		}
	}
	setBrowser();




//******** Support Detection ********

	/**
	 * Contains information about detected capabilities of the used browser or device.
	 *
	 * @namespace
	 * @name sap.ui.Device.support
	 * @public
	 */

	/**
	 * Flag indicating whether touch events are supported.
	 *
	 * @name sap.ui.Device.support#touch
	 * @type boolean
	 * @public
	 */
	/**
	 * Flag indicating whether pointer events are supported.
	 *
	 * @name sap.ui.Device.support#pointer
	 * @type boolean
	 * @public
	 */
	/**
	 * Flag indicating whether media queries via JavaScript are supported.
	 *
	 * @name sap.ui.Device.support#matchmedia
	 * @type boolean
	 * @public
	 */
	/**
	 * Flag indicating whether events on JavaScript media queries are supported.
	 *
	 * @name sap.ui.Device.support#matchmedialistener
	 * @type boolean
	 * @public
	 */
	/**
	 * Flag indicating whether the native orientationchange event is supported.
	 *
	 * @name sap.ui.Device.support#orientation
	 * @type boolean
	 * @public
	 */
	/**
	 * Flag indicating whether the device has a Retina display.
	 *
	 * @name sap.ui.Device.support#retina
	 * @type boolean
	 * @public
	 */
	/**
	 * Flag indicating whether WebSockets are supported.
	 *
	 * @name sap.ui.Device.support#websocket
	 * @type boolean
	 * @public
	 */
	/**
	 * Flag indicating whether placeholder on input tags are supported.
	 *
	 * @name sap.ui.Device.support#input.placeholder
	 * @type boolean
	 * @public
	 */

	device.support = {};

	//Maybe better to but this on device.browser because there are cases that a browser can touch but a device can't!
	device.support.touch = !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch);

	// FIXME: PhantomJS doesn't support touch events but exposes itself as touch
	//        enabled browser. Therfore we manually override that in jQuery.support!
	//        This has been tested with PhantomJS 1.9.7 and 2.0.0!
	if (device.browser.phantomJS) {
		device.support.touch = false;
	}

	device.support.pointer = !!window.PointerEvent;

	device.support.matchmedia = !!window.matchMedia;
	var m = device.support.matchmedia ? window.matchMedia("all and (max-width:0px)") : null; //IE10 doesn't like empty string as argument for matchMedia, FF returns null when running within an iframe with display:none
	device.support.matchmedialistener = !!(m && m.addListener);
	if (device.browser.safari && device.browser.version < 6) {
		//Safari seems to have addListener but no events are fired ?!
		device.support.matchmedialistener = false;
	}

	device.support.orientation = !!("orientation" in window && "onorientationchange" in window);

	device.support.retina = (window.retina || window.devicePixelRatio >= 2);

	device.support.websocket = ('WebSocket' in window);

	device.support.input = {};
	device.support.input.placeholder = ('placeholder' in document.createElement("input"));

//******** Match Media ********

	/**
	 * Event API for Screen width media queries.
	 *
	 * @namespace
	 * @name sap.ui.Device.media
	 * @public
	 */
	device.media = {};

	/**
	 * Enumeration containing the names of predefined Screen width media query range sets.
	 *
	 * @namespace
	 * @name sap.ui.Device.media.RANGESETS
	 * @public
	 */

	/**
	 * A 3 step range set (S-L).
	 *
	 * @name sap.ui.Device.media.RANGESETS#SAP_3STEPS
	 * @public
	 */
	/**
	 * A 4 step range set (S-XL).
	 *
	 * @name sap.ui.Device.media.RANGESETS#SAP_4STEPS
	 * @public
	 */
	/**
	 * A 6 step range set (XS-XXL).
	 *
	 * @name sap.ui.Device.media.RANGESETS#SAP_6STEPS
	 * @public
	 */
	/**
	 * A 3 step range set (Phone, Tablet, Desktop). <br/>
	 * <br/>
	 * This range set is initialized by default.<br/>
	 * Phone is < 600px<br/>
	 * Tablet is 600px >= Tablet < 1024<br/>
	 * Desktop is > 1024px<br/>
	 * <br/>
	 * There are 5 css classes to hide elements based on the width of the screen:
	 * <ul>
	 * 	<li>sapUiHideOnPhone - will be hidden if the screen has 600px or more</li>
	 * 	<li>sapUiHideOnTablet - will be hidden if the screen has less than 600px or more than 1023px</li>
	 * 	<li>sapUiHideOnDesktop - will be hidden if the screen is smaller than 1024px</li>
	 * 	<li>sapUiVisibleOnlyOnPhone - will be visible if the screen has less than 600px</li>
	 * 	<li>sapUiVisibleOnlyOnTablet - will be visible if the screen has 600px or more but less than 1024px</li>
	 * 	<li>sapUiVisibleOnlyOnDesktop - will be visible if the screen has 1024px or more</li>
	 * </ul>
	 * @alias sap.ui.Device.media.RANGESETS#SAP_STANDARD
	 * @public
	 */

	/**
	 * A 4 step range set (Phone, Tablet, Desktop, LargeDesktop). <br/>
	 * <br/>
	 * This range set is initialized by default. <br/>
	 * It is similar to the range set SAP_STANDARD but with an additional breakpoint for large desktop screens. <br/>
	 * Phone is < 600px<br/>
	 * Tablet is 600px >= Tablet < 1024px <br/>
	 * Desktop is 1024px >= Desktop < 1440px <br/>
	 * LargeDesktop is > 1440px <br/>
	 * <br/>
	 * @alias sap.ui.Device.media.RANGESETS#SAP_STANDARD_EXTENDED
	 * @public
	 */

	var RANGESETS = {
		"SAP_3STEPS": "3Step",
		"SAP_4STEPS": "4Step",
		"SAP_6STEPS": "6Step",
		"SAP_STANDARD": "Std",
		"SAP_STANDARD_EXTENDED": "StdExt"
	};
	device.media.RANGESETS = RANGESETS;
	device.media._predefinedRangeSets = {};
	device.media._predefinedRangeSets[RANGESETS.SAP_3STEPS] = {points: [520, 960], unit: "px", name: RANGESETS.SAP_3STEPS, names: ["S", "M", "L"]};
	device.media._predefinedRangeSets[RANGESETS.SAP_4STEPS] = {points: [520, 760, 960], unit: "px", name: RANGESETS.SAP_4STEPS, names: ["S", "M", "L", "XL"]};
	device.media._predefinedRangeSets[RANGESETS.SAP_6STEPS] = {points: [241, 400, 541, 768, 960], unit: "px", name: RANGESETS.SAP_6STEPS, names: ["XS", "S", "M", "L", "XL", "XXL"]};
	device.media._predefinedRangeSets[RANGESETS.SAP_STANDARD] = {points: [600, 1024], unit: "px", name: RANGESETS.SAP_STANDARD, names: ["Phone", "Tablet", "Desktop"]};
	device.media._predefinedRangeSets[RANGESETS.SAP_STANDARD_EXTENDED] = {points: [600, 1024, 1440], unit: "px", name: RANGESETS.SAP_STANDARD_EXTENDED, names: ["Phone", "Tablet", "Desktop", "LargeDesktop"]};
	var _defaultRangeSet = RANGESETS.SAP_STANDARD;
	var media_timeout = device.support.matchmedialistener ? 0 : 100;
	var _querysets = {};
	var media_currentwidth = null;

	function getQuery(from, to, unit){
		unit = unit || "px";
		var q = "all";
		if (from > 0) {
			q = q + " and (min-width:" + from + unit + ")";
		}
		if (to > 0) {
			q = q + " and (max-width:" + to + unit + ")";
		}
		return q;
	}

	function handleChange(name){
		if (!device.support.matchmedialistener && media_currentwidth == windowSize()[0]) {
			return; //Skip unnecessary resize events
		}

		if (_querysets[name].timer) {
			clearTimeout(_querysets[name].timer);
			_querysets[name].timer = null;
		}

		_querysets[name].timer = setTimeout(function() {
			var mParams = checkQueries(name, false);
			if (mParams) {
				fireEvent("media_" + name, mParams);
			}
		}, media_timeout);
	}

	function getRangeInfo(sSetName, iRangeIdx){
		var q = _querysets[sSetName].queries[iRangeIdx];
		var info = {from: q.from, unit: _querysets[sSetName].unit};
		if (q.to >= 0) {
			info.to = q.to;
		}
		if (_querysets[sSetName].names) {
			info.name = _querysets[sSetName].names[iRangeIdx];
		}
		return info;
	}

	function checkQueries(name, infoOnly){
		if (_querysets[name]) {
			var aQueries = _querysets[name].queries;
			var info = null;
			for (var i = 0, len = aQueries.length; i < len; i++) {
				var q = aQueries[i];
				if ((q != _querysets[name].currentquery || infoOnly) && device.media.matches(q.from, q.to, _querysets[name].unit)) {
					if (!infoOnly) {
						_querysets[name].currentquery = q;
					}
					if (!_querysets[name].noClasses && _querysets[name].names && !infoOnly) {
						refreshCSSClasses(name, _querysets[name].names[i]);
					}
					info = getRangeInfo(name, i);
				}
			}

			return info;
		}
		logger.log(WARNING, "No queryset with name " + name + " found", 'DEVICE.MEDIA');
		return null;
	}

	function refreshCSSClasses(sSetName, sRangeName, bRemove){
		 var sClassPrefix = "sapUiMedia-" + sSetName + "-";
		 changeRootCSSClass(sClassPrefix + sRangeName, bRemove, sClassPrefix);
	}

	function changeRootCSSClass(sClassName, bRemove, sPrefix){
		var oRoot = document.documentElement;
		if (oRoot.className.length == 0) {
			if (!bRemove) {
				oRoot.className = sClassName;
			}
		} else {
			var aCurrentClasses = oRoot.className.split(" ");
			var sNewClasses = "";
			for (var i = 0; i < aCurrentClasses.length; i++) {
				if ((sPrefix && aCurrentClasses[i].indexOf(sPrefix) != 0) || (!sPrefix && aCurrentClasses[i] != sClassName)) {
					sNewClasses = sNewClasses + aCurrentClasses[i] + " ";
				}
			}
			if (!bRemove) {
				sNewClasses = sNewClasses + sClassName;
			}
			oRoot.className = sNewClasses;
		}
	}

	function windowSize(){
		return [document.documentElement.clientWidth, document.documentElement.clientHeight];
	}

	function convertToPx(val, unit){
		if (unit === "em" || unit === "rem") {
			var s = window.getComputedStyle || function(e) {
					return e.currentStyle;
				};
				var x = s(document.documentElement).fontSize;
				var f = (x && x.indexOf("px") >= 0) ? parseFloat(x, 10) : 16;
				return val * f;
		}
		return val;
	}

	function match_legacy(from, to, unit){
		from = convertToPx(from, unit);
		to = convertToPx(to, unit);

		var width = windowSize()[0];
		var a = from < 0 || from <= width;
		var b = to < 0 || width <= to;
		return a && b;
	}

	function match(from, to, unit){
		var q = getQuery(from, to, unit);
		var mm = window.matchMedia(q); //FF returns null when running within an iframe with display:none
		return mm && mm.matches;
	}

	device.media.matches = device.support.matchmedia ? match : match_legacy;

	/**
	 * Registers the given handler to the range change event, which is fired when a new range of the set is entered.
	 *
	 * The handler has one map parameter <code>mParams</code>:
	 * <ul>
	 * <li>mParams.from: the range start value</li>
	 * <li>mParams.to: the range end value, not defined for the last range (INFINITY)</li>
	 * <li>mParams.unit: the used unit, e.g. px</li>
	 * <li>mParams.name: the range name if defined</li>
	 * </ul>
	 *
	 * @param {Function} fnFunction The function to call, when the range change event occurs.
	 * @param {Object} [oListener] The 'this' context of the handler function.
	 * @param {String} sName The name of the range set to listen to.
	 * @name sap.ui.Device.media#attachHandler
	 * @function
	 * @public
	 */
	device.media.attachHandler = function(fnFunction, oListener, sName){
		var name = sName || _defaultRangeSet;
		attachEvent("media_" + name, fnFunction, oListener);
	};

	/**
	 * Deregisters a previously registered handler from the range change event.
	 *
	 * @param {Function} fnFunction The function to call, when the range change event occurs.
	 * @param {Object} [oListener] The 'this' context of the handler function.
	 * @param {String} sName The name of the range set to listen to.
	 * @name sap.ui.Device.media#detachHandler
	 * @function
	 * @public
	 */
	device.media.detachHandler = function(fnFunction, oListener, sName){
		var name = sName || _defaultRangeSet;
		detachEvent("media_" + name, fnFunction, oListener);
	};

	/**
	 * Initializes a Screen width media query range set.
	 *
	 * This function can either be called only with the name parameter to initialize a predefined range set,
	 * e.g. <code>sap.ui.Device.media.initRangeSet(sap.ui.Device.media.RANGESETS.SAP_3STEPS)</code>.
	 *
	 * Or it is possible to define a custom range set as in the following example:
	 * <code>sap.ui.Device.media.initRangeSet("MyRangeSet", [200, 400], "px", ["Small", "Medium", "Large"])</code> defines 3 ranges:
	 * <ul>
	 * <li>0px-199.999px with name "Small"</li>
	 * <li>200px-399.999px with name "Medium"</li>
	 * <li>400px-INFINITY with name "Large"</li>
	 * </ul>
	 *
	 * The range names are optional. If they are specified also a CSS class (e.g. sapUiMedia-MyRangeSet-Small) is added to the document root
	 * depending on the current active range. This can be suppressed via parameter <code>bSuppressClasses</code>.
	 *
	 * @param {String} sName The name of the range set. Either a predefined or custom one. The name must be a valid id (consist of letters and digits).
	 * @param {int[]} aRangeBorders The range borders
	 * @param {String} [sUnit] The unit which should be used. Allowed values are px (default), em or rem.
	 * @param {String[]} [aRangeNames] The names of the ranges. The names must be a valid id (consist of letters and digits).
	 * @param {boolean} [bSuppressClasses] Whether writing CSS classes to the document root should be suppressed
	 * @name sap.ui.Device.media#initRangeSet
	 * @function
	 * @public
	 */
	device.media.initRangeSet = function(sName, aRangeBorders, sUnit, aRangeNames, bSuppressClasses){
		//TODO Do some Assertions and parameter checking
		var oConfig;
		if (!sName) {
			oConfig = device.media._predefinedRangeSets[_defaultRangeSet];
		} else if (sName && device.media._predefinedRangeSets[sName]) {
			oConfig = device.media._predefinedRangeSets[sName];
		} else {
			oConfig = {name: sName, unit: (sUnit || "px").toLowerCase(), points: aRangeBorders || [], names: aRangeNames, noClasses: !!bSuppressClasses};
		}

		if (device.media.hasRangeSet(oConfig.name)) {
			logger.log(INFO, "Range set " + oConfig.name + " hase already been initialized", 'DEVICE.MEDIA');
			return;
		}

		sName = oConfig.name;
		oConfig.queries = [];
		oConfig.timer = null;
		oConfig.currentquery = null;
		oConfig.listener = function(){
			return handleChange(sName);
		};

		var from, to, query;
		var aPoints = oConfig.points;
		for (var i = 0, len = aPoints.length; i <= len; i++) {
			from = (i == 0) ? 0 : aPoints[i - 1];
			to = (i == aPoints.length) ? -1 : aPoints[i];
			query = getQuery(from, to, oConfig.unit);
			oConfig.queries.push({
				query: query,
				from: from,
				to: to
			});
		}

		if (oConfig.names && oConfig.names.length != oConfig.queries.length) {
			oConfig.names = null;
		}

		_querysets[oConfig.name] = oConfig;

		if (device.support.matchmedialistener) { //FF, Safari, Chrome, IE10?
			var queries = oConfig.queries;
			for (var i = 0; i < queries.length; i++) {
				var q = queries[i];
				q.media = window.matchMedia(q.query);
				q.media.addListener(oConfig.listener);
			}
		} else { //IE, Safari (<6?)
			if (window.addEventListener) {
				window.addEventListener("resize", oConfig.listener, false);
				window.addEventListener("orientationchange", oConfig.listener, false);
			} else { //IE8
				window.attachEvent("onresize", oConfig.listener);
			}
		}

		oConfig.listener();
	};

	/**
	 * Returns information about the current active range of the range set with the given name.
	 *
	 * @param {String} sName The name of the range set.
	 * @name sap.ui.Device.media#getCurrentRange
	 * @return {Map} the information about the current active range (same structure like the handler parameters (@see sap.ui.Device.media#attachHandler))
	 * @function
	 * @public
	 */
	device.media.getCurrentRange = function(sName){
		if (!device.media.hasRangeSet(sName)) {
			return null;
		}
		return checkQueries(sName, true);
	};

	/**
	 * Returns whether a range set with the given name is initialized.
	 *
	 * @param {String} sName The name of the range set.
	 * @name sap.ui.Device.media#hasRangeSet
	 * @return {boolean}
	 * @function
	 * @public
	 */
	device.media.hasRangeSet = function(sName){
		return sName && !!_querysets[sName];
	};

	/**
	 * Removes a previously initialized range set and detaches all registered handlers.
	 *
	 * Initialized predefined range sets (@see sap.ui.Device.media#RANGESETS) cannot be removed.
	 *
	 * @param {String} sName The name of the range set.
	 * @name sap.ui.Device.media#removeRangeSet
	 * @function
	 * @protected
	 */
	device.media.removeRangeSet = function(sName){
		if (!device.media.hasRangeSet(sName)) {
			logger.log(INFO, "RangeSet " + sName + " not found, thus could not be removed.", 'DEVICE.MEDIA');
			return;
		}

		for (var x in RANGESETS) {
			if (sName === RANGESETS[x]) {
				logger.log(WARNING, "Cannot remove default rangeset - no action taken.", 'DEVICE.MEDIA');
				return;
			}
		}

		var oConfig = _querysets[sName];
		if (device.support.matchmedialistener) { //FF, Safari, Chrome, IE10?
			var queries = oConfig.queries;
			for (var i = 0; i < queries.length; i++) {
				queries[i].media.removeListener(oConfig.listener);
			}
		} else { //IE, Safari (<6?)
			if (window.removeEventListener) {
				window.removeEventListener("resize", oConfig.listener, false);
				window.removeEventListener("orientationchange", oConfig.listener, false);
			} else { //IE8
				window.detachEvent("onresize", oConfig.listener);
			}
		}

		refreshCSSClasses(sName, "", true);
		delete mEventRegistry["media_" + sName];
		delete _querysets[sName];
	};

//******** System Detection ********

	/**
	 * Contains information about the system.
	 *
	 * @namespace
	 * @name sap.ui.Device.system
	 * @public
	 */
	/**
	 * Enumeration containing the names of known types of the devices.
	 *
	 * @namespace
	 * @name sap.ui.Device.system.SYSTEMTYPE
	 * @public
	 */
	/**
	 * Flag indicating if the device is a tablet.
	 *
	 * @name sap.ui.Device.system#tablet
	 * @type boolean
	 * @public
	 */
	/**
	 * Flag indicating if the device is a phone.
	 *
	 * @name sap.ui.Device.system#phone
	 * @type boolean
	 * @public
	 */
	/**
	 * Flag indicating if the device is a desktop.
	 *
	 * @name sap.ui.Device.system#desktop
	 * @type boolean
	 * @public
	 */
	/**
	 * Flag indicating if the device is a combination of desktop and tablet.
	 *
	 * This property is mainly targeting the windows 8 devices where the mouse and touch event may supported
	 * natively by the browser.
	 *
	 * This property is set to true only when both mouse and touch event are natively supported.
	 *
	 * @alias sap.ui.Device.system#combi
	 * @type boolean
	 * @public
	 */

	var SYSTEMTYPE = {
			"TABLET" : "tablet",
			"PHONE" : "phone",
			"DESKTOP" : "desktop",
			"COMBI" : "combi"
	};

	var isWin8 = !!device.os.windows && device.os.version === 8;
	var isWin7 = !!device.os.windows && device.os.version === 7;

	device.system = {};

	function getSystem(_simMobileOnDesktop) {
		var t = isTablet();

		var s = {};
		s.tablet = ((device.support.touch && !isWin7) || isWin8 || !!_simMobileOnDesktop) && t;
		s.phone = device.os.windows_phone || ((device.support.touch && !isWin7) || !!_simMobileOnDesktop) && !t;
		s.desktop = (!s.tablet && !s.phone) || isWin8 || isWin7;
		s.combi = (s.desktop && s.tablet);
		s.SYSTEMTYPE = SYSTEMTYPE;

		for (var type in SYSTEMTYPE) {
			changeRootCSSClass("sap-" + SYSTEMTYPE[type], !s[SYSTEMTYPE[type]]);
		}
		return s;
	}

	function isTablet() {
		var android_phone = (/(?=android)(?=.*mobile)/i.test(navigator.userAgent));
		// According to google documentation: https://developer.chrome.com/multidevice/webview/overview, the WebView shipped with Android 4.4 (KitKat) is based on the same code as Chrome for Android.
		// If you're attempting to differentiate between the WebView and Chrome for Android, you should look for the presence of the Version/_X.X_ string in the WebView user-agent string
		// The stock browser of Samsung device uses Chrome kernal from Android version 4.4. It behaves differently than the Chrome Webview, therefore it's excluded from this check by checking the 'SAMSUNG'
		// string in the user agent.
		var bChromeWebView = device.os.android && device.browser.chrome && (device.os.version >= 4.4) && /Version\/\d.\d/.test(navigator.userAgent) && !/SAMSUNG/.test(navigator.userAgent);
		if (device.os.name === device.os.OS.IOS) {
			return /ipad/i.test(navigator.userAgent);
		} else {
			if (device.support.touch) {
				if (isWin8) {
					return true;
				}

				//in real mobile device
				var densityFactor = window.devicePixelRatio ? window.devicePixelRatio : 1; // may be undefined in Windows Phone devices
				if (!bChromeWebView && (device.os.name === device.os.OS.ANDROID) && device.browser.webkit && (parseFloat(device.browser.webkitVersion) > 537.10)) {
					// On Android sometimes window.screen.width returns the logical CSS pixels, sometimes the physical device pixels;
					// Tests on multiple devices suggest this depends on the Webkit version.
					// The Webkit patch which changed the behavior was done here: https://bugs.webkit.org/show_bug.cgi?id=106460
					// Chrome 27 with Webkit 537.36 returns the logical pixels,
					// Chrome 18 with Webkit 535.19 returns the physical pixels.
					// The BlackBerry 10 browser with Webkit 537.10+ returns the physical pixels.
					// So it appears like somewhere above Webkit 537.10 we do not hve to divide by the devicePixelRatio anymore.

					// update: Chrome WebView returns physical pixels therefore it's excluded from this special check
					densityFactor = 1;
				}

				//this is how android distinguishes between tablet and phone
				//http://android-developers.blogspot.de/2011/07/new-tools-for-managing-screen-sizes.html
				var bTablet = (Math.min(window.screen.width / densityFactor, window.screen.height / densityFactor) >= 600);

				// special workaround for Nexus 7 where the window.screen.width is 600px or 601px in portrait mode (=> tablet)
				// but window.screen.height 552px in landscape mode (=> phone), because the browser UI takes some space on top.
				// So the detected device type depends on the orientation :-(
				// actually this is a Chrome bug, as "width"/"height" should return the entire screen's dimensions and
				// "availWidth"/"availHeight" should return the size available after subtracting the browser UI
				if (isLandscape()
						&& (window.screen.height === 552 || window.screen.height === 553) // old/new Nexus 7
						&& (/Nexus 7/i.test(navigator.userAgent))) {
					bTablet = true;
				}

				return bTablet;
			} else {
				// in desktop browser, it's detected as tablet when
				// 1. Windows 8 device with a touch screen where "Touch" is contained in the userAgent
				// 2. Android emulation and it's not an Android phone
				return (device.browser.msie && ua.indexOf("Touch") !== -1) || (device.os.name === device.os.OS.ANDROID && !android_phone);
			}
		}
	}

	function setSystem(_simMobileOnDesktop) {
		device.system = getSystem(_simMobileOnDesktop);
		if (device.system.tablet || device.system.phone) {
			device.browser.mobile = true;
		}
	}
	setSystem();

//******** Orientation Detection ********

	/**
	 * Orientation Change Event API.
	 *
	 * @namespace
	 * @name sap.ui.Device.orientation
	 * @public
	 */

	device.orientation = {};

	/**
	 * Resize Event API.
	 *
	 * @namespace
	 * @name sap.ui.Device.resize
	 * @public
	 */
	device.resize = {};

	/**
	 * Registers the given handler to the orientation change event.
	 *
	 * The handler has one map parameter <code>mParams</code>:
	 * <ul>
	 * <li>mParams.landscape: whether the orientation is currently landscape</li>
	 * </ul>
	 *
	 * @param {Function} fnFunction The function to call, when the orientation change event occurs.
	 * @param {Object} [oListener] The 'this' context of the handler function.
	 * @name sap.ui.Device.orientation#attachHandler
	 * @function
	 * @public
	 */
	device.orientation.attachHandler = function(fnFunction, oListener){
		attachEvent("orientation", fnFunction, oListener);
	};

	/**
	 * Registers the given handler to the resize event.
	 *
	 * The handler has one map parameter <code>mParams</code>:
	 * <ul>
	 * <li>mParams.height: new height of the window</li>
	 * <li>mParams.width: new width of the window</li>
	 * </ul>
	 *
	 * @param {Function} fnFunction The function to call, when the resize event occurs.
	 * @param {Object} [oListener] The 'this' context of the handler function.
	 * @name sap.ui.Device.resize#attachHandler
	 * @function
	 * @public
	 */
	device.resize.attachHandler = function(fnFunction, oListener){
		attachEvent("resize", fnFunction, oListener);
	};

	/**
	 * Deregisters a previously registered handler from the orientation change event.
	 * @param {Function} fnFunction The function to call, when the orientation change event occurs.
	 * @param {Object} [oListener] The 'this' context of the handler function.
	 * @name sap.ui.Device.orientation#detachHandler
	 * @function
	 * @public
	 */
	device.orientation.detachHandler = function(fnFunction, oListener){
		detachEvent("orientation", fnFunction, oListener);
	};

	/**
	 * Deregisters a previously registered handler from the resize event.
	 * @param {Function} fnFunction The function to call, when the resize event occurs.
	 * @param {Object} [oListener] The 'this' context of the handler function.
	 * @name sap.ui.Device.resize#detachHandler
	 * @function
	 * @public
	 */
	device.resize.detachHandler = function(fnFunction, oListener){
		detachEvent("resize", fnFunction, oListener);
	};

	function setOrientationInfo(oInfo){
		oInfo.landscape = isLandscape(true);
		oInfo.portrait = !oInfo.landscape;
	}

	function handleOrientationChange(){
		setOrientationInfo(device.orientation);
		fireEvent("orientation", {landscape: device.orientation.landscape});
	}

	function handleResizeChange(){
		setResizeInfo(device.resize);
		fireEvent("resize", {height: device.resize.height, width: device.resize.width});
	}

	function setResizeInfo(oInfo){
		oInfo.width = windowSize()[0];
		oInfo.height = windowSize()[1];
	}

	function handleOrientationResizeChange(){
		var wasL = device.orientation.landscape;
		var isL = isLandscape();
		if (wasL != isL) {
			handleOrientationChange();
		}
		//throttle resize events because most browsers throw one or more resize events per pixel
		//for every resize event inside the period from 150ms (starting from the first resize event),
		//we only fire one resize event after this period
		if (!iResizeTimeout) {
			iResizeTimeout = window.setTimeout(handleResizeTimeout, 150);
		}
	}

	function handleResizeTimeout() {
		handleResizeChange();
		iResizeTimeout = null;
	}

	var bOrientationchange = false;
	var bResize = false;
	var iOrientationTimeout;
	var iResizeTimeout;
	var iClearFlagTimeout;
	var iWindowHeightOld = windowSize()[1];
	var iWindowWidthOld = windowSize()[0];
	var bKeyboardOpen = false;
	var iLastResizeTime;
	var rInputTagRegex = /INPUT|TEXTAREA|SELECT/;
	// On iPhone with iOS version 7.0.x and on iPad with iOS version 7.x (tested with all versions below 7.1.1), there's a invalide resize event fired
	// when changing the orientation while keyboard is shown.
	var bSkipFirstResize = device.os.ios && device.browser.name === "sf" &&
		((device.system.phone && device.os.version >= 7 && device.os.version < 7.1) || (device.system.tablet && device.os.version >= 7));

	function isLandscape(bFromOrientationChange){
		if (device.support.touch && device.support.orientation) {
			//if on screen keyboard is open and the call of this method is from orientation change listener, reverse the last value.
			//this is because when keyboard opens on android device, the height can be less than the width even in portrait mode.
			if (bKeyboardOpen && bFromOrientationChange) {
				return !device.orientation.landscape;
			}
			//when keyboard opens, the last orientation change value will be retured.
			if (bKeyboardOpen) {
				return device.orientation.landscape;
			}
			//otherwise compare the width and height of window
		} else {
			//most desktop browsers and windows phone/tablet which not support orientationchange
			if (device.support.matchmedia && device.support.orientation) {
				return !!window.matchMedia("(orientation: landscape)").matches;
			}
		}
		var size = windowSize();
		return size[0] > size[1];
	}

	function handleMobileOrientationResizeChange(evt) {
		if (evt.type == "resize") {
			// supress the first invalid resize event fired before orientationchange event while keyboard is open on iPhone 7.0.x
			// because this event has wrong size infos
			if (bSkipFirstResize && rInputTagRegex.test(document.activeElement.tagName) && !bOrientationchange) {
				return;
			}

			var iWindowHeightNew = windowSize()[1];
			var iWindowWidthNew = windowSize()[0];
			var iTime = new Date().getTime();
			//skip multiple resize events by only one orientationchange
			if (iWindowHeightNew === iWindowHeightOld && iWindowWidthNew === iWindowWidthOld) {
				return;
			}
			bResize = true;
			//on mobile devices opening the keyboard on some devices leads to a resize event
			//in this case only the height changes, not the width
			if ((iWindowHeightOld != iWindowHeightNew) && (iWindowWidthOld == iWindowWidthNew)) {
				//Asus Transformer tablet fires two resize events when orientation changes while keyboard is open.
				//Between these two events, only the height changes. The check of if keyboard is open has to be skipped because
				//it may be judged as keyboard closed but the keyboard is still open which will affect the orientation detection
				if (!iLastResizeTime || (iTime - iLastResizeTime > 300)) {
					bKeyboardOpen = (iWindowHeightNew < iWindowHeightOld);
				}
				handleResizeChange();
			} else {
				iWindowWidthOld = iWindowWidthNew;
			}
			iLastResizeTime = iTime;
			iWindowHeightOld = iWindowHeightNew;

			if (iClearFlagTimeout) {
				window.clearTimeout(iClearFlagTimeout);
				iClearFlagTimeout = null;
			}
			//Some Android build-in browser fires a resize event after the viewport is applied.
			//This resize event has to be dismissed otherwise when the next orientationchange event happens,
			//a UI5 resize event will be fired with the wrong window size.
			iClearFlagTimeout = window.setTimeout(clearFlags, 1200);
		} else if (evt.type == "orientationchange") {
			bOrientationchange = true;
		}

		if (iOrientationTimeout) {
			clearTimeout(iOrientationTimeout);
			iOrientationTimeout = null;
		}
		iOrientationTimeout = window.setTimeout(handleMobileTimeout, 50);
	}

	function handleMobileTimeout() {
		if (bOrientationchange && bResize) {
			handleOrientationChange();
			handleResizeChange();
			bOrientationchange = false;
			bResize = false;
			if (iClearFlagTimeout) {
				window.clearTimeout(iClearFlagTimeout);
				iClearFlagTimeout = null;
			}
		}
		iOrientationTimeout = null;
	}

	function clearFlags(){
		bOrientationchange = false;
		bResize = false;
		iClearFlagTimeout = null;
	}

//******** Update browser settings for test purposes ********

	device._update = function(_simMobileOnDesktop) {
		ua = navigator.userAgent;
		logger.log(WARNING, "Device API values manipulated: NOT PRODUCTIVE FEATURE!!! This should be only used for test purposes. Only use if you know what you are doing.");
		setBrowser();
		setOS();
		setSystem(_simMobileOnDesktop);
	};

//********************************************************

	setResizeInfo(device.resize);
	setOrientationInfo(device.orientation);

	//Add API to global namespace
	window.sap.ui.Device = device;

	// Add handler for orientationchange and resize after initialization of Device API (IE8 fires onresize synchronously)
	if (device.support.touch && device.support.orientation) {
		//logic for mobile devices which support orientationchange (like ios, android, blackberry)
		window.addEventListener("resize", handleMobileOrientationResizeChange, false);
		window.addEventListener("orientationchange", handleMobileOrientationResizeChange, false);
	} else {
		if (window.addEventListener) {
			//most desktop browsers and windows phone/tablet which not support orientationchange
			window.addEventListener("resize", handleOrientationResizeChange, false);
		} else {
			//IE8
			window.attachEvent("onresize", handleOrientationResizeChange);
		}
	}

	//Always initialize the default media range set
	device.media.initRangeSet();
	device.media.initRangeSet(RANGESETS["SAP_STANDARD_EXTENDED"]);

	// define module if API is available
	if (sap.ui.define) {
		sap.ui.define("sap/ui/Device", [], function() {
			return device;
		});
	}

}());
