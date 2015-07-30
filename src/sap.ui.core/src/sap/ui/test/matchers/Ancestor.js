/*!
 * @copyright@
 */

sap.ui.define([], function () {

	/**
	 * @class Ancestor - checks if a control has a defined ancestor
	 * @param {object} oAncestorControl the ancestor control to check, if undefined, validates every control to true
	 * @param {boolean} [bDirect] specifies if the ancestor should be a direct ancestor (parent)
	 * @public
	 * @alias sap.ui.test.matchers.Ancestor
	 * @author SAP SE
	 * @since 1.27
	 */
	return function(oAncestorControl, bDirect) {
		return function (oControl) {
			if (!oAncestorControl) {
				return true;
			}

			var oParent = oControl.getParent();

			while (!bDirect && oParent && oParent !== oAncestorControl) {
				oParent = oParent.getParent();
			}

			return oParent === oAncestorControl;
		};
	};

}, /* bExport= */ true);