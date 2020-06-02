/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/test/matchers/Matcher'], function (Matcher) {
	"use strict";

	/**
	 * @class Checks if a controls domref is visible.
	 * @private
	 * @extends sap.ui.test.matchers.Matcher
	 * @name sap.ui.test.matchers.Visible
	 * @author SAP SE
	 * @since 1.34
	 */
	return Matcher.extend("sap.ui.test.matchers.Visible", /** @lends sap.ui.test.matchers.Visible.prototype */ {
		isMatching: function (oControl) {
			var oDomRef = oControl.$();
			var bVisible = false;

			if (oDomRef.length) {
				if (oDomRef.is(":hidden") || oDomRef.css("visibility") === "hidden") {
					this._oLogger.debug("Control '" + oControl + "' is not visible");
				} else {
					bVisible = true;
				}
			} else {
				this._oLogger.debug("Control '" + oControl + "'' is not rendered");
			}

			return bVisible;
		}
	});

});
