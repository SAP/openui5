/*!
 * ${copyright}
 */

sap.ui.define([],
function() {
	"use strict";

	return {

		apiVersion: 2,

		render: function (oRm, oControl) {
			var oAcc = oControl._oAcc,
				oRootAttributes = oAcc.getRootAttributes(),
				sTitle = oControl.getTitle(),
				oAvatar = oControl.getProfile(),
				bRenderHiddenTitle = sTitle && !oControl.getShowMenuButton();

			oRm.openStart("div", oControl);
			oRm.class("sapFShellBar");
			if (oControl.getShowNotifications()) {
				oRm.class("sapFShellBarNotifications");
			}
			if (oControl.getShowCopilot()) {
				oRm.class("sapFShellBarCopilot");
			}
			oRm.accessibilityState({
				role: oRootAttributes.role,
				label: oRootAttributes.label
			});

			oRm.openEnd();

			if (bRenderHiddenTitle) {
				oRm.openStart("div", oControl.getId() + "-titleHidden")
					.class("sapFShellBarTitleHidden")
					.attr("role", "heading")
					.attr("aria-level", "1")
					.openEnd();

				oRm.text(sTitle).close("div");
			}
			if (oControl._aLeftControls && oControl._aLeftControls.length) {
				oRm.openStart("div")
					.class("sapFShellBarOLHB")
					.openEnd();
				oControl._aLeftControls.forEach(oRm.renderControl, oRm);

				oRm.close("div");

			}
			if (oControl._oCopilot) {
				oRm.renderControl(oControl._oCopilot);
			}

			if (oControl._aRightControls && oControl._aRightControls.length) {
				oRm.openStart("div")
					.class("sapFShellBarORHB")
					.openEnd();

				oControl._aRightControls.forEach(oRm.renderControl, oRm);

				oRm.close("div");
			}

			if (oAvatar) {
				oRm.renderControl(oAvatar);
			}
			if (oControl._oProductSwitcher) {
				oRm.renderControl(oControl._oProductSwitcher);
			}
			oRm.close("div");
		},
		shouldAddIBarContext: function () {
			return false;
		}
	};

}, /* bExport= */ true);
