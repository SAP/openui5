/*!
 * ${copyright}
 */

// Provides default renderer for control sap.ui.unified.Menu
sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";


	
	/**
	 * @class Menu renderer.
	 * @author SAP - TD Core UI&AM UI Infra
	 *
	 * @version ${version}
	 * @static
	 */
	var MenuRenderer = {
	};
	
	/**
	 * Renders the HTML for the given control, using the provided
	 * {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager}
	 *            oRenderManager The RenderManager that can be used for writing to the render-output-buffer.
	 * @param {sap.ui.core.Control}
	 *            oMenu An object representation of the control that should be rendered
	 */
	MenuRenderer.render = function(rm, oMenu) {
		if (oMenu.oHoveredItem && oMenu.indexOfItem(oMenu.oHoveredItem) < 0) {
			//Hover item not valid anymore
			oMenu.oHoveredItem = null;
		}
		
		rm.write("<div tabindex=\"-1\" hideFocus=\"true\"");
	
		if (oMenu.getTooltip_AsString()) {
			rm.writeAttributeEscaped("title", oMenu.getTooltip_AsString());
		}
	
		// ARIA
		var bAccessible = sap.ui.getCore().getConfiguration().getAccessibility();
		if (bAccessible) {
			rm.writeAttribute("aria-orientation", "vertical");
			rm.writeAttribute("role", "menu");
	
			var _getText = function(sKey, aArgs) {
				var rb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.unified");
				if (rb) {
					return rb.getText(sKey, aArgs);
				}
				return sKey;
			};
	
			rm.writeAttributeEscaped("aria-label", oMenu.getAriaDescription() ? oMenu.getAriaDescription() : _getText("MNU_ARIA_NAME"));
			rm.writeAttribute("aria-level", oMenu.getMenuLevel());
			if (oMenu.oHoveredItem) {
				rm.writeAttribute("aria-activedescendant", oMenu.oHoveredItem.getId());
			}
		}
	
		rm.addClass("sapUiMnu");
		if (oMenu.getRootMenu().bUseTopStyle) {
			rm.addClass("sapUiMnuTop");
		}
		rm.writeClasses();
		rm.writeControlData(oMenu);
		rm.write(">");
		MenuRenderer.renderItems(rm, oMenu);
		rm.write("</div>");
	};
	
	MenuRenderer.renderItems = function(rm, oMenu) {
		var aItems = oMenu.getItems();
		var bAccessible = sap.ui.getCore().getConfiguration().getAccessibility();
		
		rm.write("<ul class=\"sapUiMnuLst");
	
		var bHasIcons = false;
		var bHasSubMenus = false;
		for (var idx = 0; idx < aItems.length; idx++) {
			if (aItems[idx].getIcon && aItems[idx].getIcon()) {
				bHasIcons = true;
			}
			if (aItems[idx].getSubmenu()) {
				bHasSubMenus = true;
			}
		}
	
		if (!bHasIcons) {
			rm.write(" sapUiMnuNoIco");
		}
		if (!bHasSubMenus) {
			rm.write(" sapUiMnuNoSbMnu");
		}
	
		rm.write("\">");
	
		var iNumberOfVisibleItems = 0;
		for (var i = 0;i < aItems.length;i++) {
			if (aItems[i].getVisible() && aItems[i].render) {
				iNumberOfVisibleItems++;
			}
		}
	
		var index = 0;
		// Menu items
		for (var i = 0;i < aItems.length;i++) {
			var oItem = aItems[i];
			if (oItem.getVisible() && oItem.render) {
				index++;
	
				if (oItem.getStartsSection()) {
					rm.write("<li ");
					if (bAccessible) {
						rm.write("role=\"separator\" ");
					}
					rm.write("class=\"sapUiMnuDiv\"><div class=\"sapUiMnuDivL\"></div><hr><div class=\"sapUiMnuDivR\"></div></li>");
				}
	
				oItem.render(rm, oItem, oMenu, {bAccessible: bAccessible, iItemNo: index, iTotalItems: iNumberOfVisibleItems});
			}
		}
	
		rm.write("</ul>");
	};

	return MenuRenderer;

}, /* bExport= */ true);
