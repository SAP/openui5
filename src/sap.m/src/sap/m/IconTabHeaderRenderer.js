/*!
 * ${copyright}
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/core/IconPool'],
	function(jQuery, IconPool) {
	"use strict";

/**
	 * HBox renderer.
	 * @namespace
	 */
	var IconTabHeaderRenderer = {
	};

	/**
	 * Array of all available icon color CSS classes
	 *
	 * @private
	 */
	IconTabHeaderRenderer._aAllIconColors = ['sapMITBFilterCritical', 'sapMITBFilterPositive', 'sapMITBFilterNegative', 'sapMITBFilterDefault'];


	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	IconTabHeaderRenderer.render = function(oRM, oControl){
		// return immediately if control is not visible
		if (!oControl.getVisible()) {
			return;
		}

		var aItems = oControl.getItems(),
			bTextOnly = oControl._checkTextOnly(aItems),
			bNoText = oControl._checkNoText(aItems);

		var oIconTabBar = oControl.getParent();
		var bUpperCase = oIconTabBar && oIconTabBar instanceof sap.m.IconTabBar && oIconTabBar.getUpperCase();

		// render wrapper div
		oRM.write("<div role='tablist' ");
		oRM.addClass("sapMITH");
		if (oControl._scrollable) {
			oRM.addClass("sapMITBScrollable");
			if (oControl._bPreviousScrollForward) {
				oRM.addClass("sapMITBScrollForward");
			} else {
				oRM.addClass("sapMITBNoScrollForward");
			}
			if (oControl._bPreviousScrollBack) {
				oRM.addClass("sapMITBScrollBack");
			} else {
				oRM.addClass("sapMITBNoScrollBack");
			}
		} else {
			oRM.addClass("sapMITBNotScrollable");
		}
		// Check for upperCase property on IconTabBar
		if (bUpperCase) {
			oRM.addClass("sapMITBTextUpperCase");
		}
		oRM.writeControlData(oControl);
		oRM.writeClasses();
		oRM.write(">");

		// render left scroll arrow
		oRM.renderControl(oControl._getScrollingArrow("left"));

		// render scroll container on touch devices
		if (oControl._bDoScroll) {
			oRM.write("<div id='" + oControl.getId() + "-scrollContainer' class='sapMITBScrollContainer'>");
		}

		oRM.write("<div id='" + oControl.getId() + "-head'");
		oRM.addClass("sapMITBHead");

		if (bTextOnly) {
			oRM.addClass("sapMITBTextOnly");
		}

		if (bNoText) {
			oRM.addClass("sapMITBNoText");
		}

		oRM.writeClasses();
		oRM.write(">");

		jQuery.each(aItems, function(iIndex, oItem) {
			if (!(oItem instanceof sap.m.IconTabSeparator) && !oItem.getVisible()) {
				return; // only render visible items
			}

			var sTabParams = '';

			if (!(oItem instanceof sap.m.IconTabSeparator)) {
				//tab
				sTabParams += 'role="tab" aria-controls="' + oControl.getParent().sId + '-content" ';

				//if there is tab text
				if (oItem && oItem.getText().length) {
					sTabParams += 'aria-labelledby="' + oItem.getId() + '-text"';
				} else if (oItem.getCount() !== "") {
					//if there is no text and there is count
					sTabParams += 'aria-labelledby="' + oItem.getId() + '-count"';
				} else if (oItem.getIcon()) {
					//if there is no text and no count, but there is an icon
					sTabParams += 'aria-labelledby="' + oItem.getId() + '-icon"';
				}
			}

			oRM.write('<div ' + sTabParams + ' ');

			oRM.writeElementData(oItem);
			oRM.addClass("sapMITBItem");

			if (oItem instanceof sap.m.IconTabFilter) {

				if (oItem.getDesign() === sap.m.IconTabFilterDesign.Vertical) {
					oRM.addClass("sapMITBVertical");
				} else if (oItem.getDesign() === sap.m.IconTabFilterDesign.Horizontal) {
					oRM.addClass("sapMITBHorizontal");
				}

				if (oItem.getShowAll()) {
					oRM.addClass("sapMITBAll");
				} else {
					oRM.addClass("sapMITBFilter");
					oRM.addClass("sapMITBFilter" + oItem.getIconColor());
				}

				if (!oItem.getEnabled()) {
					oRM.addClass("sapMITBDisabled");
				}

				var sTooltip = oItem.getTooltip_AsString();
				if (sTooltip) {
					oRM.writeAttributeEscaped("title", sTooltip);
				}

				oRM.writeClasses();
				oRM.write(">");
				oRM.write("<div id='" + oItem.getId() + "-tab' class='sapMITBTab'>");

				if (!oItem.getShowAll() || !oItem.getIcon()) {
					oRM.renderControl(oItem._getImageControl(['sapMITBFilterIcon', 'sapMITBFilter' + oItem.getIconColor()], oControl, IconTabHeaderRenderer._aAllIconColors));
				}

				if (!oItem.getShowAll() && !oItem.getIcon() && !bTextOnly)  {
					oRM.write("<span class='sapMITBFilterNoIcon'> </span>");
				}

				if (oItem.getDesign() === sap.m.IconTabFilterDesign.Horizontal) {
					oRM.write("</div>");
					oRM.write("<div class='sapMITBHorizontalWrapper'>");
				}

				oRM.write("<span id='" + oItem.getId() + "-count' ");
				oRM.addClass("sapMITBCount");
				oRM.writeClasses();
				oRM.write(">");

				if ((oItem.getCount() === "") && (oItem.getDesign() === sap.m.IconTabFilterDesign.Horizontal)) {
					//this is needed for the correct placement of the text in the horizontal design
					oRM.write("&nbsp;");
				} else {
					oRM.writeEscaped(oItem.getCount());
				}

				oRM.write("</span>");

				if (oItem.getDesign() === sap.m.IconTabFilterDesign.Vertical) {
					oRM.write("</div>");
				}

				if (oItem.getText().length) {
					oRM.write("<div id='" + oItem.getId() + "-text' ");
					oRM.addClass("sapMITBText");
					// Check for upperCase property on IconTabBar
					if (bUpperCase) {
						oRM.addClass("sapMITBTextUpperCase");
					}
					oRM.writeClasses();
					oRM.write(">");
					oRM.writeEscaped(oItem.getText());
					oRM.write("</div>");
				}

				if (oItem.getDesign() === sap.m.IconTabFilterDesign.Horizontal) {
					oRM.write("</div>");
				}

				oRM.write("<div class='sapMITBContentArrow'></div>");

			} else { // separator
				oRM.addClass("sapMITBSep");

				if (!oItem.getIcon()) {
					oRM.addClass("sapMITBSepLine");
				}
				oRM.writeClasses();
				oRM.write(">");

				if (oItem.getIcon()) {
					oRM.renderControl(oItem._getImageControl(['sapMITBSepIcon'], oControl));
				}
			}
			oRM.write("</div>");
		});

		oRM.write("</div>");

		if (oControl._bDoScroll) {
			oRM.write("</div>"); //scrollContainer
		}

		// render right scroll arrow
		oRM.renderControl(oControl._getScrollingArrow("right"));

		// end wrapper div
		oRM.write("</div>");
	};

	return IconTabHeaderRenderer;

}, /* bExport= */ true);
