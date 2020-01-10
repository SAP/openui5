/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/library"
], function (library) {
	"use strict";

	// shortcut for sap.m.IconTabFilterDesign
	var IconTabFilterDesign = library.IconTabFilterDesign;

	/**
	 * IconTabHeader renderer.
	 * @namespace
	 */
	var IconTabHeaderRenderer = {};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRM the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	IconTabHeaderRenderer.render = function (oRM, oControl) {
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
		oRM.write("<div");
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

		oRM.write('<div class="sapMITHWrapper">');
		oRM.write("<div id='" + oControl.getId() + "-scrollContainer' class='sapMITHScrollContainer'>");

		// render left scroll button
		this._renderArrowButton(oRM, oControl, oControl._ARROWS.Left, bTextOnly, bInLine);

		oRM.write('<div id="' + oControl.getId() + '-scrollContainerInner" class="sapMITHScrollContainerInner">');

		oRM.write("<div id='" + oControl.getId() + "-head' role='tablist' ");
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

		oRM.write("</div>"); // close head
		oRM.write("</div>"); // close .sapMITHScrollContainerInner

		// render right scroll arrow
		this._renderArrowButton(oRM, oControl, oControl._ARROWS.Right, bTextOnly, bInLine);

		// render overflow button
		if (bShowOverflowSelectList) {
			this._renderOverflowButton(oRM, oControl, bInLine, bTextOnly, bNoText, bHasHorizontalDesign);
		}

		oRM.write("</div>"); // close scrollContainer
		oRM.write("</div>"); // close sapMITHWrapper

		oRM.write("</div>"); // close ITH
	};

	IconTabHeaderRenderer._renderArrowButton = function (oRM, oControl, sDirection, bTextOnly, bInLine) {
		var sArrowClass = "sapMITBArrowScroll";
		var oArrowButton = oControl._getScrollButton(sDirection);

		var aCssClasses = ["sapMITBArrowScroll"];

		sArrowClass += sDirection;

		if (bTextOnly) {
			aCssClasses.push(sArrowClass + "TextOnly");
		} else {
			aCssClasses.push(sArrowClass);
		}
		if (bInLine || oControl.isInlineMode()) {
			aCssClasses.push(sArrowClass + "InLine");
		}
		oRM.write("<div");
		oRM.addClass(aCssClasses.join(" "));
		oRM.writeClasses();
		oRM.write(">");

		oRM.renderControl(oArrowButton);

		oRM.write("</div>");
	};

	IconTabHeaderRenderer._renderOverflowButton = function (oRM, oControl, bInLine, bTextOnly, bNoText, bHasHorizontalDesign) {

		oRM.write('<div');
		oRM.addClass('sapMITHOverflowButton');

		if (bInLine) {
			oRM.addClass('sapMBtnInline');
		} else if (bTextOnly) {
			oRM.addClass('sapMBtnTextOnly');
		} else if (bNoText || bHasHorizontalDesign) {
			oRM.addClass('sapMBtnNoText');
		}

		oRM.writeClasses();
		oRM.write(">");

		var oOverflowButton = oControl._getOverflowButton();

		oRM.renderControl(oOverflowButton);

		oRM.write('</div>');
	};

	return IconTabHeaderRenderer;

}, /* bExport= */ true);