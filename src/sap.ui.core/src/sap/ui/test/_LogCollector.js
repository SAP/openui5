/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/test/_OpaLogger",
	"sap/base/Log"
], function (UI5Object, _OpaLogger, Log) {
	"use strict";

	var mInstances = {};
	var _oLogger = _OpaLogger.getLogger("sap.ui.test._LogCollector");

	/**
	 * A central place to collect logs during the execution of a task
	 * Listens to sap/base/Log.* to collect the logs
	 * Only collects logs from loggers with a certain component name
	 * By default only logs from components in sap.ui.test are collected - this can be used to collect all the logs during an OPA test
	 * You always need to start the collector to control when to actually collect logs
	 *
	 * @class
	 * @private
	 * @alias sap.ui.test._LogCollector
	 * @author SAP SE
	 * @since 1.41
	*/
	var _LogCollector = UI5Object.extend("sap.ui.test._LogCollector", {
		constructor: function (sMessagePattern) {
			this._aLogs = [];
			if (sMessagePattern) {
				this._oListener = getCustomListener(sMessagePattern, this._aLogs);
			} else {
				this._oListener = getOPAListener(this._aLogs);
			}
		},
		start: function () {
			Log.addLogListener(this._oListener);
		},
		getAndClearLog: function () {
			var sJoined = this._aLogs.join("\n");
			this._aLogs.length = 0;
			return sJoined;
		},
		stop: function () {
			Log.removeLogListener(this._oListener);
		},
		destroy: function () {
			this._aLogs.length = 0;
			this.stop();
		}
	});

	_LogCollector.getInstance = function (sMessagePattern) {
		var sLogCollector = sMessagePattern || "noMessagePattern";
		mInstances[sLogCollector] = mInstances[sLogCollector] || new _LogCollector(sMessagePattern);

		return mInstances[sLogCollector];
	};

	function getCustomListener(sMessagePattern, aLogs) {
		return {
			onLogEntry: function (oLogEntry) {
				var oRegExp = new RegExp(sMessagePattern);
				if (isOPALog(oLogEntry) && oRegExp.test(oLogEntry.component)) {
					aLogs.push(getLogText(oLogEntry));
				}
			}
		};
	}

	function getOPAListener(aLogs) {
		return {
			onLogEntry: function (oLogEntry) {
				if (isOPALog(oLogEntry)) {
					aLogs.push(getLogText(oLogEntry));

					// guard against memory leaking - if OPA is required the logCollector will be instantiated.
					if (aLogs.length > 500) {
						aLogs.length = 0;
						_oLogger.error("Opa has received 500 logs without a consumer - " +
							"maybe you loaded Opa.js inside of an IFrame? " +
							"The logs are now cleared to prevent memory leaking");
					}
				}
			}
		};
	}

	function getLogText(oLogEntry) {
		return oLogEntry.message + " - " + oLogEntry.details + " " + oLogEntry.component;
	}

	function isOPALog(oLogEntry) {
		return oLogEntry.component.startsWith("sap.ui.test");
	}

	return _LogCollector;

}, true);