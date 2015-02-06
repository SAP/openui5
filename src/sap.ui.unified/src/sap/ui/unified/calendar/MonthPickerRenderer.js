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
		var aMonthNamesWide = [];
		if (oMP._bLongMonth || !oMP._bNamesLengthChecked) {
			aMonthNames = oLocaleData.getMonthsStandAlone("wide");
		} else {
			aMonthNames = oLocaleData.getMonthsStandAlone("abbreviated");
			aMonthNamesWide = oLocaleData.getMonthsStandAlone("wide");
		}
		var iMonth = oMP.getMonth();

		oRm.write("<div");
		oRm.writeControlData(oMP);
		oRm.addClass("sapUiCalMonthPicker");
		oRm.writeClasses();

		if (sTooltip) {
			oRm.writeAttributeEscaped('title', sTooltip);
		}

		oRm.writeAccessibilityState(oMP, {
			role: "grid",
			readonly: "true",
			multiselectable: "false"
		});

		oRm.write(">"); // div element

		var mAccProps;

		for ( var i = 0; i < 12; i++) {
			mAccProps = {
					role: "gridcell"
				};
			if (!oMP._bLongMonth && oMP._bNamesLengthChecked) {
				mAccProps["label"] = aMonthNamesWide[i];
			}

			if (i == 0 || i % oMP._iColumns == 0) {
				// begin of row
				oRm.write("<div");
				oRm.writeAccessibilityState(null, {role: "row"});
				oRm.write(">"); // div element
			}

			oRm.write("<div");
			oRm.writeAttribute("id", sId + "-m" + i);
			oRm.addClass("sapUiCalMonth");
			if (i == iMonth) {
				oRm.addClass("sapUiCalMonthSel");
			}
			oRm.writeAttribute("tabindex", "-1");
			oRm.writeClasses();
			oRm.writeAccessibilityState(null, mAccProps);
			oRm.write(">"); // div element
			oRm.write(aMonthNames[i]);
			oRm.write("</div>");

			if ((i + 1) % oMP._iColumns == 0) {
				// end of row
				oRm.write("</div>");
			}
		}

		oRm.write("</div>");

	};

	return MonthPickerRenderer;

}, /* bExport= */ true);
