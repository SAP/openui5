/*!
 * ${copyright}
 */

/**
 * Base Class for all typed cards
 */
sap.ui.define(['jquery.sap.global', 'sap/ui/core/UIComponent'],
    function (jQuery, UIComponent) {
        "use strict";

        var CardComponent = UIComponent.extend("sap.f.cards.CardComponent", {
            constructor: function (mSettings) {
                UIComponent.apply(this, arguments);
                this._mSettings = mSettings;
            },
            metadata: {
                properties: {
                    verticalSize: {
                        type: "int"
                    },
                    horizontalSize: {
                        type: "int"
                    }
                }
            }
        });

        CardComponent.prototype.applySettings = function () {
            UIComponent.prototype.applySettings.apply(this, arguments);
        };

        CardComponent.prototype.createContent = function () {
            //var mSettings = this._mSettings,
            //mCards = this._getManifestEntry("sap.cards");
            return UIComponent.prototype.createContent.apply(this, arguments);
        };
        /**
         * Renders the root control of the UIComponent.
         *
         * @param {sap.ui.core.RenderManager} oRenderManager a RenderManager instance
         * @public
         */
        UIComponent.prototype.render = function (oRenderManager) {
            var oControl = this.getRootControl();
            if (oControl && oRenderManager) {
                oRenderManager.renderControl(oControl);
            }
        };

        return CardComponent;

    });