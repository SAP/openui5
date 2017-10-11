/*!
 * ${copyright}
 */

sap.ui.define(['sap/m/library'],
	function(library) {
	"use strict";

	// shortcut for sap.m.IconTabFilterDesign
	var IconTabFilterDesign = library.IconTabFilterDesign;

	/**
		 * HBox renderer.
		 * @namespace
		 */
	var IconTabHeaderRenderer = {
	};

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
			iItemsCount = aItems.length,
			aVisibleTabFilters = oControl.getVisibleTabFilters(),
			iVisibleTabFiltersCount = aVisibleTabFilters.length,
			iVisibleTabFilterIndex = 0,
			bTextOnly = oControl._checkTextOnly(aItems),
			bNoText = oControl._checkNoText(aItems),
			bInLine = oControl._checkInLine(aItems) || oControl.isInlineMode(),
			bShowOverflowSelectList = oControl.getShowOverflowSelectList(),
			oItem,
			bIsHorizontalDesign,
			bHasHorizontalDesign;

		var oIconTabBar = oControl.getParent();
		var bUpperCase = oIconTabBar && oIconTabBar instanceof sap.m.IconTabBar && oIconTabBar.getUpperCase();

		// render wrapper div
		oRM.write("<div role='tablist' ");
		oRM.addClass("sapMITH");
		oRM.addClass("sapContrastPlus");
		oRM.addClass("sapMITHBackgroundDesign" + oControl.getBackgroundDesign());

		if (bShowOverflowSelectList) {
			oRM.addClass("sapMITHOverflowList");
		}

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
		oRM.write("<div id='" + oControl.getId() + "-scrollContainer' aria-hidden='true' class='sapMITBScrollContainer'>");

		oRM.write("<div id='" + oControl.getId() + "-head' aria-hidden='true' ");
		oRM.addClass("sapMITBHead");

		if (bTextOnly) {
			oRM.addClass("sapMITBTextOnly");
		}

		if (bNoText) {
			oRM.addClass("sapMITBNoText");
		}

		if (bInLine) {
			oRM.addClass("sapMITBInLine");
		}

		oRM.writeClasses();
		oRM.write(">");

		for (var i = 0; i < iItemsCount; i++) {
			oItem = aItems[i];

			oItem.render(oRM, iVisibleTabFilterIndex, iVisibleTabFiltersCount);

			if (oItem instanceof sap.m.IconTabFilter) {
				bIsHorizontalDesign = oItem.getDesign() === IconTabFilterDesign.Horizontal;
				if (bIsHorizontalDesign) {
					bHasHorizontalDesign = true;
				}

				if (oItem.getVisible()) {
					iVisibleTabFilterIndex++;
				}
			}
		}

		oRM.write("</div>");

		oRM.write("</div>"); //scrollContainer

		// render right scroll arrow
		oRM.renderControl(oControl._getScrollingArrow("right"));

		// render overflow button
		if (bShowOverflowSelectList) {
			var oOverflowButton = oControl._getOverflowButton();
			if (bInLine) {
				oOverflowButton.addStyleClass('sapMBtnInline');
			} else if (bTextOnly) {
				oOverflowButton.addStyleClass('sapMBtnTextOnly');
			} else if (bNoText || bHasHorizontalDesign) {
				oOverflowButton.addStyleClass('sapMBtnNoText');
			}

			oRM.renderControl(oOverflowButton);
		}

		// end wrapper div
		oRM.write("</div>");
	};


	return IconTabHeaderRenderer;

}, /* bExport= */ true);
