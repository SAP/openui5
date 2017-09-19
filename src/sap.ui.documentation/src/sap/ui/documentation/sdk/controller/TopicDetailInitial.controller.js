/*!
 * ${copyright}
 */

/*global location */
sap.ui.define([
		"sap/ui/documentation/sdk/controller/BaseController",
		"sap/ui/Device",
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/m/MessageToast"
	], function (BaseController, Device, JSONModel, Filter, FilterOperator, MessageToast) {
		"use strict";

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
			 * Opens the download dialog
			 * @param {sap.ui.base.Event} oEvent the Button press event
			 * @public
			 */
			onMainDownloadButtonPress: function (oEvent) {
				// Override of the SelectDialog's internal dialog height
				this.byId("downloadDialog").open()._oDialog.setContentHeight("");
			},

			/**
			 * Opens the developer's guide in a pdf format for a specific UI5 version in a new tab
			 * @param {sap.ui.base.Event} oEvent The Button press event
			 * @public
			 */
			onVersionDownloadButtonPress: function (oEvent) {
				// Gets the version, we need downloading the PDF for
				// by reading the label of the InputListItem containing the button.
				var sVersion = oEvent.getSource().getParent().getLabel(),
					sFileLocation = this._determineFileLocation(sVersion);

				if (sFileLocation) {
					window.open(sFileLocation, "_blank");
				} else {
					MessageToast.show("We're sorry. No such file found.");
				}
			},

			/**
			 * Filters the download dialog
			 * @param {sap.ui.base.Event} oEvent the SearchField liveChange event
			 * @public
			 */
			onSearch: function (oEvent) {
				oEvent.getParameters().itemsBinding.filter([
					new Filter("text", FilterOperator.Contains, oEvent.getParameters().value)
				]);
			},

			/**
			 * Determines the PDF's file location for a specific UI5 version
			 * @param {string} sVersion The UI5 version
			 * @returns {string} The location of the PDF file
			 * @private
			 */
			_determineFileLocation: function (sVersion) {
				var sFilePath;

				switch (sVersion) {
					case 'SAPUI5':
						sFilePath = 'https://help.sap.com/SAPUI5_PDF/SAPUI5.pdf';
						break;
					case 'SAPUI5 Internal':
						sFilePath = 'https://help.sap.com/DRAFT/SAPUI5_Internal_PDF/SAPUI5_Internal.pdf';
						break;
					case 'OpenUI5':
						sFilePath = 'https://help.sap.com/OpenUI5_PDF/OpenUI5.pdf';
						break;
					default:
						sFilePath = '';
				}

				return sFilePath;
			}
		});
	}
);