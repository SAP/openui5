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

	return Matcher.extend("sap.ui.test.matchers._Editable", {
		isMatching: function (oControl) {
			return !oVisitor.isMatching(oControl, function (oControlAncestor) {
				if (!oControlAncestor.getEditable) {
					return false;
				}

				var bEditable = oControlAncestor.getEditable();
				if (!bEditable) {
					if (oControlAncestor === oControl) {
						this._oLogger.debug("Control '" + oControl + "' is not editable");
					} else {
						this._oLogger.debug("Control '" + oControl + "' has a parent '" + oControlAncestor + "' that is not editable");
					}
				}
				return !bEditable;
			}.bind(this));
		}
	});

});
