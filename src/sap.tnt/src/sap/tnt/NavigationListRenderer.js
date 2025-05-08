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
		const bExpanded = oControl.getExpanded(),
			bHasItemWithIcon = oControl._containsIcon(),
			aVisibleItems = oControl.getItems().filter((oItem) => oItem.getVisible());

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
		const sRole = !bExpanded && !oControl.hasStyleClass("sapTntNLPopup") ? "menubar" : "tree";
		const oParent = oControl.getParent();
		const bIsFixed = oParent.getAggregation("fixedItem") && oParent.getAggregation("fixedItem") === oControl;
		oRM.accessibilityState(oControl, {
			role: sRole,
			orientation: sRole === "menubar" ? "vertical" : undefined,
			roledescription: Lib.getResourceBundleFor("sap.tnt").getText(
				sRole === "menubar" ?
					"NAVIGATION_LIST_ITEM_ROLE_DESCRIPTION_MENUBAR" :
					"NAVIGATION_LIST_ITEM_ROLE_DESCRIPTION_TREE"),
			label: Lib.getResourceBundleFor("sap.tnt").getText(
				bIsFixed ?
					"SIDE_NAVIGATION_FIXED_LIST_LABEL" :
					"SIDE_NAVIGATION_FLEXIBLE_LIST_LABEL")
		});

		oRM.openEnd();

		const oFirstGroup = aVisibleItems.find((oItem) => oItem.isA("sap.tnt.NavigationListGroup"));
		aVisibleItems.forEach((oItem) => {
			oItem.render(oRM, oControl, oItem === oFirstGroup);
		});

		if (!bExpanded) {
			oControl._getOverflowItem().render(oRM, oControl);
		}

		oRM.close("ul");
	};

	return NavigationListRenderer;
});