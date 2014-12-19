/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	/**
	 * YearPicker renderer.
	 * @namespace
	 */
	var YearPickerRenderer = {
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.unified.calendar.YearPicker} oYP an object representation of the control that should be rendered
	 */
	YearPickerRenderer.render = function(oRm, oYP){

		var sTooltip = oYP.getTooltip_AsString();
		var sId = oYP.getId();
		var iCurrentYear = oYP.getYear();

		oRm.write("<div");
		oRm.writeControlData(oYP);
		oRm.addClass("sapUiCalYearPicker");
		oRm.writeClasses();

		if (sTooltip) {
			oRm.writeAttributeEscaped('title', sTooltip);
		}

		oRm.write(">"); // div element

		var iYear = iCurrentYear - 10;

		if (iYear >= 9980) {
			iYear = 9980;
		}else if (iYear < 1) {
			iYear = 1;
		}

		for ( var i = 0; i < 20; i++) {
			oRm.write("<div");
			oRm.writeAttribute("id", sId + "-y" + iYear);
			oRm.addClass("sapUiCalYear");
			if (iYear == iCurrentYear) {
				oRm.addClass("sapUiCalYearSel");
			}
			oRm.writeAttribute("tabindex", "-1");
			oRm.writeClasses();
			oRm.write(">"); // div element
			oRm.write(iYear);
			oRm.write("</div>");
			iYear++;
		}

		oRm.write("</div>");

	};

	return YearPickerRenderer;

}, /* bExport= */ true);
