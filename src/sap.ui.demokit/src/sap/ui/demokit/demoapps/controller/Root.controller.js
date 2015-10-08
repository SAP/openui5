/*!
 * ${copyright}
 */

/*global JSZip, Promise*/
sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"jquery.sap.global",
		"sap/ui/demokit/demoapps/model/sourceFileDownloader"
	], function (Controller, $, sourceFileDownloader) {
		"use strict";

		return Controller.extend("sap.ui.demokit.demoapps.controller.Root", {
			onTilePress: function (oEvent) {
				if (!this.getView().getModel().getProperty("/showDownloads")) {
					var sRef = oEvent.getSource().data("ref");
					sap.m.URLHelper.redirect(sRef, true);
				}
			},
			onDownloadPress: function (oEvent) {
				var oListItem = oEvent.getSource();

				oListItem.setBusy(true);
				sap.ui.require(["sap/ui/core/util/File", "sap/ui/thirdparty/jszip"], function (File) {
					var oZipFile = new JSZip();

					$.getJSON(oListItem.data("config"), function (oConfig) {
						var aFiles = oConfig.files,
							aPromises = [];

						// add extra download files
						aFiles.forEach(function(sFilePath) {
							var oPromise = sourceFileDownloader(oConfig.cwd + sFilePath);
							oPromise.then(function (oContent) {
								oZipFile.file(sFilePath, oContent);
							});
							aPromises.push(oPromise);
						});

						Promise.all(aPromises).then(function () {
							var oContent = oZipFile.generate({type:"blob"});
							oListItem.setBusy(false);
							File.save(oContent, oListItem.getTitle(), "zip", "application/zip");
						});
					});

				});
			},

			onDownloadTogglePress: function () {
				var oModel = this.getView().getModel();
				this.byId("dynamicSideContent").toggle();
				oModel.setProperty("/showDownloads", !oModel.getProperty("/showDownloads"));
			},
			breakpointChanged: function (oEvent) {
				var sCurrentBreakpoint = oEvent.getParameter("currentBreakpoint"),
					bSmallScreen = false;

				if (sCurrentBreakpoint === "S") {
					bSmallScreen = true;
				}

				var oModel = this.getView().getModel();
				oModel.setProperty("/smallScreen", bSmallScreen);
			}
	})	;
	}
);
