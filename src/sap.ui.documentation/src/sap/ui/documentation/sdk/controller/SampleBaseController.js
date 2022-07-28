/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/documentation/sdk/controller/BaseController",
	"sap/ui/thirdparty/URI",
	"sap/base/Log",
	"sap/ui/documentation/sdk/controller/util/ResourceDownloadUtil",
	"sap/ui/documentation/sdk/util/Resources"

], function (BaseController, URI, Log, ResourceDownloadUtil, ResourcesUtil) {
	"use strict";

		var TMPL_REF = sap.ui.require.toUrl("sap/ui/documentation/sdk/tmpl"),
			MOCK_DATA_REF = sap.ui.require.toUrl("sap/ui/demo/mock");

		var OPENUI5_LIBS = ["sap.ui.core", "sap.ui.dt", "sap.m", "sap.ui.fl", "sap.ui.layout", "sap.ui.mdc", "sap.ui.unified",
			"sap.f", "sap.ui.rta", "sap.ui.commons", "sap.ui.codeeditor", "sap.ui.table", "sap.uxap", "sap.ui.integration",
			"sap.tnt", "sap.ui.ux3", "sap.ui.suite", "sap.ui.webc.common", "sap.ui.webc.fiori", "sap.ui.webc.main" ];
		var SAPUI5_LIBS = ["sap.ushell", "sap.fe", "sap.viz", "sap.suite.ui.microchart", "sap.chart", "sap.ui.comp", "sap.ui.generic.app",
			"sap.fe.navigation", "sap.suite.ui.generic.template", "sap.ui.richtexteditor", "sap.suite.ui.commons", "sap.ui.export",
			"sap.ndc", "sap.me", "sap.fe.core", "sap.fe.macros", "sap.collaboration", "sap.fe.templates", "sap.ui.generic.template",
			"sap.zen.dsh", "sap.ovp", "sap.zen.crosstab", "sap.zen.commons", "sap.gantt", "sap.ui.mdc", "sap.fe.plugins", "sap.ui.vbm",
			"sap.apf", "sap.rules.ui", "sap.ui.vk", "sap.ui.vtm", "sap.ushell_abap", "sap.fe.placeholder", "sap.feedback.ui",
			"sap.fileviewer", "sap.ca.ui", "sap.landvisz"];

	return BaseController.extend("sap.ui.documentation.sdk.controller.SampleBaseController", {
		_aMockFiles: ["products.json", "supplier.json", "img.json"],

		fetchSourceFile: function (sUrl, bTreatAsText) {
			return ResourceDownloadUtil.fetch(sUrl, bTreatAsText).catch(function (e) {
				Log.warning(e);
				return "File not loaded"; // substitute content to display in the editor
			});
		},
		onDownload: function () {
			sap.ui.require([
				"sap/ui/thirdparty/jszip"
			], function (JSZip) {
				var oZipFile = new JSZip(),
					sRef = ResourcesUtil.getResourceOriginPath(sap.ui.require.toUrl((this._sId).replace(/\./g, "/"))),
					oData = this.oModel.getData(),
					aExtraFiles = oData.includeInDownload || [],
					oManifestFile,
					bHasManifest,
					aPromises = [],
					fnAddMockFileToZip = function(sRawFile) {
						var aMockFilePromises = [];
						for (var j = 0; j < this._aMockFiles.length; j++) {
							var sMockFileName = this._aMockFiles[j];
							if ((typeof sRawFile === "string") && sRawFile.indexOf(sMockFileName) > -1) {
								aMockFilePromises.push(this._addFileToZip({
									name: "mockdata/" + sMockFileName,
									url: MOCK_DATA_REF + "/" + sMockFileName,
									formatter: this._formatMockFile
								}, oZipFile));
							}
						}
						return Promise.all(aMockFilePromises);
					};

				// zip files
				for (var i = 0; i < oData.files.length; i++) {
					var oFile = oData.files[i],
						sUrl = sRef + "/" + oFile.name,
					// change the bootstrap URL to the current server for all HTML files of the sample
					bChangeBootstrap = oFile.name && (oFile.name === oData.iframe || oFile.name.split(".").pop() === "html");

					if (oFile.name === "manifest.json") {
						oManifestFile = oFile;
						aPromises.push(this._addFileToZip({
						   name: oFile.name,
						   url: sUrl,
						   formatter: this._formatManifestJsFile
						}, oZipFile));
						continue;
					 }

					aPromises.push(this._addFileToZip({
						name: oFile.name.replace(new RegExp(/(\.\.\/)+/g), "./"),
						url: sUrl,
						formatter:  bChangeBootstrap ? this._changeIframeBootstrapToCloud : undefined
					}, oZipFile));

					aPromises.push(this.fetchSourceFile(sUrl).then(fnAddMockFileToZip.bind(this)));
				}

				// iframe examples have a separate index file and a component file to describe it
				if (!oData.iframe || ResourcesUtil.getHasProxy()) {
					bHasManifest = oData.files.some(function (oFile) {
						return oFile.name === "manifest.json";
					});


					aPromises.push(this._addFileToZip({
						name: "Component.js",
						url: sRef + "/" + "Component.js"
					}, oZipFile));


					aPromises.push(this._addFileToZip({
						name: "index.html",
						url: TMPL_REF + "/" + (bHasManifest ? "indexevo.html.tmpl" : "index.html.tmpl"),
						formatter: function(sIndexFile) {
							return this._changeIframeBootstrapToCloud(this._formatIndexHtmlFile(sIndexFile, oData));
						}.bind(this)
					}, oZipFile, true));


					if (!bHasManifest) {
						aPromises.push(this._addFileToZip({
							name: "index.js",
							url: TMPL_REF + "/" + "index.js.tmpl",
							formatter: function(sIndexJsFile) {
								return this._changeIframeBootstrapToCloud(this._formatIndexJsFile(sIndexJsFile, oData));
							}.bind(this)
						}, oZipFile, true));
					}
				}


				// add extra download files
				aExtraFiles.forEach(function (sFileName) {
					aPromises.push(this._addFileToZip({
						name: sFileName,
						url: sRef + "/" + sFileName
					}, oZipFile));
				});


				// add generic license file
				aPromises.push(this._addFileToZip({
					name: "LICENSE.txt",
					url: "LICENSE.txt" // fetch from root level of UI5
				}, oZipFile));

				aPromises.push(this._addFileToZip({
					name: "ui5.yaml",
					url: TMPL_REF + "/ui5.yaml.tmpl",
					formatter: function(sYamlFile) {
						return this._formatYamlFile(sYamlFile, oData);
					}.bind(this)
				}, oZipFile, true));

				aPromises.push(this._addFileToZip({
					name: "package.json",
					url: TMPL_REF + "/package.json.tmpl",
					formatter: function(sPackageFile) {
						return this._formatPackageJson(sPackageFile, oManifestFile, oData);
					}.bind(this)
				}, oZipFile, true));

				Promise.all(aPromises).then(function() {
					var oContent = oZipFile.generate({ type: "blob" });

					// save and open generated file
					this._openGeneratedFile(oContent, this._sId);
				}.bind(this));
			}.bind(this));
		},

		_openGeneratedFile : function(oContent, sId) {
			sap.ui.require([
				"sap/ui/core/util/File"
			], function(File) {
				File.save(oContent, sId, "zip", "application/zip");
			});
		},

		_addFileToZip: function  (oFileInfo, oZipFile, bTreatAsText) {
			var sFileName = oFileInfo.name,
				sUrl = oFileInfo.url,
				fnFileFormatter = oFileInfo.formatter;

			return this.fetchSourceFile(sUrl, bTreatAsText)
				.then(function(vRawFile) {
					if (vRawFile === "File not loaded") {
						return; // ignore 404 responses, e.g. for Apache license text file in SAPUI5 environment
					}
					if (fnFileFormatter) {
						vRawFile = fnFileFormatter(vRawFile);
					}
					oZipFile.file(sFileName, vRawFile);
				});
		},

		_formatPackageJson: function (sPackageFile, sManifestFile, oData) {
			var sFormattedPackageFile = sPackageFile.replace(/{{TITLE}}/g, oData.title)
				.replace(/{{SAMPLE_ID}}/g, oData.id),
				oPackageFile = JSON.parse(sFormattedPackageFile),
				oPackageDependencies = oPackageFile.dependencies,
				oManifestFile,
				oUi5Config,
				oDependencies;

			if (sManifestFile) {
				oManifestFile = JSON.parse(sManifestFile.raw);
				oUi5Config = oManifestFile["sap.ui5"];
				oDependencies = oUi5Config && oUi5Config.dependencies;

				if (oDependencies && oDependencies.libs) {
					Object.keys(oDependencies.libs).forEach(function(sKey) {
						if (OPENUI5_LIBS.indexOf(sKey) > -1) {
							oPackageDependencies["@openui5/" + sKey] = "^1";
						}
						if (SAPUI5_LIBS.indexOf(sKey) > -1) {
							oPackageDependencies["@sapui5/" + sKey] = "^1";
						}
					});
				}
			}

			return JSON.stringify(oPackageFile, null, 2);
		},

		_formatYamlFile: function(sFile, oData) {
			return sFile.replace(/{{SAMPLE_ID}}/g, oData.id);
		},

		_formatManifestJsFile: function (sRawManifestFileJs) {
			return sRawManifestFileJs.replace(new RegExp(/(\.\.\/)+/g), "./");
		 },

		_formatIndexHtmlFile: function (sFile, oData) {
			return sFile.replace(/{{TITLE}}/g, oData.name)
				.replace(/{{SAMPLE_ID}}/g, oData.id);
		},

		_formatIndexJsFile: function (sFile, oData) {
			return sFile.replace(/{{TITLE}}/g, oData.name)
				.replace(/{{SAMPLE_ID}}/g, oData.id)
				.replace(/{{HEIGHT}}/g, oData.stretch ? 'height : "100%", ' : "")
				.replace(/{{SCROLLING}}/g, !oData.stretch);
		},

		_formatMockFile: function (sMockData) {
			var sWrongPath = "test-resources/sap/ui/documentation/sdk/images/",
				sCorrectPath = "https://sdk.openui5.org/test-resources/sap/ui/documentation/sdk/images/",
				oRegExp = new RegExp(sWrongPath, "g");

			return sMockData.replace(oRegExp, sCorrectPath);
		},

		_changeIframeBootstrapToCloud: function (sRawIndexFileHtml) {
			var rReplaceIndex = /src=(?:"[^"]*\/sap-ui-core\.js"|'[^']*\/sap-ui-core\.js')/,
				oRelativeBootstrapURI = new URI(sap.ui.require.toUrl("") + "/sap-ui-core.js"),
				sBootstrapURI = oRelativeBootstrapURI.toString();

			return sRawIndexFileHtml.replace(rReplaceIndex, 'src="./' + sBootstrapURI + '"');
		}
	});
}
);