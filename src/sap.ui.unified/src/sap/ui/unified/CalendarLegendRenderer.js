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
	 * @param {sap.ui.core.Legend} oLeg an object representation of the legend that should be rendered
	 */
	CalendarLegendRenderer.render = function(oRm, oLeg) {
	
		var rb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.unified");
		var aClasses = [
			"Today", "Selected", "NormalDay", "NonWorkingDay"
		];
		var aStandardItems = [
			"TODAY", "SELECTED", "NORMAL_DAY", "NON_WORKING_DAY"
		];
		var aCustomItems = oLeg.getItems();
	
		oRm.write("<div");
		oRm.writeControlData(oLeg);
		oRm.addClass("sapUiUnifiedLegend");
		oRm.writeClasses();
		var sColumnWidth = oLeg.getColumnWidth();
		oRm.writeAttribute("style", "column-width:" + sColumnWidth + ";-moz-column-width:" + sColumnWidth + ";-webkit-column-width:" + sColumnWidth + ";");
		oRm.writeStyles();
		oRm.write(">");
	
		// rendering standard days and colors
		for (var i = 0; i < aStandardItems.length; i++) {
			this.renderLegendItem(oRm, "sapUiUnifiedLegend" + aClasses[i], rb.getText("LEGEND_" + aStandardItems[i]));
	
		}
		// rendering special day and colors
		if (aCustomItems && aCustomItems.length > 0) {
			for (var j = 0; j < aCustomItems.length; j++) {
				var type = j + 1;
				this.renderLegendItem(oRm, "sapUiCalLegDayType" + ((type < 10) ? "0" + type : type), aCustomItems[j].getText());
			}
		}
		oRm.write("</div>");
	};
	
	/**
	 * Renders one item of the legend {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {string} sClass name of the CSS class used for this item
	 * @param {string} sText description of the item
	 */
	CalendarLegendRenderer.renderLegendItem = function(oRm, sClass, sText) {
	
		// new LegendItem
		oRm.write("<div");
		oRm.addClass("sapUiUnifiedLegendItem");
		oRm.writeClasses();
		oRm.writeStyles();
		oRm.write(">");
		// draw the square background
		oRm.write("<div");
		oRm.addClass("sapUiUnifiedLegendSquare");
		oRm.writeClasses();
		oRm.writeStyles();
		oRm.write(">");
		// draw the square color
		oRm.write("<div");
		oRm.addClass("sapUiUnifiedLegendSquareColor");
		oRm.addClass(sClass);
		oRm.writeClasses();
		oRm.writeStyles();
		oRm.write("></div></div>"); // close color, background
		// write description
		oRm.write("<div");
		oRm.addClass("sapUiUnifiedLegendDescription");
		oRm.writeClasses();
		oRm.writeStyles();
		oRm.write(">");
		oRm.writeEscaped(sText);
		oRm.write("</div></div>"); // close description, LegendItem
	};
	

	return CalendarLegendRenderer;

}, /* bExport= */ true);
