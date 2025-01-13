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

		const bHasQuckActions = oMenu._getAllEffectiveQuickActions().length > 0;
		if (bHasQuckActions) {
			this.renderQuickActions(oRm, oMenu);
		}

		const bHasItems = oMenu._getAllEffectiveItems().length > 0;
		if (bHasItems) {
			this.renderItems(oRm, oMenu);
		}

		if (!bHasQuckActions && !bHasItems) {
			oRm.renderControl(oMenu._oIllustratedMessage);
		}

		oRm.close("div");
	};

	MenuRenderer.renderQuickActions = function (oRm, oMenu) {
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

		oRm.renderControl(oMenu._oQuickSortList);
		oRm.renderControl(oMenu._oQuickFilterList);
		oRm.renderControl(oMenu._oQuickGroupList);
		oRm.renderControl(oMenu._oQuickAggregateList);
		oRm.renderControl(oMenu._oQuickGenericList);

		oRm.close("div");
	};

	MenuRenderer.renderItems = function (oRm, oMenu) {
		oRm.openStart("div");
		oRm.class("sapMTCMenuContainerWrapper");
		oRm.openEnd();
		oRm.renderControl(oMenu._oItemsContainer);
		oRm.close("div");
	};

	return MenuRenderer;
});