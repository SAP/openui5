/*!
 * ${copyright}
 */

// Provides control sap.m.LightBoxItem
sap.ui.define([
        'jquery.sap.global', './library', 'sap/ui/core/Element', './Image', './Text'],
    function(jQuery, library, Element, Image, Text) {
        "use strict";

        /**
         * Constructor for a new LightBoxItem.
         *
         * @param {string} [sId] ID for the new control, generated automatically if no ID is given
         * @param {object} [mSettings] Initial settings for the new control
         *
         * @class
         * Represents an item which is displayed within a sap.m.LightBox. This item holds all properties of the image as
         * well as the title and subtitle.
         * @extends sap.ui.core.Element
         *
         * @author SAP SE
         * @version ${version}
         *
         * @constructor
         * @public
         * @since 1.42
         * @alias sap.m.LightBoxItem
         * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
         */
        var LightBoxItem = Element.extend("sap.m.LightBoxItem", /** @lends sap.m.LightBoxItem.prototype */ {
            metadata: {

                library: "sap.m",
                properties: {
                    /**
                     * Source for the image. This property is mandatory. If not set the popup will not open
                     */
                    imageSrc: {type: 'sap.ui.core.URI', group: 'Appearance', multiple: false, defaultValue: ''},
                    /**
                     * Alt value for the image
                     */
                    alt: {type: 'string', group: 'Appearance', multiple: false, defaultValue: ''},
                    /**
                     * Title text for the image. This property is mandatory.
                     */
                    title: {type: 'string', group: 'Appearance', multiple: false, defaultValue: ''},
                    /**
                     * Subtitle text for the image
                     */
                    subtitle: {type: 'string', group: 'Appearance', multiple: false, defaultValue: ''}
                },
                aggregations: {
                    /**
                     * The image aggregation inside the LightBoxItem control.
                     * @private
                     */
                    _image: {type: 'sap.m.Image', multiple: false, visibility: 'hidden'},
                    /**
                     * The title aggregation inside the LightBoxItem control.
                     * @private
                     */
                    _title: {type: 'sap.m.Text', multiple: false, visibility: 'hidden'},
                    /**
                     * The subtitle aggregation inside the LightBoxItem control.
                     * @private
                     */
                    _subtitle: {type: 'sap.m.Text', multiple: false, visibility: 'hidden'}
                }
            }
        });

        LightBoxItem.prototype.init = function() {
            this._createNativeImage();

            this.setAggregation('_image', new Image({
                decorative: false,
                densityAware: false
            }), true);
            this.setAggregation('_title', new Text({
                wrapping : false
            }), true);
            this.setAggregation('_subtitle', new Text({
                wrapping : false
            }), true);
        };

        /**
         * Creates a native JavaScript Image object.
         * @private
         */
        LightBoxItem.prototype._createNativeImage = function () {
            var that = this;

            this._imageState = "LOADING";
            this._oImage = new window.Image();
            this._oImage.onload = function(oEvent) {
                if (this.complete && that._imageState === "LOADING") {
                    that._setImageState("LOADED");
                }
            };

            this._oImage.onerror = function(oEvent) {
                that._setImageState("ERROR");
            };
        };

        /**
         * Sets the state of the image. Possible values are "LOADING", "LOADED" and "ERROR"
         * @private
         * @param sImageState
         */
        LightBoxItem.prototype._setImageState = function (sImageState) {
            if (sImageState !== this._imageState) {
                this._imageState = sImageState;
                if (this.getParent()) {
                    this.getParent()._imageStateChanged(sImageState);
                }
            }
        };

        /**
         * Gets the state of the image.
         * @private
         * @returns {string} State of the image
         */
        LightBoxItem.prototype._getImageState = function() {
            return this._imageState;
        };

        /**
         * Gets the native JavaScript Image object.
         * @private
         * @returns {Image|*}
         */
        LightBoxItem.prototype._getNativeImage = function () {
            return this._oImage;
        };

        /**
         * Sets the source of the image.
         * @public
         * @param {sap.ui.core.URI} sImageSrc The image URI
         * @returns {LightBoxItem} Pointer to the control instance for chaining.
         */
        LightBoxItem.prototype.setImageSrc = function(sImageSrc) {
            var oImage = this.getAggregation("_image"),
                oLightBox = this.getParent();

            if (this.getImageSrc() === sImageSrc) {
                return this;
            }

            this._imageState = "LOADING";

            if (oLightBox && oLightBox._oPopup.getOpenState() === sap.ui.core.OpenState.OPEN) {
                this._oImage.src = sImageSrc;
            }

            this.setProperty("imageSrc", sImageSrc, false);
            oImage.setSrc(sImageSrc);

            return this;
        };

        /**
         * Sets the alt text of the image.
         * @public
         * @param {string} sAlt The alt text
         * @returns {LightBoxItem} Pointer to the control instance for chaining.
         */
        LightBoxItem.prototype.setAlt = function (sAlt) {
            var oImage = this.getAggregation("_image");

            this.setProperty("alt", sAlt, false);
            oImage.setAlt(sAlt);

            return this;
        };

        /**
         * Sets the title of the image.
         * @public
         * @param {string} sTitle The image title
         * @returns {LightBoxItem} Pointer to the control instance for chaining.
         */
        LightBoxItem.prototype.setTitle = function (sTitle) {
            var oTitle = this.getAggregation("_title");

            this.setProperty("title", sTitle, false);
            oTitle.setText(sTitle);

            return this;
        };

        /**
         * Sets the subtitle of the image.
         * @public
         * @param {string} sSubtitle The image subtitle
         * @returns {LightBoxItem} Pointer to the control instance for chaining.
         */
        LightBoxItem.prototype.setSubtitle = function (sSubtitle) {
            var oSubtitle = this.getAggregation("_subtitle");

            this.setProperty("subtitle", sSubtitle, false);
            oSubtitle.setText(sSubtitle);

            return this;
        };

        return LightBoxItem;
    }, /* bExport= */true);
