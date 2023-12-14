/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/documentation/sdk/controller/BaseController",
	"sap/ui/documentation/sdk/controller/util/ResourceDownloadUtil",
	"sap/ui/documentation/sdk/model/formatter",
	"sap/ui/documentation/sdk/model/libraryData",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/util/File",
	"sap/ui/thirdparty/jszip",
	"sap/ui/util/openWindow"
], function (Log, MessageToast, MessageBox, BaseController, ResourceDownloadUtil, formatter, libraryData, JSONModel, File, JSZip, openWindow) {
	"use strict";

	return BaseController.extend("sap.ui.documentation.sdk.controller.DemoApps", {

		formatter: formatter,

		/**
		 * Called when the controller is instantiated.
		 */
		onInit: function () {
			BaseController.prototype.onInit.call(this);

			this.processDemoAppsData();

			this.getRouter().getRoute("demoapps").attachPatternMatched(this.onPatternMatched, this);
		},

		/**
		 * Processes the demo apps data.
		 */
		processDemoAppsData: function() {
			libraryData.getDemoAppsData().then(function (aDemoApps) {
				aDemoApps = this.flattenDemoAppsCategories(aDemoApps);

				var oModel = new JSONModel(aDemoApps);
				this.setModel(oModel);

				this.addCategoryClassToGridItems("sapUiDemoKitDemoAppsMainContent");
			}.bind(this));
		},

		/**
		 * Flattens the demo apps by category.
		 * @param {object} data - The demo apps data.
		 * @returns {object} The flattened demo apps data.
		 */
		flattenDemoAppsCategories(data) {
			data.demoAppsByCategory.forEach(function(category) {
				category.rows = [].concat.apply([], category.rows);
			});

			return data;
		},

		/**
		 * Adds category class to each grid item.
		 * @param {string} gridId - The ID of the grid.
		 */
		addCategoryClassToGridItems(gridId) {
			this.byId(gridId).getItems().forEach(function(gridItem) {
				var cssClass = gridItem.data("demo-apps-category");
				gridItem.addStyleClass(cssClass);
			});
		},

		/**
		 * Creates an archive file and triggers a download.
		 *
		 * @param {object} oContent the blob for the zip file
		 * @param {string} sFilename the file name
		 */
		createArchive: function (oContent, sFilename) {
			File.save(oContent, sFilename, "zip", "application/zip");
		},

		/**
		 * Handles the pattern matched event.
		 * Currently, it hides the master side of the UI.
		 */
		onPatternMatched: function () {
			this.hideMasterSide();
		},

		/**
		 * Opens a new window with the demo apps home link.
		 */
		onReadMoreButtonPress: function () {
			var sDemoAppsReadMoreLink = "topic/a3ab54ecf7ac493b91904beb2095d208",
				sFormattedLink = formatter.formatHttpHrefForNewWindow(sDemoAppsReadMoreLink);

			openWindow(sFormattedLink, "_blank");
		},

		/**
		 * Handles the download press event.
		 *
		 * @param {object} oEvent - The event object.
		 */
		onDownloadPress: function (oEvent) {
			var oListItem = oEvent.getSource().getParent();

			fetch(oListItem.data("config"))
				.then(function (response) {
					return response.json();
				})
				.then(this.processFiles.bind(this, oListItem))
				.catch(function (error) {
					Log.error('Error: ', error);
					this.handleError('An error occurred: ' + error.message);
				}.bind(this));
		},

		/**
		 * Processes the files for the list item.
		 *
		 * @param {object} oListItem - The list item.
		 * @param {object} oConfig - The app configuration.
		 */
		processFiles: function (oListItem, oConfig) {
			var aFails = [],
				aPromises = [],
				oZipFile = new JSZip(),
				aFiles = oConfig.files;

			aFiles.forEach(function (sFilePath) {
				var oPromise = this.handleFilePromise(sFilePath, oZipFile, aFails, oConfig);
				aPromises.push(oPromise);
			}.bind(this));

			this.addLicenseFileToZip(aPromises, oZipFile);
			this.handlePromisesCompletion(aPromises, aFails, oZipFile, oListItem);
		},

		/**
		 * Handles the file promise.
		 *
		 * @param {string} sFilePath - The file path.
		 * @param {object} oZipFile - The zip file.
		 * @param {Array} aFails - The array of failed promises.
		 * @param {object} oConfig - The configuration.
		 *
		 * @returns {Promise} A promise that resolves with the file.
		 */
		handleFilePromise: function (sFilePath, oZipFile, aFails, oConfig) {
			var oPromise = ResourceDownloadUtil.fetch(oConfig.cwd + sFilePath);

			oPromise.then(function (oContent) {
				if (oContent.errorMessage) {
					aFails.push(oContent.errorMessage);
				} else if (!sFilePath.startsWith("../")) {
					oZipFile.file(sFilePath, oContent, { base64: false, binary: true });
				}
			});

			return oPromise;
		},

		/**
		 * Adds the license file to the zip file.
		 *
		 * @param {Array} aPromises - The array of promises.
		 * @param {object} oZipFile - The zip file.
		 */
		addLicenseFileToZip: function (aPromises, oZipFile) {
			var sUrl = sap.ui.require.toUrl("LICENSE.txt").replace("resources/", ""),
				oLicensePromise = ResourceDownloadUtil.fetch(sUrl),
				oLicensePromiseWrapper = new Promise(function (resolve, reject) {
					oLicensePromise.then(function (oContent) {
						oZipFile.file("LICENSE.txt", oContent);
						resolve();
					}).catch(function () {
						resolve();
					});
				});

			aPromises.push(oLicensePromiseWrapper);
		},

		/**
		 * Handles the completion of the promises.
		 *
		 * @param {Array} aPromises - The array of promises.
		 * @param {Array} aFails - The array of failed promises.
		 * @param {object} oZipFile - The zip file.
		 * @param {object} oListItem - The list item.
		 */
		handlePromisesCompletion: function (aPromises, aFails, oZipFile, oListItem) {
			Promise.all(aPromises).then(function () {
				if (aFails.length) {
					var sCompleteErrorMessage = aFails.reduce(function (sErrorMessage, sError) {
						return sErrorMessage + sError + "\n";
					}, "Could not locate the following download files:\n");
					this.handleError(sCompleteErrorMessage);
				}

				MessageToast.show("Downloading for app \"" + oListItem.getLabel() + "\" has been started");

				var oContent = oZipFile.generate({ type: "blob" });
				this.createArchive(oContent, oListItem.getLabel());
			}.bind(this));
		},

		/**
		 * Error handler function that can be stubbed easily in tests
		 * @param {string} sError the error message
		 * @private
		 */
		handleError: function (sError) {
			MessageBox.error(sError);
		}
	});
});