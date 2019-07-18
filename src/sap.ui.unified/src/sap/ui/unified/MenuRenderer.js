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

		oRm.write("<div");
		oRm.writeAttribute("tabindex", -1);
		oRm.writeAttribute("hideFocus", true);

		if (oMenu.getTooltip_AsString()) {
			oRm.writeAttributeEscaped("title", oMenu.getTooltip_AsString());
		}

		// ARIA
		if (bAccessible) {
			oRm.writeAccessibilityState(oMenu, {
				disabled: null,
				labelledby: {value: oMenu.getId() + "-label", append: true}
			});
		}

		oRm.addClass("sapUiMnu");

		if (oRootMenu.bUseTopStyle) {
			oRm.addClass("sapUiMnuTop");
		}

		if (oRootMenu.isCozy()) {
			oRm.addClass("sapUiSizeCozy");
		}

		if (oMenu.bCozySupported) {
			oRm.addClass("sapUiMnuCozySupport");
		}

		oRm.writeClasses();
		oRm.writeControlData(oMenu);
		oRm.write(">");
		MenuRenderer.renderItems(oRm, oMenu);
		if (bAccessible) {
			/*var _getText = function(sKey, aArgs) {
				var rb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.unified");
				if (rb) {
					return rb.getText(sKey, aArgs);
				}
				return sKey;
			};*/

			oRm.write("<span id='" + oMenu.getId() + "-label' class='sapUiInvisibleText' aria-hidden='true'>");
			oRm.writeEscaped(oMenu.getAriaDescription() ? oMenu.getAriaDescription() : ""/*_getText("MNU_ARIA_NAME")*/);
			oRm.write("</span>");
		}
		oRm.write("</div>");
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

		oRm.write("<ul");
		oRm.writeAttribute("role", "menu");
		oRm.addClass("sapUiMnuLst");

		for (i = 0; i < aItems.length; i++) {
			if (aItems[i].getIcon && aItems[i].getIcon()) {
				bHasIcons = true;
			}
			if (aItems[i].getSubmenu()) {
				bHasSubMenus = true;
			}
		}

		if (!bHasIcons) {
			oRm.addClass("sapUiMnuNoIco");
		}
		if (!bHasSubMenus) {
			oRm.addClass("sapUiMnuNoSbMnu");
		}

		oRm.writeClasses();
		oRm.write(">");

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
					oRm.write("<li");
					if (bAccessible) {
						oRm.writeAttribute("role", "separator");
					}
					oRm.addClass("sapUiMnuDiv");
					oRm.writeClasses();
					oRm.write(">");

					oRm.write("<div");
					oRm.addClass("sapUiMnuDivL");
					oRm.writeClasses();
					oRm.write(">");
					oRm.write("</div>");

					oRm.write("<hr>");

					oRm.write("<div");
					oRm.addClass("sapUiMnuDivR");
					oRm.writeClasses();
					oRm.write(">");
					oRm.write("</div>");

					oRm.write("</li>");
				}

				oItem.render(oRm, oItem, oMenu, {bAccessible: bAccessible, iItemNo: index, iTotalItems: iNumberOfVisibleItems});
			}
		}

		oRm.write("</ul>");
	};

	return MenuRenderer;

}, /* bExport= */ true);
