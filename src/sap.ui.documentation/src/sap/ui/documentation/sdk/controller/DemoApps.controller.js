/*!
 * ${copyright}
 */

sap.ui.define([
		"sap/base/Log",
		"sap/m/MessageBox",
		"sap/m/MessageToast",
		"sap/ui/Device",
		"sap/ui/VersionInfo",
		"sap/ui/documentation/sdk/controller/BaseController",
		"sap/ui/documentation/sdk/controller/util/ResourceDownloadUtil",
		"sap/ui/documentation/sdk/model/formatter",
		'sap/ui/documentation/sdk/model/libraryData',
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/resource/ResourceModel",
		"sap/ui/thirdparty/jquery"
	], function(Log, MessageBox, MessageToast, Device, VersionInfo, BaseController, ResourceDownloadUtil,
			 formatter, libraryData, Filter, FilterOperator, JSONModel, ResourceModel, jQuery) {
		"use strict";

		return BaseController.extend("sap.ui.documentation.sdk.controller.DemoApps", {

			formatter: formatter,

			/**
			 * Called when the controller is instantiated.
			 * @public
			 */
			onInit: function () {
				var oModel = new JSONModel(),
					oMessageBundle = new ResourceModel({
						bundleName: "sap.ui.documentation.messagebundle"
					});


				// load demo app metadata from docuindex of all available libraries
				libraryData.fillJSONModel(oModel);
				this.setModel(oModel);
				this.getView().setModel(oMessageBundle, "i18n");

				this.setModel(new JSONModel({
					demoAppsHomeLink: "topic/a3ab54ecf7ac493b91904beb2095d208"
					// etc
				}), "newWindowLinks");

				this.getRouter().getRoute("demoapps").attachPatternMatched(this._onMatched, this);

				VersionInfo.load().then(function (oVersionInfo) {
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
				var oDownloadDialog = this.byId("downloadDialog"),
					oDownloadDialogList = this.byId("downloadDialogList");
				this._oDownloadButton = oEvent.getSource();

				oDownloadDialogList.getBinding("items").filter([]);
				oDownloadDialog.open();
			},

			/**
			 * Opens more information about Demo Apps
			 * @public
			 */
			onReadMoreButtonPress: function () {
				var sLink = formatter.formatHttpHrefForNewWindow(this.getModel("newWindowLinks").getProperty("/demoAppsHomeLink"));
				window.open(sLink, "_blank");
			},

			/**
			 * Filters the download dialog
			 * @param {sap.ui.base.Event} oEvent the SearchField liveChange event
			 * @public
			 */
			onSearch: function (oEvent) {
				var oDownloadDialogList = this.byId("downloadDialogList"),
					sQuery = oEvent.getParameter("newValue");

				oDownloadDialogList.getBinding("items").filter([
					new Filter("name", FilterOperator.Contains, sQuery)
				]);
			},

			onCloseDialog: function() {
				var oDownloadDialog = this.byId("downloadDialog"),
					oDownloadDialogSearch = this.byId("downloadDialogSearch");

				oDownloadDialog.close();
				oDownloadDialogSearch.setValue("");
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
							var oPromise = ResourceDownloadUtil.fetch(oConfig.cwd + sFilePath);

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

						// add generic license file
						var sUrl = sap.ui.require.toUrl("LICENSE.txt").replace("resources/", "");
						var oLicensePromise = ResourceDownloadUtil.fetch(sUrl);
						var oLicensePromiseWrapper = new Promise(function(resolve, reject) {
							oLicensePromise.then(function (oContent) {
								oZipFile.file("LICENSE.txt", oContent);
								resolve();
							}).catch(function() {
								// LICENSE.txt not available in SAPUI5, continue without it
								resolve();
							});
						});

						aPromises.push(oLicensePromiseWrapper);

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