/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/core/Renderer', './CalendarRenderer'],
	function(jQuery, Renderer, CalendarRenderer) {
	"use strict";


	/**
	 * CalendarDateInterval renderer.
	 * @namespace
	 */
	var CalendarDateIntervalRenderer = {
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.unified.Calendar} oCal an object representation of the control that should be rendered
	 */
	CalendarDateIntervalRenderer.render = function(oRm, oCal){

		oCal._iMode = 0; // it's rendered always as DayPicker

		var sId = oCal.getId();
		var sTooltip = oCal.getTooltip_AsString();
		var aMonths = oCal.getAggregation("month");
		var sWidth = oCal.getWidth();

		oRm.write("<div");
		oRm.writeControlData(oCal);
		oRm.addClass("sapUiCal");
		if (aMonths.length > 1) {
			oRm.addClass("sapUiCalMulti");
		}
		// This makes the calendar focusable and therefore
		// the white empty areas can be clicked without closing the calendar
		// by accident.
		oRm.writeAttribute("tabindex", "-1");

		var rb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.unified");
		var mAccProps = {labelledby: {value: "", append: false}}; // render on Month
		if (oCal._bPoupupMode) {
			mAccProps["role"] = "dialog";
		}
		oRm.writeAccessibilityState(oCal, mAccProps);

		if (sTooltip) {
			oRm.writeAttributeEscaped('title', sTooltip);
		}

		if (sWidth) {
			oRm.addClass("sapUiCalWidth");
			oRm.addStyle("width", sWidth);
			oRm.writeStyles();
		}

		if (oCal._getSecondaryCalendarType()) {
			oRm.addClass("sapUiCalSecType");
		}

		if (this.addAttributes) {
			// additional stuff by inherited controls
			this.addAttributes(oRm, oCal);
		}
		oRm.writeClasses();
		oRm.write(">"); // div element

		var oHeader = oCal.getAggregation("header");
		oRm.renderControl(oHeader);

		oRm.write("<div id=\"" + sId + "-content\" class=\"sapUiCalContent\">");
		for (var i = 0; i < aMonths.length; i++) {
			var oMonth = aMonths[i];
			oRm.renderControl(oMonth);
		}

		if (!oCal.getPickerPopup()) {
			oRm.write("<div id=\"" + sId + "-contentOver\" class=\"sapUiCalContentOver\" style=\"display:none;\"></div>");
		}

		if (!oCal._bNamesLengthChecked) {
			// render MonthPicker to check month names length
			var oMonthPicker = oCal.getAggregation("monthPicker");
			oRm.renderControl(oMonthPicker);
		}

		oRm.write("</div>");

		oRm.write("<button id=\"" + sId + "-cancel\" class=\"sapUiCalCancel\" tabindex=\"-1\">");
		oRm.write(rb.getText("CALENDAR_CANCEL"));
		oRm.write("</button>");

		// dummy element to catch tabbing in from next element
		oRm.write("<div id=\"" + sId + "-end\" tabindex=\"0\" style=\"width:0;height:0;position:absolute;right:0;bottom:0;\"></div>");

		if (oCal.getPickerPopup()) {
			oRm.write("<div id=\"" + sId + "-contentOver\" class=\"sapUiCalContentOver\" style=\"display:none;\"></div>");
		}

		oRm.write("</div>");
	};

	CalendarDateIntervalRenderer.addAttributes = function(oRm, oCal){

		oRm.addClass("sapUiCalInt");
		oRm.addClass("sapUiCalDateInt");
		var iDays = oCal._getDays();

		if (iDays > oCal._getDaysLarge()) {
			oRm.addClass("sapUiCalIntLarge");
		}

		if (iDays > oCal._iDaysMonthHead) {
			oRm.addClass("sapUiCalIntHead");
		}

	};

	return CalendarDateIntervalRenderer;

}, /* bExport= */ true);
