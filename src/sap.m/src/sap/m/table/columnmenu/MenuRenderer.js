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

		oMenu._getAllEffectiveQuickActions().forEach(function (oQuickAction) {
			this.renderQuickAction(oRm, oQuickAction);
		}, this);

		oRm.close("div");
	};

	MenuRenderer.renderQuickAction = function (oRm, oQuickAction) {
		oRm.openStart("div", oQuickAction);
		oRm.class("sapMTCMenuQAction");
		oRm.openEnd();
		// Label
		oRm.openStart("div");
		oRm.class("sapMTCMenuQALabel");
		oRm.openEnd();
		oRm.text(oQuickAction.getLabel());
		oRm.close("div");
		// Content
		oRm.openStart("div");
		oRm.openEnd();
		oRm.renderControl(oQuickAction.getContent());
		oRm.close("div");
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