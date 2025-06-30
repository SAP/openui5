/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/ui/core/library',
	'sap/ui/core/ControlBehavior'
], function(
	coreLibrary,
	ControlBehavior
) {
	"use strict";

	/**
	 * MenuWrapper renderer.
	 * @namespace
	 */
	const MenuWrapperRenderer = {
		apiVersion: 2
	};

	// shortcut for sap.ui.core.ItemSelectionMode
	const ItemSelectionMode = coreLibrary.ItemSelectionMode;

	/**
	 * Renders the HTML output for the specified control, using the provided
	 * {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.m.MenuWrapper} oMenuWrapper the Menu Wrapper to be rendered
	 */
	MenuWrapperRenderer.render = function(oRm, oMenuWrapper) {
		const aItems = oMenuWrapper._getVisibleItems(),
			bAccessible = ControlBehavior.isAccessibilityEnabled();

			if (aItems.length) {
			oRm.openStart("ul", oMenuWrapper);

			if (bAccessible) {
				oRm.attr("role", "menu");
				oMenuWrapper._prepareItemsAccessibilityInfo();
			}

			oRm.class("sapMMenuList");
			if (!oMenuWrapper._getItemsWithIconCount()) {
				oRm.class("sapMMenuNoIcons");
			}
			oRm.openEnd();

			this.renderItems(oRm, oMenuWrapper);

			oRm.close("ul");
		}
	};

	/**
	 * Renders the items of the MenuWrapper.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.m.MenuWrapper} oMenuWrapper the Menu Wrapper to be rendered
	 */
	MenuWrapperRenderer.renderItems = function(oRm, oMenuWrapper) {
		const aItems = oMenuWrapper._getVisibleItems();
		let sCurrentGroup = null,
			sItemGroup = null,
			bGroupOpened = false,
			bGroupEndSeparatorRendered = false,
			sAriaLabel;

		aItems.forEach((oItem, iIndex) => {
			sItemGroup = oItem.getAssociation("_group");

			if (bGroupOpened && sCurrentGroup !== sItemGroup) {
				// group closing tag
				oRm.close("div");
				bGroupOpened = false;
				// group closing separator
				this.renderSeparator(oRm);
				bGroupEndSeparatorRendered = true;
			}

			if ((sCurrentGroup !== sItemGroup || oItem.getStartsSection()) && !bGroupEndSeparatorRendered && iIndex !== 0) {
				this.renderSeparator(oRm);
			}

			if (sItemGroup && !bGroupOpened) {
				switch (oItem._itemSelectionMode) {
					case ItemSelectionMode.None:
						sAriaLabel = oMenuWrapper._oRb.getText("MENU_ITEM_GROUP_NONE_ACCESSIBLE_NAME");
						break;
					case ItemSelectionMode.SingleSelect:
						sAriaLabel = oMenuWrapper._oRb.getText("MENU_ITEM_GROUP_SINGLE_ACCESSIBLE_NAME");
						break;
					case ItemSelectionMode.MultiSelect:
						sAriaLabel = oMenuWrapper._oRb.getText("MENU_ITEM_GROUP_MULTI_ACCESSIBLE_NAME");
						break;
					default:
						sAriaLabel = "";
				}
				oRm.openStart("div");
				oRm.attr("role", "group");
				sAriaLabel && oRm.attr("aria-label", sAriaLabel);
				oRm.openEnd();
				bGroupOpened = true;
			}

			sCurrentGroup = sItemGroup;
			bGroupEndSeparatorRendered = false;

			oRm.renderControl(oItem);
		});

		if (bGroupOpened) {
			oRm.close("div");
		}
	};

	/**
	 * Renders menu separator.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 */
	MenuWrapperRenderer.renderSeparator = function(oRm) {
		const bAccessible = ControlBehavior.isAccessibilityEnabled();

		oRm.openStart("li");
		oRm.class("sapMMenuSeparator");

		if (bAccessible) {
			oRm.attr("role", "separator");
		}

		oRm.openEnd();

		oRm.voidStart("hr").voidEnd();

		oRm.close("li");
	};

	return MenuWrapperRenderer;
}, /* bExport= */ true);
