/*!
 * ${copyright}
 */

// Provides the default renderer for control sap.tnt.NavigationList
sap.ui.define([
	"sap/ui/core/Lib"
], function (Lib) {
	"use strict";

	/**
	 * NavigationListRenderer renderer.
	 *
	 * @author SAP SE
	 * @namespace
	 */
	const NavigationListRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRM The RenderManager that can be used for writing to the renderer output buffer
	 * @param {sap.tnt.NavigationList} oControl An object representation of the control that should be rendered
	 */
	NavigationListRenderer.render = function (oRM, oControl) {
		const oResourceBundle = Lib.getResourceBundleFor("sap.tnt"),
			bExpanded = oControl.getExpanded(),
			bHasItemWithIcon = oControl._containsIcon(),
			aVisibleItems = oControl._getVisibleItems();

		oRM.openStart("ul", oControl)
			.class("sapTntNL");

		if (!bExpanded) {
			oRM.class("sapTntNLCollapsed");
		}

		if (!bHasItemWithIcon) {
			oRM.class("sapTntNLNoIcons");
		}

		var sWidth = oControl.getWidth();
		if (sWidth && bExpanded) {
			oRM.style("width", sWidth);
		}

		// ARIA
		const oParent = oControl.getParent();
		const bIsFixed = oParent.getAggregation("fixedItem") && oParent.getAggregation("fixedItem") === oControl;
		const bIsMenubar = !bExpanded && !oControl.hasStyleClass("sapTntNLPopup");
		let sListLabelKey;
		if (bIsFixed) {
			sListLabelKey = "SIDE_NAVIGATION_FIXED_LIST_LABEL";
		} else if (bIsMenubar) {
			// Collapsed flexible list renders as a menubar and uses a dedicated label.
			sListLabelKey = "SIDE_NAVIGATION_FLEXIBLE_LIST_LABEL_COLLAPSED";
		} else {
			sListLabelKey = "SIDE_NAVIGATION_FLEXIBLE_LIST_LABEL";
		}
		const sListLabel = oResourceBundle.getText(sListLabelKey);

		const sRole = bIsMenubar ? "menubar" : "tree";
		oRM.accessibilityState(oControl, {
			role: sRole,
			orientation: sRole === "menubar" ? "vertical" : undefined,
			label: sListLabel
		});

		oRM.openEnd();

		if (!aVisibleItems.length && oControl.getHighlightedText() && bExpanded) {
			NavigationListRenderer.renderNoData(oRM, oControl);
		} else {
			const oFirstGroup = aVisibleItems.find((oItem) => oItem.isA("sap.tnt.NavigationListGroup"));
			aVisibleItems.forEach((oItem) => {
				oItem.render(oRM, oControl, oItem === oFirstGroup);
			});

			if (!bExpanded) {
				oControl._getOverflowItem()?.render(oRM, oControl);
			}
		}

		oRM.close("ul");
	};

	NavigationListRenderer.renderNoData = function (oRM, oControl) {
		oRM.openStart("li", oControl.getId() + "-nodata");
		oRM.attr("role", "none");
		oRM.openEnd();

		oRM.openStart("div");
		oRM.class("sapTntNLI");
		oRM.class("sapTntNLIFirstLevel");
		oRM.class("sapTntNLIDisabled");
		oRM.class("sapTntNLNoData");
		oRM.openEnd();

		oRM.openStart("div");
		oRM.attr("tabindex", "0");
		oRM.attr("role", "treeitem");
		oRM.openEnd();
		oRM.text(Lib.getResourceBundleFor("sap.tnt").getText("SIDE_NAVIGATION_SEARCH_MATCHES_FOUND", [0]));
		oRM.close("div");

		oRM.close("div");
		oRM.close("li");
	};

	return NavigationListRenderer;
});