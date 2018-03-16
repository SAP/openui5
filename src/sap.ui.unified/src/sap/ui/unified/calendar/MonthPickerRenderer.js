/*!
 * ${copyright}
 */

sap.ui.define([],
	function() {
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

		var iMonth = oMP.getMonth();
		var iMonths = oMP.getMonths();
		var iStartMonth = 0;
		var iColumns = oMP.getColumns();
		var sTooltip = oMP.getTooltip_AsString();
		var oLocaleData = oMP._getLocaleData();
		var sId = oMP.getId();
		var sWidth = "";

		var aMonthNames = [];
		var aMonthNamesWide = [];
		var sCalendarType = oMP.getPrimaryCalendarType();
		if (oMP._bLongMonth || !oMP._bNamesLengthChecked) {
			aMonthNames = oLocaleData.getMonthsStandAlone("wide", sCalendarType);
		} else {
			aMonthNames = oLocaleData.getMonthsStandAlone("abbreviated", sCalendarType);
			aMonthNamesWide = oLocaleData.getMonthsStandAlone("wide", sCalendarType);
		}

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

		if (iMonths > 12) {
			iMonths = 12;
		}else	if (iMonths < 12) {
			// Month blocks should start with multiple of number of displayed months
			iStartMonth = Math.floor( iMonth / iMonths) * iMonths;
			if (iStartMonth + iMonths > 12) {
				iStartMonth = 12 - iMonths;
			}
		}

		if (iColumns > 0) {
			sWidth = ( 100 / iColumns ) + "%";
		} else {
			sWidth = ( 100 / iMonths ) + "%";
		}

		for ( var i = 0; i < iMonths; i++) {
			var iCurrentMonth = i + iStartMonth;

			mAccProps = {
					role: "gridcell"
				};
			if (!oMP._bLongMonth && oMP._bNamesLengthChecked) {
				mAccProps["label"] = aMonthNamesWide[iCurrentMonth];
			}

			if (iColumns > 0 && i % iColumns == 0) {
				// begin of row
				oRm.write("<div");
				oRm.writeAccessibilityState(null, {role: "row"});
				oRm.write(">"); // div element
			}

			oRm.write("<div");
			oRm.writeAttribute("id", sId + "-m" + (iCurrentMonth));
			oRm.addClass("sapUiCalItem");
			if (iCurrentMonth == iMonth) {
				oRm.addClass("sapUiCalItemSel");
				mAccProps["selected"] = true;
			} else {
				mAccProps["selected"] = false;
			}

			if (iCurrentMonth < oMP._iMinMonth || iCurrentMonth > oMP._iMaxMonth) {
				oRm.addClass("sapUiCalItemDsbl"); // month disabled
				mAccProps["disabled"] = true;
			}

			oRm.writeAttribute("tabindex", "-1");
			oRm.addStyle("width", sWidth);
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.writeAccessibilityState(null, mAccProps);
			oRm.write(">"); // div element
			oRm.write(aMonthNames[iCurrentMonth]);
			oRm.write("</div>");

			if (iColumns > 0 && ((i + 1) % iColumns == 0)) {
				// end of row
				oRm.write("</div>");
			}
		}

		oRm.write("</div>");

	};

	return MonthPickerRenderer;

}, /* bExport= */ true);
