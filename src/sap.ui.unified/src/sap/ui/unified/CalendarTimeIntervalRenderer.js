/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/Lib"],
	function(Lib) {
	"use strict";


	/**
	 * Calendar renderer.
	 * @namespace
	 */
	var CalendarTimeIntervalRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.unified.CalendarTimeInterval} oCal An object representation of the control that should be rendered
	 */
	CalendarTimeIntervalRenderer.render = function(oRm, oCal){

		var sId = oCal.getId();
		var sTooltip = oCal.getTooltip_AsString();

		oRm.openStart("div", oCal);
		oRm.class("sapUiCal");
		oRm.class("sapUiCalInt");
		oRm.class("sapUiCalTimeInt");

		if (oCal._getShowItemHeader()) {
			oRm.class("sapUiCalIntHead");
		}

		if (oCal.getPickerPopup()) {
			oRm.class("sapUiCalIntLarge");
		}

		var rb = Lib.getResourceBundleFor("sap.ui.unified");
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

		var oHeader = oCal.getAggregation("header");
		oRm.renderControl(oHeader);

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

	return CalendarTimeIntervalRenderer;

}, /* bExport= */ true);
