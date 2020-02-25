/*!
 * ${copyright}
 */

/*global history */
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/documentation/sdk/controller/SampleBaseController",
	"sap/ui/documentation/sdk/controller/util/ControlsInfo",
	"sap/ui/model/json/JSONModel"
], function(jQuery, SampleBaseController, ControlsInfo, JSONModel) {
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

				this.getAPIReferenceCheckPromise(this._sEntityId).then(function (bHasAPIReference) {
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