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
				sTitle = oControl.getTitle(),
				bRenderHiddenTitle = sTitle && !oControl.getShowMenuButton();

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

			if (bRenderHiddenTitle) {
				oRm.write('<div id="' + oControl.getId() + '-titleHidden" role="heading" aria-level="1" class="sapFShellBarTitleHidden">');
				oRm.writeEscaped(sTitle);
				oRm.write('</div>');
			}

			oRm.renderControl(oControl._getOverflowToolbar());

			oRm.write("</div>");
		},
		shouldAddIBarContext: function () {
			return false;
		}
	};

}, /* bExport= */ true);
