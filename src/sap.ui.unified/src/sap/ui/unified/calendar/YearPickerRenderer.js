/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/unified/calendar/CalendarDate', 'sap/ui/core/date/UniversalDate', 'sap/ui/core/InvisibleText'],
	function(CalendarDate, UniversalDate, InvisibleText) {
	"use strict";

	/*
	 * Inside the YearPickerRenderer CalendarDate objects are used. But in the API JS dates are used.
	 * So conversion must be done on API functions.
	 */

	/**
	 * YearPicker renderer.
	 * @namespace
	 */
	var YearPickerRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.unified.calendar.YearPicker} oYP an object representation of the control that should be rendered
	 */
	YearPickerRenderer.render = function(oRm, oYP){
		var sTooltip = oYP.getTooltip_AsString();

		oRm.openStart("div", oYP);
		oRm.class("sapUiCalYearPicker");

		if (sTooltip) {
			oRm.attr('title', sTooltip);
		}

		oRm.accessibilityState(oYP, this.getAccessibilityState(oYP));

		oRm.openEnd(); // div element

		this.renderCells(oRm, oYP);

		oRm.close("div");

	};

	YearPickerRenderer.getAccessibilityState = function(oYP) {
		return {
			role: "grid",
			readonly: "true",
			multiselectable: oYP.getIntervalSelection(),
			roledescription: sap.ui.getCore().getLibraryResourceBundle("sap.ui.unified").getText("YEAR_PICKER"),
			describedby: oYP._bCalendar ? InvisibleText.getStaticId("sap.ui.unified", "CALENDAR_YEAR_RANGE_PICKER_OPEN_HINT") : ""
		};
	};

	YearPickerRenderer.renderCells = function(oRm, oYP) {

		var oDate = oYP.getProperty("_middleDate") ? oYP.getProperty("_middleDate") : oYP._getDate(),
			oCurrentDate = new CalendarDate(oDate, oYP.getPrimaryCalendarType()),
			iYears = oYP.getYears(),
			sId = oYP.getId(),
			iColumns = oYP.getColumns(),
			sWidth = "",
			bEnabled = false,
			oCurrentValidatedDate,
			bApplySelection,
			bApplySelectionBetween,
			mAccProps, sYyyymmdd, i;

		oCurrentDate.setYear(oCurrentDate.getYear() - Math.floor(iYears / 2));
		oCurrentValidatedDate = oYP._checkFirstDate(oCurrentDate);

		if (!oCurrentValidatedDate.isSame(oCurrentDate)) {
			oCurrentDate = oCurrentValidatedDate;
		}

		if (iColumns > 0) {
			sWidth = ( 100 / iColumns ) + "%";
		} else {
			sWidth = ( 100 / iYears ) + "%";
		}

		for (i = 0; i < iYears; i++) {
			sYyyymmdd = oYP._oFormatYyyymmdd.format(oCurrentDate.toUTCJSDate(), true);
			mAccProps = {
				role: "gridcell"
			};
			bEnabled = oYP._checkDateEnabled(oCurrentDate);

			if (iColumns > 0 && i % iColumns == 0) {
				// begin of row
				oRm.openStart("div");
				oRm.accessibilityState(null, {role: "row"});
				oRm.openEnd(); // div element
			}

			oRm.openStart("div", sId + "-y" + sYyyymmdd);
			oRm.class("sapUiCalItem");

			bApplySelection = oYP._fnShouldApplySelection(oCurrentDate);
			bApplySelectionBetween = oYP._fnShouldApplySelectionBetween(oCurrentDate);

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

			if (!bEnabled) {
				oRm.class("sapUiCalItemDsbl"); // year disabled
				mAccProps["disabled"] = true;
			}

			oRm.attr("tabindex", "-1");
			oRm.attr("data-sap-year-start", sYyyymmdd);
			oRm.style("width", sWidth);
			oRm.accessibilityState(null, mAccProps);
			oRm.openEnd(); // div element
			// to render era in Japanese, UniversalDate is used, since CalendarDate.toUTCJSDate() will convert the date in Gregorian
			oRm.text(oYP._oYearFormat.format(UniversalDate.getInstance(oCurrentDate.toUTCJSDate(), oCurrentDate.getCalendarType()), true)); // to render era in Japanese
			oRm.close("div");

			oCurrentDate.setYear(oCurrentDate.getYear() + 1);

			if (iColumns > 0 && ((i + 1) % iColumns == 0)) {
				// end of row
				oRm.close("div");
			}
		}
	};

	return YearPickerRenderer;

}, /* bExport= */ true);
