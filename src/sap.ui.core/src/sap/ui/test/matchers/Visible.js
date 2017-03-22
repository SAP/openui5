/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './Matcher'], function ($, Matcher) {
	"use strict";

	/**
	 * @class Visible - check if a controls domref is visible
	 * @private
	 * @extends sap.ui.test.matchers.Matcher
	 * @name sap.ui.test.matchers.Visible
	 * @author SAP SE
	 * @since 1.34
	 */
	return Matcher.extend("sap.ui.test.matchers.Visible", /** @lends sap.ui.test.matchers.Visible.prototype */ {
		isMatching:  function(oControl) {
			if (!oControl.getDomRef()) {
				this._oLogger.debug("The control " + oControl + " is not rendered");
				return false;
			}

			var bVisible = oControl.$().is(":visible");
			if (!bVisible) {
				this._oLogger.debug("The control " + oControl + " is not visible");
			}

			return bVisible;
		}
	});

}, /* bExport= */ true);
