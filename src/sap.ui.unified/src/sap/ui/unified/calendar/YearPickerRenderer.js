/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/core/date/UniversalDate'],
	function(jQuery, UniversalDate) {
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
		var oCurrentDate = oYP._getDate();
		var iCurrentYear = oCurrentDate.getUTCFullYear();
		var iYears = oYP.getYears();
		var iColumns = oYP.getColumns();
		var sWidth = "";

		oRm.write("<div");
		oRm.writeControlData(oYP);
		oRm.addClass("sapUiCalYearPicker");
		oRm.writeClasses();

		if (sTooltip) {
			oRm.writeAttributeEscaped('title', sTooltip);
		}

		oRm.writeAccessibilityState(oYP, {
			role: "grid",
			readonly: "true",
			multiselectable: "false"
		});

		oRm.write(">"); // div element

		var oDate = oYP._newUniversalDate(oCurrentDate);
		oDate.setUTCFullYear(oDate.getFullYear() - Math.floor(iYears / 2));
		var bEnabledCheck = false; // check for disabled years only needed if borders touched
		var oFirstDate = oYP._checkFirstDate(oDate);
		if (oFirstDate.getTime() != oDate.getTime()) {
			oDate = oFirstDate;
			bEnabledCheck = true;
		}

		if (iColumns > 0) {
			sWidth = ( 100 / iColumns ) + "%";
		} else {
			sWidth = ( 100 / iYears ) + "%";
		}

		for ( var i = 0; i < iYears; i++) {
			var sYyyymmdd = oYP._oFormatYyyymmdd.format(oDate.getJSDate(), true);
			var mAccProps = {
					role: "gridcell"
				};
			var bEnabled = true;

			if (bEnabledCheck) {
				bEnabled = oYP._checkDateEnabled(oDate);
			}

			if (iColumns > 0 && i % iColumns == 0) {
				// begin of row
				oRm.write("<div");
				oRm.writeAccessibilityState(null, {role: "row"});
				oRm.write(">"); // div element
			}

			oRm.write("<div");
			oRm.writeAttribute("id", sId + "-y" + sYyyymmdd);
			oRm.addClass("sapUiCalItem");
			if ( oDate.getUTCFullYear() == iCurrentYear) {
				oRm.addClass("sapUiCalItemSel");
				mAccProps["selected"] = true;
			} else {
				mAccProps["selected"] = false;
			}
			if (!bEnabled) {
				oRm.addClass("sapUiCalItemDsbl"); // year disabled
				mAccProps["disabled"] = true;
			}
			oRm.writeAttribute("tabindex", "-1");
			oRm.writeAttribute("data-sap-year-start", sYyyymmdd);
			oRm.addStyle("width", sWidth);
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.writeAccessibilityState(null, mAccProps);
			oRm.write(">"); // div element
			oRm.write(oYP._oYearFormat.format(oDate, true)); // to render era in Japanese
			oRm.write("</div>");
			oDate.setUTCFullYear(oDate.getUTCFullYear() + 1);

			if (iColumns > 0 && ((i + 1) % iColumns == 0)) {
				// end of row
				oRm.write("</div>");
			}
		}

		oRm.write("</div>");

	};

	return YearPickerRenderer;

}, /* bExport= */ true);
