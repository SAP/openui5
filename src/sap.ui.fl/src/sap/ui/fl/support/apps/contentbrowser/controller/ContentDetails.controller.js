/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/Dialog",
	"sap/m/Text",
	"sap/m/Button",
	"sap/ui/fl/support/apps/contentbrowser/lrepConnector/LRepConnector",
	"sap/ui/fl/support/apps/contentbrowser/utils/DataUtils"
], function (Controller, Dialog, Text, Button, LRepConnector, DataUtils) {
	"use strict";

	/**
	 * Controller for displaying detail of content in Content Browser.
	 *
	 * @constructor
	 * @alias sap.ui.fl.support.apps.contentbrowser.controller.ContentDetails
	 * @author SAP SE
	 * @version ${version}
	 * @experimental Since 1.45
	 */
	return Controller.extend("sap.ui.fl.support.apps.contentbrowser.controller.ContentDetails", {

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
			oRouter.getRoute("ContentDetails").attachMatched(this._onRouteMatched, this);
			oRouter.getRoute("ContentDetailsFlip").attachMatched(this._onRouteMatched, this);
		},

		/**
		 * Creates and binds the model for the selected content.
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
		 * @param {Object} sContentSuffix - content suffix for sending the metadata request
		 * @param {Object} oData - data which is received from <code>LRepConnector</code> "getContent" promise
		 * @returns {Promise} - <code>LRepConnector</code> "getContent" promise
		 * @private
		 */
		_onContentReceived: function (oModelData, oPage, sContentSuffix, oData) {
			var that = this;
			oModelData.data = DataUtils.formatData(oData, oModelData.fileType);

			if (oModelData.fileType) {
				return LRepConnector.getContent(oModelData.layer, sContentSuffix, true).then(
					that._onContentMetadataReceived.bind(that, oModelData, oPage),
					function () {
						oPage.setBusy(false);
					}
				);
			} else {
				return Promise().resolve();
			}
		},

		/**
		 * Handler if content metadata was received;
		 * Sets the received data to the current content model, updates the icon tab bar, and releases the busy mode of the current page.
		 * @param {Object} oModelData - model data of current page
		 * @param {Object} oPage - current page used to set display busy mode on/off
		 * @param {Object} oMetadata - metadata which is received from <code>LRepConnector</code> "getContent" promise
		 * @private
		 */
		_onContentMetadataReceived: function (oModelData, oPage, oMetadata) {
			oModelData.metadata = oMetadata;
			this.oSelectedContentModel.setData(oModelData);
			var oCore = sap.ui.getCore();
			var sIconTabBarId = this.getView().createId("contentDetailsIconTabBar");
			var oIconTabBar = oCore.getElementById(sIconTabBarId);
			if (oIconTabBar){
				var oFirstIconTabBarItem = oIconTabBar.getItems()[0];
				if (oIconTabBar.getSelectedKey() !== oFirstIconTabBarItem.getId()) {
					oIconTabBar.setSelectedItem(oFirstIconTabBarItem);
				}
			}
			oPage.setBusy(false);
		},

		/**
		 * Navigates to Edit mode of content.
		 * @public
		 */
		onEditClicked: function () {
			var oSelectedContentModel = this.getView().getModel("selectedContent");
			var oContentData = oSelectedContentModel.getData();
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

			oRouter.navTo("ContentDetailsEdit", {
				"layer": oContentData.layer,
				"namespace": encodeURIComponent(oContentData.namespace),
				"fileName": oContentData.fileName,
				"fileType": oContentData.fileType
			});
		},

		/**
		 * Handles the deletion button;
		 * The function displays a confirmation dialog. On confirmation, the deletion of the displayed content is triggered.
		 * @public
		 */
		onDeleteClicked: function () {
			var that = this;

			var oDialog = new Dialog({
				title: "{i18n>confirmDeletionTitle}",
				type: "Message",
				content: new Text({text: "{i18n>questionFileDeletion}"}),
				beginButton: new Button({
					text: "{i18n>confirm}",
					type: sap.m.ButtonType.Reject,
					press: function () {
						that._deleteFile();
						oDialog.close();
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
		},

		/**
		 * Handler if a deletion was confirmed.
		 * @returns {Promise} - <code>LRepConnector</code> "deleteFile" promise
		 * @private
		 */
		_deleteFile: function () {
			var oSelectedContentModel = this.getView().getModel("selectedContent");
			var oContentData = oSelectedContentModel.getData();
			var sSelectedLayer = oContentData.layer;
			var sContentLayer = "";

			oContentData.metadata.some(function (mMetadata) {
				if (mMetadata.name === "layer") {
					sContentLayer = mMetadata.value;
					return true;
				}
			});

			var sNamespace = oContentData.namespace;
			var sFileName = oContentData.fileName;
			var sFileType = oContentData.fileType;

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

			return LRepConnector.deleteFile(sContentLayer, sNamespace, sFileName, sFileType).then(function () {
				oRouter.navTo("LayerContentMaster", {
					"layer": sSelectedLayer,
					"namespace": encodeURIComponent(sNamespace)
				});
			});
		}
	});
});
