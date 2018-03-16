/*
 * ${copyright}
 */

sap.ui.define(['sap/ui/core/InvisibleText'],
	function(InvisibleText) {
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

	/**
	 * Utility method to add accessibility info related to the CalendarDayType.
	 * If the given legend item has a text, it is used as aria-label,
	 * otherwise the default text for the given legend type is used as aria-describedby.
	 * Currently used by TimesRowRenderer/MonthsRowRenderer to enrich the accessibility properties, but can be used from
	 * other calendar controls as well.
	 * @param {Object} mAccProps the accessibility map to add accessibility properties to
	 * @param {string} sType The Type as per {sap.ui.unified.CalendarDayType}
	 * @param {sap.ui.unified.CalendarLegend} [oLegend] a reference to the calendar legend. If not given, the built-in
	 * sap.ui.unified.CalendarDayType.Type<X> text will be used and added as aria-describedby.
	 * @private
	 */
	CalendarLegendRenderer.addCalendarTypeAccInfo = function (mAccProps, sType, oLegend) {
		var sTypeLabelText,
			oStaticLabel;

		// as legend must not be rendered add text of type
		if (oLegend) {
			var oLegendItem = oLegend._getItemByType(sType);
			if (oLegendItem) {
				sTypeLabelText = oLegendItem.getText();
			}
		}

		if (sTypeLabelText) {
			mAccProps["label"] = mAccProps["label"] ? mAccProps["label"] + "; " + sTypeLabelText : sTypeLabelText;
		} else {
			//use static invisible labels - "Type 1", "Type 2"
			oStaticLabel = CalendarLegendRenderer.getTypeAriaText(sType);
			if (oStaticLabel) {
				mAccProps["describedby"] = mAccProps["describedby"] ? mAccProps["describedby"] + " " + oStaticLabel.getId() : oStaticLabel.getId();
			}
		}
	};

	CalendarLegendRenderer.typeARIATexts = {};

	/**
	 * Creates and returns an invisible static label containing the translated type of the text.
	 * @param {string} sType A string in the same format as sap.ui.unified.CalendarDayType entries
	 * @returns {sap.ui.core.InvisibleText} An invisible static label containing the translated type of the text
	 * @private
	 */
	CalendarLegendRenderer.getTypeAriaText = function(sType) {
		var rb,
			sText;

		if (sType.indexOf("Type") !== 0) {
			return;
		}

		if (!CalendarLegendRenderer.typeARIATexts[sType]) {
			rb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.unified");
			sText = rb.getText("LEGEND_UNNAMED_TYPE", parseInt(sType.slice(4), 10).toString());
			CalendarLegendRenderer.typeARIATexts[sType] = new InvisibleText({ text: sText });
			CalendarLegendRenderer.typeARIATexts[sType].toStatic();
		}

		return CalendarLegendRenderer.typeARIATexts[sType];
	};

	return CalendarLegendRenderer;

}, /* bExport= */ true);
