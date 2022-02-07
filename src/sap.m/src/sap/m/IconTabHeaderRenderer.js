/*!
 * ${copyright}
 */

sap.ui.define(['./library'],
		function (library) {
	"use strict";

	/**
	 * IconTabHeader renderer.
	 * @namespace
	 */
	var IconTabHeaderRenderer = {
		apiVersion: 2
	};

	// shortcut for sap.m.TabsOverflowMode
	var TabsOverflowMode = library.TabsOverflowMode;

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRM the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.IconTabHeader} oControl an object representation of the control that should be rendered
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
			bInLine = oControl._checkInLine(aItems) || oControl.isInlineMode();

		var oIconTabBar = oControl.getParent(),
			bUpperCase = oIconTabBar && oIconTabBar.isA('sap.m.IconTabBar') && oIconTabBar.getUpperCase(),
			mAriaTexts = oControl.getAriaTexts() || {};

		// render wrapper div
		oRM.openStart("div", oControl)
			.class("sapMITH")
			.class("sapContrastPlus")
			.class("sapMITHBackgroundDesign" + oControl.getBackgroundDesign());

		// Check for upperCase property on IconTabBar
		if (bUpperCase) {
			oRM.class("sapMITBTextUpperCase");
		}

		if (bTextOnly) {
			oRM.class("sapMITBTextOnly");
		}

		if (bNoText) {
			oRM.class("sapMITBNoText");
		}

		if (bInLine) {
			oRM.class("sapMITBInLine");
			oRM.class("sapMITBTextOnly");
		}

		oRM.accessibilityState(oControl, {
			role: "navigation"
		});

		if (mAriaTexts.headerLabel) {
			oRM.accessibilityState(oControl, {
				label: mAriaTexts.headerLabel
			});
		}

		oRM.openEnd();

		if (aItems.length && oControl.getTabsOverflowMode() === TabsOverflowMode.StartAndEnd) {
			oRM.openStart("div")
				.class("sapMITHStartOverflow")
				.openEnd();

			oControl._getStartOverflow().render(oRM);

			oRM.close("div");
		}

		if (mAriaTexts.headerDescription) {
			oRM.renderControl(oControl._getInvisibleHeadText());
		}

		oRM.openStart("div", sId + "-head")
			.class("sapMITBHead");

		oRM.accessibilityState({
			role: "tablist",
			orientation: "horizontal"
		});

		if (mAriaTexts.headerDescription) {
			oRM.accessibilityState({
				describedby: oControl._getInvisibleHeadText().getId()
			});
		}

		oRM.openEnd();

		for (var i = 0; i < aItems.length; i++) {
			var oItem = aItems[i];
			oItem.render(oRM, iVisibleTabFilterIndex, iVisibleTabFiltersCount);

			if (oItem.isA("sap.m.IconTabFilter")) {
				if (oItem.getVisible()) {
					iVisibleTabFilterIndex++;
				}
			}
		}

		oRM.close("div");

		if (aItems.length) {
			oRM.openStart("div")
				.class("sapMITHEndOverflow")
				.openEnd();

			oControl._getOverflow().render(oRM);

			oRM.close("div");
		}

		oRM.close("div");
	};

	return IconTabHeaderRenderer;
}, /* bExport= */ true);