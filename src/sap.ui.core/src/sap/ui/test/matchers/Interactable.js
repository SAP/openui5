/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', './Matcher', './Visible'], function ($, Matcher, Visible) {
	"use strict";
	var oVisibleMatcher = new Visible();

	/**
	 * @class
	 * Interactable - check if a control is currently able to take user interactions.
	 * OPA5 will automatically apply this matcher if you specify actions in {@link sap.ui.test.Opa5#waitFor}.
	 * This matcher will match if none of the following conditions apply to the control:
	 * <ul>
	 *     <li>
	 *         If the control is invisible (using the visible matcher)
	 *     </li>
	 *     <li>
	 *         If the control is hidden behind a dialog
	 *     </li>
	 *     <li>
	 *         If the control is in a navigating nav container
	 *     </li>
	 *     <li>
	 *         If the control or its parents are busy
	 *     </li>
	 *     <li>
	 *         If the UIArea of the control needs new rendering
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
			var bVisible = oVisibleMatcher.isMatching(oControl);

			if (!bVisible) {
				// Control is not visible so there is no need to continue
				return false;
			}

			// Check busy of the control
			if (oControl.getBusy && oControl.getBusy()) {
				$.sap.log.debug("The control " + oControl + " is busy so it is filtered out", this._sLogPrefix);
				return false;
			}

			var oParent = oControl.getParent();
			while (oParent) {
				// Check busy of parents
				if (oParent.getBusy && oParent.getBusy()) {
					$.sap.log.debug("The control " + oControl + " has a parent that is busy " + oParent, this._sLogPrefix);
					return false;
				}

				// Check for navigating nav containers
				var sName = oParent.getMetadata().getName();
				// Split container and splitapp use navcontainers in the control tree
				if ((sName === "sap.m.App" || sName === "sap.m.NavContainer") && oParent._bNavigating) {
					$.sap.log.debug("The control " + oControl + " has a parent NavContainer " + oParent + " that is currently navigating", this._sLogPrefix);
					return false;
				}

				if (sName === "sap.ui.core.UIArea" && oParent.bNeedsRerendering) {
					$.sap.log.debug("The control " + oControl + " is currently in an ui area that needs a new rendering", this._sLogPrefix);
					return false;
				}

				oParent = oParent.getParent();
			}

			// Control is not in the static UI area
			if (oControl.$().closest("#sap-ui-static").length === 0) {
				// Check for blocking layer and if the control is not in the static ui area
				if ($("#sap-ui-blocklayer-popup").is(":visible")) {
					$.sap.log.debug("The control " + oControl + " is hidden behind a blocking layer of a Popup", this._sLogPrefix);
					return false;
				}

				// Whan a Dialog was opened and is in the closing phase the blocklayer is gone already therefore ask the instance manager
				var oInstanceManager = $.sap.getObject("sap.m.InstanceManager");
				if (oInstanceManager && oInstanceManager.getOpenDialogs().length) {
					$.sap.log.debug("The control " + oControl + " is hidden behind an Open dialog", this._sLogPrefix);
					return false;
				}

			}


			return true;
		}
	});

}, /* bExport= */ true);
