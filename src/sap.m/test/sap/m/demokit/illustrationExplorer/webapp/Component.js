sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/documentation/sdk/controller/util/ConfigUtil",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel",
    "sap/ui/documentation/sdk/controller/util/CookiesConsentManager"
], (UIComponent,
    ConfigUtil,
    Device,
    JSONModel,
    CookiesConsentManager) => {
    "use strict";

    return UIComponent.extend("sap.ui.demo.illustrationExplorer.Component", {
        metadata: {
            manifest: "json"
        },

        /**
         * Initializes the component instance after creation.
         * @public
         * @override
         */
        init() {
            UIComponent.prototype.init.apply(this, arguments);

            const oCategoriesModel = new JSONModel(sap.ui.require.toUrl(
                "sap/ui/demo/illustrationExplorer/model/categories.json"
            ));
            this.setModel(oCategoriesModel, "categories");

            const oIllustrationModel = new JSONModel();
            this.setModel(oIllustrationModel, "illustration");

            this.getRouter().initialize();
        },

        /**
         * Cleans up resources and destroys the component.
         * @public
         * @override
         */
        destroy() {
            this._oConfigUtil?.destroy();
            this._oConfigUtil = null;

            this._oCookiesConsentManager?.destroy();
            this._oCookiesConsentManager = null;

            UIComponent.prototype.destroy.apply(this, arguments);
        },

        /**
         * Retrieves the configuration utility instance.
         * If the instance does not exist, it creates a new one.
         * @returns {ConfigUtil} The configuration utility instance.
         */
        getConfigUtil() {
            if (!this._oConfigUtil) {
                this._oConfigUtil = new ConfigUtil(this);
            }
            return this._oConfigUtil;
        },

        /**
         * Retrieves the content density class according to the device.
         * @returns {string} The content density class.
         */
        getContentDensityClass() {
            return Device.support.touch ? "sapUiSizeCozy" : "sapUiSizeCompact";
        },

        /**
         * Gets or creates the cookies consent manager instance.
         * @returns {object} The cookies consent manager instance
         */
        getCookiesConsentManager() {
            if (!this._oCookiesConsentManager) {
                const oConfig = {
                    defaultConsentDialogComponentId: "sap.ui.documentation.sdk.cookieSettingsDialog"
                };
                this._oCookiesConsentManager = CookiesConsentManager.create(this, oConfig);
            }
            return this._oCookiesConsentManager;
        }
    });
});