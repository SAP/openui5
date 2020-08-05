/*!
 * ${copyright}
 */

/*global location */
sap.ui.define([
    "sap/ui/documentation/sdk/controller/BaseController",
    "sap/ui/Device",
    "sap/ui/thirdparty/jquery"
], function(BaseController, Device, jQuery0) {
		"use strict";

		var GIT_HUB_URL = "https://github.com/SAP/openui5-docs";

		return BaseController.extend("sap.ui.documentation.sdk.controller.TopicDetailInitial", {

			/**
			 * Called when the controller is instantiated.
			 * @public
			 */
			onInit: function () {
				BaseController.prototype.onInit.call(this);

				// manually call the handler once at startup as device API won't do this for us
				this._onOrientationChange({
					landscape: Device.orientation.landscape
				});

				this.handleDocumentationDisclaimer();
			},

			/**
			 * Documentation disclaimer handler. This method fetches the disclaimer json file and modify's the view
			 * to show disclaimer message if such is available in the loaded json file.
			 */
			handleDocumentationDisclaimer: function () {
				jQuery0.ajax(this.getConfig().docuPath + "disclaimer.json", {dataType: "json"}).then(function (oData) {
					var oView = this.getView();
					if (oData.showDisclaimer && oData.message) {
						oView.byId("disclaimerBlock").setVisible(true);
						oView.byId("disclaimerMessage").setText(oData.message);
					}
				}.bind(this), function () {
					// This functionality should fail silently
				});
			},

			/**
			 * Called before the view is rendered.
			 * @public
			 */
			onBeforeRendering: function() {
				this._deregisterOrientationChange();
			},

			/**
			 * Called after the view is rendered.
			 * @public
			 */
			onAfterRendering: function() {
				this._registerOrientationChange();
			},

			/**
			 * Called when the controller is destroyed.
			 * @public
			 */
			onExit: function() {
				this._deregisterOrientationChange();
			},

			/**
			 * Opens the developer's guide in a pdf format and in a new tab.
			 * @public
			 */
			onDownloadButtonPress: function () {
				window.open(this._determineFileLocation(), "_blank");
			},

			/**
			 * Opens the openui5-docs GitHub repo in a new tab.
			 * @public
			 */
			onGitHubButtonPress: function () {
				window.open(GIT_HUB_URL, "_blank");
			},

			/**
			 * Determines the downloaded PDF's file location.
			 * @returns {string} The location of the PDF file
			 * @private
			 */
			_determineFileLocation: function () {
				var oVersionModel = this.getModel("versionData"),
					bIsDevVersion = oVersionModel.getProperty('/isDevVersion'),
					bIsOpenUI5 = oVersionModel.getProperty('/isOpenUI5');

				if (bIsOpenUI5) {
					return 'https://help.sap.com/OpenUI5_PDF/OpenUI5.pdf';
				}

				return bIsDevVersion ? 'https://help.sap.com/DRAFT/SAPUI5_Internal_PDF/SAPUI5_Internal.pdf' : 'https://help.sap.com/SAPUI5_PDF/SAPUI5.pdf';
			}
		});
	}
);