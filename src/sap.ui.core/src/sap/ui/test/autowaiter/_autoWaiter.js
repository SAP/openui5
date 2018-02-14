/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/test/_OpaLogger",
	"sap/ui/test/autowaiter/_XHRWaiter",
	"sap/ui/test/autowaiter/_timeoutWaiter",
	"sap/ui/test/autowaiter/_promiseWaiter",
	"sap/ui/test/autowaiter/_navigationContainerWaiter",
	"sap/ui/test/autowaiter/_UIUpdatesWaiter"
], function ($,_OpaLogger,_XHRWaiter, _timeoutWaiter, _promiseWaiter, _navigationContainerWaiter, _UIUpdatesWaiter) {
	"use strict";

	var oLogger = _OpaLogger.getLogger("sap.ui.test.autowaiter._autoWaiter");

	// TODO: add possibility to add and exclude validators
	// execute wait helpers in sequence and stop on the first that returns true
	// eg: there's no use to call _timeoutWaiter if _UIUpdatesWaiter is true
	var aWaiters = [_navigationContainerWaiter, _UIUpdatesWaiter, _XHRWaiter, _promiseWaiter, _timeoutWaiter];

	return {
		hasToWait: function () {
			var result = false;
			aWaiters.forEach(function (oWaiter) {
				if (!result && oWaiter.hasPending()) {
					result = true;
				}
			});
			if (!result) {
				oLogger.timestamp("opa.autoWaiter.syncPoint");
				oLogger.debug("AutoWaiter syncpoint");
			}
			return result;
		},
		extendConfig: function (oConfig) {
			aWaiters.forEach(function (oWaiter) {
				if (oWaiter.extendConfig) {
					oWaiter.extendConfig(oConfig);
				}
			});
		}
	};
}, true);
