/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/fl/support/apps/contentbrowser/lrepConnector/LRepConnector",
	"sap/ui/fl/support/apps/contentbrowser/utils/DataUtils",
	"sap/ui/fl/Layer",
	"sap/m/Dialog",
	"sap/m/Text",
	"sap/m/Button",
	"sap/m/Input",
	"sap/m/library"
], function (
	Controller,
	LRepConnector,
	DataUtils,
	Layer,
	Dialog,
	Text,
	Button,
	Input,
	mobileLibrary
) {
	"use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	/**
	 * Controller for editing content in Content Browser.
	 *
	 * @constructor
	 * @alias sap.ui.fl.support.apps.contentbrowser.controller.ContentDetailsEdit
	 * @author SAP SE
	 * @version ${version}
	 * @experimental Since 1.45
	 */
	return Controller.extend("sap.ui.fl.support.apps.contentbrowser.controller.ContentDetailsEdit", {

		oSelectedContentModel: undefined,
		oDataUtils : DataUtils,

		/**
		 * Initialize function;
		 * Handles data binding and route matching.
		 * @public
		 */
		onInit: function () {
			this._initAndBindSelectedContentModel();
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("ContentDetailsEdit").attachMatched(this._onRouteMatched, this);
		},

		/**
		 * Creates and binds of the model for the selected content.
		 * @private
		 */
		_initAndBindSelectedContentModel: function () {
			this.oSelectedContentModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.oSelectedContentModel, "selectedContent");
		},

		/**
		 * Handler if a route was matched;
		 * Obtains information about layer, namespace, filename, and file type from the route's arguments, and then requests content from Layered Repository.
		 * @param {Object} oRouteMatch - route object which is specified in the router and matched via regexp
		 * @returns {Promise} - <code>LRepConnector</code> "getContent" promise
		 * @private
		 */
		_onRouteMatched: function (oRouteMatch) {
			var that = this;
			var mRouteArguments = oRouteMatch.getParameter("arguments");

			var oModelData = {};
			oModelData.layer = mRouteArguments.layer;
			oModelData.namespace = decodeURIComponent(mRouteArguments.namespace);
			oModelData.fileName = mRouteArguments.fileName;
			oModelData.fileType = mRouteArguments.fileType;

			// correct namespace
			if (oModelData.namespace[oModelData.namespace.length - 1] !== "/") {
				oModelData.namespace += "/";
			}
			var sContentSuffix = oModelData.namespace + oModelData.fileName + "." + oModelData.fileType;

			var oPage = that.getView().getContent()[0];
			oPage.setBusy(true);

			return LRepConnector.getContent(oModelData.layer, sContentSuffix, null, null, true).then(
				that._onContentReceived.bind(that, oModelData, oPage, sContentSuffix),
				function () {
					oPage.setBusy(false);
				}
			);
		},

		/**
		 * Handler if content data was received;
		 * Formats the received data into the correct file type and requests the file metadata.
		 * @param {Object} oModelData - model data of current page
		 * @param {Object} oPage - current page used to set display busy mode on/off
		 * @param {Object} sContentSuffix - content suffix to send metadata request
		 * @param {Object} oData - data which is received from <code>LRepConnector</code> "getContent" promise
		 * @returns {Promise} - <code>LRepConnector</code> "getContent" promise
		 * @private
		 */
		_onContentReceived: function (oModelData, oPage, sContentSuffix, oData) {
			var that = this;
			return LRepConnector.getContent(oModelData.layer, sContentSuffix, true).then(
				function (oMetadata) {
					oModelData.data = DataUtils.formatData(oData, oModelData.fileType);
					oModelData.metadata = oMetadata;
					that.oSelectedContentModel.setData(oModelData);
					oPage.setBusy(false);
				}, function () {
				oPage.setBusy(false);
			}
			);
		},

		/**
		 * Handler for a "Save" action in "Edit" mode;
		 * Checks the current layer, namespace, filename, and file type and select correct transport id (through a dialog if necessary) and trigger save request of file.
		 * @public
		 */
		onSave: function () {
			var that = this;
			var oSelectedContentModel = this.getView().getModel("selectedContent");
			var oContentData = oSelectedContentModel.getData();
			var sLayer;
			var sTransportIdFromContent;
			var sPackageFromContent;
			var sTransportId;
			var sPackageName;
			oContentData.metadata.some(function (oMetadata) {
				if (oMetadata.name === "layer") {
					sLayer = oMetadata.value;
					return true;
				}
			});
			oContentData.metadata.some(function (mMetadata) {
				if (mMetadata.name === "transportId") {
					sTransportIdFromContent = mMetadata.value;
					return true;
				}
			});
			try {
				sPackageFromContent = JSON.parse(oContentData.data).packageName;
			} catch (e) {
				//when content is not in JSON format (Ex: js or code_ext file), package is undefined but does not break the code.
			}

			if ((sLayer === Layer.USER) ||
				(sLayer === "LOAD") ||
				(sLayer === "VENDOR_LOAD") ||
				(!sTransportIdFromContent && (!sPackageFromContent || sPackageFromContent === "$TMP"))) {
				sTransportId = undefined;
				this._saveFile(sLayer, oContentData.namespace, oContentData.fileName, oContentData.fileType, oContentData.data, sTransportId, sPackageName);
			} else if (sTransportIdFromContent === "ATO_NOTIFICATION") {
				sTransportId = sTransportIdFromContent;
				this._saveFile(sLayer, oContentData.namespace, oContentData.fileName, oContentData.fileType, oContentData.data, sTransportId, sPackageName);
			} else {
				var isPackageVisible = !!(sLayer === Layer.VENDOR || sLayer === Layer.CUSTOMER_BASE);
				var oPackageInput = new Input({visible: isPackageVisible, placeholder: "Package name (Only necessary for cross client content)" });
				var oTransportInput = new Input({placeholder: "Transport ID or ATO_NOTIFICATION" });
				var oDialog = new Dialog({
					title: "{i18n>transportInput}",
					type: "Message",
					content: [
						new Text({text: "{i18n>transportInputDescription}"}),
						oPackageInput,
						oTransportInput],
					beginButton: new Button({
						text: "{i18n>confirm}",
						type: ButtonType.Reject,
						press: function () {
							sPackageName = oPackageInput.getValue();
							sTransportId = oTransportInput.getValue();
							oDialog.close();
							that._saveFile(sLayer, oContentData.namespace, oContentData.fileName, oContentData.fileType, oContentData.data, sTransportId, sPackageName);
						}
					}),
					endButton: new Button({
						text: "{i18n>cancel}",
						press: function () {
							oDialog.close();
						}
					}),
					afterClose: function () {
						oDialog.destroy();
					}
				});
				this.getView().addDependent(oDialog);
				oDialog.open();
			}
		},

		/**
		 * Send request to back end to saved file.
		 * After the file has been successfully saved, navigates to "Display" mode of the content.
		 * @returns {Promise} - <code>LRepConnector</code> "saveFiles" promise
		 * @private
		 */
		_saveFile: function (sLayer, sNameSpace, sFileName, sFileType, sData, sTransportId, sPackageName) {
			return LRepConnector.saveFile(sLayer, sNameSpace, sFileName, sFileType, sData, sTransportId, sPackageName).then(this._navToDisplayMode.bind(this));
		},

		/**
		 * Handler for "Cancel" action in "Edit" mode;
		 * Navigates back to "Display" mode of the content.
		 * @public
		 */
		onCancel: function () {
			this._navToDisplayMode();
		},

		/**
		 * Navigates from "Edit" mode to "Display" mode;
		 * Gathers layer, namespace, filename, and file type information and navigates to "ContentDetailsFlip" target.
		 * @private
		 */
		_navToDisplayMode: function () {
			var oSelectedContentModel = this.getView().getModel("selectedContent");
			var oContentData = oSelectedContentModel.getData();
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

			oRouter.navTo("ContentDetailsFlip", {
				layer: oContentData.layer,
				namespace: encodeURIComponent(oContentData.namespace),
				fileName: oContentData.fileName,
				fileType: oContentData.fileType
			});
		}
	});
});