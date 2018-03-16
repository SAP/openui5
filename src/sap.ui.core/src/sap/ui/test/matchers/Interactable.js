/*!
 * ${copyright}
 */

sap.ui.define([
	'jquery.sap.global',
	'./Matcher',
	'./Visible'
], function ($, Matcher, Visible) {
	"use strict";
	var oVisibleMatcher = new Visible();

	/**
	 * @class
	 * Interactable - check if a control is currently able to take user interactions.
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
	 * Since 1.53 Interactable no longer uses internal autoWait functionality.
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

			// control and its ancestors (including indirect ones) must be enabled and not busy
			if (oControl.getBusy && oControl.getBusy()) {
				this._oLogger.debug("Control '" + oControl + "' is busy");
				return false;
			}

			if (oControl.getEnabled && !oControl.getEnabled()) {
				this._oLogger.debug("Control '" + oControl + "' is not enabled");
				return false;
			}

			var oParent = oControl.getParent();

			while (oParent) {
				if (oParent.getBusy && oParent.getBusy()) {
					this._oLogger.debug("Control '" + oControl + "' has a parent '" + oParent + "' that is busy");
					return false;
				}

				if (oParent.getEnabled && !oParent.getEnabled()) {
					this._oLogger.debug("Control '" + oControl + "' has a parent '" + oParent + "' that is not enabled");
					return false;
				}

				var bParentIsUIArea = oParent.getMetadata().getName() === "sap.ui.core.UIArea";
				if (bParentIsUIArea  && oParent.bNeedsRerendering) {
					this._oLogger.debug("Control '" + oControl + "' is currently in a UIArea that needs a new rendering");
					return false;
				}

				oParent = oParent.getParent();
			}

			var bControlIsInStaticArea = oControl.$().closest("#sap-ui-static").length;
			var bOpenStaticBlockingLayer = $("#sap-ui-blocklayer-popup").is(":visible");
			if (!bControlIsInStaticArea && bOpenStaticBlockingLayer) {
				this._oLogger.debug("The control '" + oControl + "' is hidden behind a blocking popup layer");
				return false;
			}

			return true;
		}
	});

});
