/*!
 * ${copyright}
 */

/*global Promise*/
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/Device",
	"sap/ui/model/json/JSONModel",
	"jquery.sap.global",
	"sap/ui/documentation/demoapps/model/sourceFileDownloader",
	"sap/ui/documentation/demoapps/model/formatter",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/library"
], function (Controller, Device, JSONModel, $, sourceFileDownloader, formatter, MessageBox, MessageToast, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("sap.ui.documentation.demoapps.controller.App", {

		formatter: formatter,

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Called when the controller is instantiated.
		 * @public
		 */
		onInit: function() {
			var oVersionInfo = sap.ui.getVersionInfo(),
				oViewModel = new JSONModel({
					isOpenUI5: oVersionInfo && oVersionInfo.gav && /openui5/i.test(oVersionInfo.gav)
				});

			this.getView().setModel(oViewModel, "appView");

			// manually call the handler once at startup as device API won't do this for us
			this._onOrientationChange({
				landscape: Device.orientation.landscape
			});
			this._onResize({
				name: (Device.resize.width <= 600 ? "Phone" : "NoPhone")
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
			this._registerResize();
		},

		/**
		 * Called when the controller is destroyed.
		 * @public
		 */
		onExit: function() {
			this._deregisterOrientationChange();
			this._deregisterResize();
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
			Device.media.detachHandler(this._onOrientationChange, this);
		},

		/**
		 * Registers an event listener on device resize
		 * @private
		 */
		_registerResize: function () {
			Device.media.attachHandler(this._onResize, this);
		},

		/**
		 * Deregisters the event listener for device resize
		 * @private
		 */
		_deregisterResize: function () {
			Device.orientation.detachHandler(this._onResize, this);
		},

		/**
		 * Switches the maximum height of the phone image for optimal display in landscape mode
		 * @param {sap.ui.base.Event} oEvent Device orientation change event
		 * @private
		 */
		_onOrientationChange: function(oEvent) {
			this.byId("phoneImage").toggleStyleClass("phoneHeaderImageLandscape", oEvent.landscape);
		},

		/**
		* Switches the image to phone and hides the download icon when decreasing the window size
		* @param {sap.ui.base.Event} oEvent Device media change event
		* @private
		*/
		_onResize: function(oEvent) {
			this.byId("phoneImage").setVisible(oEvent.name === "Phone");
			this.byId("desktopImage").setVisible(oEvent.name !== "Phone");
			this.byId("phoneImage").toggleStyleClass("phoneHeaderImageDesktop", oEvent.name === "Phone");
			this.byId("download").setIcon(oEvent.name === "Phone" || oEvent.name === "Tablet" ? "" : "sap-icon://download");
		},

		/**
		 * Opens the download dialog
		 * @param {sap.ui.base.Event} oEvent the Button press event
		 * @public
		 */
		onDownloadButtonPress: function (oEvent) {
			var oDownloadDialog = this.byId("downloadDialog");
			this._oDownloadButton = oEvent.getSource();

			oDownloadDialog.getBinding("items").filter([]);
			oDownloadDialog.open();
			// hack: override of the SelectDialog's internal dialog height
			oDownloadDialog._oDialog.setContentHeight("");
		},

		/**
		 * Filters the download dialog
		 * @param {sap.ui.base.Event} oEvent the SearchField liveChange event
		 * @public
		 */
		onSearch: function (oEvent) {
			oEvent.getParameters().itemsBinding.filter([
				new Filter("name", FilterOperator.Contains, oEvent.getParameters().value)
			]);
		},

		/**
		 * Downloads a demo app
		 * @param {sap.ui.base.Event} oEvent the Button press event
		 * @public
		 */
		onDownloadPress: function (oEvent) {
			var oSelectedItem = oEvent.getParameters().selectedItem,
				oListItem = oSelectedItem ? oSelectedItem : oEvent.getSource().getParent();

			this._oDownloadButton.setBusy(true);
			sap.ui.require([
				"sap/ui/core/util/File",
				"sap/ui/thirdparty/jszip"
			], function (File, JSZip) {
				var oZipFile = new JSZip();

				// load the config file from the custom data attached to the list item
				$.getJSON(oListItem.data("config"), function (oConfig) {
					var aFiles = oConfig.files,
						aPromises = [],
						aFails = [];

					// add extra download files
					aFiles.forEach(function(sFilePath) {
						var oPromise = sourceFileDownloader(oConfig.cwd + sFilePath);

						oPromise.then(function (oContent) {
							if (oContent.errorMessage) {
								// promise gets resolved in error case since Promise.all will not wait for all fails
								aFails.push(oContent.errorMessage);
							} else {
								oZipFile.file(sFilePath, oContent);
							}
						});
						aPromises.push(oPromise);
					});

					Promise.all(aPromises).then(function () {
						// collect errors and show them
						if (aFails.length) {
							var sCompleteErrorMessage = aFails.reduce(function (sErrorMessage, sError) {
								return sErrorMessage + sError + "\n";
							}, "Could not locate the following download files:\n");
							this._handleError(sCompleteErrorMessage);
						}

						// show success message
						this._oDownloadButton.setBusy(false);
						MessageToast.show("Downloading for app \"" + oListItem.getLabel() + "\" has been started");

						// still make the available files ready for download
						var oContent = oZipFile.generate({type:"blob"});
						this._createArchive(File, oContent, oListItem.getLabel());
					}.bind(this));
				}.bind(this));
			}.bind(this));
		},

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Factory function for creating the demo app cells
		 *
		 * @param {string} sId the id for the current cell
		 * @param {sap.ui.model.Context} oBindingContext the context for the current cell
		 * @return {sap.ui.layout.BlockLayoutCell} either a header cell or a demo app cell based on the metadata in the model
		 * @public
		 */
		createDemoAppRow: function (sId, oBindingContext) {
			var oBlockLayoutCell;
			if (!oBindingContext.getObject().categoryId) { // demo app tile
				if (oBindingContext.getObject().teaser) { // teaser cell (loads fragment from demo app)
					try {
						jQuery.sap.registerResourcePath("test-resources","test-resources");
						var sRelativePath = jQuery.sap.getResourcePath(oBindingContext.getObject().teaser);
						var oTeaser = sap.ui.xmlfragment(sId, sRelativePath);
						oBlockLayoutCell = sap.ui.xmlfragment(sId, "sap.ui.documentation.demoapps.view.BlockLayoutTeaserCell", this);
						oBlockLayoutCell.getContent()[0].addContent(oTeaser);
						jQuery.sap.registerResourcePath("test-resources",null);
					} catch (oException) {
						jQuery.sap.log.warning("Teaser for demo app \"" + oBindingContext.getObject().name + "\" could not be loaded: " + oException);
						oBlockLayoutCell = sap.ui.xmlfragment(sId, "sap.ui.documentation.demoapps.view.BlockLayoutCell", this);
					}
				} else { // normal cell
					oBlockLayoutCell = sap.ui.xmlfragment(sId, "sap.ui.documentation.demoapps.view.BlockLayoutCell", this);
				}
			} else { // headline tile
				oBlockLayoutCell = sap.ui.xmlfragment(sId, "sap.ui.documentation.demoapps.view.BlockLayoutHeadlineCell", this);
			}
			oBlockLayoutCell.setBindingContext(oBindingContext);

			return oBlockLayoutCell;
		},

		/* =========================================================== */
		/* helper methods                                              */
		/* =========================================================== */

		/**
		 * Archive creation function that can be stubbed easily in tests
		 * @param {object} File the jszip file handle
		 * @param {object} oContent the blob for the zip file
		 * @param {string} sFilename the file name
		 * @private
		 */
		_createArchive: function (File, oContent, sFilename) {
			File.save(oContent, sFilename, "zip", "application/zip");
		},

		/**
		 * Error handler function that can be stubbed easily in tests
		 * @param {string} sError the error message
		 * @private
		 */
		_handleError: function (sError) {
			MessageBox.error(sError);
		}
	});
});
