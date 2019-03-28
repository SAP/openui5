/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/Renderer'],
function(Renderer) {
	"use strict";

	return {
		render: function (oRm, oControl) {
			var oAcc = oControl._oAcc,
				oRootAttributes = oAcc.getRootAttributes(),
				sTitle = oControl.getTitle();

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

			if (sTitle) {
				oRm.write('<div id="' + oControl.getId() + '-titleHidden" role="heading" aria-level="1" class="sapFShellBarTitleHidden">');
				oRm.writeEscaped(sTitle);
				oRm.write('</div>');
			}

			oRm.renderControl(oControl._getOverflowToolbar());

			oRm.write("</div>");
		}
	};

}, /* bExport= */ true);
