/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Renderer",
	"sap/ui/integration/library"
], function (Renderer, library) {
	"use strict";

	var CardPreviewMode = library.CardPreviewMode;

	/**
	 * BaseContent renderer.
	 * @author SAP SE
	 * @namespace
	 */
	var BaseContentRenderer = Renderer.extend("sap.ui.integration.cards.BaseContentRenderer", {
		apiVersion: 2
	});

	/**
	 * Default min height for all content types.
	 */
	BaseContentRenderer.DEFAULT_MIN_HEIGHT = "5rem";

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.integration.cards.BaseContent} oCardContent an object representation of the control that should be rendered
	 */
	BaseContentRenderer.render = function (oRm, oCardContent) {
		// Add class the simple way. Add renderer hooks only if needed.
		var sClass = "sapFCard",
			sName = oCardContent.getMetadata().getName(),
			sType = sName.slice(sName.lastIndexOf(".") + 1),
			oCard = oCardContent.getCardInstance(),
			oMessageContainer = oCardContent.getAggregation("_messageContainer"),
			oBlockingMessage = oCardContent.getAggregation("_blockingMessage");

		sClass += sType;

		oRm.openStart("div", oCardContent)
			.class(sClass)
			.class("sapFCardBaseContent");

		if (oCardContent.isInteractive()) {
			oRm.class("sapFCardSectionClickable");
		}

		if (oCard && oCard.getHeight() === "auto" && !oCardContent.getOverflowWithShowMore()) { // if there is no height specified the default value is "auto"
			var sHeight = this.getMinHeight(oCardContent.getParsedConfiguration(), oCardContent, oCard);
			oRm.style("min-height", sHeight);
		}

		this.renderLoadingClass(oRm, oCardContent);

		oRm.openEnd();

		this.renderLoadingPlaceholder(oRm, oCardContent);

		if (oMessageContainer) {
			oRm.renderControl(oMessageContainer);
		}

		if (oBlockingMessage) {
			oRm.renderControl(oBlockingMessage);
		} else {
			this.renderContent(oRm, oCardContent);
		}

		oRm.close("div");
	};

	/**
	 * @protected
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.integration.cards.BaseContent} oCardContent an object representation of the control that should be rendered
	 */
	BaseContentRenderer.renderContent = function (oRm, oCardContent) {
		oRm.renderControl(oCardContent.getAggregation("_content"));
	};

	/**
	 * @protected
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.integration.cards.BaseContent} oCardContent an object representation of the control that should be rendered
	 */
	BaseContentRenderer.renderLoadingClass = function (oRm, oCardContent) {
		const oCard = oCardContent.getCardInstance();
		const bIsAbstractPreviewMode =  oCard && oCard.getPreviewMode() === CardPreviewMode.Abstract;

		if (oCardContent.isLoading() || bIsAbstractPreviewMode) {
			oRm.class("sapFCardContentLoading");
		}
	};

	/**
	 * @protected
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.integration.cards.BaseContent} oCardContent an object representation of the control that should be rendered
	 */
	BaseContentRenderer.renderLoadingPlaceholder = function (oRm, oCardContent) {
		const oCard = oCardContent.getCardInstance();
		const bIsAbstractPreviewMode = oCard && oCard.getPreviewMode() === CardPreviewMode.Abstract;

		if (oCardContent.isLoading() || bIsAbstractPreviewMode) {
			oRm.renderControl(oCardContent.getAggregation("_loadingPlaceholder"));
		}
	};

	/**
	 * @protected
	 * @param {object} oConfiguration The manifest configuration of the content
	 * @param {sap.ui.integration.cards.BaseContent} oContent The content
	 * @returns {string} Min height in Rems.
	 */
	BaseContentRenderer.getMinHeight = function (oConfiguration, oContent) {
		return this.DEFAULT_MIN_HEIGHT;
	};

	BaseContentRenderer.isCompact = function (oContent) {
		var oReferenceElement = oContent,
			oParent = oContent.getParent();

		if (!oContent.getDomRef() && oParent && oParent.isA("sap.f.ICard")) {
			oReferenceElement = oParent;
		}

		// check if there is an element up the DOM which enables compact density
		return oReferenceElement.getDomRef()?.closest(".sapUiSizeCompact")?.classList.contains("sapUiSizeCompact");
	};

	return BaseContentRenderer;
});
