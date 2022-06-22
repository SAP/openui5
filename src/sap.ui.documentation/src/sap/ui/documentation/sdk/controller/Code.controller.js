/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/documentation/sdk/controller/SampleBaseController",
	"sap/ui/documentation/sdk/controller/util/ControlsInfo",
	"sap/ui/documentation/sdk/model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/base/util/merge",
	"sap/ui/core/Component",
	"sap/ui/core/Core"
], function(SampleBaseController, ControlsInfo, formatter, JSONModel, merge, Component, Core) {
		"use strict";

		return SampleBaseController.extend("sap.ui.documentation.sdk.controller.Code", {

			/**
			 * Called when the controller is instantiated.
			 * @public
			 */
			onInit : function () {
				SampleBaseController.prototype.onInit.call(this);

				this.oModel = new JSONModel();
				this.getView().setModel(this.oModel);

				this.router = this.getRouter();
				this.router.getRoute("code").attachPatternMatched(this.onRouteMatched, this);
				this.router.getRoute("codeFile").attachPatternMatched(this.onRouteMatched, this);

				this._aFilesAvailable = [];

				this._bFirstLoad = true;

				this.bus = Core.getEventBus();
				this.bus.subscribe("themeChanged", "onDemoKitThemeChanged", this.onDemoKitThemeChanged, this);
			},

			onDemoKitThemeChanged: function (sChannelId, sEventId, oData) {
				this._updateCodeEditorTheme(oData.sThemeActive);
			},

			onRouteMatched: function (oEvt) {
				var oArguments = oEvt.getParameter("arguments");

				this.showMasterSide();

				this._sId = oArguments.sampleId;
				this._sEntityId = oArguments.entityId;
				this._sFileName = formatter.routeParamsToFilePath(oArguments);

				ControlsInfo.loadData().then(this._loadCode.bind(this));
			},

			_loadCode: function (oData) {
				var sFileName = this._sFileName,
					oSample = oData.samples[this._sId]; // retrieve sample object

				// If there is no sample or the context from the URL is for the wrong sample we redirect to not found page
				// If you modify this expression please check with both class and tutorial which won't have a context.
				if (!oSample || (oSample.contexts && !oSample.contexts[this._sEntityId])) {
					this.onRouteNotFound();
					return;
				}

				// cache the data to be reused
				if (!this._oData || oSample.id !== this._oData.id) {
					// get component and data when sample is changed or nothing exists so far
					this._createComponent().then(function (oComponent) {
						// create data object
						var aPromises = [];
						var oConfig = oComponent.getManifestEntry("/sap.ui5/config") || {};
						this._oData = {
							id: oSample.id,
							title: "Code: " + oSample.name,
							name: oSample.name,
							stretch: oConfig.sample ? oConfig.sample.stretch : false,
							files: [],
							iframe: oConfig.sample.iframe,
							fileName: sFileName,
							includeInDownload: oConfig.sample.additionalDownloadFiles
						};

						// retrieve files
						// (via the 'Orcish maneuver': Use XHR to retrieve and cache code)
						if (oConfig.sample && oConfig.sample.files) {
							var sRef = sap.ui.require.toUrl((oSample.id).replace(/\./g, "/"));
							for (var i = 0; i < oConfig.sample.files.length; i++) {
								var sFile = oConfig.sample.files[i];
								aPromises.push(this._updateFileContent(sRef, sFile));

								this._oData.files.push({
									name: sFile
								});
								this._aFilesAvailable.push(sFile);
							}
						}
						return Promise.all(aPromises);
					}.bind(this)).then(this._showCode.bind(this, sFileName));
				} else {
					this._oData.fileName = sFileName;
					this._showCode(sFileName);
				}

			},

			_showCode: function(sFileName){
				this.getAPIReferenceCheckPromise(this._sEntityId).then(function (bHasAPIReference) {
					this.getView().byId("apiRefButton").setVisible(bHasAPIReference);
				}.bind(this));

				// set model data
				this.oModel.setData(this._oData);

				if (sFileName === undefined) {
					sFileName = this._getInitialFileName();
				}

				if (this._aFilesAvailable.indexOf(sFileName) === -1) {
					this.onRouteNotFound();
					return;
				}

				// update <code>CodeEditor</code> content and the selected tab
				this._updateCodeEditor(sFileName);

				this._getTabHeader().setSelectedKey(sFileName);

				// scroll to the top of the page
				var page = this.byId("page");
				page.scrollTo(0);

				this.appendPageTitle(this.getModel().getProperty("/title"));
			},

			_updateFileContent: function(sRef, sFile) {
				return this.fetchSourceFile(sRef + "/" + sFile).then(function(vContent) {
					this._oData.files.some(function(oFile) {
						if (oFile.name === sFile) {
							oFile.raw = vContent;
							oFile.code = this._convertCodeToHtml(vContent);
							return true;
						}
					}, this);
					this.oModel.setData(this._oData);
				}.bind(this));
			},

			onAPIRefPress: function () {
				this.getRouter().navTo("apiId", {id: this._sEntityId});
			},

			onNavBack : function () {
				this.router.navTo("sample", {
					sampleId: this._sId,
					entityId: this._sEntityId
				});
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

			handleTabSelectEvent: function(oEvent) {
				var sFileName = oEvent.getParameter("selectedKey"),
					oRouteParams = merge(formatter.filePathToRouteParams(sFileName), {
					entityId: this._sEntityId,
					sampleId: this._sId
				});

				this._bFirstLoad = false;
				this.router.navTo("codeFile", oRouteParams, false);
			},

			_updateCodeEditor : function(sFileName) {
				var oCodeEditor = this._getCodeEditor(),
					oAceInstance = oCodeEditor.getInternalEditorInstance(),
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

				this._updateCodeEditorTheme(Core.getConfiguration().getTheme().toLowerCase());
			},

			_updateCodeEditorTheme : function(sTheme) {
				// coppied from the original CodeEditor file
				var sEditorTheme = "tomorrow";
				if (sTheme.indexOf("hcb") > -1) {
					sEditorTheme = "chaos";
				} else if (sTheme.indexOf("hcw") > -1) {
					sEditorTheme = "github";
				} else if (sTheme === "sap_fiori_3") {
					sEditorTheme = "crimson_editor";
				} else if (sTheme === "sap_fiori_3_dark" || sTheme === "sap_horizon_dark") {
					sEditorTheme = "clouds_midnight";
				}
				this._getCodeEditor().setColorTheme(sEditorTheme);
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
				switch (sFileExtension) {
					case "js":
						return "javascript";
					case "feature":
						return "text";
					default:
						return sFileExtension;
				}
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
			},

			_createComponent : function () {
				// create component only once
				var sCompId = 'sampleComp-' + this._sId;
				var sCompName = this._sId;

				var oComp = Component.get(sCompId);

				if (oComp) {
					oComp.destroy();
				}

				return Component.create({
					id: sCompId,
					name: sCompName
				});
			}
		});
	}
);
