/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/_LogCollector",
	"sap/base/Log",
	"sap/ui/test/matchers/_Visitor"
], function (_LogCollector, Log, _Visitor) {
	"use strict";
	var oLogger = Log.getLogger("sap.ui.test.matchers.Ancestor");
	var oVisitor = new _Visitor();

	/**
	 * @class Ancestor - checks if a control has a defined ancestor
	 * @param {object|string} vAncestor the ancestor control to check, if undefined, validates every control to true. Can be a control or a control ID
	 * @param {boolean} [bDirect] specifies if the ancestor should be a direct ancestor (parent)
	 * @public
	 * @name sap.ui.test.matchers.Ancestor
	 * @author SAP SE
	 * @since 1.27
	 */

	return function (vAncestor, bDirect) {
		return function (oControl) {
			if (!vAncestor) {
				oLogger.debug("No ancestor was defined so no controls will be filtered.");
				return true;
			}

			var bResult = oVisitor.isMatching(oControl, function (oControlAncestor) {
				if (oControlAncestor === oControl) {
					return false;
				}
				if (typeof vAncestor === "string") {
					return oControlAncestor && oControlAncestor.getId() === vAncestor;
				 }
				 return oControlAncestor === vAncestor;
			}, bDirect);

			oLogger.debug("Control '" + oControl + (bResult ? "' has " : "' does not have ") +
				(bDirect ? "direct " : "") + "ancestor '" + vAncestor);

			return bResult;
		};
	};

}, /* bExport= */ true);
