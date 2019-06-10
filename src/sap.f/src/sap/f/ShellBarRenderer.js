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
				bRenderHiddenTitle = sTitle && !oControl.getShowMenuButton();

			oRm.openStart("div", oControl);
			oRm.class("sapFShellBar");
			if (oControl.getShowNotifications()) {
				oRm.class("sapFShellBarNotifications");
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

			oRm.renderControl(oControl._getOverflowToolbar());

			oRm.close("div");
		},
		shouldAddIBarContext: function () {
			return false;
		}
	};

}, /* bExport= */ true);
