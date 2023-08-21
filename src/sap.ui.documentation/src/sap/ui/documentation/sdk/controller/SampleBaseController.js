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

	return BaseController.extend("sap.ui.documentation.sdk.controller.SampleBaseController", {
		_aMockFiles: ["products.json", "supplier.json", "img.json"],

		fetchSourceFile: function (sUrl, bTreatAsText, bForceFetch) {
			return ResourceDownloadUtil.fetch(sUrl, bTreatAsText, bForceFetch).catch(function (e) {
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
					bCustomIndexHTML = oData.customIndexHTML, // samples with custom index.html (e.g. for including a custom UI5 bootstrap src)
					sCustomPkgJson = oData.files.find(function (oFile) { // samples with custom package.json (e.g. using TS, Babel)
						return oFile.name.includes("package.json");
					}),
					sCustomUI5Yaml = oData.files.find(function (oFile) { // samples with custom ui5.yaml (e.g. declaring a different webapp root)
						return oFile.name.includes("ui5.yaml");
					}),
					aPromises = [],
					fnAddMockFileToZip = function(sRawFile) {
						var aMockFilePromises = [];
						for (var j = 0; j < this._aMockFiles.length; j++) {
							var sMockFileName = this._aMockFiles[j];
							if ((typeof sRawFile === "string") && sRawFile.indexOf(sMockFileName) > -1) {
								aMockFilePromises.push(this._addFileToZip({
									name: this._formatWebAppPath("mockdata/" + sMockFileName),
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
							name: this._formatWebAppPath(oFile.name),
							url: sUrl,
							formatter: this._formatManifestJsFile
						}, oZipFile));
						continue;
					} else if (this._isRootLevelFile(oFile.name)) {
						continue;
					} else {
						aPromises.push(this._addFileToZip({
							name: this._formatWebAppPath(oFile.name.replace(new RegExp(/(\.\.\/)+/g), "./")),
							url: sUrl,
							formatter: (bChangeBootstrap && !bCustomIndexHTML) ? this._changeIframeBootstrapToCloud : undefined
						}, oZipFile));
						aPromises.push(this.fetchSourceFile(sUrl).then(fnAddMockFileToZip.bind(this)));
					}
				}

				// iframe examples have a separate index file and a component file to describe it
				if (!oData.iframe || ResourcesUtil.getHasProxy()) {
					bHasManifest = oData.files.some(function (oFile) {
						return oFile.name === "manifest.json";
					});


					aPromises.push(this._addFileToZip({
						name: this._formatWebAppPath("Component.js"),
						url: sRef + "/" + "Component.js"
					}, oZipFile));


					if (!bCustomIndexHTML) {
						aPromises.push(this._addFileToZip({
							name: this._formatWebAppPath("index.html"),
							url: TMPL_REF + "/" + (bHasManifest ? "indexevo.html.tmpl" : "index.html.tmpl"),
							formatter: function(sIndexFile) {
								return this._changeIframeBootstrapToCloud(this._formatIndexHtmlFile(sIndexFile, oData));
							}.bind(this)
						}, oZipFile, true));
					}


					if (!bHasManifest) {
						aPromises.push(this._addFileToZip({
							name: this._formatWebAppPath("index.js"),
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
						name: this._formatWebAppPath(sFileName),
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
					url: sCustomUI5Yaml ? sRef + "/" + sCustomUI5Yaml.name : TMPL_REF + "/ui5.yaml.tmpl",
					formatter: function(sYamlFile) {
						return sCustomUI5Yaml ? this._formatCustomUI5Yaml(sYamlFile) : this._formatUI5Yaml(sYamlFile, oData, oManifestFile);
					}.bind(this)
				}, oZipFile, true));

				aPromises.push(this._addFileToZip({
					name: "package.json",
					url: sCustomPkgJson ? sRef + "/" + sCustomPkgJson.name : TMPL_REF + "/package.json.tmpl",
					formatter: function(sPackageFile) {
						return sCustomPkgJson ? sPackageFile : this._formatPackageJson(sPackageFile, oData);
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
			var sFileName = oFileInfo.name.replace(new RegExp(/(\.+\/)+/g), ""), // remove "../" etc. so one-level-up dirs are zipped properly
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

		/**
		 * Formats the name in NPM style string:
		 *
		 * A package.json file must contain "name" and "version" fields.
		 * The "name" field contains your package's name, and must be lowercase and one word,
		 * and may contain hyphens and underscores.
		 *
		 * @param {string} name The name to format
		 * @returns {string} Formatted name
		 */
		_formatNameToNpmSpec: function (name) {
			var result;
			var testValidChars = /[^\w_\-\.]+/gi; // Only "words", "-", "_" and "."

			name = name
				.replace(testValidChars, "") // Cleanup invalid characters
				.replaceAll(".", "-"); // Replace the dots with dashes

			result = name.split(/(?=[A-Z])/); // Split on Capital letters

			return result
				.map(function (chunk) { return chunk.toLowerCase(); })
				.join("-");
		},

		_formatPackageJson: function (sPackageFile, oData) {
			var sFormattedPackageFile = sPackageFile.replace(/{{TITLE}}/g, oData.title)
				.replace(/{{SAMPLE_ID}}/g, this._formatNameToNpmSpec(oData.id)),
				oPackageFile = JSON.parse(sFormattedPackageFile);

			return JSON.stringify(oPackageFile, null, 2);
		},

		_formatUI5Yaml: function(sYamlFile, oData, sManifestFile) {
			let sFormattedYamlFile = sYamlFile.replace(/{{SAMPLE_ID}}/g, this._formatNameToNpmSpec(oData.id));
			const bIsOpenUI5 = this.getModel("versionData").getProperty("/isOpenUI5");
			const sUI5Version = this.getModel("versionData").getProperty("/fullVersion");
			sFormattedYamlFile = sFormattedYamlFile.replace(/{{UI5_KIND}}/g, bIsOpenUI5 ? "OpenUI5" : "SAPUI5");
			sFormattedYamlFile = sFormattedYamlFile.replace(/{{UI5_VERSION}}/g, sUI5Version);

			if (this._isOpenUI5NightlySDK()){
				sFormattedYamlFile = sFormattedYamlFile.replace(/libraries:/g, "libraries:" + this._getSnapshotNote());
			}

			if (sManifestFile) {
				const oManifestFile = JSON.parse(sManifestFile.raw);
				const oUi5Config = oManifestFile["sap.ui5"];
				const oDependencies = oUi5Config && oUi5Config.dependencies;

				if (oDependencies && oDependencies.libs) {
					Object.keys(oDependencies.libs).forEach(function(sKey) {
						sFormattedYamlFile += "\n    - name: " + sKey;
					});
				}
			}
			return sFormattedYamlFile;
		},

		_formatCustomUI5Yaml: function(sYamlFile){
			const sCommentReplacement = this._isOpenUI5NightlySDK() ? this._getSnapshotNote() : "";
			return sYamlFile.replace(/ #DependencyVersion,groupId:com.sap.openui5,artifactId:sap.ui.core#/g, sCommentReplacement);
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

			return sRawIndexFileHtml.replace(rReplaceIndex, 'src="' + sBootstrapURI + '"');
		},

		_formatWebAppPath: function(sPath) {
			const sWebAppPath = "webapp/";
			return sPath.startsWith(sWebAppPath) ? sPath : sWebAppPath + sPath;
		},

		_isRootLevelFile: function(sFileName){
			return ["package.json", "ui5.yaml"].includes(sFileName);
		},

		_isOpenUI5NightlySDK: function(){
			const oModel = this.getModel("versionData"),
				bIsDevVersion = oModel.getProperty("/isDevVersion"),
				bIsDevEnv = oModel.getProperty("/isDevEnv"),
				bIsOpenUI5 = oModel.getProperty("/isOpenUI5");
			return bIsDevVersion && bIsOpenUI5 && !bIsDevEnv;
		},

		_getSnapshotNote: function(){
			return "\n  # Note: Consumption of SNAPSHOT versions is only available to SAP employees from within the corporate network.\n" +
				"  # If this does not apply to you, please adjust the UI5 version to the latest stable version either manually\n" +
				"  # or using the command \"ui5 use latest\".";
		}
	});
}
);