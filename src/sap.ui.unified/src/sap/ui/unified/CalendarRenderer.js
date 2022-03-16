/*!
 * ${copyright}
 */

sap.ui.define([],
	function() {
	"use strict";


	/**
	 * Calendar renderer.
	 * @namespace
	 */
	var CalendarRenderer = {
		apiVersion: 2
	};

	// Holds the possible values for the "_currentPicker" property.
	var CURRENT_PICKERS = {
		MONTH: "month", // represents the "month" aggregation
		MONTH_PICKER: "monthPicker",  // represents the "monthPicker" aggregation
		YEAR_PICKER: "yearPicker",  // represents the "yearPicker" aggregation
		YEAR_RANGE_PICKER: "yearRangePicker"  // represents the "yearRangePicker" aggregation
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.unified.Calendar} oCal an object representation of the control that should be rendered
	 */
	CalendarRenderer.render = function(oRm, oCal){

		var sId = oCal.getId(),
			sTooltip = oCal.getTooltip_AsString(),
			aMonths = oCal.getAggregation("month"),
			sCurrentPicker = oCal.getProperty("_currentPicker"),
			sWidth = oCal.getWidth(),
			rb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.unified"),
			mAccProps = {labelledby: {value: "", append: false}};

		oRm.openStart("div", oCal);
		oRm.class("sapUiCal");
		if (aMonths.length > 1) {
			oRm.class("sapUiCalMulti");
		}

		oRm.accessibilityState(oCal, mAccProps);

		if (sTooltip) {
			oRm.attr("title", sTooltip);
		}

		if (sWidth) {
			oRm.class("sapUiCalWidth");
			oRm.style("width", sWidth);
		}

		if (oCal._getSecondaryCalendarType()) {
			oRm.class("sapUiCalSecType");
		}

		if (this.addAttributes) {
			// additional stuff by inherited controls
			this.addAttributes(oRm, oCal);
		}
		oRm.openEnd(); // div element

		oRm.openStart("div", sId + "-content");
		oRm.class("sapUiCalContent");
		oRm.openEnd();

		if (oCal.getMonths() > 1) { // in case of more than 1 month - render them below the actual picker
			switch (sCurrentPicker) {
				case CURRENT_PICKERS.MONTH_PICKER: // month picker
				case CURRENT_PICKERS.YEAR_PICKER: // year picker
				case CURRENT_PICKERS.YEAR_RANGE_PICKER: // year picker
					this.renderMonths(oRm, oCal, aMonths);
					this.renderCalContentOverlay(oRm, oCal, sId);
					break;
				// no default
			}
		}
		switch (sCurrentPicker) {
			case CURRENT_PICKERS.MONTH: // month picker
				this.renderMonths(oRm, oCal, aMonths);
				break;
			case CURRENT_PICKERS.MONTH_PICKER: // month picker
				oRm.renderControl(oCal._getMonthPicker());
				break;
			case CURRENT_PICKERS.YEAR_PICKER: // year picker
				oRm.renderControl(oCal._getYearPicker());
				break;
			case CURRENT_PICKERS.YEAR_RANGE_PICKER: // year picker
				oRm.renderControl(oCal._getYearRangePicker());
				break;
			// no default
		}

		oRm.close("div");

		var oHeader = oCal.getAggregation("header");
		oRm.renderControl(oHeader);

		//when used in a DatePicker, in mobile there is no cancel button
		if (!oCal._bSkipCancelButtonRendering) {
			oRm.openStart("button", sId + "-cancel");
			oRm.class("sapUiCalCancel");
			oRm.attr("tabindex", "-1");
			oRm.openEnd();
			oRm.text(rb.getText("CALENDAR_CANCEL"));
			oRm.close("button");
		}

		this.renderCalContentAndArrowsOverlay(oRm, oCal, sId);

		oRm.close("div");
	};

	CalendarRenderer.renderMonths = function(oRm, oCal, aMonths) {
		aMonths.forEach(function(oMonth, iIndex) {
			oRm.renderControl(oMonth);
			if (aMonths.length === 2 && iIndex === 0) {
				oRm.renderControl(oCal.getAggregation("secondMonthHeader"));
			}
		});
	};

	CalendarRenderer.renderCalContentOverlay = function(oRm, oCal, sId) {
		oRm.openStart("div", sId + "-contentOver");
		oRm.class("sapUiCalContentOver");
		oRm.openEnd();
		oRm.close("div");
	};

	CalendarRenderer.renderCalContentAndArrowsOverlay = function(oRm, oCal, sId) {
	};

	return CalendarRenderer;

}, /* bExport= */ true);
