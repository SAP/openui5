/*!
 * ${copyright}
 */

sap.ui.define([], function () {
	"use strict";

	function matchControls(oParent, aAncestor) {
		var bMatchById = typeof aAncestor === "string";
		return bMatchById ? (oParent && oParent.getId()) === aAncestor : oParent === aAncestor;
	}

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
				return true;
			}

			var oParent = oControl.getParent();

			while (!bDirect && oParent && !matchControls(oParent, aAncestorControl)) {
				oParent = oParent.getParent();
			}

			return matchControls(oParent, aAncestorControl);
		};
	};

}, /* bExport= */ true);
