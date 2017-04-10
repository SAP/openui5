/*!
 * ${copyright}
 */

/*global history */
sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/ui/core/routing/History",
		"jquery.sap.storage"
	], function (Controller, History, jQueryStorage) {
		"use strict";

		return Controller.extend("sap.ui.documentation.controller.BaseController", {

			// Prerequisites
			_oStorage: jQueryStorage.sap.storage(jQueryStorage.sap.storage.Type.local),
			_sStorageKey: "UI5_EXPLORED_VIEW_SETTINGS_FROM_1_48",
			_oDefaultSettings: {
				filter: {},
				groupProperty: "category",
				groupDescending: false,
				compactOn: false,
				themeActive: "sap_belize",
				rtl: false,
				version: jQuery.sap.Version(sap.ui.version).getMajor() + "." + jQuery.sap.Version(sap.ui.version).getMinor()
			},
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
			},

			/**
			 * Makes sure the view settings are initialized and apply application settings
			 * @private
			 */
			_applyViewConfigurations: function () {
				if (!this._oViewSettings) {
					this._initViewSettings();

					// Apply app settings
					this.getOwnerComponent().getEventBus().publish("app", "applyAppConfiguration", {
						themeActive: this._oViewSettings.themeActive,
						compactOn: this._oViewSettings.compactOn
					});
				}
			},

			/**
			 * Initialize the view settings. At first local storage is checked. If this is empty defaults are applied.
			 * @private
			 */
			_initViewSettings: function () {
				var sJson = this._oStorage.get(this._sStorageKey);
				if (!sJson) {
					// local storage is empty, apply default settings
					this._oViewSettings = this._oDefaultSettings;
				} else {
					this._oViewSettings = JSON.parse(sJson);

					// handle RTL-on in settings as this needs a reload
					if (this._oViewSettings.rtl && !jQuery.sap.getUriParameters().get('sap-ui-rtl')) {
						this._handleRTL(true);
					}
				}
			},

			/**
			 * Handles RTL|LTR mode switch of the Explored App
			 * @param {boolean} bSwitch to RTL mode
			 * @private
			 */
			_handleRTL: function (bSwitch) {
				// Include HashChanger only in this case
				jQuery.sap.require("sap.ui.core.routing.HashChanger");

				var HashChanger = sap.ui.require("sap/ui/core/routing/HashChanger"),
					oHashChanger = new HashChanger(),
					sHash = oHashChanger.getHash(),
					oUri = window.location;

				// TODO: remove this fix when microsoft fix this under IE11 on Win 10
				if (!oUri.origin) {
					oUri.origin = oUri.protocol + "//" + oUri.hostname + (oUri.port ? ':' + oUri.port : '');
				}

				// Add or remove the switch - Keep in mind that we are using window.location directly instead of the
				// reference. Changing the reference won't redirect the browser to the new URL.
				window.location = oUri.origin + oUri.pathname + (bSwitch ? "?sap-ui-rtl=true#" + sHash : "#/" + sHash);
			}

		});

	}
);
