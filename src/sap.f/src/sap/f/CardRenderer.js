/*!
 * ${copyright}
 */

// Provides default renderer for control sap.f.Card
sap.ui.define(["sap/f/library", "sap/base/security/encodeXML", "sap/ui/core/IconPool"],
    function (library, encodeXML, IconPool) {
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
				oRm.writeElementData(oCard);
				oRm.writeAttribute("tabindex", "0");
				oRm.addClass("sapFCard");

				if (oCard.getBusy()) {
					oRm.addClass("sapFCardLoading");
				}

				oRm.addStyle("width", "100%");
				oRm.addStyle("height", "100%");

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

            //styles
            var sColor = oCard._oCardManifest.get("sap.card/color"),
                sBackgroundColor = oCard._oCardManifest.get("sap.card/backgroundColor"),
                sBackgroundImage = oCard._oCardManifest.get("sap.card/backgroundImage"),
				sBackgroundImageSize = oCard._oCardManifest.get("sap.card/backgroundImageSize");

			oRm.addStyle("width", oCard._oCardManifest.get("sap.card/width"));
			oRm.addStyle("height", oCard._oCardManifest.get("sap.card/height"));

            if (sColor) {
                oRm.addStyle("color", sColor);
                //TODO: Use this only in focus case
                oRm.addStyle("border-color", sColor + " !important");
            }
            if (sBackgroundColor) {
                oRm.addStyle("background-color", sBackgroundColor);
            }
            if (sBackgroundImage) {
                oRm.addStyle("background-image", "url('" + sBackgroundImage + "')");
                if (sBackgroundImageSize) {
                    oRm.addStyle("background-size", sBackgroundImageSize);
                }
            }

            oRm.writeStyles();
            oRm.write(">");

            //header
            CardRenderer.renderHeaderSection(oRm, oCard);

            //content
			oRm.write("<div class=\"sapFCardSeparator\" />");
			CardRenderer.renderContentSection(oRm, oCard);

            //end
			oRm.write("</section>");
        };

        /*
         * renders the header of the card
         */
        CardRenderer.renderHeaderSection = function (oRm, oCard) {
            oRm.write("<header");
            oRm.addClass("sapFCardHeader");
            oRm.writeClasses();
            oRm.writeStyles();
            oRm.write(">");
            if (oCard._oCardManifest.get("sap.card/icon")) {
                CardRenderer.renderHeaderIcon(oRm, oCard);
            }

			oRm.write("<div>");
			var sTitle = oCard._oCardManifest.get("sap.card/title");
			oRm.write("<h1");
			oRm.addClass("sapFCardTitle");
			oRm.writeClasses();
			oRm.write(">");
			oRm.writeEscaped(sTitle);
			oRm.write("</h1>");
			if (sTitle) {
				var sSubtitle = oCard._oCardManifest.get("sap.card/subTitle");
				oRm.write("<h2");
				oRm.addClass("sapFCardSubtitle");
				oRm.writeClasses();
				oRm.write(">");
				oRm.writeEscaped(sSubtitle);
				oRm.write("</h2>");
			}
			oRm.write("</div>");

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

        /*
         * renders the icon of the card
         */
        CardRenderer.renderHeaderIcon = function (oRm, oCard) {
            var sIcon = oCard._oCardManifest.get("sap.card/icon"),
                vIconInfo = IconPool.getIconInfo(oCard._oCardManifest.get("sap.card/icon"), undefined, "mixed"),
                bIconInfo = false,
                sColor = oCard._oCardManifest.get("sap.card/iconColor") || oCard._oCardManifest.get("sap.card/color"),
                sIconBackgroundColor = oCard._oCardManifest.get("sap.card/iconBackgroundColor");
            if (vIconInfo instanceof Promise) {
                // if the icon info is still being loaded,
                // an invalidation is triggered after the icon info is available
                vIconInfo.then(oCard.invalidate.bind(oCard));
            } else if (vIconInfo) {
                // render icon info in renderer
                bIconInfo = true;
            }
            if (sColor) {
                oRm.addStyle("color", sColor);

            }
            if (sIconBackgroundColor) {
                oRm.addStyle("background-color", sIconBackgroundColor);
            }
            oRm.write("<span");
            oRm.addClass("sapFCardIcon");
            if (!sIcon.startsWith("sap-icon://")) {
                oRm.addStyle("background-image", "url('" + encodeXML(sIcon) + "')");
            } else if (bIconInfo) {
                oRm.writeAttributeEscaped("data-sap-ui-icon-content", vIconInfo.content);
                oRm.addStyle("font-family", "'" + encodeXML(vIconInfo.fontFamily) + "'");
                oRm.addClass("sapUiIcon");
            }
            oRm.writeClasses();
            oRm.writeStyles();
            oRm.write(">");
            oRm.write("</span>");
        };

        /*
         * renders the content of the card
         */
        CardRenderer.renderContentSection = function (oRm, oCard) {
            oRm.write("<section");
            oRm.addClass("sapFCardContent");
            oRm.writeClasses();
            oRm.write(">");
            oRm.renderControl(oCard.getAggregation("_content"));
            oRm.write("</section>");
        };

        return CardRenderer;
    }, /* bExport= */ true);