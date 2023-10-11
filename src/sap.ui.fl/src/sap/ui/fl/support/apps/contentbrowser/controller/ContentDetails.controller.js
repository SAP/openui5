/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/Dialog",
	"sap/m/Text",
	"sap/m/Button",
	"sap/m/Input",
	"sap/ui/fl/support/apps/contentbrowser/lrepConnector/LRepConnector",
	"sap/ui/fl/support/apps/contentbrowser/utils/DataUtils",
	"sap/ui/fl/Layer",
	"sap/m/library",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/UIComponent",
	"sap/ui/core/Element"
], function(
	Controller,
	Dialog,
	Text,
	Button,
	Input,
	LRepConnector,
	DataUtils,
	Layer,
	mobileLibrary,
	JSONModel,
	UIComponent,
	Element
) {
	"use strict";

	// shortcut for sap.m.ButtonType
	var {ButtonType} = mobileLibrary;

	/**
	 * Controller for displaying detail of content in Content Browser.
	 *
	 * @constructor
	 * @alias sap.ui.fl.support.apps.contentbrowser.controller.ContentDetails
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.45
	 * @private
	 */
	return Controller.extend("sap.ui.fl.support.apps.contentbrowser.controller.ContentDetails", {

		oSelectedContentModel: undefined,
		oDataUtils: DataUtils,

		/**
		 * Initialize function;
		 * Handles data binding and route matching.
		 * @public
		 */
		onInit() {
			this._initAndBindSelectedContentModel();
			var oRouter = UIComponent.getRouterFor(this);
			oRouter.getRoute("ContentDetails").attachMatched(this._onRouteMatched, this);
			oRouter.getRoute("ContentDetailsFlip").attachMatched(this._onRouteMatched, this);
		},

		/**
		 * Creates and binds the model for the selected content.
		 * @private
		 */
		_initAndBindSelectedContentModel() {
			this.oSelectedContentModel = new JSONModel();
			this.getView().setModel(this.oSelectedContentModel, "selectedContent");
		},

		/**
		 * Handler if a route was matched;
		 * Obtains information about layer, namespace, filename, and file type from the route's arguments, and then requests content from Layered Repository.
		 * @param {object} oRouteMatch - Route object which is specified in the router and matched via regexp
		 * @returns {Promise} <code>LRepConnector</code> "getContent" promise
		 * @private
		 */
		_onRouteMatched(oRouteMatch) {
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
			var sContentSuffix = `${oModelData.namespace + oModelData.fileName}.${oModelData.fileType}`;
			var oPage = that.getView().getContent()[0];
			oPage.setBusy(true);

			return LRepConnector.getContent(oModelData.layer, sContentSuffix, null, null, true).then(
				that._onContentReceived.bind(that, oModelData, oPage, sContentSuffix),
				function() {
					oPage.setBusy(false);
				}
			);
		},

		/**
		 * Handler if content data was received;
		 * Formats the received data into the correct file type and requests the file metadata.
		 * @param {object} oModelData - Model data of current page
		 * @param {object} oPage - Current page used to set display busy mode on/off
		 * @param {object} sContentSuffix - Content suffix for sending the metadata request
		 * @param {object} oData - Data which is received from <code>LRepConnector</code> "getContent" promise
		 * @returns {Promise} <code>LRepConnector</code> "getContent" promise
		 * @private
		 */
		_onContentReceived(oModelData, oPage, sContentSuffix, oData) {
			var that = this;
			oModelData.data = DataUtils.formatData(oData, oModelData.fileType);

			if (oModelData.fileType) {
				return LRepConnector.getContent(oModelData.layer, sContentSuffix, true).then(
					that._onContentMetadataReceived.bind(that, oModelData, oPage),
					function() {
						oPage.setBusy(false);
					}
				);
			}

			return Promise.resolve();
		},

		/**
		 * Handler if content metadata was received;
		 * Sets the received data to the current content model, updates the icon tab bar, and releases the busy mode of the current page.
		 * @param {object} oModelData - Model data of current page
		 * @param {object} oPage - Current page used to set display busy mode on/off
		 * @param {object} oMetadata - Metadata which is received from <code>LRepConnector</code> "getContent" promise
		 * @private
		 */
		_onContentMetadataReceived(oModelData, oPage, oMetadata) {
			oModelData.metadata = oMetadata;
			this.oSelectedContentModel.setData(oModelData);
			oModelData.metadata.some(function(oMetadata) {
				if (oMetadata.name === "layer") {
					if (oMetadata.value === "CUSTOMER") {
						this.getView().byId("activeVersionCheckBox").setVisible(true);
					} else {
						this.getView().byId("activeVersionCheckBox").setVisible(false);
					}
					return true;
				}
			}.bind(this));
			var sIconTabBarId = this.getView().createId("contentDetailsIconTabBar");
			var oIconTabBar = Element.getElementById(sIconTabBarId);
			if (oIconTabBar) {
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
		onEditClicked() {
			var oSelectedContentModel = this.getView().getModel("selectedContent");
			var oContentData = oSelectedContentModel.getData();
			var oRouter = UIComponent.getRouterFor(this);

			oRouter.navTo("ContentDetailsEdit", {
				layer: oContentData.layer,
				namespace: encodeURIComponent(oContentData.namespace),
				fileName: oContentData.fileName,
				fileType: oContentData.fileType
			});
		},

		/**
		 * Handles the deletion button;
		 * The function displays a confirmation dialog. On confirmation, the deletion of the displayed content is triggered.
		 * @public
		 */
		onDeleteClicked() {
			var that = this;

			var oDialog = new Dialog({
				title: "{i18n>confirmDeletionTitle}",
				type: "Message",
				content: new Text({text: "{i18n>questionFileDeletion}"}),
				beginButton: new Button({
					text: "{i18n>confirm}",
					type: ButtonType.Reject,
					press() {
						oDialog.close();
						that._selectTransportAndDeleteFile();
					}
				}),
				endButton: new Button({
					text: "{i18n>cancel}",
					press() {
						oDialog.close();
					}
				}),
				afterClose() {
					oDialog.destroy();
				}
			});

			this.getView().addDependent(oDialog);

			oDialog.open();
		},

		/**
		 * Select correct transport id (through a dialog if necessary) and trigger deletion of file.
		 * @private
		 */
		_selectTransportAndDeleteFile() {
			var that = this;
			var oSelectedContentModel = this.getView().getModel("selectedContent");
			var bOnActivatedVersion = this.getView().byId("activeVersionCheckBox").getSelected();
			var oContentData = oSelectedContentModel.getData();
			var sSelectedLayer = oContentData.layer;
			var sContentLayer = "";
			var sTransportIdFromContent;
			var sPackageFromContent;
			var sTransportId;

			oContentData.metadata.some(function(mMetadata) {
				if (mMetadata.name === "layer") {
					sContentLayer = mMetadata.value;
					return true;
				}
			});
			oContentData.metadata.some(function(mMetadata) {
				if (mMetadata.name === "transportId") {
					sTransportIdFromContent = mMetadata.value;
					return true;
				}
			});
			try {
				sPackageFromContent = JSON.parse(oContentData.data).packageName;
			} catch (e) {
				// when content is not in JSON format, package is undefined but does not break the code.
			}

			var sNamespace = oContentData.namespace;
			var sFileName = oContentData.fileName;
			var sFileType = oContentData.fileType;

			if ((sContentLayer === Layer.USER) ||
				(sContentLayer === "LOAD") ||
				(sContentLayer === "VENDOR_LOAD") ||
				(!sTransportIdFromContent && (!sPackageFromContent || sPackageFromContent === "$TMP"))) {
				// USER, LOAD (and VENDOR_LOAD) layers together with non-ABAP and local ABAP content do not need transport
				sTransportId = undefined;
				that._deleteFile(sContentLayer, sNamespace, sFileName, sFileType, sTransportId, sSelectedLayer, bOnActivatedVersion);
			} else if (sTransportIdFromContent === "ATO_NOTIFICATION") {
				// ATO_NOTIFICATION content
				sTransportId = sTransportIdFromContent;
				that._deleteFile(sContentLayer, sNamespace, sFileName, sFileType, sTransportId, sSelectedLayer, bOnActivatedVersion);
			} else {
				// Bring up an simple transport input dialog
				var oTransportInput = new Input({placeholder: "Transport ID or ATO_NOTIFICATION" });
				var oDialog = new Dialog({
					title: "{i18n>transportInput}",
					type: "Message",
					content: [
						new Text({text: "{i18n>transportInputDescription}"}),
						oTransportInput],
					beginButton: new Button({
						text: "{i18n>confirm}",
						type: ButtonType.Accept,
						press() {
							sTransportId = oTransportInput.getValue();
							oDialog.close();
							that._deleteFile(sContentLayer, sNamespace, sFileName, sFileType, sTransportId, sSelectedLayer);
						}
					}),
					endButton: new Button({
						text: "{i18n>cancel}",
						press() {
							oDialog.close();
						}
					}),
					afterClose() {
						oDialog.destroy();
					}
				});
				this.getView().addDependent(oDialog);
				oDialog.open();
			}
		},

		/**
		 * Handler if a deletion was confirmed.
		 * @returns {Promise} <code>LRepConnector</code> "deleteFile" promise
		 * @private
		 */
		_deleteFile(sLayer, sNamespace, sFileName, sFileType, sTransportId, sSelectedLayer, bSupport) {
			return LRepConnector.deleteFile(sLayer, sNamespace, sFileName, sFileType, sTransportId, bSupport).then(function() {
				var oRouter = UIComponent.getRouterFor(this);
				oRouter.navTo("LayerContentMaster", {
					layer: sSelectedLayer,
					namespace: encodeURIComponent(sNamespace)
				});
			}.bind(this));
		}
	});
});
