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
	var CardRenderer = {},
		oRb = sap.ui.getCore().getLibraryResourceBundle("sap.f");

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
	 * @param {sap.ui.core.Control} oCard an object representation of the control that should be rendered
	 */
	CardRenderer.render = function (oRm, oCard) {
		var oHeader = oCard.getCardHeader(),
			sHeight = oCard.getHeight(),
			bCardHeaderBottom = oHeader && oCard.getCardHeaderPosition() === HeaderPosition.Bottom;

		//start
		oRm.write("<div");
		oRm.writeElementData(oCard);
		oRm.addClass("sapFCard");
		if (!oCard.getCardContent()) {
			oRm.addClass("sapFCardNoContent");
		}
		if (bCardHeaderBottom) {
			oRm.addClass("sapFCardBottomHeader");
		}
		oRm.writeClasses();

		oRm.addStyle("width", oCard.getWidth());

		if (sHeight && sHeight !== 'auto') {
			oRm.addStyle("height", sHeight);
		}

		//Accessibility state
		oRm.writeAccessibilityState(oCard, {
			role: "region",
			roledescription: {value: oRb.getText("ARIA_ROLEDESCRIPTION_CARD"), append: true}
		});
		if (oHeader) {
			var oTitle = oHeader._getTitle();
			if (oTitle) {
				oRm.writeAccessibilityState(oCard, {
					labelledby: {value: oTitle.getId(), append: true}
				});
			}

		}
		oRm.writeStyles();
		oRm.write(">");

		//header at the top
		if (oHeader && oCard.getCardHeaderPosition() === "Top") {
			oRm.renderControl(oHeader);
		}

		//content
		CardRenderer.renderContentSection(oRm, oCard);

		//header at the bottom
		if (bCardHeaderBottom) {
			oRm.renderControl(oHeader);
		}

		//end
		oRm.write("</div>");
	};

	/**
	 * Render content section.
	 * Will be overwritten by subclasses.
	 *
	 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
	 */
	CardRenderer.renderContentSection = function (oRm, oCard) {
		var oContent = oCard.getCardContent();

		if (oContent) {
			oRm.write("<div");
			oRm.addClass("sapFCardContent");
			oRm.writeClasses();
			//Accessibility configuration
			oRm.writeAccessibilityState(oCard, {
				role: "group",
				label: {value: oRb.getText("ARIA_LABEL_CARD_CONTENT"), append: true}
			});
			oRm.write(">");

			oRm.renderControl(oContent);

			oRm.write("</div>");
		}
	};

	return CardRenderer;
});