/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/_OpaLogger",
	"sap/ui/test/_opaCorePlugin",
	"sap/base/util/ObjectPath"
], function (_OpaLogger, _opaCorePlugin, ObjectPath) {
	"use strict";

	var oHasPendingLogger = _OpaLogger.getLogger("sap.ui.test.autowaiter._navigationContainerWaiter#hasPending");

	function hasNavigatingNavContainers () {
		var sControlType = "sap.m.NavContainer";
		var fnNavContainer = ObjectPath.get(sControlType);
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