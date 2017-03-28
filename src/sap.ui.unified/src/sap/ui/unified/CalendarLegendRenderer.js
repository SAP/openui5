/*
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";

	/**
	 * Legend renderer.
	 * @namespace
	 */
	var CalendarLegendRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.unified.CalendarLegend} oLeg an object representation of the legend that should be rendered
	 */
	CalendarLegendRenderer.render = function(oRm, oLeg) {

		var aStandardItems = oLeg.getAggregation("standardItems");
		var aCustomItems = oLeg.getItems();
		var i = 0;

		oRm.write("<div");
		oRm.writeControlData(oLeg);
		oRm.addClass("sapUiUnifiedLegend");
		oRm.writeClasses();
		var sColumnWidth = oLeg.getColumnWidth();
		oRm.writeAttribute("style", "column-width:" + sColumnWidth + ";-moz-column-width:" + sColumnWidth + ";-webkit-column-width:" + sColumnWidth + ";");
		oRm.writeStyles();
		oRm.write(">");

		// rendering standard days and colors
		var iIdLength = oLeg.getId().length + 1;
		for (i = 0; i < aStandardItems.length; ++i) {
			var sClass = "sapUiUnifiedLegend" + aStandardItems[i].getId().slice(iIdLength);
			this.renderLegendItem(oRm, sClass, aStandardItems[i]);
		}

		// rendering special day and colors
		for (i = 0; i < aCustomItems.length; i++) {
			this.renderLegendItem(oRm, "sapUiCalLegDayType" + oLeg._getItemType(aCustomItems[i]).slice(4), aCustomItems[i]);
		}

		oRm.write("</div>");
	};

	/**
	 * Renders one item of the legend {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {string} sClass name of the CSS class used for this item
	 * @param {sap.ui.unified.CalenderLegendItem} oItem item element
	 */
	CalendarLegendRenderer.renderLegendItem = function(oRm, sClass, oItem) {

		var sText = oItem.getText();
		var sTooltip = oItem.getTooltip_AsString();
		var sColor = oItem.getColor();

		// new LegendItem
		oRm.write("<div");
		oRm.writeElementData(oItem);

		if (sTooltip) {
			oRm.writeAttributeEscaped('title', sTooltip);
		}

		oRm.addClass("sapUiUnifiedLegendItem");
		oRm.addClass(sClass);
		oRm.writeClasses();
		oRm.write(">");
		// draw the square background
		oRm.write("<div");
		oRm.addClass("sapUiUnifiedLegendSquare");
		oRm.writeClasses();
		oRm.write(">");
		// draw the square color
		oRm.write("<div");
		oRm.addClass("sapUiUnifiedLegendSquareColor");
		if (sColor) {
			oRm.addStyle("background-color", sColor);
            oRm.writeStyles();
        }
		oRm.writeClasses();
		oRm.write("></div></div>"); // close color, background
		// write description
		oRm.write("<div");
		oRm.writeAttribute("id", oItem.getId() + "-Text");
		oRm.addClass("sapUiUnifiedLegendDescription");
		oRm.writeClasses();
		oRm.write(">");
		oRm.writeEscaped(sText);
		oRm.write("</div></div>"); // close description, LegendItem
	};

	return CalendarLegendRenderer;

}, /* bExport= */ true);
