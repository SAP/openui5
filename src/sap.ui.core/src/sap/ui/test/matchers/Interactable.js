/*!
 * ${copyright}
 */

sap.ui.define([
	'jquery.sap.global',
	'./Matcher',
	'./Visible',
	'sap/ui/test/launchers/iFrameLauncher'
], function ($, Matcher, Visible, iFrameLauncher) {
	"use strict";
	var oVisibleMatcher = new Visible();

	/**
	 * @class
	 * Interactable - check if a control is currently able to take user interactions.
	 * OPA5 will automatically apply this matcher if you specify actions in {@link sap.ui.test.Opa5#waitFor}.
	 * A control will be filtered out by this matcher when:
	 * <ul>
	 *     <li>
	 *         There are unfinished XMLHttpRequests (globally).
	 *         That means, the Opa can wait for pending requests to finish that would probably update the UI.
	 *         Also detects sinon.FakeXMLHttpRequests that are not responded yet.
	 *     </li>
	 *     <li>
	 *         The control is invisible (using the visible matcher)
	 *     </li>
	 *     <li>
	 *         The control is hidden behind a dialog
	 *     </li>
	 *     <li>
	 *         The control is in a navigating nav container
	 *     </li>
	 *     <li>
	 *         The control or its parents are busy
	 *     </li>
	 *     <li>
	 *         The control or its parents are not enabled
	 *     </li>
	 *     <li>
	 *         The UIArea of the control needs new rendering
	 *     </li>
	 * </ul>
	 * @public
	 * @extends sap.ui.test.matchers.Matcher
	 * @name sap.ui.test.matchers.Interactable
	 * @author SAP SE
	 * @since 1.34
	 */
	return Matcher.extend("sap.ui.test.matchers.Interactable", {
		isMatching:  function(oControl) {
			var bHasToWait = iFrameLauncher._getAutoWaiter().hasToWait();
			if (bHasToWait) {
				// There are open requests - _XHRWaiter will log if there are open XHRs
				return false;
			}

			var bVisible = oVisibleMatcher.isMatching(oControl);

			if (!bVisible) {
				// Control is not visible so there is no need to continue
				return false;
			}

			// Check busy of the control
			if (oControl.getBusy && oControl.getBusy()) {
				this._oLogger.debug("The control " + oControl + " is busy so it is filtered out");
				return false;
			}

			if (oControl.getEnabled && !oControl.getEnabled()) {
				this._oLogger.debug("The control '" + oControl + "' is not enabled");
				return false;
			}

			var oParent = oControl.getParent();
			while (oParent) {
				// Check busy of parents
				if (oParent.getBusy && oParent.getBusy()) {
					this._oLogger.debug("The control " + oControl + " has a parent that is busy " + oParent);
					return false;
				}

				if (oParent.getEnabled && !oParent.getEnabled()) {
					this._oLogger.debug("The control '" + oControl + "' has a parent '" + oParent + "' that is not enabled");
					return false;
				}

				// Check for rendering updates
				var sName = oParent.getMetadata().getName();
				if (sName === "sap.ui.core.UIArea" && oParent.bNeedsRerendering) {
					this._oLogger.debug("The control " + oControl + " is currently in a UIArea that needs a new rendering");
					return false;
				}

				oParent = oParent.getParent();
			}

			// Control is not in the static UI area
			if (oControl.$().closest("#sap-ui-static").length === 0) {
				// Check for blocking layer and if the control is not in the static ui area
				if ($("#sap-ui-blocklayer-popup").is(":visible")) {
					this._oLogger.debug("The control " + oControl + " is hidden behind a blocking layer of a Popup");
					return false;
				}
			}


			return true;
		}
	});

});
