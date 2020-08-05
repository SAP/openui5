/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.unified.Menu
sap.ui.define([],
	function() {
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
	 * @param {sap.ui.core.Control}
	 *            oMenu An object representation of the control that should be rendered
	 */
	MenuRenderer.render = function(oRm, oMenu) {
		var bAccessible = sap.ui.getCore().getConfiguration().getAccessibility(),
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
				disabled: null,
				labelledby: {value: oMenu.getId() + "-label", append: true}
			});
		}

		oRm.class("sapUiMnu");

		if (oRootMenu.bUseTopStyle) {
			oRm.class("sapUiMnuTop");
		}

		if (oRootMenu.isCozy()) {
			oRm.class("sapUiSizeCozy");
		}

		if (oMenu.bCozySupported) {
			oRm.class("sapUiMnuCozySupport");
		}

		oRm.openEnd();
		MenuRenderer.renderItems(oRm, oMenu);
		if (bAccessible) {
			/*var _getText = function(sKey, aArgs) {
				var rb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.unified");
				if (rb) {
					return rb.getText(sKey, aArgs);
				}
				return sKey;
			};*/

			oRm.openStart("span", oMenu.getId() + "-label");
			oRm.class("sapUiInvisibleText");
			oRm.attr("aria-hidden", true);
			oRm.openEnd();
			oRm.text(oMenu.getAriaDescription() ? oMenu.getAriaDescription() : ""/*_getText("MNU_ARIA_NAME")*/);
			oRm.close("span");
		}
		oRm.close("div");
	};

	MenuRenderer.renderItems = function(oRm, oMenu) {
		var aItems = oMenu.getItems(),
			bAccessible = sap.ui.getCore().getConfiguration().getAccessibility(),
			bHasIcons = false,
			bHasSubMenus = false,
			iNumberOfVisibleItems = 0,
			index = 0,
			i,
			oItem;

		oRm.openStart("ul");
		oRm.attr("role", "menu");
		oRm.class("sapUiMnuLst");

		for (i = 0; i < aItems.length; i++) {
			if (aItems[i].getIcon && aItems[i].getIcon()) {
				bHasIcons = true;
			}
			if (aItems[i].getSubmenu()) {
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

		iNumberOfVisibleItems = 0;
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

				if (oItem.getStartsSection()) {
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
				}

				oItem.render(oRm, oItem, oMenu, {bAccessible: bAccessible, iItemNo: index, iTotalItems: iNumberOfVisibleItems});
			}
		}

		oRm.close("ul");
	};

	return MenuRenderer;

}, /* bExport= */ true);
