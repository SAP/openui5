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
	var CalendarMonthIntervalRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.unified.CalendarMonthInterval} oCal An object representation of the control that should be rendered
	 */
	CalendarMonthIntervalRenderer.render = function(oRm, oCal){

		var sId = oCal.getId();
		var sTooltip = oCal.getTooltip_AsString();

		oRm.openStart("div", oCal);
		oRm.class("sapUiCal");
		oRm.class("sapUiCalInt");
		oRm.class("sapUiCalMonthInt");

		if (oCal._getShowItemHeader()) {
			oRm.class("sapUiCalIntHead");
		}

		var rb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.unified");
		var mAccProps = {labelledby: {value: "", append: false}}; // render on Month
		if (oCal._bPoupupMode) {
			mAccProps["role"] = "dialog";
		}
		oRm.accessibilityState(oCal, mAccProps);

		if (sTooltip) {
			oRm.attr('title', sTooltip);
		}

		var sWidth = oCal.getWidth();
		if (sWidth && sWidth != '') {
			oRm.style("width", sWidth);
		}

		oRm.openEnd(); // div element

		oRm.openStart("div", sId + "-content");
		oRm.class("sapUiCalContent");
		oRm.openEnd();
		oRm.renderControl(oCal.getAggregation(oCal.getProperty("_currentPicker")));
		oRm.close("div");
		oRm.openStart("button", sId + "-cancel");
		oRm.class("sapUiCalCancel");
		oRm.attr("tabindex", "-1");
		oRm.openEnd();
		oRm.text(rb.getText("CALENDAR_CANCEL"));
		oRm.close("button");

		var oHeader = oCal.getAggregation("header");
		oRm.renderControl(oHeader);

		if (oCal.getPickerPopup()) {
			oRm.openStart("div", sId + "-contentOver");
			oRm.class("sapUiCalContentOver");
			if (!oCal._oPopup || !oCal._oPopup.isOpen()) {
				oRm.style("display", "none");
			}
			oRm.openEnd();
			oRm.close("div");
		}

		oRm.close("div");
	};

	return CalendarMonthIntervalRenderer;

}, /* bExport= */ true);
