/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global",
	"sap/ui/test/_OpaLogger",
	"sap/ui/test/_opaCorePlugin"
], function ($, _OpaLogger, _opaCorePlugin) {
	"use strict";

	var oHasPendingLogger = _OpaLogger.getLogger("sap.ui.test.autowaiter._navigationContainerWaiter#hasPending");

	function hasNavigatingNavContainers () {
		var sControlType = "sap.m.NavContainer";
		var fnNavContainer = $.sap.getObject(sControlType);
		// no Nav container has been loaded - continue
		if (sap.ui.lazyRequire._isStub(sControlType) || !fnNavContainer) {
			return false;
		}

		return _opaCorePlugin.getAllControls(fnNavContainer).some(function (oNavContainer) {
			if (oNavContainer._bNavigating) {
				oHasPendingLogger.debug("The NavContainer " + oNavContainer + " is currently navigating");
			}

			return oNavContainer._bNavigating;
		});
	}

	return {
		hasPending: hasNavigatingNavContainers
	};
});
