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

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.unified.Calendar} oCal an object representation of the control that should be rendered
	 */
	CalendarRenderer.render = function(oRm, oCal){

		oCal._iMode = 0; // it's rendered always as DayPicker

		var sId = oCal.getId();
		var sTooltip = oCal.getTooltip_AsString();
		var aMonths = oCal.getAggregation("month");
		var sWidth = oCal.getWidth();

		oRm.openStart("div", oCal);
		oRm.class("sapUiCal");
		if (aMonths.length > 1) {
			oRm.class("sapUiCalMulti");
		}

		var rb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.unified");
		var mAccProps = {labelledby: {value: "", append: false}}; // render on Month
		if (oCal._bPoupupMode) {
			mAccProps.role = "dialog";
			mAccProps.modal = true;
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

		var oHeader = oCal.getAggregation("header");
		oRm.renderControl(oHeader);

		var iMonthsCount = aMonths.length;
		oRm.openStart("div", sId + "-content");
		oRm.class("sapUiCalContent");
		oRm.openEnd();
		for (var i = 0; i < iMonthsCount; i++) {
			var oMonth = aMonths[i];
			oRm.renderControl(oMonth);
			if (iMonthsCount === 2 && i === 0) {
				oRm.renderControl(oCal.getAggregation("secondMonthHeader"));
			}
		}

		this.renderCalContentOverlay(oRm, oCal, sId);

		if (!oCal._bNamesLengthChecked) {
			// render MonthPicker to check month names length
			var oMonthPicker = oCal.getAggregation("monthPicker");
			oRm.renderControl(oMonthPicker);
		}

		oRm.close("div");

		//when used in a DatePicker, in mobile there is no cancel button
		if (!oCal._bSkipCancelButtonRendering) {
			oRm.openStart("button", sId + "-cancel");
			oRm.class("sapUiCalCancel");
			oRm.attr("tabindex", "-1");
			oRm.openEnd();
			oRm.text(rb.getText("CALENDAR_CANCEL"));
			oRm.close("button");
		}

		// dummy element to catch tabbing in from next element
		oRm.openStart("div", sId + "-end");
		oRm.attr("tabindex", "0");
		oRm.style("position", "absolute");
		oRm.style("width", "0");
		oRm.style("height", "0");
		oRm.style("right", "0");
		oRm.style("bottom", "0");
		oRm.openEnd();
		oRm.close("div");

		this.renderCalContentAndArrowsOverlay(oRm, oCal, sId);

		oRm.close("div");
	};

	CalendarRenderer.renderCalContentOverlay = function(oRm, oCal, sId) {
		oRm.openStart("div", sId + "-contentOver");
		oRm.class("sapUiCalContentOver");
		oRm.style("display", "none");
		oRm.openEnd();
		oRm.close("div");
	};

	CalendarRenderer.renderCalContentAndArrowsOverlay = function(oRm, oCal, sId) {
	};

	return CalendarRenderer;

}, /* bExport= */ true);
