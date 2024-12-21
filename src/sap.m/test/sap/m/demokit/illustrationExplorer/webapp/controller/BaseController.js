sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/base/Log"
], (Controller, UIComponent, Log) => {
    "use strict";

    return Controller.extend("sap.ui.demo.illustrationExplorer.controller.BaseController", {
        /**
         * Lifecycle method called when the controller is initialized.
         */
        onInit() {
            Log.setLevel(Log.Level.WARNING);

            this.applyContentDensityClass();
        },

        /**
         * Convenience method for accessing the router.
         * @public
         * @returns {sap.ui.core.routing.Router} the router for this component
         */
        getRouter() {
            return UIComponent.getRouterFor(this);
        },

        /**
         * Convenience method for getting the view model by name.
         * @public
         * @param {string} [sName] the model name
         * @returns {sap.ui.model.Model} the model instance
         */
        getModel(sName) {
            return this.getView().getModel(sName);
        },

        /**
         * Convenience method for setting the view model.
         * @public
         * @param {sap.ui.model.Model} oModel the model instance
         * @param {string} sName the model name
         * @returns {sap.ui.mvc.View} the view instance
         */
        setModel(oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },

        /**
         * Getter for the resource bundle.
         * @public
         * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
         */
        getResourceBundle() {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        /**
         * Adds the content density class to the view.
         * @public
         */
        applyContentDensityClass() {
            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
        },

        /**
         * Navigates to home page
         * @public
         */
        onNavToHome() {
            this.getRouter().navTo("home");
        }
    });
});