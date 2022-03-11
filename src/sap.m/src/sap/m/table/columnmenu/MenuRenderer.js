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
		this.renderQuickActions(oRm, oMenu);
		this.renderItems(oRm, oMenu);
		oRm.close("div");
	};

	MenuRenderer.renderQuickActions = function (oRm, oMenu) {
		if (oMenu.getQuickActions().length === 0 && !oMenu.getAggregation("_quickActions")) {
			return;
		}

		oRm.openStart("div", oMenu.getId() + "-quickActions");
		if (oMenu._oItemsContainer) {
			if (oMenu._oItemsContainer.getCurrentViewKey() === "$default") {
				oRm.class("sapMTCMenuQAList");
			} else {
				oRm.class("sapMTCMenuQAListHidden");
			}
		} else {
			oRm.class("sapMTCMenuQAList");
		}
		oRm.openEnd();

		oRm.renderControl(oMenu._oForm);

		oRm.close("div");
	};

	MenuRenderer.renderItems = function (oRm, oMenu) {
		if (oMenu.getItems().length === 0 && !oMenu.getAggregation("_items")) {
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