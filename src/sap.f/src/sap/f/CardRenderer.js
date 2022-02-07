/*!
 * ${copyright}
 */

// Provides default renderer for control sap.f.Card
sap.ui.define([
	"sap/ui/core/Renderer",
	"sap/f/library"
], function (
	Renderer,
	library
) {
	"use strict";
	var HeaderPosition = library.cards.HeaderPosition;

	/**
	 * <code>Card</code> renderer.
	 * @author SAP SE
	 * @namespace
	 */
	var CardRenderer = Renderer.extend("sap.f.CardRenderer", {
		apiVersion: 2
	});

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.f.Card} oCard an object representation of the control that should be rendered
	 */
	CardRenderer.render = function (oRm, oCard) {
		var oHeader = oCard.getCardHeader(),
			bHeaderTop = oHeader && oCard.getCardHeaderPosition() === HeaderPosition.Top;

		oRm.openStart("div", oCard);
		this.renderContainerAttributes(oRm, oCard);
		oRm.openEnd();

		// header at the top
		if (bHeaderTop) {
			oRm.renderControl(oHeader);
		}

		// content
		this.renderContentSection(oRm, oCard);

		// header at the bottom
		if (!bHeaderTop) {
			oRm.renderControl(oHeader);
		}

		// footer
		this.renderFooterSection(oRm, oCard);

		oRm.renderControl(oCard._ariaText);
		oRm.renderControl(oCard._ariaContentText);

		oRm.close("div");
	};

	/**
	 * @protected
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.f.Card} oCard An object representation of the control that should be rendered.
	 */
	CardRenderer.renderContainerAttributes = function (oRm, oCard) {
		var sHeight = oCard.getHeight(),
			sTooltip = oCard.getTooltip_AsString();

		var bHasHeader = !!(oCard.getCardHeader() && oCard.getCardHeader().getVisible()),
			bCardHeaderBottom = bHasHeader && oCard.getCardHeaderPosition() === HeaderPosition.Bottom;

		oRm.class("sapFCard")
			.style("width", oCard.getWidth());

		if (!bHasHeader) {
			oRm.class("sapFCardNoHeader");
		}

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
			labelledby: { value: oCard._getAriaLabelledIds(), append: true }
		});
	};

	/**
	 * Render content section.
	 * Will be overwritten by subclasses.
	 *
	 * @protected
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.f.Card} oCard An object representation of the control that should be rendered.
	 */
	CardRenderer.renderContentSection = function (oRm, oCard) {
		var oContent = oCard.getCardContent();

		if (oContent) {
			oRm.openStart("div", oCard.getId() + "-contentSection")
				.class("sapFCardContent")
				.accessibilityState(oCard, {
					role: "group",
					labelledby: { value: oCard.getId() + "-ariaContentText", append: true }
				})
				.openEnd();

			oRm.renderControl(oContent);

			oRm.close("div");
		}
	};

	/**
	 * Render footer section.
	 * Will be overwritten by subclasses.
	 *
	 * @protected
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.f.Card} oCard An object representation of the control that should be rendered.
	 */
	CardRenderer.renderFooterSection = function (oRm, oCard) {

	};

	return CardRenderer;
});
