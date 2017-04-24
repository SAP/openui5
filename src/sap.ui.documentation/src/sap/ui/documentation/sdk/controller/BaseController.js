/*!
 * ${copyright}
 */

/*global history */
sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/ui/core/routing/History"
	], function (Controller, History) {
		"use strict";

		return Controller.extend("sap.ui.documentation.sdk.controller.BaseController", {

			// Prerequisites
			_oCore: sap.ui.getCore(),

			hideMasterSide : function() {
				var splitApp = this.getSplitApp();
				splitApp.setMode(sap.m.SplitAppMode.HideMode);
			},

			showMasterSide : function() {
				var splitApp = this.getSplitApp();
				splitApp.setMode(sap.m.SplitAppMode.ShowHideMode);
			},

			getSplitApp: function() {
				return this.getView().getParent().getParent();
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
			 * Convenience method for getting the application configuration located in manifest.json.
			 * @public
			 * @returns {object} the configuration of the component
			 */
			getConfig : function () {
				var oConfigModel = this.getOwnerComponent().getModel("config");
				if (oConfigModel) {
					return oConfigModel.getData();
				} else {
					return {};
				}
			},

			/**
			 * Event handler  for navigating back.
			 * It checks if there is a history entry. If yes, history.go(-1) will happen.
			 * If not, it will replace the current entry of the browser history with the master route.
			 * @public
			 */
			onNavBack : function(event) {
				var sPreviousHash = History.getInstance().getPreviousHash();

				if (sPreviousHash !== undefined) {
					// The history contains a previous entry
					history.go(-1);
				} else {
					var sCurrentHash = window.location.hash;

					if (sCurrentHash.indexOf("#/topic/") == 0) {
						this.getRouter().navTo("topic", {}, true);
					} else if (sCurrentHash.indexOf("#/api/") == 0) {
						this.getRouter().navTo("api", {}, true);
					}
				}
			},

			searchResultsButtonVisibilitySwitch : function(oButton) {
				var sPreviousHash = History.getInstance().getPreviousHash();
				if (sPreviousHash && sPreviousHash.indexOf("search/") === 0) {
					oButton.setVisible(true);
				} else {
					oButton.setVisible(false);
				}
			}

		});

	}
);
