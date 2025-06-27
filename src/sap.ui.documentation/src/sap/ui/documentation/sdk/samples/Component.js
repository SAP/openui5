/*!
 * ${copyright}
 */

/**
 * @namespace sap.ui.documentation.sdk.samples
 * @classdesc
 * A UI5 component wrapper for dynamically loading and embedding an inner component
 * corresponding to a Demokit sample.
 * The purpose of this component is to provide the required setup for Runtime Adaptation (RTA),
 * namely:
 * (1) wrapper component is of "type": "application" in the manifest,
 * (2) the wrapper component registers to the "start" and "stop" events of RTA via its custom design time metadata
 *
 * @extends sap.ui.core.UIComponent
 *
 * @param {object} mSettings - Configuration settings for the component.
 * @param {string} mSettings.innerComponentName - The name of the inner component to load.
 * @param {string} mSettings.innerComponentId - The ID to assign to the inner component.
 *
 */
sap.ui.define([
    "sap/ui/core/Component",
    "sap/ui/core/UIComponent",
    "sap/ui/core/ComponentContainer",
    "sap/ui/core/CustomData",
    "sap/ui/core/Manifest",
    "sap/m/Page"
], function (Component, UIComponent, ComponentContainer, CustomData, Manifest, Page) {
    "use strict";

    /**
     * An object containing configuration settings.
     * @type {Object}
     */
    let oSettings = {};

    return UIComponent.extend("sap.ui.documentation.sdk.samples", {
        metadata: {
            manifest: "json",
            properties: {
                innerComponentName: { type: "string" },
                innerComponentId: { type: "string" }
            }
        },

        constructor: function (mSettings) {
            oSettings = mSettings;
            UIComponent.prototype.constructor.apply(this, arguments);
        },

        init: function () {
            UIComponent.prototype.init.apply(this, arguments);
        },

        /**
         * @override
         * Returns the manifest object for the component.
         * This method checks if the manifest contains the <code>appVariantId</code> for its inner component.
         * If not, it adds the <code>appVariantId</code> to the manifest.
         *
         * The <code>appVariantId</code> coincides with the name of the currently nested inner component.
         * This is required to ensure that any RTA changes made to the inner component are
         * saved in local storage as belonging to that same inner component.
         * @returns {sap.ui.core.Manifest} The manifest object for the component.
         */
        getManifestObject: function () {
            var oManifest = UIComponent.prototype.getManifestObject.call(this),
                sAppVariantId = oSettings.innerComponentName;

            if (!this._checkManifestContainsAppVariant(oManifest, sAppVariantId)) {
                this._addVariantToManifest(oManifest, sAppVariantId);
            }

            return oManifest;
        },

        _checkManifestContainsAppVariant: function (oManifest, sAppVariantId) {
            var oUI5Entry = oManifest.getEntry("sap.ui5");
            return (oUI5Entry && oUI5Entry.appVariantId === sAppVariantId);
        },

        _addVariantToManifest: function (oManifest, appVariantId) {
            oManifest.getEntry = function (sPath) {
                var oEntry = Manifest.prototype.getEntry.call(oManifest, sPath);
                if (sPath === "sap.ui5") {
                    oEntry = Object.assign({}, oEntry, {
                        appVariantId
                    });
                }
                return oEntry;
            };
        },

        createInnerComponent: function () {
            var sName = oSettings.innerComponentName;
            var sId = oSettings.innerComponentId;

            return Component.create({
                    id: sId,
                    name: sName
                }).then(function (oComponent) {
                    this._oInnerComponent = oComponent;
                    this._createComponentContainer();
                    return oComponent;
                }.bind(this));
        },

        _createComponentContainer: function() {
            var oContainer = new ComponentContainer({
                component: this._oInnerComponent,
                propagateModel: true,
                height: "100%"
            });

            var oRootControl = new Page({
                content: [oContainer],
                showHeader: false,
                customData: [
                    new CustomData({
                        key: "sap-ui-custom-settings",
                        value: {
                            "sap.ui.dt": {
                                "designtime": "sap/ui/documentation/sdk/samples/Page.designtime"
                            }
                        }
                    })
                ]
            });

            // Set the container as the root control of the wrapper
            this.setAggregation("rootControl", oRootControl);
        },

        exit: function() {
            if (this._oInnerComponent) {
                this._oInnerComponent.destroy();
            }
        }
    });
});