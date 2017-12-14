/*!
 * ${copyright}
 */

/*global JSZip, Promise*/
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"jquery.sap.global",
	"sap/ui/demokit/demoapps/model/sourceFileDownloader",
	"sap/ui/demokit/demoapps/model/formatter",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/library"
], function (Controller, $, sourceFileDownloader, formatter, MessageBox, MessageToast, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("sap.ui.demokit.demoapps.controller.App", {

		formatter: formatter,

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

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
			], function (oFile) {
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
								// exclude relative paths outside of the app root (e.g. commong helpers, images, ...)
								if (!sFilePath.startsWith("../")) {
									oZipFile.file(sFilePath, oContent, {base64: false, binary: true});
								}
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
						this._createArchive(oFile, oContent, oListItem.getLabel());
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
						$.sap.registerResourcePath("test-resources","test-resources");
						var sRelativePath = $.sap.getResourcePath(oBindingContext.getObject().teaser);
						var oTeaser = sap.ui.xmlfragment(sId, sRelativePath);
						oBlockLayoutCell = sap.ui.xmlfragment(sId, "sap.ui.demokit.demoapps.view.BlockLayoutTeaserCell", this);
						oBlockLayoutCell.getContent()[0].addContent(oTeaser);
						$.sap.registerResourcePath("test-resources",null);
					} catch (oException) {
						$.sap.log.warning("Teaser for demo app \"" + oBindingContext.getObject().name + "\" could not be loaded: " + oException);
						oBlockLayoutCell = sap.ui.xmlfragment(sId, "sap.ui.demokit.demoapps.view.BlockLayoutCell", this);
					}
				} else { // normal cell
					oBlockLayoutCell = sap.ui.xmlfragment(sId, "sap.ui.demokit.demoapps.view.BlockLayoutCell", this);
				}
			} else { // headline tile
				oBlockLayoutCell = sap.ui.xmlfragment(sId, "sap.ui.demokit.demoapps.view.BlockLayoutHeadlineCell", this);
			}
			oBlockLayoutCell.setBindingContext(oBindingContext);

			return oBlockLayoutCell;
		},

		/* =========================================================== */
		/* helper methods                                              */
		/* =========================================================== */

		/**
		 * Archive creation function that can be stubbed easily in tests
		 * @param {object} oFile the jszip file handle
		 * @param {object} oContent the blob for the zip file
		 * @param {string} sFilename the file name
		 * @private
		 */
		_createArchive: function (oFile, oContent, sFilename) {
			oFile.save(oContent, sFilename, "zip", "application/zip");
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
