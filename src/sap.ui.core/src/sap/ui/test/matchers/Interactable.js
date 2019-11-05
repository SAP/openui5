/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/test/matchers/Matcher',
	'sap/ui/test/matchers/Visible',
	'sap/ui/test/matchers/_Busy',
	'sap/ui/test/matchers/_Visitor'
], function(Matcher, Visible, _Busy, _Visitor) {
	"use strict";

	var oVisibleMatcher = new Visible();
	var oBusyMatcher = new _Busy();
	var oVisitor = new _Visitor();

	/**
	 * @class
	 * Checks if a control is currently able to take user interactions.
	 * OPA5 will automatically apply this matcher if you specify actions in {@link sap.ui.test.Opa5#waitFor}.
	 * A control will be filtered out by this matcher when:
	 * <ul>
	 *     <li>
	 *         The control is invisible (using the visible matcher)
	 *     </li>
	 *     <li>
	 *         The control or its parents are busy
	 *     </li>
	 *     <li>
	 *         The control or its parents are not enabled
	 *     </li>
	 *     <li>
	 *         The control is hidden behind a dialog
	 *     </li>
	 *		<li>
	 *         The UIArea of the control needs new rendering
	 *     </li>
	 * </ul>
	 * Since 1.53, Interactable no longer uses internal autoWait functionality.
	 * Interactable matcher might be made private in the near future.
	 * It is recommended to enable autoWait OPA option instead of using the Interactable matcher directly.
	 * @public
	 * @extends sap.ui.test.matchers.Matcher
	 * @name sap.ui.test.matchers.Interactable
	 * @author SAP SE
	 * @since 1.34
	 */
	return Matcher.extend("sap.ui.test.matchers.Interactable", {
		isMatching:  function(oControl) {
			// control must be visible
			if (!oVisibleMatcher.isMatching(oControl)) {
				return false;
			}

			// control and ancestors should not be busy
			if (oBusyMatcher.isMatching(oControl)) {
				return false;
			}

			var bInAreaForRerendering = oVisitor.isMatching(oControl, function (oControl) {
				return oControl.getMetadata().getName() === "sap.ui.core.UIArea"  && oControl.bNeedsRerendering;
			});

			if (bInAreaForRerendering) {
				this._oLogger.debug("Control '" + oControl + "' is currently in a UIArea that needs a new rendering");
				return false;
			}

			var oAppWindowJQuery = this._getApplicationWindow().jQuery;
			var bControlIsInStaticArea = oControl.$().closest("#sap-ui-static").length;
			var bOpenStaticBlockingLayer = oAppWindowJQuery("#sap-ui-blocklayer-popup").is(":visible");
			if (!bControlIsInStaticArea && bOpenStaticBlockingLayer) {
				this._oLogger.debug("The control '" + oControl + "' is hidden behind a blocking popup layer");
				return false;
			}

			// control is interactable
			return true;
		}
	});

});