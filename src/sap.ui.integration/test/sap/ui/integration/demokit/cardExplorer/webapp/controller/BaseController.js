sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent"
], function(Controller, UIComponent) {
		"use strict";

		return Controller.extend("sap.ui.demo.cardExplorer.controller.BaseController", {
			/**
			 * Convenience method for accessing the router.
			 * @public
			 * @returns {sap.ui.core.routing.Router} the router for this component
			 */
			getRouter: function () {
				return UIComponent.getRouterFor(this);
			},

			/**
			 * Convenience method for getting the view model by name.
			 * @public
			 * @param {string} [sName] the model name
			 * @returns {sap.ui.model.Model} the model instance
			 */
			getModel: function (sName) {
				return this.getView().getModel(sName);
			},

			/**
			 * Convenience method for setting the view model.
			 * @public
			 * @param {sap.ui.model.Model} oModel the model instance
			 * @param {string} sName the model name
			 * @returns {sap.ui.mvc.View} the view instance
			 */
			setModel: function (oModel, sName) {
				return this.getView().setModel(oModel, sName);
			},

			/**
			 * Getter for the resource bundle.
			 * @public
			 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
			 */
			getResourceBundle : function () {
				return this.getOwnerComponent().getModel("i18n").getResourceBundle();
			},

			/**
			 * Adds eventListener on "load" event listener to the iframe, which is used to display topics.
			 */
			onFrameSourceChange: function () {
				var oDomRef = this.byId("topicFrame").getDomRef();

				// sync sapUiSizeCompact with the iframe
				if (oDomRef) {
					oDomRef.querySelector("iframe").addEventListener("load", function (oEvent) {
						var sClass = this.getOwnerComponent().getContentDensityClass();
						oEvent.target.contentDocument.body.classList.add(sClass);
					}.bind(this));
				}
			}
		});
	}
);