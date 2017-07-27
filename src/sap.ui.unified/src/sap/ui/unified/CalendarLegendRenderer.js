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

		var aStandardItems = oLeg.getAggregation("_standardItems"),
			aCustomItems = oLeg.getItems(),
			i,
			iIdLength,
			sColumnWidth;

		oRm.write("<div");
		oRm.writeControlData(oLeg);
		oRm.addClass("sapUiUnifiedLegend");
		oRm.writeClasses();
		oRm.write(">");

		this.renderItemsHeader(oRm, oLeg);

		if (aStandardItems || aCustomItems) {
			oRm.write("<div");
			oRm.addClass("sapUiUnifiedLegendItems");
			oRm.writeClasses();
			sColumnWidth = oLeg.getColumnWidth();
			oRm.writeAttribute("style", "column-width:" + sColumnWidth + ";-moz-column-width:" + sColumnWidth + ";-webkit-column-width:" + sColumnWidth + ";");
			oRm.writeStyles();
			oRm.write(">");

			if (aStandardItems) {
				// rendering standard days and colors
				iIdLength = oLeg.getId().length + 1; //+1, because of the dash in "CalLeg1-Today"?
				for (i = 0; i < aStandardItems.length; ++i) {
					var sClass = "sapUiUnifiedLegend" + aStandardItems[i].getId().slice(iIdLength);
					this.renderLegendItem(oRm, sClass, aStandardItems[i], ["sapUiUnifiedLegendSquareColor"]);
				}
			}

			if (aCustomItems) {
				// rendering special day and colors
				for (i = 0; i < aCustomItems.length; i++) {
					this.renderLegendItem(oRm, "sapUiCalLegDayType" + oLeg._getItemType(aCustomItems[i], aCustomItems).slice(4), aCustomItems[i], ["sapUiUnifiedLegendSquareColor"]);
				}
			}

			oRm.write("</div>");
		}

		this.renderAdditionalContent(oRm, oLeg); //like more sections with items

		oRm.write("</div>");
	};

	/**
	 * Renders one item of the legend {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {string} sClass name of the CSS class used for this item
	 * @param {sap.ui.unified.CalenderLegendItem} oItem item element
	 * @param {string[]} aColorClasses Css classes to be added to the color bullet item in front of the legend item
	 */
	CalendarLegendRenderer.renderLegendItem = function(oRm, sClass, oItem, aColorClasses) {

		var sText = oItem.getText();
		var sTooltip = oItem.getTooltip_AsString();

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
		this.renderColor(oRm, oItem.getColor(), aColorClasses);
		oRm.write("</div>"); //close background
		// write description
		oRm.write("<div");
		oRm.writeAttribute("id", oItem.getId() + "-Text");
		oRm.addClass("sapUiUnifiedLegendDescription");
		oRm.writeClasses();
		oRm.write(">");
		oRm.writeEscaped(sText);
		oRm.write("</div></div>"); // close description, LegendItem
	};

	/**
	 * Renders a header for the items list.
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.unified.CalendarLegend} oLeg an object representation of the legend that should be rendered
	 * @since 1.50
	 */
	CalendarLegendRenderer.renderItemsHeader = function(oRm, oLeg) {
		//to be used if descendant classes want to render a header for the items list
	};

	/**
	 * Renders additional content after the items list.
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.unified.CalendarLegend} oLeg an object representation of the legend that should be rendered
	 * @since 1.50
	 */
	CalendarLegendRenderer.renderAdditionalContent = function(oRm, oLeg) {
		//to be used to render additional content after the items section
		//for example more sections with items
	};

	/**
	 * Renders a color bullet in front of a legend item.
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {string} sColor Item bullet color
	 * @param {string[]} aColorClasses Css classes to be added to the color bullet item in front of the legend item
	 * @since 1.50
	 */
	CalendarLegendRenderer.renderColor = function(oRm, sColor, aColorClasses) {
		oRm.write("<div");
		for (var i = 0; i < aColorClasses.length; i++) {
			oRm.addClass(aColorClasses[i]);
		}
		if (sColor) {
			oRm.addStyle("background-color", sColor);
			oRm.writeStyles();
		}
		oRm.writeClasses();
		oRm.write("></div>"); // close color
	};

	return CalendarLegendRenderer;

}, /* bExport= */ true);
