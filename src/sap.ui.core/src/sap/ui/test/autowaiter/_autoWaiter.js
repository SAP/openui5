/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/test/_LogCollector",
	"sap/ui/test/_opaCorePlugin",
	"sap/ui/test/autowaiter/_XHRCounter",
	"sap/ui/test/autowaiter/_timeoutCounter"
], function ($, _LogCollector, _opaCorePlugin, _XHRCounter, _timeoutCounter) {
	"use strict";

	var oLogger = $.sap.log.getLogger("sap.ui.test.autowaiter._autoWaiter", _LogCollector.DEFAULT_LEVEL_FOR_OPA_LOGGERS);

	function hasNavigatingNavContainers () {
		var sControlType = "sap.m.NavContainer";
		var fnNavContainer = $.sap.getObject(sControlType);
		// no Nav container has been loaded - continue
		if (sap.ui.lazyRequire._isStub(sControlType) || !fnNavContainer) {
			return false;
		}

		return _opaCorePlugin.getAllControls(fnNavContainer).some(function (oNavContainer) {
			if (oNavContainer._bNavigating) {
				oLogger.debug("The NavContainer " + oNavContainer + " is currently navigating");
			}

			return oNavContainer._bNavigating;
		});
	}

	function hasPendingUIUpdates () {
		var bUIDirty = _opaCorePlugin.isUIDirty();
		if (bUIDirty) {
			oLogger.debug("The UI needs rerendering");
		}
		return bUIDirty;
	}

	return {
		hasToWait: function () {
			return hasNavigatingNavContainers() || _XHRCounter.hasPendingRequests() || hasPendingUIUpdates() || _timeoutCounter.hasPendingTimeouts();
		}
	};
}, true);