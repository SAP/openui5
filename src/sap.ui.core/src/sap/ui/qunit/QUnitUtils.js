/*!
 * ${copyright}
 */

/*global QUnit, Date:true */

/**
 * SAPUI5 test utilities
 *
 * @namespace
 * @name sap.ui.test
 * @public
 */

sap.ui.define('sap/ui/qunit/QUnitUtils', [
	'jquery.sap.global',
	'sap/base/util/ObjectPath',
	'sap/ui/Device',
	'sap/ui/base/DataType',
	'sap/ui/events/KeyCodes',
	"sap/base/strings/camelize",
	"sap/base/strings/capitalize",
	"sap/base/util/UriParameters",
	"sap/base/Log",
	"sap/ui/dom/jquery/control" // jQuery Plugin "control"
],
	function(
		jQuery,
		ObjectPath,
		Device,
		DataType,
		KeyCodes,
		camelize,
		capitalize,
		UriParameters,
		Log
	) {
	"use strict";

	if ( typeof QUnit !== 'undefined' ) {

		// any version < 2.0 activates legacy support
		// note that the strange negated condition properly handles NaN
		var bLegacySupport = !(parseFloat(QUnit.version) >= 2.0);

		// extract the URL parameters
		var mParams = UriParameters.fromQuery(window.location.search);

		if ( bLegacySupport ) {
		// TODO: Remove deprecated code once all projects adapted
		QUnit.equals = window.equals = window.equal;
		}

		// Set a timeout for all tests, either to a value given via URL
		// or - when no other value has been configured yet - to a static default
		var sTimeout = mParams.get("sap-ui-qunittimeout");
		if (sTimeout != null || !("testTimeout" in QUnit.config)) {
			if (!sTimeout || isNaN(sTimeout)) {
				sTimeout = "30000"; // 30s: default timeout of an individual QUnit test!
			}
			QUnit.config.testTimeout = parseInt(sTimeout);
		}

		if ( bLegacySupport ) {
		// Do not reorder tests, as most of the tests depend on each other
		QUnit.config.reorder = false;
		}

		// only when instrumentation is done on server-side blanket itself doesn't
		// take care about rendering the report - in this case we do it manually
		// when the URL parameter "coverage-report" is set to true or x
		if (window["sap-ui-qunit-coverage"] !== "client" && /x|true/i.test(mParams.get("coverage-report"))) {
			QUnit.done(function(failures, total) {
				// only when coverage is available
				if (window._$blanket) {
					// we remove the QUnit object to avoid blanket to automatically
					// trigger start on QUnit which leads to failures in qunit-reporter-junit
					var QUnit = window.QUnit;
					window.QUnit = undefined;
					// load the blanket instance
					sap.ui.requireSync("sap/ui/thirdparty/blanket");
					// restore the QUnit object
					window.QUnit = QUnit;
					// trigger blanket to display the coverage report
					window.blanket.report({});
				}
			});
		}

	}

	// Re-implement jQuery.now to always delegate to Date.now.
	//
	// Otherwise, fake timers that are installed after jQuery don't work with jQuery animations
	// as those animations internally use jQuery.now which then is a reference to the original,
	// native Date.now.
	jQuery.now = function() {
		return Date.now();
	};

	// PhantomJS fixes
	if (Device.browser.phantomJS) {

		// 1.) PhantomJS patch for Focus detection via jQuery:
		// ==> https://code.google.com/p/phantomjs/issues/detail?id=427
		//     ==> https://github.com/ariya/phantomjs/issues/10427
		var $is = jQuery.fn.is;
		jQuery.fn.is = function(sSelector) {
			if (sSelector === ":focus") {
				return this.get(0) === document.activeElement;
			}
			return $is.apply(this, arguments);
		};

		// 2.) PhantomJS fix for invalid date handling:
		// ==> https://github.com/ariya/phantomjs/issues/11151

		/*eslint-disable */
		var NativeDate = Date,
			NativeDate_parse = NativeDate.parse;

		// override the constructor of the Date object
		Date = function(sDateString) {
			if ( arguments.length === 1 && typeof sDateString === 'string' ) {
				return new NativeDate(Date.parse(sDateString));
			}

			// signature variant with 2..6 individual date components
			var args = Array.prototype.slice.call(arguments);
			args.unshift(window);
			if (this instanceof NativeDate) {
				// usage of new Date(...):
				// simulate a new call with Function.prototype.bind.apply(fnClass, args)
				return new (Function.prototype.bind.apply(NativeDate, args));
			} else {
				// usage of Date(...):
				return NativeDate.apply(window, args);
			}
		};

		// patch the parse function of the Date
		var parse = function (sDateString) {
			var iMillis = NativeDate_parse.apply(Date, arguments);
			if (sDateString && typeof sDateString === "string") {
				// if the year is gt/eq 2034 we need to increment the
				// date by one additional day since this is broken in
				// PhantomJS => this is a workaround for the upper BUG!
				var m = /^(\d{4})(?:-(\d+)?-(\d+))(?:[T ](\d+):(\d+)(?::(\d+)(?:\.(\d+))?)?)?(?:Z(-?\d*))?$/.exec(sDateString);
				if (m && parseInt(m[1]) >= 2034) {
					iMillis += 24 * 60 * 60 * 1000;
				}
			}
			return iMillis;
		};

		// Add the static functions to Date with 'enumerable=false',
		// otherwise, Sinon will copy them over his own modified versions
		// of e.g. Date.now, thereby breaking the fakeTimer feature.
		Object.defineProperties(Date, {
			"parse": {
				value: parse,
				enumerable: false
			},
			"toString": {
				value: function() {
					return NativeDate.toString.call(this);
				},
				enumerable: false
			},
			"now": {
				value: NativeDate.now,
				enumerable: false
			},
			"UTC": {
				value: NativeDate.UTC,
				enumerable: false
			},
			"prototype": {
				value: NativeDate.prototype,
				enumerable :false
			}
		});
		/*eslint-enable */

	}

	/**
	 * Contains helper functionality for QUnit tests.
	 *
	 * @namespace
	 * @alias sap.ui.test.qunit
	 * @public
	 */
	var QUtils = {};

	/**
	 * Delays the start of the test until everything is rendered or - if given - for the specified milliseconds.
	 * This function must be called before the first test function.
	 *
	 * @param {int} [iDelay] optional delay in milliseconds
	 *
	 * @public
	 */
	QUtils.delayTestStart = function(iDelay){
		QUnit.config.autostart = false;
		if (iDelay) {
			window.setTimeout(function() {
				QUnit.start();
			}, iDelay);
		} else {
			jQuery(function() {
				QUnit.start();
			});
		}
	};

	var fixOriginalEvent = jQuery.noop;

	try {

		// check whether preventDefault throws an error for a dummy event
		new jQuery.Event({type: "mousedown"}).preventDefault();

	} catch (e) {

		// if so, we might be running on top of jQuery 2.2.0 or higher and we have to add the native Event methods to the 'originalEvent'
		fixOriginalEvent = function(origEvent) {
			if ( origEvent ) {
				origEvent.preventDefault = origEvent.preventDefault || jQuery.noop;
				origEvent.stopPropagation = origEvent.stopPropagation || jQuery.noop;
				origEvent.stopImmediatePropagation = origEvent.stopImmediatePropagation || jQuery.noop;
			}
		};

		var OrigjQEvent = jQuery.Event;
		jQuery.Event = function(src, props) {
			var event = new OrigjQEvent(src, props);
			fixOriginalEvent(event.originalEvent);
			return event;
		};
		jQuery.Event.prototype = OrigjQEvent.prototype;
	}

	/*
	 * Creates a fake event of type jQuery.Event, according to current UI5 practices; it will always
	 * contain a pseudo browser event (property <code>originalEvent</code>).
	 *
	 * Please note that the <code>originalEvent</code> could be created as a native browser event (class <code>Event</code>)
	 * as some existing test cases specify a <code>target</code> property which is readonly in the <code>Event</code> class.
	 *
	 * Any given <code>oParams</code> are added to the new <code>jQuery.Event</code> as well as to its <code>originalEvent</code>
	 * object. To be compatible with older versions, this function does not propagate properties to <code>originalEvent</code> when
	 * they are given before an eventual <code>originalEvent</code> property in <code>oParams</code>.
	 *
	 * @param {string} sEventName mandatory name (type) of the newly created event
	 * @param {Element} [oTarget] optional target of the event
	 * @param {object} [oParams] optional map of properties to be added to the event
	 */
	function fakeEvent(sEventName, oTarget, oParams) {

		var oEvent = jQuery.Event({type : sEventName});
		if ( oTarget != null ) {
			oEvent.target = oTarget;
		}

		if (oParams) {
			for (var x in oParams) {

				// propagate property to event
				oEvent[x] = oParams[x];

				if ( x === 'originalEvent' ) {
					// if 'originalEvent' has been changed, fix it
					fixOriginalEvent(oEvent[x]);
				} else {
					// otherwise propagate property to 'originalEvent' as well
					oEvent.originalEvent[x] = oParams[x];
				}
			}
		}

		return oEvent;
	}

	/**
	 * Programmatically triggers an event specified by its name on a specified target with some optional parameters.
	 * @see http://api.jquery.com/trigger/
	 *
	 * @param {string} sEventName The name of the browser event (like "click")
	 * @param {string | Element} oTarget The ID of a DOM element or a DOM element which serves as target of the event
	 * @param {object} [oParams] The parameters which should be attached to the event in JSON notation (depending on the event type).
	 * @public
	 */
	QUtils.triggerEvent = function(sEventName, oTarget, oParams) {

		if (typeof (oTarget) == "string") {
			oTarget = oTarget ? document.getElementById(oTarget) : null;
		}

		var oEvent = fakeEvent(sEventName, /* no target */ null, oParams);

		jQuery(oTarget).trigger(oEvent);

	};


	/**
	 * Programmatically triggers a touch event specified by its name.
	 * The onEVENTNAME functions are called directly on the "nearest" control / element of the given target.
	 *
	 * @param {string} sEventName The name of the touch event (touchstart, touchmove, touchend)
	 * @param {string | Element} oTarget The ID of a DOM element or a DOM element which serves as target of the event
	 * @param {object} [oParams] The parameters which should be attached to the event in JSON notation (depending on the event type).
	 * @param {string} [sEventHandlerPrefix='on'] prefix to use for the event handler name, defaults to 'on'
	 * @public
	 */
	QUtils.triggerTouchEvent = function(sEventName, oTarget, oParams, sEventHandlerPrefix) {

		if (typeof (oTarget) == "string") {
			oTarget = oTarget ? document.getElementById(oTarget) : null;
		}

		var oEvent = fakeEvent(sEventName, oTarget, oParams),
			oElement = jQuery(oTarget).control(0),
			sEventHandlerName = (sEventHandlerPrefix == null ? 'on' : sEventHandlerPrefix) + sEventName;

		if (oElement && oElement[sEventHandlerName]) {
			oElement[sEventHandlerName].call(oElement, oEvent);
		}

	};

	function mapKeyCodeToLocation(sKey) {
		if (!sKey) {
			return undefined;
		}

		if (!isNaN(sKey)) {
			var aKeys = Object.keys(KeyCodes).filter(function (sKeyName) {
				return KeyCodes[sKeyName] === sKey;
			});
			if (aKeys.length === 1) {
				sKey = aKeys[0];
			}
		}
		if (sKey.toLowerCase().startsWith("numpad_")) {
			return "NUMPAD";
		}
	}

	/**
	 * Maps the input keyCode to key property
	 * @param sKeyCode {string|Integer} keyCode number or string, e.g. 27 or ESCAPE
	 * @returns {*} the key property of KeyBoardEvent, e.g. Escape
	 */
	function mapKeyCodeToKey(sKeyCode) {

		// look up number in KeyCodes enum to get the string
		if (!isNaN(sKeyCode)) {
			sKeyCode = getKeyCodeStringFromNumber(sKeyCode);
		}
		if (!sKeyCode) {
			return undefined;
		}
		sKeyCode = sKeyCode.toLowerCase();
		// replace underscores with dash character such as 'ARROW_LEFT' --> 'ARROW-LEFT' and then camelize it --> 'ArrowLeft'
		sKeyCode = camelize(sKeyCode.replace(/_/g, "-"));

		// capitalize key
		var sKey = capitalize(sKeyCode);

		// remove "Digit" and "Numpad" from the resulting string as this info is present within the Location property and not the key property
		// e.g. "Digit9" --> "9"
		if (sKey.startsWith("Digit")) {
			return sKey.substring("Digit".length);
		} else if (sKey.startsWith("Numpad")) {
			sKey = sKey.substring("Numpad".length);
		}

		// special handling where KeyCodes[sKeyCode] does not match
		// e.g. KeyCodes.BREAK --> 'Pause' instead of 'Break'
		switch (sKey) {
			case "Break": return "Pause";
			case "Space": return " ";
			case "Print": return "PrintScreen";
			case "Windows": return "Meta";
			case "Sleep": return "Standby";
			case "TurnOff": return "PowerOff";
			case "Asterisk": return "*";
			case "Plus": return "+";
			case "Minus": return "-";
			case "Comma": return ",";
			case "Slash": return "/";
			case "OpenBracket": return ";";
			case "Dot": return ".";
			case "Pipe": return "|";
			case "Semicolon": return ";";
			case "Equals": return "=";
			case "SingleQUote": return "=";
			case "Backslash": return "\\";
			case "GreatAccent": return "`";
			default: return sKey;
		}
	}

	/**
	 * Retrieves keycode string from number
	 * @param iKeyCode
	 * @returns {string}
	 */
	function getKeyCodeStringFromNumber(iKeyCode) {
		for (var sKey in KeyCodes) {
			if (KeyCodes.hasOwnProperty(sKey)) {
				if (KeyCodes[sKey] === iKeyCode) {
					return sKey;
				}
			}
		}
	}


	/**
	 * Programmatically triggers a keyboard event specified by its name on a specified target.
	 * @see sap.ui.test.qunit.triggerEvent
	 *
	 * @param {string} sEventType The name of the browser keyboard event (like "keydown")
	 * @param {string | Element} oTarget The ID of a DOM element or a DOM element which serves as target of the event
	 * @param {string | int} sKey The keys name as defined in {@link sap.ui.events.KeyCodes} or its key code
	 * @param {boolean} bShiftKey Indicates whether the shift key is down in addition
	 * @param {boolean} bAltKey Indicates whether the alt key is down in addition
	 * @param {boolean} bCtrlKey Indicates whether the ctrl key is down in addition
	 * @public
	 */
	QUtils.triggerKeyEvent = function(sEventType, oTarget, sKey, bShiftKey, bAltKey, bCtrlKey) {
		var oParams = {};
		var bKeyIsNumber = !isNaN(sKey);
		oParams.keyCode = bKeyIsNumber ? sKey : KeyCodes[sKey];

		// set the "key" property
		if (bKeyIsNumber) {
			// look up number in KeyCodes enum to get the string
			sKey = getKeyCodeStringFromNumber(sKey);
		}

		oParams.key = mapKeyCodeToKey(sKey);
		oParams.location = mapKeyCodeToLocation(sKey);

		oParams.which = oParams.keyCode;
		oParams.shiftKey = bShiftKey;
		oParams.altKey = bAltKey;
		oParams.metaKey = bCtrlKey;
		oParams.ctrlKey = bCtrlKey;
		QUtils.triggerEvent(sEventType, oTarget, oParams);
	};


	/**
	 * Programmatically triggers a 'keydown' event on a specified target.
	 * @see sap.ui.test.qunit.triggerKeyEvent
	 *
	 * @param {string | Element} oTarget The ID of a DOM element or a DOM element which serves as target of the event
	 * @param {string | int} sKey The keys name as defined in {@link sap.ui.events.KeyCodes} or its key code
	 * @param {boolean} bShiftKey Indicates whether the shift key is down in addition
	 * @param {boolean} bAltKey Indicates whether the alt key is down in addition
	 * @param {boolean} bCtrlKey Indicates whether the ctrl key is down in addition
	 * @public
	 */
	QUtils.triggerKeydown = function(oTarget, sKey, bShiftKey, bAltKey, bCtrlKey) {
		QUtils.triggerKeyEvent("keydown", oTarget, sKey, bShiftKey, bAltKey, bCtrlKey);
	};


	/**
	 * Programmatically triggers a 'keyup' event on a specified target.
	 * @see sap.ui.test.qunit.triggerKeyEvent
	 *
	 * @param {string | Element} oTarget The ID of a DOM element or a DOM element which serves as target of the event
	 * @param {string | int} sKey The keys name as defined in {@link sap.ui.events.KeyCodes} or its key code
	 * @param {boolean} bShiftKey Indicates whether the shift key is down in addition
	 * @param {boolean} bAltKey Indicates whether the alt key is down in addition
	 * @param {boolean} bCtrlKey Indicates whether the ctrl key is down in addition
	 * @public
	 */
	QUtils.triggerKeyup = function(oTarget, sKey, bShiftKey, bAltKey, bCtrlKey) {
		QUtils.triggerKeyEvent("keyup", oTarget, sKey, bShiftKey, bAltKey, bCtrlKey);
	};


	/**
	 * @param {object} oTarget
	 * @param {string} sKey
	 * @param {boolean} bShiftKey
	 * @param {boolean} bAltKey
	 * @param {boolean} bCtrlKey
	 * @deprecated Use <code>sap.ui.test.qunit.triggerKeydown</code> instead.
	 * @see sap.ui.test.qunit.triggerKeydown
	 * @public
	 */
	QUtils.triggerKeyboardEvent = function(oTarget, sKey, bShiftKey, bAltKey, bCtrlKey) {
		QUtils.triggerKeydown(oTarget, sKey, bShiftKey, bAltKey, bCtrlKey);
	};


	/**
	 * Programmatically triggers a 'keypress' event on a specified target.
	 * @see sap.ui.test.qunit.triggerEvent
	 *
	 * @param {string | Element} oTarget The ID of a DOM element or a DOM element which serves as target of the event
	 * @param {string} sChar Only the first char of the string will be passed via keypress event
	 * @param {boolean} bShiftKey Indicates whether the shift key is down in addition
	 * @param {boolean} bAltKey Indicates whether the alt key is down in addition
	 * @param {boolean} bCtrlKey Indicates whether the ctrl key is down in addition
	 * @public
	 */
	QUtils.triggerKeypress = function(oTarget, sChar, bShiftKey, bAltKey, bCtrlKey) {
		var _sChar = sChar && sChar.toUpperCase();
		if (KeyCodes[_sChar] === null) {
			QUnit.ok(false, "Invalid character for triggerKeypress: '" + sChar + "'");
		}
		var _iCharCode = sChar.charCodeAt(0);

		var oParams = {};
		oParams.charCode = _iCharCode;
		oParams.which = _iCharCode;
		oParams.key = mapKeyCodeToKey(_sChar);
		oParams.location = mapKeyCodeToLocation(_sChar);
		oParams.shiftKey = !!bShiftKey;
		oParams.altKey = !!bAltKey;
		oParams.metaKey = !!bCtrlKey;
		oParams.ctrlKey = !!bCtrlKey;
		QUtils.triggerEvent("keypress", oTarget, oParams);
	};


	/**
	 * Programmatically triggers a 'keypress' event on a specified input field target and appends the character to the value
	 * of this input field.
	 * @see sap.ui.test.qunit.triggerKeypress
	 *
	 * @param {string | Element} oInput The ID of a DOM input field or a DOM input field which serves as target
	 * @param {string} sChar Only the first char of the string will be passed via keypress event
	 * @param {string} [sValue] If passed, this will be set as the new value of the input and the method will not rely on the old value of the input
	 * @public
	 */
	QUtils.triggerCharacterInput = function(oInput, sChar, sValue) {
		QUtils.triggerKeypress(oInput, sChar);

		if (typeof (oInput) == "string") {
			oInput = oInput ? document.getElementById(oInput) : null;
		}
		var $Input = jQuery(oInput);

		if (typeof sValue !== "undefined") {
			$Input.val(sValue);
		} else {
			$Input.val($Input.val() + sChar);
		}
	};


	/**
	 * Programmatically triggers a mouse event specified by its name on a specified target.
	 * @see sap.ui.test.qunit.triggerEvent
	 *
	 * @param {string | Element} oTarget The ID of a DOM element or a DOM element which serves as target of the event
	 * @param {string} sEventType The name of the browser mouse event (like "click")
	 * @param {int} iOffsetX The offset X position of the mouse pointer during the event
	 * @param {int} iOffsetY The offset Y position of the mouse pointer during the event
	 * @param {int} iPageX The page X position of the mouse pointer during the event
	 * @param {int} iPageY The page Y position of the mouse pointer during the event
	 * @param {int} iButton The button of the mouse during the event (e.g. 0: LEFT, 1: MIDDLE, 2: RIGHT)
	 * @public
	 */
	QUtils.triggerMouseEvent = function(oTarget, sEventType, iOffsetX, iOffsetY, iPageX, iPageY, iButton) {
		var oParams = {};
		oParams.offsetX = iOffsetX;
		oParams.offsetY = iOffsetY;
		oParams.pageX = iPageX;
		oParams.pageY = iPageY;
		oParams.button = iButton;
		QUtils.triggerEvent(sEventType, oTarget, oParams);
	};

	/**
	 * Performs a "SelectAll" also known as CTRL + A on the whole browser window
	 *
	 * @public
	 */
	QUtils.triggerSelectAll = function(){
		document.getSelection().selectAllChildren(document.body);
	};

	/**
	 * Checks if the given <code>sText</code> is equal with the selected text. If no <code>sText</code> is given, its checked if the there is any text selected
	 *
	 * @param {string} [sText] The given text
	 * @returns {boolean} If the selected text is equal with the given <code>sText</code>
	 * @public
	 */
	QUtils.isSelectedTextEqual = function(sText){
		var sSelectedText = QUtils.getSelectedText();
		return sText ? sText === sSelectedText : !!sSelectedText;
	};

	/**
	 * Checks if the given <code>sText</code> is included in the selected text. If no <code>sText</code> is given, its checked if the there is any text selected
	 *
	 * @param {string | string[]} [vText] The given text or an array of string
	 * @returns {boolean} If the selected text contains the given <code>sText</code>
	 * @public
	 */
	QUtils.includesSelectedText = function(vText){
		var sSelectedText = QUtils.getSelectedText();
		if (!vText){
			return !!sSelectedText;
		}
		if (!Array.isArray(vText)){
			vText = [vText];
		}
		return vText.every(function(sText){
			return sSelectedText.indexOf(sText) > -1;
		});
	};

	/**
	 * Determines the selected text, if no text is selected an empty string is returned
	 *
	 * @returns {string} The selected text
	 * @public
	 */
	QUtils.getSelectedText = function(){
		return document.getSelection().toString().replace(/\n/g, "");
	};

	// --------------------------------------------------------------------------------------------------

	var FONT_WEIGHTS = {
		'normal': 400,
		'bold': 700
	};

	jQuery.fn.extend({

		/**
		 * jQuery plugin (function) to retrieve the internal event data even for jQuery >= 1.9
		 *
		 * This is only a HACK and not guaranteed to work with future versions of jQuery.
		 * It is only intended to be used in test cases.
		 *
		 * @see http://jquery.com/upgrade-guide/1.9/#data-events-
		 *
		 * @public
		 * @name jQuery#_sapTest_dataEvents
		 * @deprecated Tests that rely on this function should try to substitute it with other tests
		 */
		_sapTest_dataEvents : function() {
			var elem = this[0];
			return elem ? jQuery._data(elem, "events") : null;
		},

		/**
		 * jQuery plugin (function) that normalizes textual font-weight values to numerical ones.
		 *
		 * Webkit browsers preserve string values and even convert well known numerical values to
		 * string values (e.g. 700 -> bold, 400 -> normal).
		 *
		 * Starting with jQuery 1.10, jQuery normalizes some of these values to a numerical value.
		 *
		 * This method hides all these differences (browser, jQuery version) and returns a numerical value
		 *
		 * @public
		 * @name jQuery#_sapTest_cssFontWeight
		 * @deprecated Tests that rely on this function should try to substitute it with other tests
		 */
		_sapTest_cssFontWeight : function() {
			var v = this.css("font-weight");
			return v ? FONT_WEIGHTS[v] || v : v;
		}
	});


	//************************************
	//TODO: Check JS Doc starting here -> describe and check visibility for stuff in namespace sap.ui.test.qunit


	(function() {

		/*
		 * wrapper around window.console
		 */
		function info(msg) {
			Log.info(msg);
		}

		var M_DEFAULT_TEST_VALUES = {
			"boolean" : [false, true],
			"int" : [0, 1, 5, 10, 100],
			"float" : [NaN, 0.0, 0.01, 3.14, 97.7],
			"string" : ["", "some", "very long otherwise not normal and so on whatever", "<" + "script>alert('XSS attack!');</" + "script>"]
		};

		var mDefaultTestValues = Object.create(M_DEFAULT_TEST_VALUES);

		function ensureArray(o) {
			return o && !(o instanceof Array) ? [o] : o;
		}

		/**
		 * @TODO DESCRIBE AND CHECK VISIBILITY!
		 * @private
		 */
		QUtils.resetDefaultTestValues = function(sType) {
			if ( typeof sType === "string" ) {
				delete mDefaultTestValues[sType];
			} else {
				mDefaultTestValues = Object.create(M_DEFAULT_TEST_VALUES);
			}
		};

		/**
		 * @TODO DESCRIBE AND CHECK VISIBILITY!
		 * @private
		 */
		QUtils.setDefaultTestValues = function(sType, aValues) {
			if ( typeof sType === "string" ) {
				mDefaultTestValues[sType] = ensureArray(aValues);
			} else if ( typeof sType === "object" ) {
				jQuery.extend(mDefaultTestValues, sType);
			}
		};

		/**
		 * @TODO DESCRIBE AND CHECK VISIBILITY!
		 * @private
		 */
		QUtils.createSettingsDomain = function(oClass, oPredefinedValues) {

			function createValues(sType) {
				if ( mDefaultTestValues[sType] ) {
					return mDefaultTestValues[sType];
				}

				try {
					//TODO: global jquery call found
					jQuery.sap.require(sType);
				} catch (e) {
					//escape eslint check for empty block
				}
				var oType = ObjectPath.get(sType);
				if ( !(oType instanceof DataType) ) {
					var r = [];
					for (var n in oType) {
						r.push(oType[n]);
					}
					mDefaultTestValues[sType] = r;
					return r;
				}
				return [];

			}

			var oClass = new oClass().getMetadata().getClass(); // resolves proxy
			var oPredefinedValues = oPredefinedValues || {};
			var result = {};
			var oProps = oClass.getMetadata().getAllProperties();
			for (var name in oProps) {
				result[name] = ensureArray(oPredefinedValues[name]) || createValues(oProps[name].type);
			}
			/*
			var oAggr = oClass.getMetadata().getAllAggregations();
			for (var name in oAggr) {
				if ( oAggr[name].altTypes && oAggr[name].altTypes[0] === 'string' ) {
					result[name] = ensureArray(oPredefinedValues[name]) || createValues(oAggr[name].altTypes[0].type);
				}
			}
			*/
			return result;
		};

		/**
		 * @TODO DESCRIBE AND CHECK VISIBILITY!
		 * @private
		 */
		QUtils.genericTest = function(oClass, sUIArea, oTestConfig) {

			if ( oTestConfig && oTestConfig.skip === true ) {
				return;
			}

			var oClass = new oClass().getMetadata().getClass(); // resolves proxy
			var oTestConfig = oTestConfig || {};
			var oTestValues = QUtils.createSettingsDomain(oClass, oTestConfig.allPairTestValues || {});

			info("domain");
			for (var name in oTestValues) {
				var l = oTestValues[name].length;
				var s = [];
				s.push("  ", name, ":", "[");
				for (var i = 0; i < l; i++) {
					s.push(oTestValues[name][i], ",");
				}
				s.push("]");
				info(s.join(""));
			}

			function method(sPrefix, sName) {
				return sPrefix + sName.substring(0,1).toUpperCase() + sName.substring(1);
			}

			function getActualSettings(oControl, oSettings) {
				var oActualSettings = {};
				for (var settingsName in oSettings) {
					if ( oControl[method("get", settingsName)] ) {
					  oActualSettings[settingsName] = oControl[method("get", settingsName)]();
					}
				}
				return oActualSettings;
			}

			var oControl;
			var oSettings;

			// generate "AllPairs" test cases
			var apg = new QUtils.AllPairsGenerator(oTestValues);
			var aTestCases = [];
			while ( apg.hasNext() ) {
				aTestCases.push(apg.next());
			}

			var index = 0;
			function testNextCombination() {
				info("testNextCombination(" + index + ")");
				if ( index >= aTestCases.length ) {
					// continue with other tests
					info("last combination -> done");
					QUnit.start();
					return;
				}

				// constructor test
				oControl = new oClass(oSettings);
				var oActualSettings = getActualSettings(oControl, oSettings);
				QUnit.deepEqual(oActualSettings, oSettings, "settings");

				/*
				// individual setters
				oControl = new oClass();
				for(var name in oSettings) {
					var r = oControl[method("set", name)](oSettings[name]);
					QUnit.equal(oControl[method("get", name)](), oSettings[name], "setter for property '" + name + "'");
					QUnit.ok(r == oControl, "setter for property '" + name + "' supports chaining");
				}
				*/

				// rendering test
				oControl.placeAt(sUIArea);
				info("before explicit rerender");
				oControl.getUIArea().rerender();
				info("after explicit rerender");

				info("info");
				setTimeout(continueAfterRendering, 0);

			}

			QUnit.stop(15000);
			testNextCombination();

			function continueAfterRendering() {
				info("continueAfterRendering(" + index + ")");
				var oTestSettings = aTestCases[aTestCases.length - index - 1];
				for (var settingsName in oTestSettings) {
					var r = oControl[method("set", settingsName)](oTestSettings[settingsName]);
					QUnit.equal(oControl[method("get", settingsName)](), oTestSettings[settingsName], "setter for property '" + settingsName + "'");
					QUnit.ok(r == oControl, "setter for property '" + settingsName + "' supports chaining (after rendering)");
				}
				index = index + 1;
				setTimeout(testNextCombination, 0);
			}

		};

		/**
		 * @TODO DESCRIBE AND CHECK VISIBILITY!
		 * @private
		 */
		QUtils.suppressErrors = function(bSuppress) {
			//var lastErrorHandler;
			if ( bSuppress !== false ) {
				info("suppress global errors");
				//lastErrorHandler = window.onerror;
	//			window.onerror = function(msg) {
	//				info("global error handler: " + msg);
	//				return true;
	//			};
			} else {
				info("reenable global errors");
	//			window.onerror = lastErrorHandler;
				//lastErrorHandler = undefined;
			}
		};

		/**
		 * @TODO DESCRIBE AND CHECK VISIBILITY!
		 * @private
		 */
		QUtils.RandomPairsGenerator = function(oDomain) {

			var iCombinations = 0;
			for (var name in oDomain) {
				if ( oDomain[name] && !(oDomain[name] instanceof Array) ) {
					oDomain[name] = [ oDomain[name] ];
				}
				if ( oDomain[name] && oDomain[name].length > 0 ) {
					if ( iCombinations == 0 ) {
						iCombinations = oDomain[name].length;
					} else {
						iCombinations = iCombinations * oDomain[name].length;
					}
				}
			}

			function createSettings(iCombination) {
				var oSettings = {};
				for (var domainName in oDomain) {
					var l = oDomain[domainName] && oDomain[domainName].length;
					if ( l == 1 ) {
						oSettings[domainName] = oDomain[domainName][0];
						//info("  " + name + ":" + "0");
					} else if ( l > 1 ) {
						var c = iCombination % l;
						oSettings[domainName] = oDomain[domainName][c];
						iCombination = (iCombination - c) / l;
					}
				}
				return oSettings;
			}

			this.hasNext = function() {
				return true;
			};

			this.next = function() {
				return createSettings(Math.floor(100 * iCombinations * Math.random()));
			};

		};

		/**
		 * @TODO DESCRIBE AND CHECK VISIBILITY!
		 * @private
		 */
		QUtils.AllPairsGenerator = function (oDomain) {

			// more suitable access to the params
			var params = [];
			for (var name in oDomain) {
				params.push({
					name : name,
					n : oDomain[name].length,
					values : oDomain[name]
				});
			}
			var N = params.length;

			/**
			 * Number of occurrences for each possible property value pair.
			 * A value of 0 indicates that there is no test case yet, so the pair must
			 * be incorporated in another test case. A value of 1 is the optimum,
			 * values greater than 1 indicate that the pair has been used (too) often.
			 *
			 * The algorithm of this generator guarantees to create values > 0 for all
			 * pairs but still tries to minimize the values.  It does not guarantee
			 * to find the most optimal solution.
			 *
			 * Let a and b be two different properties from oDomain (e.g. a='text' and b='visible'),
			 * with (WOLG) params.indexOf(a) < params.indexOf(b). Let further a have
			 * n values (== oDomain[a].length) and b have m values (== oDomain[b].length).
			 *
			 * Then the occurrences counters for the n*m possible value combinations
			 * (pairs) of a and b are stored in a contiguous segment of the occurs[] array.
			 *
			 * The segments for all combinations of a and b themselves are ordered
			 * first by a, then by b (same params.indexOf() ordering applies).
			 *
			 * The position of the segment for a given combination (a,b) could be calculated
			 * as the sum of the size of all preceding segments, but this would be too
			 * expensive (access to the occurs[] is used very often and therefore must be efficient).
			 * Therefore, during initialization, the offset for each segment is stored in
			 * an additional array abOffset[]. To further simplify access, that array uses N*N
			 * space, but only the entries params.indexOf(a) * N + params.indexOf(b) (with
			 * params.indexOf(a) < params.indexOf(b)) are filled.
			 */
			var occurs = [];

			/**
			 * Offset for a given combination of properties (a,b) into the occurs[]
			 * array. For a details description see the occurs[] array.
			 */
			var abOffset = [];

			/**
			 * Number of pairs for which occurs[(a,b)] == 0.
			 *
			 * Note: during initialization, this variable also represents the number
			 * of created entries in the occurs[] array. As all entries are created with
			 * a value of 0, the definition above still holds.
			 */
			var nPairs = 0;

			/*
			 * Initialization. Loops over all a,b combinations with (a<b)
			 * and creates the initial occurs[] and abOccurs[] values.
			 */
			for (var a = 0; a < N - 1; a++) {
				var pa = params[a];
				for (var b = a + 1; b < N; b++) {
					var pb = params[b];
					// remember offset into occurs array
					abOffset[a * N + b] = nPairs;
					// set occurrences for all n*m values to 0
					for (var i = pa.n * pb.n; i > 0; i--) {
						occurs[nPairs++] = 0;
					}
				}
			}

			/**
			 * Helper that calculates the offset into the occurs array
			 * for a given combination of a,b and the values of a and b.
			 */
			function offset(a,b,va,vb) {
				return abOffset[a * N + b] + va * params[b].n + vb;
			}

			function findTestCase() {

				var value_index = [];

				/**
				 * Calculates a cost function for the case where for
				 * property 'a' the value 'va' is taken.
				 *
				 * The calculated cost consists of two parts:
				 * - pairs : number of newly addressed unique pairs
				 * - redundant : number of redundantly added pairs
				 *
				 * @param a
				 * @param va
				 * @return
				 */
				function calcCost(a, va) {
					var score = { va: va, pairs:0, redundant:0 };
					for (var c = 0; c < N; c++) {
						var count;
						if ( c < a ) {
							count = occurs[offset(c,a,value_index[c],va)];
						} else if ( c > a ) {
							var j = offset(a,c,va,0),
								end = j + params[c].n;
							for (count = occurs[j]; count > 0 && i < end; j++ ) {
								if ( occurs[j] < count ) {
									count = occurs[j];
								}
							}
						}
						score.redundant = score.redundant + count;
						if ( count == 0 ) {
							score.pairs++;
						}
					}
					return score;
				}

				// loop over all properties and find the "best" value
				for (var d = 0; d < N; d++) {
					var pd = params[d];
					// measure the quality of the first possible value
					var bestCost = calcCost(d, 0);
					for (var va = 1; va < pd.n; va++) {
						// measure the quality of the new combination
						var cost = calcCost(d, va);
						// a new combination is preferred if it either incorporates more unique pairs or if
						// it incorporates the same number of pairs but with less redundant combinations
						if ( cost.pairs > bestCost.pairs || (cost.pairs == bestCost.pairs && cost.redundant < bestCost.redundant) ) {
							bestCost = cost;
						}
					}

					value_index[d] = bestCost.va;
				}

				return value_index;
			}

			/**
			 * Iff there are still unused pairs, then there will be another test case.
			 * @return whether another test cases is needed.
			 * @private
			 */
			this.hasNext = function() {
				return nPairs > 0;
			};

			var lastTest;
			var lastPairs = -1;

			/**
			 *
			 * @return
			 * @private
			 */
			this.next = function() {
				lastTest = findTestCase();
				lastPairs = 0;

				var test = {};
				for (var a = 0; a < N; a++) {
					for (var b = a + 1; b < N; b++) {
						var i = offset(a,b,lastTest[a],lastTest[b]);
						if ( occurs[i] == 0 ) {
							nPairs--;
							lastPairs++;
						}
						occurs[i]++;
					}
					test[params[a].name] = params[a].values[lastTest[a]];
				}

				return test;
			};

			this.lastPairs = function() {
				return lastPairs;
			};
		};

	}());

	// export
	// TODO: Get rid of the old namespace and adapt the existing tests accordingly
	ObjectPath.set("sap.ui.test.qunit", QUtils);
	window.qutils = QUtils;

	return QUtils;

}, /* bExport= */ true);