/*!
 * ${copyright}
 */

sap.ui.define(["jquery.sap.global", "sap/ui/test/_LogCollector"], function ($, _LogCollector) {
	"use strict";
	var oLogger = $.sap.log.getLogger("sap.ui.test.matchers.Ancestor", _LogCollector.DEFAULT_LEVEL_FOR_OPA_LOGGERS);

	function matchControls(oParent, aAncestor) {
		var bMatchById = typeof aAncestor === "string";
		return bMatchById ? (oParent && oParent.getId()) === aAncestor : oParent === aAncestor;
	}

	/**
	 * @class Ancestor - checks if a control has a defined ancestor
	 * @param {object|string} oAncestorControl the ancestor control to check, if undefined, validates every control to true. Can be a control or a control ID
	 * @param {boolean} [bDirect] specifies if the ancestor should be a direct ancestor (parent)
	 * @public
	 * @name sap.ui.test.matchers.Ancestor
	 * @author SAP SE
	 * @since 1.27
	 */

	return function (aAncestorControl, bDirect) {
		return function (oControl) {
			if (!aAncestorControl) {
				oLogger.debug("No ancestor was defined so no controls will be filtered.");
				return true;
			}

			var oParent = oControl.getParent();

			while (!bDirect && oParent && !matchControls(oParent, aAncestorControl)) {
				oParent = oParent.getParent();
			}

			var bResult = matchControls(oParent, aAncestorControl);
			if (!bResult) {
				oLogger.debug("Control '" + oControl + "' does not have " + (bDirect ? "direct " : "") + "ancestor '" + aAncestorControl);
			}
			return bResult;
		};
	};

}, /* bExport= */ true);
