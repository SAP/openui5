/*!
 * ${copyright}
 */

/*global JSZip, Promise*/
sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"jquery.sap.global",
		"sap/ui/demokit/demoapps/model/sourceFileDownloader",
		"sap/m/MessageBox",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator"
	], function (Controller, $, sourceFileDownloader, MessageBox, Filter, FilterOperator) {
		"use strict";

		return Controller.extend("sap.ui.demokit.demoapps.controller.Root", {
			onTilePress: function (oEvent) {
				var sRef = oEvent.getSource().data("ref");
				if (sRef !== "DOWNLOAD") {
					sap.m.URLHelper.redirect(sRef, true);
				} else {
					this._downloadTile = oEvent.getSource();
					var oDownloadDialog = this.byId("downloadDialog");
					oDownloadDialog.getBinding("items").filter([]);
					oDownloadDialog.open();
				}
			},
			onLiveChange: function (oEvent) {
				oEvent.getParameters().itemsBinding.filter([
					new Filter("name", FilterOperator.Contains, oEvent.getParameters().value)
				]);
			},
			onDownloadPress: function (oEvent) {
				var oListItem = oEvent.getParameters().selectedItem;
				var oDownloadTile = this._downloadTile;

				oDownloadTile.setBusy(true);
				sap.ui.require(["sap/ui/core/util/File", "sap/ui/thirdparty/jszip"], function (File) {
					var oZipFile = new JSZip();

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
							// Collect errors and show them
							if (aFails.length) {
								var sCompleteErrorMessage = aFails.reduce(function (sErrorMessage, sError) {
									return sErrorMessage + sError + "\n";
								}, "Was not able to locate the following files:\n");
								MessageBox.error(sCompleteErrorMessage);
							}

							// Still make the available files ready for download
							var oContent = oZipFile.generate({type:"blob"});
							oDownloadTile.setBusy(false);
							File.save(oContent, oListItem.getTitle(), "zip", "application/zip");
						});
					});

				});
			}
	})	;
	}
);
