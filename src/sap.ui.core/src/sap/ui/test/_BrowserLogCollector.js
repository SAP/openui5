/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/isEmptyObject",
	"sap/ui/base/Object"
], function (isEmptyObject, UI5Object) {
	"use strict";

	var MAX_COUNT = 500;
	// sorted by severity
	var LEVELS = [{
		name: 'trace',
		methods: ['trace']
	}, {
		name: 'debug',
		methods: ['debug']
	}, {
		name: 'info',
		methods: ['log', 'info', 'warn']
	}, {
		name: 'error',
		methods: ['error']
	}];

	var oInstance;

	var _BrowserLogCollector = UI5Object.extend("sap.ui.test._BrowserLogCollector", {
		constructor: function () {
			UI5Object.call(this);
			this._console = {};
			this._logs = [];
		},

		start: function (sLevel, iMaxCount) {
			if (!isEmptyObject(this._console)) {
				throw new Error("_BrowserLogCollector: 'start' has already been called. Call 'stop' before re-starting the _BrowserLogCollector instance.");
			}

			iMaxCount = iMaxCount || MAX_COUNT;
			sLevel = sLevel && sLevel.trim().toLowerCase() || "error";
			var bLevelMatched = false;
			var that = this;

			var aSelectedLevels = LEVELS.filter(function (mLevel) {
				// levels array is already sorted by severity
				bLevelMatched = bLevelMatched || mLevel.name === sLevel;
				return bLevelMatched;
			});

			if (!aSelectedLevels.length) {
				throw new Error("_BrowserLogCollector: log level '" + sLevel + "' is not known.");
			}

			aSelectedLevels.forEach(function (mLevel) {
				var oConsole = getConsole();

				mLevel.methods.filter(function (sMethod) {
					// some methods may not be available on the console
					return oConsole[sMethod];
				}).forEach(function (sMethod) {
					that._console[sMethod] = oConsole[sMethod];

					oConsole[sMethod] = function () {
						var mNewLog = {
							level: mLevel.name,
							message: getConsoleMessage(Array.prototype.slice.call(arguments))
						};
						if (that._logs.length < iMaxCount) {
							that._logs.unshift(mNewLog);
						} else {
							// circle buffer
							that._logs.unshift(mNewLog);
							that._logs.pop();
						}

						// call browser method
						that._console[sMethod].apply(this, arguments);
					};
				});
			});
		},

		getAndClearLogs: function (iLocalStoreIndex) {
			return {
				logs: this._logs.splice(0, this._logs.length)
			};
		},

		// should call when collection is no longer needed
		stop: function () {
			this._stopAndClearLogs();
		},

		destroy: function () {
			this._stopAndClearLogs();
		},

		_stopAndClearLogs: function () {
			var oConsole = getConsole();

			for (var sMethod in this._console) {
				if (oConsole[sMethod]) {
					oConsole[sMethod] = this._console[sMethod];
				}
			}

			// clear to enable future _BrowserLogCollector.start
			this._console = {};
			this._logs = [];
		}
	});

	_BrowserLogCollector.getInstance = function () {
		oInstance = oInstance || new _BrowserLogCollector();
		return oInstance;
	};

	_BrowserLogCollector._MAX_COUNT = MAX_COUNT;
	_BrowserLogCollector._LEVELS = LEVELS;

	function getConsole() {
		// in IE and Edge, logging is only enabled when devtools are open
		// console.log is a different function when dev tools are open (__BROWSERTOOLS_CONSOLE_SAFEFUNC vs log() { [native code] })
		// hijack the prototype's function to make sure we capture logs with closed devtools
		return Object.getPrototypeOf(console).log ? Object.getPrototypeOf(console) : console;
	}

	function getConsoleMessage(aArgs) {
		var sMessage;
		var oSubstituteRegexp = new RegExp("%(o|O|d|i|s|f)", "g");

		if (aArgs[0].match(oSubstituteRegexp)) {
			var iReplaceIndex = 0;
			sMessage = aArgs[0].replace(oSubstituteRegexp, function (sMatch) {
				// eslint-disable-next-line no-return-assign
				return aArgs.length > iReplaceIndex ? aArgs[iReplaceIndex += 1] : sMatch;
			});
		} else if (aArgs.length > 1) {
			sMessage = aArgs.join(" ");
		} else {
			sMessage = aArgs[0];
		}

		return sMessage;
	}

	return _BrowserLogCollector;

});
