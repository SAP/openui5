/*!
 * ${copyright}
 */

/*global history */
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/documentation/sdk/controller/BaseController",
	"sap/ui/documentation/sdk/controller/util/ControlsInfo",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/URI"
], function(jQuery, BaseController, ControlsInfo, JSONModel, URI) {
		"use strict";

		return BaseController.extend("sap.ui.documentation.sdk.controller.Code", {

			_aMockFiles : ["products.json", "supplier.json", "img.json"],

			/**
			 * Called when the controller is instantiated.
			 * @public
			 */
			onInit : function () {
				this.oModel = new JSONModel();
				this.getView().setModel(this.oModel);

				this.router = this.getRouter();
				this.router.getRoute("code").attachPatternMatched(this.onRouteMatched, this);
				this.router.getRoute("codeFile").attachPatternMatched(this.onRouteMatched, this);

				this._codeCache = {};
				this._aFilesAvailable = [];

				this._bFirstLoad = true;
			},

			onRouteMatched: function (oEvt) {
				var oArguments = oEvt.getParameter("arguments");

				this.showMasterSide();

				this._sId = oArguments.sampleId;
				this._sEntityId = oArguments.entityId;
				this._sFileName = decodeURIComponent(oArguments.fileName);

				ControlsInfo.loadData().then(this._loadCode.bind(this));
			},

			_loadCode: function (oData) {
				var sFileName = this._sFileName,
					oSample = oData.samples[this._sId]; // retrieve sample object

				// If there is no sample or the context from the URL is for the wrong sample we redirect to not found page
				// If you modify this expression please check with both class and tutorial which won't have a context.
				if (!oSample || (oSample.contexts && !oSample.contexts[this._sEntityId])) {
					this.router.myNavToWithoutHash("sap.ui.documentation.sdk.view.NotFound", "XML", false);
					return;
				}

				// cache the data to be reused
				if (!this._oData || oSample.id !== this._oData.id) {

					// get component and data when sample is changed or nothing exists so far
					var sCompId = 'sampleComp-' + this._sId;
					var sCompName = this._sId;
					var oComp = sap.ui.component(sCompId);
					if (!oComp) {
						oComp = sap.ui.getCore().createComponent({
							id : sCompId,
							name : sCompName
						});
					}

					// create data object
					var oMetadata = oComp.getMetadata();
					var oConfig = (oMetadata) ? oMetadata.getConfig() : null;
					this._oData = {
						id : oSample.id,
						title : "Code: " + oSample.name,
						name : oSample.name,
						stretch : oConfig.sample ? oConfig.sample.stretch : false,
						files : [],
						iframe : oConfig.sample.iframe,
						fileName: sFileName,
						includeInDownload: oConfig.sample.additionalDownloadFiles
					};

					// retrieve files
					// (via the 'Orcish maneuver': Use XHR to retrieve and cache code)
					if (oConfig && oConfig.sample && oConfig.sample.files) {
						var sRef = sap.ui.require.toUrl((oSample.id).replace(/\./g, "/"));
						for (var i = 0 ; i < oConfig.sample.files.length ; i++) {
							var sFile = oConfig.sample.files[i];
							var sContent = this.fetchSourceFile(sRef, sFile);

							this._oData.files.push({
								name : sFile,
								raw : sContent,
								code : this._convertCodeToHtml(sContent)
							});
							this._aFilesAvailable.push(sFile);
						}
					}
				} else {
					this._oData.fileName = sFileName;
				}

				// we need this property to navigate to API reference
				this.entityId = oSample.entityId;

				this.getAPIReferenceCheckPromise(oSample.entityId).then(function (bHasAPIReference) {
					this.getView().byId("apiRefButton").setVisible(bHasAPIReference);
				}.bind(this));

				// set model data
				this.oModel.setData(this._oData);

				if (sFileName === "undefined") {
					sFileName = this._getInitialFileName();
				}

				if (this._aFilesAvailable.indexOf(sFileName) === -1) {
					this.router.myNavToWithoutHash("sap.ui.documentation.sdk.view.NotFound", "XML", false);
					return;
				}

				// update <code>CodeEditor</code> content and the selected tab
				this._updateCodeEditor(sFileName);
				this._getTabHeader().setSelectedKey(sFileName);

				// scroll to the top of the page
				var page = this.byId("page");
				page.scrollTo(0);

			},

			fetchSourceFile : function (sRef, sFile) {
				var that = this;
				var sUrl = sRef + "/" + sFile;

				var fnSuccess = function (result) {
					that._codeCache[sUrl] = result;
				};
				var fnError = function (result) {
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

			onDownload : function () {
				sap.ui.require([
					"sap/ui/thirdparty/jszip",
					"sap/ui/core/util/File"
				], function(JSZip, File) {
					var oZipFile = new JSZip();

					// zip files
					var oData = this.oModel.getData();
					for (var i = 0 ; i < oData.files.length ; i++) {
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
							if (oFile.raw.indexOf(sMockFile) > -1){
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
						oData.files.forEach(function(oFile) {
							bHasManifest = oFile.name === "manifest.json";

							return;
						});

						oZipFile.file("Component.js", this.fetchSourceFile(sRef, "Component.js"));
						oZipFile.file("index.html", this._changeIframeBootstrapToCloud(this._createIndexHtmlFile(oData, bHasManifest)));

						if (!bHasManifest) {
							oZipFile.file("index.js", this._changeIframeBootstrapToCloud(this._createIndexJsFile(oData)));
						}
					}

					// add extra download files
					aExtraFiles.forEach(function(sFileName) {
						oZipFile.file(sFileName, that.fetchSourceFile(sRef, sFileName));
					});

					// add generic license and notice file
					oZipFile.file("LICENSE.txt", this.fetchSourceFile(sap.ui.require.toUrl("sap/ui/documentation/sdk/tmpl/"), "LICENSE.txt"));
					oZipFile.file("NOTICE.txt", this.fetchSourceFile(sap.ui.require.toUrl("sap/ui/documentation/sdk/tmpl/"), "NOTICE.txt"));

					var oContent = oZipFile.generate({type:"blob"});

					// save and open generated file
					File.save(oContent, this._sId, "zip", "application/zip");
				}.bind(this));
			},

			_createIndexHtmlFile : function(oData, bHasManifest) {
				var sRef = sap.ui.require.toUrl("sap/ui/documentation/sdk/tmpl"),
					sFile;

				sFile = this.fetchSourceFile(sRef, bHasManifest ? "indexevo.html.tmpl" : "index.html.tmpl");

				sFile = sFile.replace(/{{TITLE}}/g, oData.name)
					.replace(/{{SAMPLE_ID}}/g, oData.id);

				return sFile;
			},

			_createIndexJsFile : function(oData) {
				var sRef = sap.ui.require.toUrl("sap/ui/documentation/sdk/tmpl"),
					sFile = this.fetchSourceFile(sRef, "index.js.tmpl");

				sFile = sFile.replace(/{{TITLE}}/g, oData.name)
					.replace(/{{SAMPLE_ID}}/g, oData.id)
					.replace(/{{HEIGHT}}/g, oData.stretch ? 'height : "100%", ' : "")
					.replace(/{{SCROLLING}}/g, !oData.stretch);

				return sFile;
			},

			downloadMockFile : function(sFile) {
				var sRef = sap.ui.require.toUrl("sap/ui/demo/mock");
				var sWrongPath = "test-resources/sap/ui/documentation/sdk/images/";
				var sCorrectPath = "https://openui5.hana.ondemand.com/test-resources/sap/ui/documentation/sdk/images/";
				var oRegExp = new RegExp(sWrongPath,"g");
				var sMockData = this.fetchSourceFile(sRef, sFile);

				if (sMockData) {
					sMockData = sMockData.replace(oRegExp, sCorrectPath);
				}

				return sMockData;
			},

			onAPIRefPress: function () {
				this.getRouter().navTo("apiId", {id: this.entityId});
			},

			onNavBack : function () {
				this.router.navTo("sample", {
					sampleId: this._sId,
					entityId: this._sEntityId
				}, true);
			},

			_convertCodeToHtml : function (code) {
				code = code.toString();

				// Get rid of function around code
				code = code.replace(/^function.+{/, "");

				code = code.replace(/}[!}]*$/, "");

				// Get rid of unwanted code if CODESNIP tags are used
				code = code.replace(/^[\n\s\S]*\/\/\s*CODESNIP_START\n/, "");
				code = code.replace(/\/\/\s*CODESNIP_END[\n\s\S]*$/, "");

				// Improve indentation for display
				code = code.replace(/\t/g, "  ");

				return code;
			},

			_changeIframeBootstrapToCloud : function (sRawIndexFileHtml) {
				var rReplaceIndex = /src=(?:"[^"]*\/sap-ui-core\.js"|'[^']*\/sap-ui-core\.js')/;
				var oCurrentURI = new URI(window.location.href).search("");
				var oRelativeBootstrapURI = new URI(sap.ui.require.toUrl("") + "/sap-ui-core.js");
				var sBootstrapURI = oRelativeBootstrapURI.absoluteTo(oCurrentURI).toString();

				// replace the bootstrap path of the sample with the current to the core
				return sRawIndexFileHtml.replace(rReplaceIndex, 'src="' + sBootstrapURI + '"');
			},

			handleTabSelectEvent: function(oEvent) {
				var sFileName = oEvent.getParameter("selectedKey");

				this._bFirstLoad = false;
				this.router.navTo("codeFile", {
					entityId: this._sEntityId,
					sampleId: this._sId,
					fileName: encodeURIComponent(sFileName)
				}, false);
			},

			_updateCodeEditor : function(sFileName) {
				var oCodeEditor = this._getCodeEditor(),
					oAceInstance = oCodeEditor._getEditorInstance(),
					oAceRenderer = oAceInstance.renderer;

				// set the <code>CodeEditor</code> new code base and its type - xml, js, json or css.
				oCodeEditor.setValue(this._getCode(sFileName));
				oCodeEditor.setType(this._getFileType(sFileName));

				// set the <code>CodeEditor</code> scroll pos to line 0
				oAceInstance.gotoLine(/*line*/0, /*column*/0, /*animate*/false);

				if (this._bFirstLoad) {
					setTimeout(function(){
						oAceRenderer.onResize();
					}, 0);
				}
			},

			_getCode : function (sFileName) {
				var aFiles = this.getModel().getData().files,
					sCode = "";

				aFiles.forEach(function(oFile) {
					if (oFile.name === sFileName) {
						sCode = oFile.raw;
						return true;
					}
				});

				return sCode;
			},

			_getFileType : function (sFileName) {
				var sFileExtension = sFileName.split('.').pop();
				return sFileExtension === "js" ? "javascript" : sFileExtension;
			},

			_getInitialFileName : function() {
				return (this._oData
						&& this._oData.files
						&& this._oData.files.length > 0
						&& this._oData.files[0].name) || null;
			},

			_getCodeEditor : function() {
				if (!this.oCodeEditor) {
					this.oCodeEditor = this.byId("codeEditor");
				}

				return this.oCodeEditor;
			},

			_getTabHeader : function() {
				if (!this.oTabHeader) {
					this.oTabHeader = this.byId("tabHeader");
				}

				return this.oTabHeader;
			}
		});
	}
);