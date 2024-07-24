/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.unified.Menu
sap.ui.define(["sap/ui/core/ControlBehavior"], function(ControlBehavior) {
"use strict";



/**
 * Menu renderer.
 * @author SAP - TD Core UI&AM UI Infra
 *
 * @version ${version}
 * @namespace
 */
var MenuRenderer = {
	apiVersion: 2
};

/**
 * Renders the HTML for the given control, using the provided
 * {@link sap.ui.core.RenderManager}.
 *
 * @param {sap.ui.core.RenderManager}
 *            oRm The RenderManager that can be used for writing to the render-output-buffer.
 * @param {sap.ui.unified.Menu}
 *            oMenu An object representation of the control that should be rendered
 */
MenuRenderer.render = function(oRm, oMenu) {
	var bAccessible = ControlBehavior.isAccessibilityEnabled(),
		oRootMenu = oMenu.getRootMenu();

	if (oMenu.oHoveredItem && oMenu.indexOfItem(oMenu.oHoveredItem) < 0) {
		//Hover item not valid anymore
		oMenu.oHoveredItem = null;
	}

	oRm.openStart("div", oMenu);
	oRm.attr("tabindex", -1);
	oRm.attr("hideFocus", true);

	if (oMenu.getTooltip_AsString()) {
		oRm.attr("title", oMenu.getTooltip_AsString());
	}

	// ARIA
	if (bAccessible) {
		oRm.accessibilityState(oMenu, {
			disabled: null
		});
	}

	oRm.class("sapUiMnu");

	//do not remove - the class is only to distinguish between menu and submenu
	if (oMenu.isSubMenu()) {
		oRm.class("sapUiSubmenu");
	}

	if (oRootMenu.bUseTopStyle) {
		oRm.class("sapUiMnuTop");
	}

	oRm.openEnd();
	MenuRenderer.renderItems(oRm, oMenu);
	oRm.close("div");
};

MenuRenderer.renderItems = function(oRm, oMenu) {
	var aItems = oMenu._getItems(),
		bAccessible = ControlBehavior.isAccessibilityEnabled(),
		bHasIcons = false,
		bHasSubMenus = false,
		iNumberOfVisibleItems = 0,
		index = 0,
		i,
		oItem,
		sCurrentGroup = null,
		sItemGroup = null,
		bGroupOpened = false,
		oSubmenu;

	oRm.openStart("ul");
	oRm.attr("role", "menu");
	oRm.class("sapUiMnuLst");

	for (i = 0; i < aItems.length; i++) {
		oSubmenu = aItems[i].getSubmenu();
		if (aItems[i].getIcon && aItems[i].getIcon()) {
			bHasIcons = true;
		}
		if (oSubmenu && oSubmenu._getItems().length) {
			bHasSubMenus = true;
		}
	}

	if (!bHasIcons) {
		oRm.class("sapUiMnuNoIco");
	}
	if (!bHasSubMenus) {
		oRm.class("sapUiMnuNoSbMnu");
	}

	oRm.openEnd();

	for (i = 0; i < aItems.length; i++) {
		if (aItems[i].getVisible() && aItems[i].render) {
			iNumberOfVisibleItems++;
		}
	}

	// Menu items
	for (i = 0; i < aItems.length; i++) {
		oItem = aItems[i];
		if (oItem.getVisible() && oItem.render) {
			index++;
			sItemGroup = oItem.getAssociation("_group");

			if (bGroupOpened && sCurrentGroup !== sItemGroup) {
				// group closing tag
				oRm.close("div");
				bGroupOpened = false;
			}
			if (sItemGroup && !bGroupOpened) {
				oRm.openStart("div");
				oRm.attr("role", "group");
				oRm.openEnd();
				bGroupOpened = true;
			}

			if ((sCurrentGroup !== sItemGroup || oItem.getStartsSection()) && index !== 1) {
				MenuRenderer.renderSeparator(oRm, bAccessible);
			}
			sCurrentGroup = sItemGroup;

			oItem.render(oRm, oItem, oMenu, {bAccessible: bAccessible, iItemNo: index, iTotalItems: iNumberOfVisibleItems});
		}
	}

	if (bGroupOpened) {
		oRm.close("div");
	}

	oRm.close("ul");
};

MenuRenderer.renderSeparator = function(oRm, bAccessible) {
	oRm.openStart("li");
	if (bAccessible) {
		oRm.attr("role", "separator");
	}
	oRm.class("sapUiMnuDiv");
	oRm.openEnd();

	oRm.openStart("div");
	oRm.class("sapUiMnuDivL");
	oRm.openEnd();
	oRm.close("div");

	oRm.voidStart("hr").voidEnd();

	oRm.openStart("div");
	oRm.class("sapUiMnuDivR");
	oRm.openEnd();
	oRm.close("div");

	oRm.close("li");
};

return MenuRenderer;

});
