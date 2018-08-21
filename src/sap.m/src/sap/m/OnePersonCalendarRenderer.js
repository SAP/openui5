/*!
 * ${copyright}
 */
sap.ui.define([],
function() {
	"use strict";

	/**
	 * OnePersonCalendar renderer.
	 * @namespace
	 */
	var OnePersonCalendarRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.m.OnePersonCalendar} oCalendar An object representation of the <code>OnePersonCalendarRenderer</code> control that should be rendered.
	 */
	OnePersonCalendarRenderer.render = function(oRm, oCalendar){
		oRm.write("<div");
		oRm.writeControlData(oCalendar);
		oRm.addClass("sapMOnePerCal");
		oRm.addClass("sapUiSizeCompact"); // TODO: for now force Compact mode
		oRm.writeClasses();
		oRm.write(">");

		var oHeader = oCalendar._getHeader();
		if (oHeader) {
			oRm.renderControl(oHeader);
		}

		var oGrid = oCalendar._getGrid();
		if (oGrid) {
			oRm.renderControl(oGrid);
		}

		oRm.write("</div>");
	};

	return OnePersonCalendarRenderer;

}, /* bExport= */ true);