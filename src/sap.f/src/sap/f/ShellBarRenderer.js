/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/Renderer'],
function(Renderer) {
	"use strict";

	return {
		render: function (oRm, oControl) {
			var oAcc = oControl._oAcc,
				oRootAttributes = oAcc.getRootAttributes();
			oRm.write("<div");
			oRm.addClass("sapFShellBar");
			if (oControl.getShowNotifications()) {
				oRm.addClass("sapFShellBarNotifications");
			}
			oRm.writeAccessibilityState({
				role: oRootAttributes.role,
				label: oRootAttributes.label
			});
			oRm.writeControlData(oControl);
			oRm.writeClasses();
			oRm.write(">");

			oRm.renderControl(oControl._getOverflowToolbar());

			oRm.write("</div>");
		}
	};

}, /* bExport= */ true);
