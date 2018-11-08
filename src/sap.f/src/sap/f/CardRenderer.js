/*!
 * ${copyright}
 */

// Provides default renderer for control sap.f.Card
sap.ui.define(["sap/f/library", "sap/base/security/encodeXML", "sap/ui/core/IconPool"],
    function (library, encodeXML, IconPool) {
        "use strict";
        var mSizes = {
            "1x1": {
                icon: true
            },
            "2x1": {
                icon: false,
                title: true,
                subtitle: true
            },
            "4x1": {
                icon: true,
                title: true,
                subtitle: true,
                status: true
            },
            "2x2": {
                icon: true,
                title: true,
                subtitle: true,
                status: false
            },
            "*x*": {
                icon: true,
                title: true,
                subtitle: true,
                status: true,
                content: true
            }
        };
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
            //start
            var mSizeSettings = CardRenderer.getSizeSettings(oCard),
                vRaster = oCard.getRaster(),
                iHorizontalSize = oCard.getHorizontalSize(),
				iVerticalSize = oCard.getVerticalSize(),
				bFitContainer = oCard.getFitContainer();

            oRm.write("<section");
            oRm.writeElementData(oCard);
            oRm.writeAttributeEscaped("aria-label", oCard.getTitle() + "-" + oCard.getSubtitle());
            oRm.writeAttribute("tabindex", "0");
			oRm.addClass("sapFCard");
			if (bFitContainer) {
                oRm.addClass("sapFCardFitContainer");
			} else {
				oRm.addClass("sapFCard" + iHorizontalSize + "x" + iVerticalSize);
			}
            if (oCard.getBusy()) {
                oRm.addClass("sapFCardLoading");
            }
            if (!mSizeSettings.content) {
                oRm.addClass("sapFCardNoContent");
            }
            oRm.writeClasses();

			if (!bFitContainer) {
				if (vRaster === "CSSGrid") {
					oRm.addStyle("grid-column", "span " + iHorizontalSize);
					oRm.addStyle("grid-row", "span " + iVerticalSize);
				} else {
					oRm.addStyle("min-width", "calc(" + iHorizontalSize + " * " + vRaster.minWidth + ")");
					oRm.addStyle("min-height", "calc(" + iVerticalSize + " * " + vRaster.minHeight + ")");
					oRm.addStyle("max-width", "calc(" + iHorizontalSize + " * " + vRaster.maxWidth + ")");
					oRm.addStyle("max-height", "calc(" + iVerticalSize + " * " + vRaster.maxHeight + ")");
				}
			}
            //styles
            var sColor = oCard.getColor(),
                sBackgroundColor = oCard.getBackgroundColor(),
                sBackgroundImage = oCard.getBackgroundImage(),
                sBackgroundImageSize = oCard.getBackgroundImageSize();
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
            CardRenderer.renderHeaderSection(oRm, oCard, mSizeSettings);

            //content
            if (mSizeSettings.content) {
                oRm.write("<div class=\"sapFCardSeparator\" />");
                CardRenderer.renderContentSection(oRm, oCard);
            }

            //end
            oRm.write("</section>");

        };

        /*
         * renders the header of the card
         */
        CardRenderer.renderHeaderSection = function (oRm, oCard, mSizeSettings) {
            oRm.write("<header");
            oRm.addClass("sapFCardHeader");
            oRm.writeClasses();
            oRm.writeStyles();
            oRm.write(">");
            if (mSizeSettings.icon && oCard.getIcon()) {
                CardRenderer.renderHeaderIcon(oRm, oCard);
            }


            if (mSizeSettings.title) {
                oRm.write("<div>");
                var sTitle = oCard.getTitle();
                oRm.write("<h1");
                oRm.addClass("sapFCardTitle");
                oRm.writeClasses();
                oRm.write(">");
                oRm.writeEscaped(sTitle);
                oRm.write("</h1>");
                if (mSizeSettings.subtitle) {
                    var sSubtitle = oCard.getSubtitle();
                    oRm.write("<h2");
                    oRm.addClass("sapFCardSubtitle");
                    oRm.writeClasses();
                    oRm.write(">");
                    oRm.writeEscaped(sSubtitle);
                    oRm.write("</h2>");
                }
                oRm.write("</div>");
            }

            if (mSizeSettings.status && oCard.getStatus()) {
                var sStatus = oCard.getStatus();
                if (sStatus) {
                    oRm.write("<span");
                    oRm.addClass("sapFCardStatus");
                    oRm.writeClasses();
                    oRm.write(">");
                    oRm.writeEscaped(sStatus);
                    oRm.write("</span>");
                }
            }
            oRm.write("</header>");
        };

        /*
         * renders the icon of the card
         */
        CardRenderer.renderHeaderIcon = function (oRm, oCard) {
            var sIcon = oCard.getIcon(),
                vIconInfo = IconPool.getIconInfo(oCard.getIcon(), undefined, "mixed"),
                bIconInfo = false,
                sColor = oCard.getIconColor() || oCard.getColor(),
                sIconBackgroundColor = oCard.getIconBackgroundColor();
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

        /*
         * renders the content of the card
         */
        CardRenderer.getSizeSettings = function (oCard) {
            var iVertical = oCard.getVerticalSize(),
                iHorizontal = oCard.getHorizontalSize(),
                mSettings = mSizes[iHorizontal + "x" + iVertical] || mSizes["*x*"];
            mSettings.vertical = iVertical;
            mSettings.horizontal = iHorizontal;
            return mSettings;
        };
        return CardRenderer;
    }, /* bExport= */ true);