/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/unified/calendar/CalendarDate"],
	function(CalendarDate) {
	"use strict";


	/**
	 * MonthPicker renderer.
	 * @namespace
	 */
	var MonthPickerRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.unified.calendar.MonthPicker} oMP an object representation of the control that should be rendered
	 */
	MonthPickerRenderer.render = function(oRm, oMP){

		var iMonth = oMP.getMonth(),
			iMonths = oMP.getMonths(),
			iStartMonth = 0,
			iColumns = oMP.getColumns(),
			sTooltip = oMP.getTooltip_AsString(),
			oLocaleData = oMP._getLocaleData(),
			sId = oMP.getId(),
			sWidth = "",
			aMonthNames = [],
			aMonthNamesWide = [],
			sCalendarType = oMP.getPrimaryCalendarType(),
			i,
			bApplySelection,
			bApplySelectionBetween;

		if (oMP._bLongMonth || !oMP._bNamesLengthChecked) {
			aMonthNames = oLocaleData.getMonthsStandAlone("wide", sCalendarType);
		} else {
			aMonthNames = oLocaleData.getMonthsStandAlone("abbreviated", sCalendarType);
			aMonthNamesWide = oLocaleData.getMonthsStandAlone("wide", sCalendarType);
		}

		oRm.openStart("div",oMP);
		oRm.class("sapUiCalMonthPicker");

		if (sTooltip) {
			oRm.attr("tooltip", sTooltip);
		}

		oRm.accessibilityState(oMP, {
			role: "grid",
			readonly: "true",
			multiselectable: oMP.getIntervalSelection(),
			label: sap.ui.getCore().getLibraryResourceBundle("sap.ui.unified").getText("MONTH_PICKER")
		});

		oRm.openEnd(); // div element
		var mAccProps;

		if (iMonths > 12) {
			iMonths = 12;
		} else if (iMonths < 12) {
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

		for (i = 0; i < iMonths; i++) {
			var iCurrentMonth = i + iStartMonth,
				oCurrentDate = CalendarDate.fromLocalJSDate(new Date(), oMP.getPrimaryCalendarType());

			oCurrentDate.setMonth(iCurrentMonth, 1);
			oMP._iYear && oCurrentDate.setYear(oMP._iYear);

			mAccProps = {
					role: "gridcell"
				};
			if (!oMP._bLongMonth && oMP._bNamesLengthChecked) {
				mAccProps["label"] = aMonthNamesWide[iCurrentMonth];
			}

			if (iColumns > 0 && i % iColumns == 0) {
				// begin of row
				oRm.openStart("div");
				oRm.accessibilityState(null, {role: "row"});
				oRm.openEnd();
			}

			oRm.openStart("div", sId + "-m" + (iCurrentMonth));
			oRm.class("sapUiCalItem");

			bApplySelection = oMP._fnShouldApplySelection(oCurrentDate);
			bApplySelectionBetween = oMP._fnShouldApplySelectionBetween(oCurrentDate);

			if (bApplySelection) {
				oRm.class("sapUiCalItemSel");
				mAccProps["selected"] = true;
			}

			if (bApplySelectionBetween) {
				oRm.class("sapUiCalItemSelBetween");
				mAccProps["selected"] = true;
			}

			if (!bApplySelection && !bApplySelectionBetween) {
				mAccProps["selected"] = false;
			}

			if (iCurrentMonth < oMP._iMinMonth || iCurrentMonth > oMP._iMaxMonth) {
				oRm.class("sapUiCalItemDsbl"); // month disabled
				mAccProps["disabled"] = true;
			}

			oRm.attr("tabindex", "-1");
			oRm.style("width", sWidth);
			oRm.accessibilityState(null, mAccProps);
			oRm.openEnd();
			oRm.text(aMonthNames[iCurrentMonth]);
			oRm.close("div");

			if (iColumns > 0 && ((i + 1) % iColumns == 0)) {
				// end of row
				oRm.close("div");
			}
		}

		oRm.close("div");
	};

	return MonthPickerRenderer;

}, /* bExport= */ true);
