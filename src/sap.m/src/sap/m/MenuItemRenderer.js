/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/core/library'
], function(
	coreLibrary
) {
	"use strict";

	// Shortcut for sap.ui.core.ItemSelectionMode
	const ItemSelectionMode = coreLibrary.ItemSelectionMode;

	/**
	 * MenuItem renderer.
	 * @namespace
	 */
	const MenuItemRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided
	 * {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.m.MenuItem} oItem the menu item to be rendered
	 */
	MenuItemRenderer.render = function(oRm, oItem) {
		const bHasSubmenu = !!oItem._getVisibleItems().length;

		oRm.openStart("li", oItem);

		// HTML attributes
		this.renderAttributes(oRm, oItem);
		// CSS classes
		this.renderStyleClasses(oRm, oItem);
		// Inline styles
		this.renderInlineStyles(oRm, oItem);
		// Add ARIA attributes
		this.setAccessibilityAttributes(oRm, oItem);

		oRm.openEnd();

		// Icon column
		this.renderIcon(oRm, oItem);
		// Text column
		this.renderText(oRm, oItem);

		if (bHasSubmenu) {
			// Submenu arrow column
			this.renderSubmenuArrow(oRm, oItem);
		} else {
			// Shortcut column
			this.renderShortcut(oRm, oItem);
			// End content column
			this.renderEndContent(oRm, oItem);
			// Selection mark column
			this.renderSelectionMark(oRm, oItem);
		}

		oRm.close("li");
	};

	/**
	 * Renders the HTML attributes for the given control.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.m.MenuItem} oItem the menu item to be rendered
	 */
	MenuItemRenderer.renderAttributes = function(oRm, oItem) {
		if (oItem.getTooltip_AsString()) {
			oRm.attr("title", oItem.getTooltip_AsString());
		}

		if (oItem.getVisible() && oItem.isFocusable && oItem.isFocusable()) {
			oRm.attr("tabindex", "0");
		}
	};

	/**
	 * Renders the CSS classes for the given control.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.m.MenuItem} oItem the menu item to be rendered
	 */
	MenuItemRenderer.renderStyleClasses = function(oRm, oItem) {
		const bIsEnabled = oItem.getEnabled();

		oRm.class("sapMMenuItem");
		if (!bIsEnabled) {
			oRm.class("sapMMenuItemDisabled");
		}
	};

	/**
	 * Hook for rendering the inline styles of the control.
	 * Hook for the subclasses.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.m.MenuItem} oItem the menu item to be rendered
	 */
	MenuItemRenderer.renderInlineStyles = function(oRm, oItem) {
	};

	/**
	 * Sets the accessibility attributes for the given control.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.m.MenuItem} oItem the menu item to be rendered
	 */
	MenuItemRenderer.setAccessibilityAttributes = function(oRm, oItem) {
		oRm.accessibilityState(oItem._getAccessibilityAttributes());
	};

	/**
	 * Renders the icon column for the given control.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.m.MenuItem} oItem the menu item to be rendered
	 */
	MenuItemRenderer.renderIcon = function(oRm, oItem) {
		oRm.openStart("div");
		oRm.class("sapMMenuItemIcon");
		oRm.openEnd();

		if (oItem.getIcon()) {
			const oIcon = oItem._getIcon();
			oRm.renderControl(oIcon);
		}

		oRm.close("div");
	};

	/**
	 * Renders the text column for the given control.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.m.MenuItem} oItem the menu item to be rendered
	 */
	MenuItemRenderer.renderText = function(oRm, oItem) {
		oRm.openStart("div", `${oItem.getId()}-txt`);
		oRm.class("sapMMenuItemText");
		oRm.openEnd();
		oRm.text(oItem.getText());
		oRm.close("div");
	};

	/**
	 * Renders the shortcut column for the given control (if necessary).
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.m.MenuItem} oItem the menu item to be rendered
	 */
	MenuItemRenderer.renderShortcut = function(oRm, oItem) {
		const sShortcutText = oItem.getShortcutText();

		if (sShortcutText) {
			oRm.openStart("div", `${oItem.getId()}-scuttxt`);
			oRm.class("sapMMenuItemShortcut");
			oRm.openEnd();
			oRm.text(sShortcutText);
			oRm.close("div");
		}
	};

	/**
	 * Renders the submenu arrow column for the given control.
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.m.MenuItem} oItem the menu item to be rendered
	 */
	MenuItemRenderer.renderSubmenuArrow = function(oRm, oItem) {
		oRm.openStart("div");
		oRm.class("sapMMenuItemSubMenu");
		oRm.openEnd();
		oRm.openStart("div");
		oRm.class("sapUiIconMirrorInRTL");
		oRm.openEnd();
		oRm.close("div");
		oRm.close("div");
	};

	/**
	 * Renders the end content column for the given control (if necessary).
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.m.MenuItem} oItem the menu item to be rendered
	 */
	MenuItemRenderer.renderEndContent = function(oRm, oItem) {
		const aEndContent = oItem.getEndContent();

		if (aEndContent.length) {
			oRm.openStart("div", `${oItem.getId()}-endContent`);
			oRm.class("sapMMenuEndContent");
			oRm.openEnd();
			aEndContent.forEach((oControl) => oRm.renderControl(oControl));
			oRm.close("div");
		}
	};

	/**
	 * Renders the selection mark column for the given control (if necessary).
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.m.MenuItem} oItem the menu item to be rendered
	 */
	MenuItemRenderer.renderSelectionMark = function(oRm, oItem) {
		if (oItem.getSelected() && oItem._getItemSelectionMode() !== ItemSelectionMode.None) {
			oRm.openStart("div", `${oItem.getId()}-sel`);
			oRm.class("sapMMenuItemSelected");
			oRm.openEnd();
			oRm.close("div");
		}
	};

	return MenuItemRenderer;
});
