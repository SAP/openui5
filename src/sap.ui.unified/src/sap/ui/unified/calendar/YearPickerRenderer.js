/*!
 * ${copyright}
 */

sap.ui.define(['sap/ui/unified/calendar/CalendarDate', 'sap/ui/core/date/UniversalDate'],
	function(CalendarDate, UniversalDate) {
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
		var sId = oYP.getId();
		var oCurrentDate = oYP._getDate();
		var iCurrentYear = oCurrentDate.getYear();
		var iYears = oYP.getYears();
		var iColumns = oYP.getColumns();
		var sWidth = "";

		oRm.openStart("div", oYP);
		oRm.class("sapUiCalYearPicker");

		if (sTooltip) {
			oRm.attr('title', sTooltip);
		}

		oRm.accessibilityState(oYP, {
			role: "grid",
			readonly: "true",
			multiselectable: "false",
			label: sap.ui.getCore().getLibraryResourceBundle("sap.ui.unified").getText("YEAR_PICKER")
		});

		oRm.openEnd(); // div element

		var oDate = new CalendarDate(oCurrentDate, oYP.getPrimaryCalendarType());
		oDate.setYear(oDate.getYear() - Math.floor(iYears / 2));
		var bEnabledCheck = false; // check for disabled years only needed if borders touched
		var oFirstDate = oYP._checkFirstDate(oDate);
		if (!oFirstDate.isSame(oDate)) {
			oDate = oFirstDate;
			bEnabledCheck = true;
		}

		if (iColumns > 0) {
			sWidth = ( 100 / iColumns ) + "%";
		} else {
			sWidth = ( 100 / iYears ) + "%";
		}

		for ( var i = 0; i < iYears; i++) {
			var sYyyymmdd = oYP._oFormatYyyymmdd.format(oDate.toUTCJSDate(), true);
			var mAccProps = {
					role: "gridcell"
				};
			var bEnabled = true;

			if (bEnabledCheck) {
				bEnabled = oYP._checkDateEnabled(oDate);
			}

			if (iColumns > 0 && i % iColumns == 0) {
				// begin of row
				oRm.openStart("div");
				oRm.accessibilityState(null, {role: "row"});
				oRm.openEnd(); // div element
			}

			oRm.openStart("div", sId + "-y" + sYyyymmdd);
			oRm.class("sapUiCalItem");
			if ( oDate.getYear() == iCurrentYear) {
				oRm.class("sapUiCalItemSel");
				mAccProps["selected"] = true;
			} else {
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
			oRm.text(oYP._oYearFormat.format(UniversalDate.getInstance(oDate.toUTCJSDate(), oDate.getCalendarType()))); // to render era in Japanese
			oRm.close("div");
			oDate.setYear(oDate.getYear() + 1);

			if (iColumns > 0 && ((i + 1) % iColumns == 0)) {
				// end of row
				oRm.close("div");
			}
		}

		oRm.close("div");

	};

	return YearPickerRenderer;

}, /* bExport= */ true);
