/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Renderer",
	"sap/m/StandardListItemRenderer"
], function(Renderer, StandardListItemRenderer) {
	"use strict";

	/**
	 * ListContentItemRenderer renderer.
	 * @namespace
	 */
	var ListContentItemRenderer = Renderer.extend(StandardListItemRenderer);
	ListContentItemRenderer.apiVersion = 2;

	/**
	 * @override
	 */
	ListContentItemRenderer.renderLIAttributes = function(rm, oLI) {
		StandardListItemRenderer.renderLIAttributes.apply(this, arguments);

		rm.class("sapUiIntegrationListContentItem");

		if (oLI.getMicrochart()) {
			rm.class("sapUiIntegrationListContentItemWithChart");
		}
	};

	/**
	 * @override
	 */
	ListContentItemRenderer.renderLIContent = function (rm, oLI) {
		var sInfo = oLI.getInfo(),
			sTitle = oLI.getTitle(),
			sDescription = oLI.getDescription(),
			bAdaptTitleSize = oLI.getAdaptTitleSize(),
			bShouldRenderInfoWithoutTitle = !sTitle && sInfo;

		// render image
		if (oLI.getIcon()) {
			rm.renderControl(oLI._getImage());
		}

		rm.openStart("div").class("sapMSLIDiv");

		// if bShouldRenderInfoWithoutTitle=true then adapt the style class to have flex-direction: row
		if ((!sDescription && bAdaptTitleSize && sInfo) || bShouldRenderInfoWithoutTitle) {
			rm.class("sapMSLIInfoMiddle");
		}

		rm.openEnd();

		this.renderTitleWrapper(rm, oLI);

		if (sTitle && sDescription) {
			this.renderDescription(rm, oLI);
		}

		if (bShouldRenderInfoWithoutTitle && !oLI.getWrapping()) {
			this.renderInfo(rm, oLI);
		}

		if (oLI.getMicrochart()) {
			rm.renderControl(oLI.getMicrochart());
		}

		rm.close("div");
	};

	return ListContentItemRenderer;

}, /* bExport= */ true);
