/*!
 * ${copyright}
 */

// Provides default renderer for control sap.m.IconTabBarSelectList
sap.ui.define([
	"sap/ui/core/theming/Parameters",
	"sap/ui/core/library"
], function (Parameters, coreLibary) {
	"use strict";

	var IconColor = coreLibary.IconColor;

	/**
	 * IconTabBarSelectList renderer.
	 * @author SAP SE
	 * @namespace
	 */
	var IconTabBarSelectListRenderer = {
		apiVersion: 2
	};

	IconTabBarSelectListRenderer.fNestedItemPaddingLeft = Number.parseFloat(Parameters.get("_sap_m_IconTabBar_SelectListItem_PaddingLeft"));

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRM the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.m.IconTabBarSelectList} oControl an object representation of the control that should be rendered
	 */
	IconTabBarSelectListRenderer.render = function(oRM, oSelectList) {
		var aItems = oSelectList.getVisibleItems(),
			oIconTabHeader = oSelectList._oIconTabHeader,
			bTextOnly = oIconTabHeader._checkTextOnly(),
			iTotalItemsCount = oIconTabHeader.getVisibleTabFilters().length,
			fNestedItemPaddingLeft = this.fNestedItemPaddingLeft,
			bExtraIndent = false;

		// find if in that level of nesting there is some semantic icon set
		// all of the filters in same level (all siblings) should know that
		var bHasSemanticColor = aItems
			.filter(function (oItem) { return oItem.isA("sap.m.IconTabFilter"); })
			.some(function (oItem) { return oItem.getIconColor() !== IconColor.Default; });

		oSelectList.checkIconOnly();

		var fAdditionalPadding = Number.parseFloat(Parameters.get("_sap_m_IconTabBar_SelectListItem_PaddingLeftAdditional"));
		if (bHasSemanticColor && fAdditionalPadding) {
			fNestedItemPaddingLeft += fAdditionalPadding;
			bExtraIndent = true;
		}

		this.renderList(oRM, aItems, oSelectList, oIconTabHeader, bTextOnly, fNestedItemPaddingLeft, bExtraIndent, iTotalItemsCount);
	};

	/**
	 * Renders the <code>ul<code> element for the IconTabBarSelectList's items, or an IconTabFilter's own items.
	 *
	 * @param {sap.ui.core.RenderManager} oRM the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.m.IconTab[]} aItems the control's items
	 * @param {sap.m.IconTabBarSelectList} oSelectList an object representation of the control that should be rendered
	 * @param {sap.m.IconTabHeader} oIconTabHeader the IconTabHeader control which the SelectList is rendered in
	 * @param {boolean} bTextOnly IconTabFilter's <code>textOnly</code> property
	 * @param {number} fPadding base value used as indentation
	 * @param {boolean} bExtraIndent adds extra indentation, used to provide space for semantic icons
	 * @param {int} iSetSize total number of items in the IconTabHeader
	 */
	IconTabBarSelectListRenderer.renderList = function (oRM, aItems, oSelectList, oIconTabHeader, bTextOnly, fPadding, bExtraIndent, iSetSize) {
		if (!aItems.length) {
			return;
		}

		oRM.openStart("ul", oSelectList)
			.attr("role", "menu")
			.class("sapMITBSelectList");

		if (bTextOnly) {
			oRM.class("sapMITBSelectListTextOnly");
		}

		oRM.openEnd();

		for (var i = 0; i < aItems.length; i++) {
			var oItem = aItems[i],
				iIndexInSet;

			if (oIconTabHeader && oItem.isA("sap.m.IconTabFilter")) {
				iIndexInSet = oIconTabHeader.getVisibleTabFilters().indexOf(oItem._getRealTab());
			}

			// if rendering first level of tab overflow list
			if (oItem.isA("sap.m.IconTabFilter") && oItem._getRootTab()._getSelectList() === oSelectList) {
				iIndexInSet = i;
				iSetSize = aItems.length;
			}

			var iLevel = oItem._getNestedLevel() - 1;
			if (bExtraIndent) {
				iLevel++;
			}
			oItem.renderInSelectList(oRM, oSelectList, iIndexInSet, iSetSize, fPadding * iLevel);
		}

		oRM.close("ul");
	};

	return IconTabBarSelectListRenderer;
}, /* bExport= */ true);