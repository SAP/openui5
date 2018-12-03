/*!
 * ${copyright}
 */

// Provides default renderer for control sap.f.Card
sap.ui.define(["sap/f/library", "sap/base/security/encodeXML", "sap/ui/core/IconPool", "sap/base/security/encodeCSS"],
	function (library, encodeXML, IconPool, encodeCSS) {
		"use strict";

		/**
		 * <code>Card</code> renderer.
		 * @author SAP SE
		 * @namespace
		 */
		var CardRenderer = {};

		/**
		 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
		 *
		 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the Render-Output-Buffer
		 * @param {sap.ui.core.Control} oCard an object representation of the control that should be rendered
		 */
		CardRenderer.render = function (oRm, oCard) {

			// TODO: Don't expect fully loaded Manifest in here.
			// We should rather render a base card with certain size and then load manifest information and update the header/content.
			if (!oCard._oCardManifest) {
				oRm.write("<section");
				oRm.writeControlData(oCard);
				oRm.writeAttribute("tabindex", "0");
				oRm.addClass("sapFCard");

				if (oCard.getBusy()) {
					oRm.addClass("sapFCardLoading");
				}
				oRm.addStyle("width", oCard.getWidth());
				oRm.addStyle("height", oCard.getHeight());
				oRm.writeClasses();
				oRm.writeStyles();
				oRm.write(">");
				oRm.write("</section>");
				return;
			}

            //start
            oRm.write("<section");
            oRm.writeElementData(oCard);
            oRm.writeAttributeEscaped("aria-label", oCard._oCardManifest.get("sap.card/title") + "-" + oCard._oCardManifest.get("sap.card/subTitle"));
            oRm.writeAttribute("tabindex", "0");
			oRm.addClass("sapFCard");

            if (oCard.getBusy()) {
                oRm.addClass("sapFCardLoading");
            }
            oRm.writeClasses();
			oRm.addStyle("width", oCard.getWidth());
			oRm.addStyle("height", oCard.getHeight());
			oRm.writeStyles();
			oRm.write(">");

			//header
            CardRenderer.renderHeaderSection(oRm, oCard);

			//content
			CardRenderer.renderContentSection(oRm, oCard);

			//end
			oRm.write("</section>");
		};

		/**
		 * Render header section.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
        CardRenderer.renderHeaderSection = function (oRm, oCard) {
			oRm.write("<header");
			oRm.addClass("sapFCardHeader");
			oRm.writeClasses();
			oRm.writeStyles();
			oRm.write(">");
            if (oCard._oCardManifest.get("sap.card/icon")) {
				this.renderHeaderIcon(oRm, oCard);
			}
			var sTitle = oCard._oCardManifest.get("sap.card/title"),
				sSubTitle = oCard._oCardManifest.get("sap.card/subTitle");
            if (sTitle) {
				oRm.write("<div");
				oRm.addClass("sapFCardHeaderText");
				oRm.writeClasses();
				oRm.writeStyles();
				oRm.write(">");
				oRm.renderControl(oCard._oTitle);
				if (sSubTitle) {
					oRm.renderControl(oCard._oSubTitle);
				}
				oRm.write("</div>");
			}

			//TODO rename status to count
			var sStatus = oCard._oCardManifest.get("sap.card/status");
            if (sStatus) {
				oRm.write("<span");
				oRm.addClass("sapFCardStatus");
				oRm.writeClasses();
				oRm.write(">");
				oRm.writeEscaped(sStatus);
				oRm.write("</span>");
            }
			oRm.write("</header>");
		};
		/**
		 * Render icon section.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		CardRenderer.renderHeaderIcon = function (oRm, oCard) {
			oRm.renderControl(oCard._oAvatar);
		};

		/**
		 * Render content section.
		 * Will be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		CardRenderer.renderContentSection = function (oRm, oCard) {
			oRm.write("<section");
			oRm.writeAttribute("id", oCard.getId() + "-content");
			var sColor = oCard._oCardManifest.get("sap.card/color"),
				sBackgroundColor = oCard._oCardManifest.get("sap.card/backgroundColor"),
				sBackgroundImage = oCard._oCardManifest.get("sap.card/backgroundImage"),
				sBackgroundImageSize = oCard._oCardManifest.get("sap.card/backgroundImageSize");

			if (sColor) {
				oRm.addStyle("color", sColor);
				//TODO: Use this only in focus case
				oRm.addStyle("border-color", encodeCSS(sColor) + " !important");
			}
			if (sBackgroundColor) {
				oRm.addStyle("background-color", encodeCSS(sBackgroundColor));
			}
			if (sBackgroundImage) {
				oRm.addStyle("background-image", "url('" + encodeCSS(sBackgroundImage) + "')");
				if (sBackgroundImageSize) {
					oRm.addStyle("background-size", encodeCSS(sBackgroundImageSize));
				}
			}
			oRm.addClass("sapFCardContent");
			oRm.writeClasses();
			oRm.write(">");
			var oContent = oCard.getAggregation("_content");
			if (oContent) {
				oRm.renderControl(oContent);
			}
			oRm.write("</section>");
		};

		/**
		 * Add a control type class class to input container.
		 * Will be overwritten by subclasses.
		 *
		 * @param {sap.ui.core.RenderManager} oRm The RenderManager that can be used for writing to the render output buffer.
		 * @param {sap.ui.core.Control} oControl An object representation of the control that should be rendered.
		 */
		CardRenderer.addCardTypeClass = function(oRm, oControl) {};

		return CardRenderer;
	}, /* bExport= */ true);