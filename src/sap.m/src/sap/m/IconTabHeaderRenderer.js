/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/m/library"
], function (library) {
	"use strict";

	// shortcut for sap.m.IconTabFilterDesign
	var IconTabFilterDesign = library.IconTabFilterDesign,
		oRb = sap.ui.getCore().getLibraryResourceBundle("sap.m");

	/**
	 * IconTabHeader renderer.
	 * @namespace
	 */
	var IconTabHeaderRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRM the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.core.Control} oControl an object representation of the control that should be rendered
	 */
	IconTabHeaderRenderer.render = function (oRM, oControl) {
		if (!oControl.getVisible()) {
			return;
		}

		var sId = oControl.getId(),
			aItems = oControl.getItems(),
			iVisibleTabFiltersCount = oControl.getVisibleTabFilters().length,
			iVisibleTabFilterIndex = 0,
			bTextOnly = oControl._checkTextOnly(),
			bNoText = oControl._checkNoText(aItems),
			bInLine = oControl._checkInLine(aItems) || oControl.isInlineMode(),
			bHasHorizontalDesign;

		var oIconTabBar = oControl.getParent();
		var bUpperCase = oIconTabBar && oIconTabBar instanceof sap.m.IconTabBar && oIconTabBar.getUpperCase();

		// render wrapper div
		oRM.openStart("div", oControl)
			.class("sapMITH")
			.class("sapMITHOverflowList")
			.class("sapContrastPlus")
			.class("sapMITHBackgroundDesign" + oControl.getBackgroundDesign());

		// Check for upperCase property on IconTabBar
		if (bUpperCase) {
			oRM.class("sapMITBTextUpperCase");
		}

		oRM.accessibilityState(oControl, {
			role: "navigation",
			label: oRb.getText("ICONTABHEADER_LABEL")
		});

		oRM.openEnd();

		oRM.openStart("div", sId + "-scrollContainer")
			.class("sapMITHScrollContainer")
			.openEnd();

		oRM.renderControl(oControl._oAriaHeadText);
		oRM.openStart("div", sId + "-head")
			.class("sapMITBHead");

		oRM.accessibilityState({
			role: "tablist",
			orientation: "horizontal",
			describedby: oControl.getId() + "-ariaHeadText"
		});

		if (bTextOnly) {
			oRM.class("sapMITBTextOnly");
		}

		if (bNoText) {
			oRM.class("sapMITBNoText");
		}

		if (bInLine) {
			oRM.class("sapMITBInLine");
		}

		oRM.openEnd();

		for (var i = 0; i < aItems.length; i++) {
			var oItem = aItems[i];
			oItem.render(oRM, iVisibleTabFilterIndex, iVisibleTabFiltersCount);

			if (oItem.isA("sap.m.IconTabFilter")) {
				if (oItem.getDesign() === IconTabFilterDesign.Horizontal) {
					bHasHorizontalDesign = true;
				}

				if (oItem.getVisible()) {
					iVisibleTabFilterIndex++;
				}
			}
		}

		oRM.close("div"); // close head

		this._renderOverflowButton(oRM, oControl, bInLine, bTextOnly, bNoText, bHasHorizontalDesign);

		oRM.close("div") // close scrollContainer
			.close("div"); // close ITH
	};

	IconTabHeaderRenderer._renderOverflowButton = function (oRM, oControl, bInLine, bTextOnly, bNoText, bHasHorizontalDesign) {

		oRM.openStart("div")
			.class("sapMITHOverflowButton");

		if (bInLine) {
			oRM.class("sapMBtnInline");
		} else if (bTextOnly) {
			oRM.class("sapMBtnTextOnly");
		} else if (bNoText || bHasHorizontalDesign) {
			oRM.class("sapMBtnNoText");
		}

		oRM.openEnd()
			.renderControl(oControl._getOverflowButton())
			.close("div");
	};

	return IconTabHeaderRenderer;
}, /* bExport= */ true);