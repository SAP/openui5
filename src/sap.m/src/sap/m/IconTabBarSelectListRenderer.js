/*!
 * ${copyright}
 */

// Provides default renderer for control sap.m.IconTabBarSelectList
sap.ui.define([
	"sap/ui/core/theming/Parameters"
], function (Parameters) {
	"use strict";

	/**
	 * IconTabBarSelectList renderer.
	 * @author SAP SE
	 * @namespace
	 */
	var IconTabBarSelectListRenderer = {
		apiVersion: 2
	};

	IconTabBarSelectListRenderer.NestedItemPaddingLeft = Number.parseFloat(Parameters.get("_sap_m_IconTabBar_SelectItemInPopover_PaddingLeft"));

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
			iTotalItemsCount = oIconTabHeader.getVisibleTabFilters().length;

		oSelectList.checkIconOnly();
		this.renderList(oRM, aItems, oSelectList, oIconTabHeader, bTextOnly, 0, iTotalItemsCount);
	};

	/**
	 * Renders the <code>ul<code> element for the IconTabBarSelectList's items, or an IconTabFilter's own items.
	 *
	 * @param {sap.ui.core.RenderManager} oRM the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.m.IconTabFilter[]} aItems the control's items
	 * @param {sap.m.IconTabBarSelectList} oSelectList an object representation of the control that should be rendered
	 * @param {sap.m.IconTabHeader} oIconTabHeader the IconTabHeader control which the SelectList is rendered in
	 * @param {boolean} bTextOnly IconTabFilter's <code>textOnly</code> property
	 * @param {int} iLevel base level of indentation for all list items
	 * @param {int} iSetSize total number of items in the IconTabHeader
	 */
	IconTabBarSelectListRenderer.renderList = function (oRM, aItems, oSelectList, oIconTabHeader, bTextOnly, iLevel, iSetSize) {
		if (!aItems.length) {
			return;
		}

		oRM.openStart("ul", oSelectList)
			.attr("role", "tree")
			.class("sapMITBSelectList");

		if (bTextOnly) {
			oRM.class("sapMITBSelectListTextOnly");
		}

		oRM.openEnd();

		for (var i = 0; i < aItems.length; i++) {
			var oItem = aItems[i],
				iIndexInSet;

			if (oIconTabHeader) {
				iIndexInSet = oIconTabHeader.getVisibleTabFilters().indexOf(oItem._getRealTab());
			}

			// if rendering first level of tab overflow list
			if (oItem._getRootTab()._getSelectList() === oSelectList) {
				iIndexInSet = i;
				iSetSize = aItems.length;
			}

			oItem.renderInSelectList(
				oRM,
				oSelectList,
				iIndexInSet,
				iSetSize,
				this.NestedItemPaddingLeft,
				iLevel
			);

			var aSubFilters = oItem._getRealTab().getItems();
			if (aSubFilters.length) {
				oRM.openStart("li")
					.openEnd();

				iLevel++;
				IconTabBarSelectListRenderer.renderList(oRM, aSubFilters, oSelectList, null, bTextOnly, iLevel, aSubFilters.length);
				iLevel--;

				oRM.close("li");
			}
		}

		oRM.close("ul");
	};

	return IconTabBarSelectListRenderer;
}, /* bExport= */ true);