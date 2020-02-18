/*!
 * ${copyright}
 */

/*global location */
sap.ui.define([
	"sap/ui/documentation/sdk/controller/BaseController",
	"sap/ui/thirdparty/URI"
], function (BaseController, URI) {
	"use strict";

	return BaseController.extend("sap.ui.documentation.sdk.controller.SampleBaseController", {
		_aMockFiles: ["products.json", "supplier.json", "img.json"],

		fetchSourceFile: function (sRef, sFile) {
			var that = this,
				sUrl = sRef + "/" + sFile,
				fnSuccess = function (result) {
					that._codeCache[sUrl] = result;
				},
				fnError = function (result) {
					that._codeCache[sUrl] = "not found: '" + sUrl + "'";
				};

			if (!(sUrl in this._codeCache)) {
				this._codeCache[sUrl] = "";
				jQuery.ajax(sUrl, {
					async: false,
					dataType: "text",
					success: fnSuccess,
					error: fnError
				});
			}

			return that._codeCache[sUrl];
		},
		onDownload: function () {
			sap.ui.require([
				"sap/ui/thirdparty/jszip",
				"sap/ui/core/util/File"
			], function (JSZip, File) {
				var oZipFile = new JSZip();

				// zip files
				var oData = this.oModel.getData();
				for (var i = 0; i < oData.files.length; i++) {
					var oFile = oData.files[i],
						sRawFileContent = oFile.raw;

					// change the bootstrap URL to the current server for all HTML files of the sample
					if (oFile.name && (oFile.name === oData.iframe || oFile.name.split(".").pop() === "html")) {
						sRawFileContent = this._changeIframeBootstrapToCloud(sRawFileContent);
					}

					oZipFile.file(oFile.name, sRawFileContent);

					// mock files
					for (var j = 0; j < this._aMockFiles.length; j++) {
						var sMockFile = this._aMockFiles[j];
						if (oFile.raw.indexOf(sMockFile) > -1) {
							oZipFile.file("mockdata/" + sMockFile, this.downloadMockFile(sMockFile));
						}
					}
				}

				var sRef = sap.ui.require.toUrl((this._sId).replace(/\./g, "/")),
					aExtraFiles = oData.includeInDownload || [],
					that = this,
					bHasManifest;

				// iframe examples have a separate index file and a component file to describe it
				if (!oData.iframe) {
					bHasManifest = oData.files.some(function (oFile) {
						return oFile.name === "manifest.json";
					});

					oZipFile.file("Component.js", this.fetchSourceFile(sRef, "Component.js"));
					oZipFile.file("index.html", this._changeIframeBootstrapToCloud(this._createIndexHtmlFile(oData, bHasManifest)));

					if (!bHasManifest) {
						oZipFile.file("index.js", this._changeIframeBootstrapToCloud(this._createIndexJsFile(oData)));
					}
				}

				// add extra download files
				aExtraFiles.forEach(function (sFileName) {
					oZipFile.file(sFileName, that.fetchSourceFile(sRef, sFileName));
				});

				// add generic license and notice file
				oZipFile.file("LICENSE.txt", this.fetchSourceFile(sap.ui.require.toUrl("sap/ui/documentation/sdk/tmpl/"), "LICENSE.txt"));
				oZipFile.file("NOTICE.txt", this.fetchSourceFile(sap.ui.require.toUrl("sap/ui/documentation/sdk/tmpl/"), "NOTICE.txt"));

				var oContent = oZipFile.generate({ type: "blob" });

				// save and open generated file
				File.save(oContent, this._sId, "zip", "application/zip");
			}.bind(this));
		},

		_createIndexHtmlFile: function (oData, bHasManifest) {
			var sRef = sap.ui.require.toUrl("sap/ui/documentation/sdk/tmpl"),
				sFile;

			sFile = this.fetchSourceFile(sRef, bHasManifest ? "indexevo.html.tmpl" : "index.html.tmpl");

			sFile = sFile.replace(/{{TITLE}}/g, oData.name)
				.replace(/{{SAMPLE_ID}}/g, oData.id);

			return sFile;
		},

		_createIndexJsFile: function (oData) {
			var sRef = sap.ui.require.toUrl("sap/ui/documentation/sdk/tmpl"),
				sFile = this.fetchSourceFile(sRef, "index.js.tmpl");

			sFile = sFile.replace(/{{TITLE}}/g, oData.name)
				.replace(/{{SAMPLE_ID}}/g, oData.id)
				.replace(/{{HEIGHT}}/g, oData.stretch ? 'height : "100%", ' : "")
				.replace(/{{SCROLLING}}/g, !oData.stretch);

			return sFile;
		},

		downloadMockFile: function (sFile) {
			var sRef = sap.ui.require.toUrl("sap/ui/demo/mock"),
				sWrongPath = "test-resources/sap/ui/documentation/sdk/images/",
				sCorrectPath = "https://openui5.hana.ondemand.com/test-resources/sap/ui/documentation/sdk/images/",
				oRegExp = new RegExp(sWrongPath, "g"),
				sMockData = this.fetchSourceFile(sRef, sFile);

			if (sMockData) {
				sMockData = sMockData.replace(oRegExp, sCorrectPath);
			}

			return sMockData;
		},

		_changeIframeBootstrapToCloud: function (sRawIndexFileHtml) {
			var rReplaceIndex = /src=(?:"[^"]*\/sap-ui-core\.js"|'[^']*\/sap-ui-core\.js')/,
				oCurrentURI = new URI(window.location.href).search(""),
				oRelativeBootstrapURI = new URI(sap.ui.require.toUrl("") + "/sap-ui-core.js"),
				sBootstrapURI = oRelativeBootstrapURI.absoluteTo(oCurrentURI).toString();

			// replace the bootstrap path of the sample with the current to the core
			return sRawIndexFileHtml.replace(rReplaceIndex, 'src="' + sBootstrapURI + '"');
		}
	});
}
);