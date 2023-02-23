/*!
 * ${copyright}
 */
sap.ui.define([], function () {
	"use strict";

	var MenuRenderer = {
		apiVersion: 2
	};

	MenuRenderer.render = function (oRm, oMenu) {
		oRm.openStart("div", oMenu);
		oRm.class("sapMTCMenu");
		oRm.openEnd();
		this.renderHiddenTexts(oRm, oMenu);
		this.renderQuickActions(oRm, oMenu);
		this.renderItems(oRm, oMenu);

		oRm.openStart("div");
		oRm.style("role", "none");
		oRm.attr("id", oMenu.getId() + "-focusDummy");
		oRm.attr("tabindex", "0");
		oRm.openEnd().close("div");

		oRm.close("div");
	};

	var renderInvisibleText = function(oRm, sId, sText) {
		oRm.openStart("span", sId);
		oRm.class("sapUiInvisibleText");
		oRm.attr("aria-hidden", "true");
		oRm.openEnd();
		oRm.text(sText);
		oRm.close("span");
	};

	MenuRenderer.renderHiddenTexts = function(oRm, oMenu) {
		oRm.openStart("div");
		oRm.class("sapMTCMenuHiddenTexts");
		oRm.style("display", "none");
		oRm.attr("aria-hidden", "true");
		oRm.openEnd();

		renderInvisibleText(oRm, oMenu.getId() + "-menuDescription", oMenu._getResourceText("table.COLUMNMENU_TITLE"));
		renderInvisibleText(oRm, oMenu.getId() + "-actionContainerDescription", oMenu._getResourceText("table.COLUMNMENU_ACTION_CONTAINER_DESC"));
		renderInvisibleText(oRm, oMenu.getId() + "-itemContainerDescription", oMenu._getResourceText("table.COLUMNMENU_ITEM_CONTAINER_DESC"));

		oRm.close("div");
	};

	MenuRenderer.renderQuickActions = function (oRm, oMenu) {
		// If no active QuickActions are found, do not render the quick action container.
		if (oMenu._getAllEffectiveQuickActions().length === 0) {
			return;
		}

		oRm.openStart("div");
		if (oMenu._oItemsContainer) {
			if (oMenu._oItemsContainer.getCurrentViewKey() === "$default") {
				oRm.class("sapMTCMenuQAList");
			} else {
				oRm.class("sapMTCMenuQAListHidden");
			}
		} else {
			oRm.class("sapMTCMenuQAList");
		}
		oRm.attr("role", "region");
		oRm.openEnd();

		oRm.renderControl(oMenu._oQuickActionContainer);

		oRm.close("div");
	};

	MenuRenderer.renderItems = function (oRm, oMenu) {
		if (oMenu._getAllEffectiveItems().length === 0) {
			return;
		}

		oRm.openStart("div");
		oRm.class("sapMTCMenuContainerWrapper");
		oRm.openEnd();
		oRm.renderControl(oMenu._oItemsContainer);
		oRm.close("div");
	};

	return MenuRenderer;
});