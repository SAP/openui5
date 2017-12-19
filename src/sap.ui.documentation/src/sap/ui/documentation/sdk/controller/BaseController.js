/*!
 * ${copyright}
 */

/*global history */
sap.ui.define([
		"sap/ui/documentation/library",
		"sap/ui/core/mvc/Controller",
		"sap/ui/core/routing/History",
		"sap/ui/Device",
		"sap/m/library",
		"sap/ui/documentation/sdk/controller/util/APIInfo"
	], function (library, Controller, History, Device, mobileLibrary, APIInfo) {
		"use strict";

		// shortcut for sap.m.SplitAppMode
		var SplitAppMode = mobileLibrary.SplitAppMode;

		return Controller.extend("sap.ui.documentation.sdk.controller.BaseController", {

			// Prerequisites
			_oCore: sap.ui.getCore(),

			onInit: function() {
				// Load <code>versionInfo</code> to ensure the <code>versionData</code> model is loaded.
				if (Device.system.phone || Device.system.tablet) {
					this.getOwnerComponent().loadVersionInfo(); // for Desktop is always loaded in <code>Component.js</code>
				}
			},

			hideMasterSide : function() {
				var splitApp = this.getSplitApp();
				splitApp.setMode(SplitAppMode.HideMode);
			},

			showMasterSide : function() {
				var splitApp = this.getSplitApp();
				splitApp.setMode(SplitAppMode.ShowHideMode);
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
			 * Convenience method for getting the application configuration located in manifest.json.
			 * @public
			 * @returns {object} the configuration of the component
			 */
			getConfig : function () {
				return this.getOwnerComponent().getMetadata().getConfig();
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
					if (sPreviousHash.indexOf("search/") === 0) {
						this.getRouter().navTo("search", {searchParam: sPreviousHash.split("/")[1]}, false);
					} else {
						history.go(-1);
					}
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
			},

			/**
			 * Getter for the application root view
			 * @return {sap.ui.core.mvc.View} Application root view
			 */
			getRootView: function () {
				var oComponent = this.getOwnerComponent();
				return oComponent.byId(oComponent.getManifestEntry("/sap.ui5/rootView").id);
			},

			/**
			 * Retrieves the actual component for the control.
			 * @param {string} sControlName
			 * @return {string} the actual component
			 */
			_getControlComponent: function (sControlName, oControlsData) {
				var oLibComponentModel = oControlsData.libComponentInfos,
					oLibInfo = library._getLibraryInfoSingleton();
				return oLibInfo._getActualComponent(oLibComponentModel, sControlName);
			},

			/**
			 * Switches the maximum height of the phone image for optimal display in landscape mode
			 * @param {sap.ui.base.Event} oEvent Device orientation change event
			 * @private
			 */
			_onOrientationChange: function(oEvent) {
				if (Device.system.phone) {
					this.byId("phoneImage").toggleStyleClass("phoneHeaderImageLandscape", oEvent.landscape);
				}
			},

			/**
			 * Registers an event listener on device orientation change
			 * @private
			 */
			_registerOrientationChange: function () {
				Device.orientation.attachHandler(this._onOrientationChange, this);
			},

			/**
			 * Deregisters the event listener for device orientation change
			 * @private
			 */
			_deregisterOrientationChange: function () {
				Device.orientation.detachHandler(this._onOrientationChange, this);
			},

			/**
			 * Handles landing image load event and makes landing image headline visible
			 * when the image has loaded.
			 */
			handleLandingImageLoad: function () {
				this.getView().byId("landingImageHeadline").setVisible(true);
			},
			/**
			 * Checks if a control has API Reference
			 * @param {string} sControlName
			 * @return {Promise} A promise that resolves to {boolean}
			 */
            getAPIReferenceCheckPromise: function (sControlName) {
				return APIInfo.getIndexJsonPromise().then(function (result) {
					var aFilteredResult;

					aFilteredResult = result.filter(function (element) {
						return element.name === sControlName;
					});

					return aFilteredResult && aFilteredResult.length > 0;
				});
			}
		});
	}
);
