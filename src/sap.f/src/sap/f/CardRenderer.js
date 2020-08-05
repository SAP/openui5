/*!
 * ${copyright}
 */

// Provides default renderer for control sap.f.Card
sap.ui.define([
	"sap/f/library"
], function (
	library
) {
	"use strict";
	var HeaderPosition = library.cards.HeaderPosition;

	/**
	 * <code>Card</code> renderer.
	 * @author SAP SE
	 * @namespace
	 */
	var CardRenderer = {
		apiVersion: 2
	};
	var oRb = sap.ui.getCore().getLibraryResourceBundle("sap.f");

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oCard an object representation of the control that should be rendered
	 */
	CardRenderer.render = function (oRm, oCard) {
		var oHeader = oCard.getCardHeader(),
			sHeight = oCard.getHeight(),
			bCardHeaderBottom = oHeader && oCard.getCardHeaderPosition() === HeaderPosition.Bottom,
			sTooltip = oCard.getTooltip_AsString(),
			oFilterBar = oCard.getAggregation("_filterBar");

		oRm.openStart("div", oCard)
			.class("sapFCard")
			.style("width", oCard.getWidth());

		if (!oCard.getCardContent()) {
			oRm.class("sapFCardNoContent");
		}

		if (bCardHeaderBottom) {
			oRm.class("sapFCardBottomHeader");
		}

		if (sHeight && sHeight !== "auto") {
			oRm.style("height", sHeight);
		}

		if (sTooltip) {
			oRm.attr("title", sTooltip);
		}

		//Accessibility state
		oRm.accessibilityState(oCard, {
			role: "region",
			labelledby: { value: oCard.getId() + "-ariaText", append: true }
		});
		oRm.openEnd();

		//header at the top
		if (oHeader && oCard.getCardHeaderPosition() === HeaderPosition.Top) {
			oRm.renderControl(oHeader);
		}

		if (oFilterBar) {
			oRm.openStart("div")
				.class("sapFCardFilterBar")
				.openEnd();

			oRm.renderControl(oFilterBar);

			oRm.close("div");
		}

		//content
		CardRenderer.renderContentSection(oRm, oCard);

		//header at the bottom
		if (bCardHeaderBottom) {
			oRm.renderControl(oHeader);
		}

		oRm.renderControl(oCard._ariaText);

		oRm.close("div");
	};

	/**
	 * Render content section.
	 * Will be overwritten by subclasses.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oCard An object representation of the control that should be rendered.
	 */
	CardRenderer.renderContentSection = function (oRm, oCard) {
		var oContent = oCard.getCardContent();

		if (oContent) {
			oRm.openStart("div")
				.class("sapFCardContent")
				.accessibilityState(oCard, {
					role: "group",
					label: { value: oRb.getText("ARIA_LABEL_CARD_CONTENT"), append: true }
				})
				.openEnd();

			oRm.renderControl(oContent);

			oRm.close("div");
		}
	};

	return CardRenderer;
});
