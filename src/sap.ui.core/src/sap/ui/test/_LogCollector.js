/*!
 * ${copyright}
 */
sap.ui.define(["sap/ui/base/Object", "jquery.sap.global"], function (UI5Object, $) {
	"use strict";
	var oSingleton;
	/**
	* @class A central place to collect all the logs during an OPA test
	 * listens to $.sap.log.* to collect the logs
	 *
	 * @private
	 * @alias sap.ui.test.OpaPlugin
	 * @author SAP SE
	 * @since 1.41
	*/
	var _LogCollector = UI5Object.extend("sap.ui.test._LogCollector", /** @lends sap.ui.test._LogCollector.prototype */ {
		constructor: function () {
			this._aLogs = [];
			this._oListener = {
				onLogEntry: function (oLogEntry) {
					if (!$.sap.startsWith(oLogEntry.component, "sap.ui.test")) {
						return;
					}
					var sLogText = oLogEntry.message + " - " + oLogEntry.details + " " + oLogEntry.component;
					this._aLogs.push(sLogText);
				}.bind(this)
			};
			$.sap.log.addLogListener(this._oListener);
		},
		getAndClearLog: function () {
			var sJoined = this._aLogs.join("\n");
			this._aLogs.length = 0;
			return sJoined;
		},
		destroy: function () {
			this._aLogs.length = 0;
			$.sap.log.removeLogListener(this._oListener);
		}
	});

	_LogCollector.getInstance = function () {
		if (!oSingleton) {
			oSingleton = new _LogCollector();
		}

		return oSingleton;
	};

	// Even if you set the log level of the UI5 core to Error opa will log everything down to the debug level
	// and it will be collected by instances of the LogCollector.
	_LogCollector.DEFAULT_LEVEL_FOR_OPA_LOGGERS = $.sap.log.Level.DEBUG;

	return _LogCollector;
}, true /* export */);