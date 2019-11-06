/*!
 * ${copyright}
 */

/*global history */
sap.ui.define([
		"sap/ui/thirdparty/jquery",
		"sap/ui/documentation/sdk/controller/BaseController",
		"sap/ui/model/resource/ResourceModel",
		"sap/ui/Device",
		"sap/ui/model/json/JSONModel",
		"sap/ui/documentation/sdk/model/sourceFileDownloader",
		"sap/ui/documentation/sdk/model/formatter",
		"sap/m/MessageBox",
		"sap/m/MessageToast",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		'sap/ui/documentation/sdk/model/libraryData',
		"sap/base/Log"
	], function(jQuery, BaseController, ResourceModel, Device, JSONModel, sourceFileDownloader, formatter, MessageBox, MessageToast, Filter, FilterOperator, libraryData, Log) {
		"use strict";

		return BaseController.extend("sap.ui.documentation.sdk.controller.DemoApps", {

			formatter: formatter,

			/**
			 * Called when the controller is instantiated.
			 * @public
			 */
			onInit: function () {
				// set i18n model on view
				var oModel = new JSONModel(),
					i18nModel = new ResourceModel({
						bundleName: "sap.ui.documentation.sdk.i18n.i18n"
					});

				this.getView().setModel(i18nModel, "i18n");

				// load demo app metadata from docuindex of all available libraries
				libraryData.fillJSONModel(oModel);
				this.setModel(oModel);

				this.getRouter().getRoute("demoapps").attachPatternMatched(this._onMatched, this);

				sap.ui.getVersionInfo({async: true}).then(function (oVersionInfo) {
					var oViewModel = new JSONModel({
						isOpenUI5: oVersionInfo && oVersionInfo.gav && /openui5/i.test(oVersionInfo.gav)
					});
					this.getView().setModel(oViewModel, "appView");
				}.bind(this));

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
				Device.orientation.detachHandler(this._onOrientationChange, this);
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
				Device.media.detachHandler(this._onResize, this);
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
			},

			/**
			 * Handles "demoapps" routing
			 * @function
			 * @private
			 */
			_onMatched: function () {
				try {
					this.hideMasterSide();
				} catch (e) {
					// try-catch due to a bug in UI5 SplitApp, CL 1898264 should fix it
					Log.error(e);
				}
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
			 * Opens more information about Demo Apps
			 * @public
			 */
			onReadMoreButtonPress: function () {
				window.open("topic/a3ab54ecf7ac493b91904beb2095d208", "_blank");
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
					jQuery.getJSON(oListItem.data("config"), function (oConfig) {
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
									// exclude relative paths outside of the app root (e.g. common helpers, images, ...)
									if (!sFilePath.startsWith("../")) {
										oZipFile.file(sFilePath, oContent, { base64: false, binary: true });
									}
								}
							});
							aPromises.push(oPromise);
						});

						// add generic license and notice file
						var oLicensePromise = sourceFileDownloader(sap.ui.require.toUrl("sap/ui/documentation/sdk/tmpl/LICENSE.txt"));
						oLicensePromise.then(function (oContent) {
							oZipFile.file("LICENSE.txt", oContent, { base64: false, binary: true });
						});
						aPromises.push(oLicensePromise);
						var oNoticePromise = sourceFileDownloader(sap.ui.require.toUrl("sap/ui/documentation/sdk/tmpl/NOTICE.txt"));
						oNoticePromise.then(function (oContent) {
							oZipFile.file("NOTICE.txt", oContent, { base64: false, binary: true });
						});
						aPromises.push(oNoticePromise);

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
			 * @return {sap.ui.layout.BlockLayoutCell} either a teaser cell or a demo app cell based on the metadata in the model
			 * @public
			 */
			createDemoAppCell: function (sId, oBindingContext) {
				var oBlockLayoutCell;
				if (oBindingContext.getObject().teaser) { // teaser cell (loads fragment from demo app)
					try {
						sap.ui.loader.config({paths:{"test-resources":"test-resources"}});
						var sRelativePath = sap.ui.require.toUrl(oBindingContext.getObject().teaser);
						var oTeaser = sap.ui.xmlfragment(sId, sRelativePath);
						oBlockLayoutCell = sap.ui.xmlfragment(sId, "sap.ui.documentation.sdk.view.BlockLayoutTeaserCell", this);
						oBlockLayoutCell.getContent()[0].addContent(oTeaser);
						sap.ui.loader.config({paths:{"test-resources":null}});
						//sets the teaser to aria-hidden => gets ignored by screen reader
						oTeaser.addEventDelegate({"onAfterRendering": function() {
							this.getParent().getDomRef().childNodes[1].setAttribute("aria-hidden", "true");
							}.bind(oTeaser)});
					} catch (oException) {
						Log.warning("Teaser for demo app \"" + oBindingContext.getObject().name + "\" could not be loaded: " + oException);
						oBlockLayoutCell = sap.ui.xmlfragment(sId, "sap.ui.documentation.sdk.view.BlockLayoutCell", this);
					}
				} else { // normal cell
					oBlockLayoutCell = sap.ui.xmlfragment(sId, "sap.ui.documentation.sdk.view.BlockLayoutCell", this);
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
			},

			/**
			 * Handles landing image load event and makes landing image headline visible
			 * when the image has loaded.
			 */
			handleLandingImageLoad: function () {
				this.byId("landingImageHeadline").setVisible(true);
			}
		});
	}
);