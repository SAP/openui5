/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/test/_OpaLogger"
], function(Element, _OpaLogger) {
	"use strict";

	var oHasPendingLogger = _OpaLogger.getLogger("sap.ui.test.autowaiter._navigationContainerWaiter#hasPending");

	function hasNavigatingNavContainers () {

		var fnNavContainer = sap.ui.require("sap/m/NavContainer");
		// no Nav container has been loaded - continue
		if (!fnNavContainer) {
			return false;
		}
		// instanceof filter
		function isNavContainer(oControl) {
			return oControl instanceof fnNavContainer;
		}

		return Element.registry.filter(isNavContainer).some(function (oNavContainer) {
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
