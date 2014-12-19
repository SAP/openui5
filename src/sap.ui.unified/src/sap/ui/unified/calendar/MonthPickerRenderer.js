/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	/**
	 * MonthPicker renderer.
	 * @namespace
	 */
	var MonthPickerRenderer = {
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.unified.calendar.MonthPicker} oMP an object representation of the control that should be rendered
	 */
	MonthPickerRenderer.render = function(oRm, oMP){

		var sTooltip = oMP.getTooltip_AsString();
		var oLocaleData = oMP._getLocaleData();
		var sId = oMP.getId();
		var aMonthNames = [];
		if (oMP._bLongMonth || !oMP._bNamesLengthChecked) {
			aMonthNames = oLocaleData.getMonthsStandAlone("wide");
		} else {
			aMonthNames = oLocaleData.getMonthsStandAlone("abbreviated");
		}
		var iMonth = oMP.getMonth();

		oRm.write("<div");
		oRm.writeControlData(oMP);
		oRm.addClass("sapUiCalMonthPicker");
		oRm.writeClasses();

		if (sTooltip) {
			oRm.writeAttributeEscaped('title', sTooltip);
		}

		oRm.write(">"); // div element

		for ( var i = 0; i < 12; i++) {
			oRm.write("<div");
			oRm.writeAttribute("id", sId + "-m" + i);
			oRm.addClass("sapUiCalMonth");
			if (i == iMonth) {
				oRm.addClass("sapUiCalMonthSel");
			}
			oRm.writeAttribute("tabindex", "-1");
			oRm.writeClasses();
			oRm.write(">"); // div element
			oRm.write(aMonthNames[i]);
			oRm.write("</div>");
		}

		oRm.write("</div>");

	};

	return MonthPickerRenderer;

}, /* bExport= */ true);
