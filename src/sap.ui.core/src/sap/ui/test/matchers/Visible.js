/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './Matcher'], function ($, Matcher) {
	"use strict";

	/**
	 * @class Visible - check if a controls domref is visible
	 * @private
	 * @extends sap.ui.test.matchers.Matcher
	 * @alias sap.ui.test.matchers.Visible
	 * @author SAP SE
	 * @since 1.34
	 */
	return Matcher.extend("sap.ui.test.matchers.Visible", {
		isMatching:  function(oControl) {
			if (!oControl.getDomRef()) {
				$.sap.log.debug("The control " + oControl + " is not rendered", this);
				return false;
			}

			var bVisible = oControl.$().is(":visible");
			if (!bVisible) {
				$.sap.log.debug("The control " + oControl + " is not visible", this);
			}

			return bVisible;
		}
	});

}, /* bExport= */ true);
