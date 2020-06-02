/*!
 * ${copyright}
 */

// private
sap.ui.define([
	'sap/ui/test/matchers/Matcher',
	'sap/ui/test/matchers/_Visitor'
], function (Matcher, _Visitor) {
	"use strict";

	var oVisitor = new _Visitor();

	return Matcher.extend("sap.ui.test.matchers._Enabled", {
		isMatching: function (oControl) {
			var bDisabled = oVisitor.isMatching(oControl, function (oControlAncestor) {
				if (!oControlAncestor.getEnabled) {
					return false;
				}

				var bDisabled = !oControlAncestor.getEnabled();
				if (bDisabled) {
					if (oControlAncestor === oControl) {
						this._oLogger.debug("Control '" + oControl + "' is not enabled");
					} else {
						this._oLogger.debug("Control '" + oControl + "' has a parent '" + oControlAncestor + "' that is not enabled");
					}
				}
				return bDisabled;
			}.bind(this));

			return !bDisabled;
		}
	});

});
