/*!
 * ${copyright}
 */

sap.ui.define(["jquery.sap.global", "sap/ui/test/_LogCollector"], function ($, _LogCollector) {
	"use strict";
	var oLogger = $.sap.log.getLogger("sap.ui.test.matchers.Ancestor", _LogCollector.DEFAULT_LEVEL_FOR_OPA_LOGGERS);

	/**
	 * @class Ancestor - checks if a control has a defined ancestor
	 * @param {object} oAncestorControl the ancestor control to check, if undefined, validates every control to true
	 * @param {boolean} [bDirect] specifies if the ancestor should be a direct ancestor (parent)
	 * @public
	 * @name sap.ui.test.matchers.Ancestor
	 * @author SAP SE
	 * @since 1.27
	 */

	return function (oAncestorControl, bDirect) {
		return function (oControl) {
			if (!oAncestorControl) {
				oLogger.debug("No ancestor was defined so no controls will be filtered.");
				return true;
			}

			var oParent = oControl.getParent();

			while (!bDirect && oParent && oParent !== oAncestorControl) {
				oParent = oParent.getParent();
			}

			var bResult = oParent === oAncestorControl;
			if (!bResult) {
				oLogger.debug("Control '" + oControl + "' does not have " + (bDirect ? "direct " : "") + "ancestor '" + oAncestorControl);
			}
			return bResult;
		};
	};

}, /* bExport= */ true);
