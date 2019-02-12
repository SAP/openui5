/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/Renderer'],
function(Renderer) {
	"use strict";

	return {
		render: function (oRm, oControl) {

			oRm.write("<div");
			oRm.addClass("sapFShellBar");
			oRm.writeControlData(oControl);
			oRm.writeClasses();
			oRm.write(">");

			oRm.renderControl(oControl._getOverflowToolbar());

			oRm.write("</div>");
		}
	};

}, /* bExport= */ true);
