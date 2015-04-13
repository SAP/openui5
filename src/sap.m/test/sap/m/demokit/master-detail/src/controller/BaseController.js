/*!
 * ${copyright}
 */

sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/ui/core/routing/History"
	], function (Controller, History) {
	"use strict";

	return Controller.extend("sap.ui.demo.masterdetail.controller.BaseController", {

		/**
		 * Convenience method for accessing the event bus in every controller of the application.
		 * @public
		 * @returns {sap.ui.core.EventBus} the event bus for this component
		 */
		getEventBus : function () {
			return this.getOwnerComponent().getEventBus();
		},

		/**
		 * Convenience method for accessing the router in every controller of the application.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter : function () {
			return this.getOwnerComponent().getRouter();
		},

		/**
		 * Convenience method for getting the view model by name in every controller of the application.
		 * @public
		 * @param {string} sName the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel : function (sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model in every controller of the application.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel : function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Convenience method for getting the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle : function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Event handler  for navigating back.
		 * It checks if there is a history entry. If yes, history.go(-1) will happen.
		 * If not, a backward navigation with forward history will take place.
		 * @param {string} sRoute the route name where you would like to navigate to
		 * @param {object} mData optional data for the route
		 * @public
		 */
		onNavBack : function(sRoute, mData) {
			var sPreviousHash = History.getInstance().getPreviousHash();


			//The history contains a previous entry
			if (sPreviousHash !== undefined) {
				/*eslint-disable */
				window.history.go(-1);
				/*eslint-enable */
			} else {
				var bReplace = true; // otherwise we go backwards with a forward history
				this.getRouter().navTo(sRoute, mData, bReplace);
			}
		}

	});

});
