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

	return Matcher.extend("sap.ui.test.matchers._Busy", {
		isMatching: function (oControl) {
			var bResult = oVisitor.isMatching(oControl, function (oControlAncestor) {
				var bIsBusy = oControlAncestor.getBusy && oControlAncestor.getBusy();
				if (bIsBusy) {
					if (oControlAncestor === oControl) {
						this._oLogger.debug("Control '" + oControl + "' is busy");
					} else {
						this._oLogger.debug("Control '" + oControl + "' has a parent '" + oControlAncestor + "' that is busy");
					}
				}
				return bIsBusy;
			}.bind(this));

			return bResult;
		}
	});

});
