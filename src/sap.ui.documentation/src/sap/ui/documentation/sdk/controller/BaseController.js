/*!
 * ${copyright}
 */

/*global history */
sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/ui/core/routing/History",
		"sap/ui/core/util/LibraryInfo",
		"sap/ui/documentation/sdk/controller/util/ControlsInfo",
		"sap/ui/documentation/sdk/controller/util/JSDocUtil"
	], function (Controller, History, LibraryInfo, ControlsInfo, JSDocUtil) {
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
			 * Retrieves the actual component for the control.
			 * @param {string} sControlName
			 * @return {string} the actual component
			 */
			_getControlComponent: function (sControlName) {
				var oLibComponentModel = ControlsInfo.data.libComponentInfos,
					oLibInfo = new LibraryInfo();
				return oLibInfo._getActualComponent(oLibComponentModel, sControlName);
			},

			/**
			 * This function wraps a text in a span tag so that it can be represented in an HTML control.
			 * @param {string} sText
			 * @returns {string}
			 * @private
			 */
			_wrapInSpanTag: function (sText) {

				var sFormattedTextBlock = JSDocUtil.formatTextBlock(sText, {
					linkFormatter: function (target, text) {

						var p;

						// If the link has a protocol, do not modify, but open in a new window
						if (target.match("://")) {
							return '<a target="_blank" href="' + target + '">' + (text || target) + '</a>';
						}

						target = target.trim().replace(/\.prototype\./g, "#");
						p = target.indexOf("#");
						if ( p === 0 ) {
							// a relative reference - we can't support that
							return "<code>" + target.slice(1) + "</code>";
						}

						if ( p > 0 ) {
							text = text || target; // keep the full target in the fallback text
							target = target.slice(0, p);
						}

						return "<a class=\"jsdoclink\" href=\"javascript:void(0);\" data-sap-ui-target=\"" + target + "\">" + (text || target) + "</a>";

					}
				});

				return '<span class="sapUiDocumentationJsDoc">' + sFormattedTextBlock + '</span>';
			}
		});

	}
);
