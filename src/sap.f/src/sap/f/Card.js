/*!
 * ${copyright}
 */

// Provides control sap.f.Card.
sap.ui.define([
    "./library",
    "sap/ui/core/Control",
    "sap/ui/core/ComponentContainer",
    "sap/f/cards/CardComponent",
    "sap/base/Log"
], function (
    library,
    Control,
    ComponentContainer,
    CardContentComponent,
    Log
) {
    "use strict";

    /**
     * Constructor for a new <code>Card</code>.
     *
     * @param {string} [sId] ID for the new control, generated automatically if no ID is given
     * @param {object} [mSettings] Initial settings for the new control
     *
     * @class
     * A control that represents header and content area as a card. Content area of a card should use controls or component located in the sub package sal.f.cardcontents.
     *
     * <h3>Overview</h3>
     *
     * The control consist of a header and content section
     *
     * <h3>Usage</h3>
     *
     * <h3>Responsive Behavior</h3>
     *
     * @extends sap.ui.core.Control
     *
     * @author SAP SE
     * @version ${version}
     *
     * @constructor
     * @experimental
     * @since 1.60
     * @see {@link TODO Card}
     * @alias sap.f.Card
     * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
     */

    //raster size
    var Card = Control.extend("sap.f.Card", /** @lends sap.f.Card.prototype */ {
        metadata: {
            library: "sap.f",
            properties: {
                /**
                 * Defines the title of the card that appears at the top of the header area of the <code>Card</code>
                 */
                title: {
                    type: "string",
                    defaultValue: ""
                },
                /**
                 * Defines the title of the card that appears below the title in the header area of the <code>Card</code>
                 */
                subtitle: {
                    type: "string",
                    defaultValue: ""
                },
                /**
                 * Defines the status text that appears at the end of title line of the <code>Card</code> header section.
                 */
                status: {
                    type: "string",
                    defaultValue: ""
                },
                /**
                 * Defines the icon to be displayed as graphical element within the <code>Card</code> header section.
                 * It can be an image or an icon from the icon font.
                 */
                icon: {
                    type: "sap.ui.core.URI",
                    group: "Appearance",
                    defaultValue: null
                },
                /**
                 * Reference path to the component that should be used to render the content.
                 * Cards without a content will visualize depending on the sizes given in verticalSize, horizontalSize.
                 */
                component: {
                    type: "string",
                    defaultValue: ""
                },
                /**
                 * The vertical size of the card. The default is 2. The raster taken as measurement is part of the css class sapFCardRasterSize width property.
                 */
                verticalSize: {
                    type: "int",
                    value: 2
                },
                /**
                 * The horizontal size of the card. The default is 2. The raster taken as measurement is part of the css class sapFCardRasterSize height property.
                 */
                horizontalSize: {
                    type: "int",
                    value: 2
                },
                /**
                 * Color of the Icon. If color is not defined here, the Icon inherits the color from its DOM parent.
                 *
                 * The property can be set with {@link sap.ui.core.CSSColor CSS Color} or {@link sap.ui.core.IconColor Semantic Icon Color}.
                 */
                iconColor: {
                    type: "string"
                },
                /**
                 * Background color of the Icon.
                 *
                 * The property can be set with {@link sap.ui.core.CSSColor CSS Color} or {@link sap.ui.core.IconColor Semantic Icon Color}.
                 */
                iconBackgroundColor: {
                    type: "string"
                },
                /**
                 * Color of the Cards texts and icons. The default color is derived by the theme.
                 *
                 * The property can be set with {@link sap.ui.core.CSSColor CSS Color} or {@link sap.ui.core.IconColor Semantic Icon Color}.
                 */
                color: {
                    type: "string"
                },
                /**
                 * Background color of the Card.
                 *
                 * The property can be set with {@link sap.ui.core.CSSColor CSS Color} or {@link sap.ui.core.IconColor Semantic Icon Color}.
                 */
                backgroundColor: {
                    type: "string"
                },
                /**
                 * Background image of the Card.
                 */
                backgroundImage: {
                    type: "string"
                },
                /**
                 * Background image size of the Card. Use stretch or cover from the corresponding CSS spec.
                 */
                backgroundImageSize: {
                    type: "string"
                }

            },
            aggregations: {
                /**
                 * @private
                 */
                _content: {
                    multiple: false,
                    visibility: "hidden"
                }
            },
            events: {
                /*
                ready: {},
                contentRequested: {},
                contentReady: {},
                */
            }
        }
    });

    /**
     * Extracts the raster from the css class.
     * TODO: Use JS access to the less parameters instead
     */
    Card.prototype.getRaster = function () {
        if (this.getParent().isA("sap.ui.layout.CSSGrid")) {
            return "CSSGrid";
        } else {
            if (!Card.defaultRaster) {
                var oSpan = document.createElement("span");
                oSpan.className = "sapFCardDefaultRaster";
                document.body.appendChild(oSpan);
                var oStyle = window.getComputedStyle(oSpan);
                //TODO: What about passing the oStyle here
                Card.defaultRaster = {
                    maxWidth: oStyle.maxWidth,
                    maxHeight: oStyle.maxHeight,
                    minWidth: oStyle.minWidth,
                    minHeight: oStyle.minHeight
                };
                oSpan.parentNode.removeChild(oSpan);
            }
            return Card.defaultRaster;
        }
    };

    /**
     * Just an idea to do a busy visualization of the separator line
     */
    Card.prototype.setBusy = function (bValue) {
        this.setProperty("busy", bValue, true);
        var oDomRef = this.getDomRef();
        if (oDomRef) {
            if (bValue === true) {
                oDomRef.classList.add("sapFCardLoading");
            } else {
                oDomRef.classList.remove("sapFCardLoading");
            }
        }
        return this;
    };

    /**
     * Setters
     */
    /**
     * After rendering is currently only used for scrolling an overflow text
     * Hovering the text will then css scroll it.
     * @private
     */
    Card.prototype.onAfterRendering = function () {
        var oDomRef = this.getDomRef();
        if (oDomRef) {
            var oTitleDomRef = oDomRef.querySelector("h1");
            if (oTitleDomRef) {
                if (oTitleDomRef.scrollWidth > oTitleDomRef.offsetWidth) {
                    oTitleDomRef.classList.add("sapFCardTextScroll");
                } else {
                    oTitleDomRef.classList.remove("sapFCardTextScroll");
                }
            }
            var oSubtitleDomRef = oDomRef.querySelector("h2");
            if (oSubtitleDomRef) {
                if (oSubtitleDomRef.scrollWidth > oSubtitleDomRef.offsetWidth) {
                    oSubtitleDomRef.classList.add("sapFCardTextScroll");
                } else {
                    oSubtitleDomRef.classList.remove("sapFCardTextScroll");
                }
            }
        }

    };

    Card.prototype.setTitle = function (sValue) {
        this.setProperty("title", sValue, true);
        var oDomRef = this.getDomRef();
        if (oDomRef) {
            var oTitleDomRef = oDomRef.querySelector("h1");
            if (oTitleDomRef) {
                oTitleDomRef.nodeValue = sValue;
            }
        }
        return this;
    };

    Card.prototype.setSubtitle = function (sValue) {
        this.setProperty("subtitle", sValue, true);
        var oDomRef = this.getDomRef();
        if (oDomRef) {
            var oSubtitleDomRef = oDomRef.querySelector("h2");
            if (oSubtitleDomRef) {
                oSubtitleDomRef.nodeValue = sValue;
            }
        }
        return this;
    };

    Card.prototype.setStatus = function (sValue) {
        this.setProperty("status", sValue, true);
        var oDomRef = this.getDomRef();
        if (oDomRef) {
            var oStatusDomRef = oDomRef.querySelector(".sapFCardStatus");
            if (oStatusDomRef) {
                oStatusDomRef.nodeValue = sValue;
            }
        }
        return this;
    };

    Card.prototype.setComponent = function (sValue) {
        var sOldValue = this.getComponent(),
            oCurrentContent = this.getAggregation("_content");

        if (sOldValue !== sValue && oCurrentContent) {
            oCurrentContent.destroy();
        }
        this.setProperty("component", sValue, true);
        if (sValue) {
            var oContent = new ComponentContainer({
                name: sValue,
                async: true,
                settings: {
                    verticalSize: this.getVerticalSize(),
                    horizontalSize: this.getHorizontalSize()
                }
            });
            this.setAggregation("_content", oContent);
        }
        return this;
    };
    return Card;
});