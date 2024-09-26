/*!
 * ${copyright}
 */

sap.ui.define([
	"./BaseContentRenderer"
], function (BaseContentRenderer) {
	"use strict";

	/**
	 * BaseContent renderer.
	 * @author SAP SE
	 * @namespace
	 */
	var BaseListContentRenderer = BaseContentRenderer.extend("sap.ui.integration.cards.BaseListContentRenderer", {
		apiVersion: 2
	});

	/**
	 * @override
	 */
	BaseListContentRenderer.renderContent = function (oRm, oCardContent) {
		oRm.renderControl(oCardContent.getAggregation("_content"));
		oCardContent.getPaginator()?.render(oRm);
	};

	/**
	 * @override
	 */
	BaseListContentRenderer.renderLoadingClass = function (oRm, oCardContent) {
		if (oCardContent.getPaginator()?.isLoadingMore()) {
			return;
		}

		BaseContentRenderer.renderLoadingClass(oRm, oCardContent);
	};

	/**
	 * @override
	 */
	BaseListContentRenderer.renderLoadingPlaceholder = function (oRm, oCardContent) {
		if (oCardContent.getPaginator()?.isLoadingMore()) {
			return;
		}

		BaseContentRenderer.renderLoadingPlaceholder(oRm, oCardContent);
	};

	return BaseListContentRenderer;
});
