/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/Object",
	"jquery.sap.global",
	"sap/ui/test/_OpaLogger"
], function (UI5Object, $, _OpaLogger) {
	"use strict";
	var oSingleton;
	var sModuleName = "sap.ui.test._LogCollector";
	var _oLogger = _OpaLogger.getLogger(sModuleName);

	/**
	 * @class A central place to collect all the logs during an OPA test
	 * listens to $.sap.log.* to collect the logs
	 * collects only OPA component logs
	 *
	 * @private
	 * @alias sap.ui.test._LogCollector
	 * @author SAP SE
	 * @since 1.41
	*/
	var _LogCollector = UI5Object.extend(sModuleName, /** @lends sap.ui.test._LogCollector.prototype */ {
		constructor: function () {
			this._aLogs = [];
			this._oListener = {
				onLogEntry: function (oLogEntry) {
					if (!$.sap.startsWith(oLogEntry.component, "sap.ui.test")) {
						return;
					}
					var sLogText = oLogEntry.message + " - " + oLogEntry.details + " " + oLogEntry.component;
					this._aLogs.push(sLogText);

					// guard against memory leaking - if OPA is required the logCollector will be instantiated.
					if (this._aLogs.length > 500) {
						this._aLogs.length = 0;
						_oLogger.error("Opa has received 500 logs without a consumer - " +
							"maybe you loaded Opa.js inside of an IFrame? " +
							"The logs are now cleared to prevent memory leaking");
					}
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

	return _LogCollector;

}, true);
