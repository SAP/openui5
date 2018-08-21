sap.ui.define([
	"jquery.sap.global",
	"sap/ui/rta/dttool/controller/BaseController",
	"sap/ui/documentation/sdk/controller/util/ControlsInfo",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/postmessage/Bus"
], function (
	jQuery,
	BaseController,
	ControlsInfo,
	JSONModel,
	PostMessageBus
) {
	"use strict";
	return BaseController.extend("sap.ui.rta.dttool.controller.Code", {

		_aMockFiles : ["products.json", "supplier.json", "img.json"],

		onInit: function () {

			this.oPostMessageBus = PostMessageBus.getInstance();

			this.mEdited = {};

			this.oPostMessageBus.subscribe("dtTool", "iFrameReady", this.onIFrameReady, this)
				.subscribe("dtTool", "files", this.retrieveXMLFiles, this)
				.subscribe("dtTool", "updateDesignTimeFile", this.onUpdateDTFile, this);

			this.getView().setModel(new JSONModel());

			this.oRouter = this.getRouter();
			this.oRouter.getRoute("sample").attachMatched(this._onRouteMatched, this);
			this.oRouter.getRoute("home").attachMatched(this._onRouteMatched, this);
			this._oCodeCache = {};
		},

		/**
		 * Called when the route sample or home is matched
		 * @param {sap.ui.base.Event} oEvent the event
		 */
		_onRouteMatched: function (oEvent) {

			this._aFilesAvailable = [];
			this.sCompName = null;

			var oModel = this.getView().getModel();

			oModel.setProperty("/fileName", "");
			oModel.setProperty("/files", []);

			var sRouteName = oEvent.getParameters().name;

			if (sRouteName === "home") {
				if (!this.bIFrameReady) {
					this.sCompName = "sap.ui.rta.dttool.emptyView";
				} else {

					this.oPostMessageBus.publish({
						target : this.getIFrameWindow(),
						origin : this.getIFrameWindow().origin,
						channelId : "dtTool",
						eventId : "setComponent",
						data : {
							compName : "sap.ui.rta.dttool.emptyView"
						}
					});
				}
			} else if (sRouteName === "sample") {
				this._sId = oEvent.getParameter("arguments").codeID;

				ControlsInfo.loadData().then(function(oData) {
					this._loadCode(oData);
				}.bind(this));
			}
		},

		/**
		 * Called when the iFrame is ready to receive messages
		 */
		onIFrameReady: function () {

			this.bIFrameReady = true;

			if (this.sCompName) {

				this.oPostMessageBus.publish({
					target : this.getIFrameWindow(),
					origin : this.getIFrameWindow().origin,
					channelId : "dtTool",
					eventId : "setComponent",
					data : {
						compName : this.sCompName
					}
				});
			}
		},

		/**
		 * Loads the code of a sample
		 * @param {object} oData the data of the samples
		 */
		_loadCode: function (oData) {

			// retrieve sample object
			var oSample = oData.samples[this._sId];
			if (!oSample) {
				this.getRouter().getTargets().display("notFound");
				return;
			}

			// cache the data to be reused
			if (!this._oData || oSample.id !== this._oData.id) {

				// get component and data when sample is changed or nothing exists so far
				var sCompName = this._sId;

				this.sSampleId = oSample.id;

				if (!this.bIFrameReady) {
					this.sCompName = sCompName;
				} else {

					this.oPostMessageBus.publish({
						target : this.getIFrameWindow(),
						origin : this.getIFrameWindow().origin,
						channelId : "dtTool",
						eventId : "setComponent",
						data : {
							compName : sCompName
						}
					});
				}

				// create data object
				this._oData = {
					id : oSample.id,
					title : "Code: " + oSample.name,
					name : oSample.name,
					files : []
				};
			}
		},

		/**
		 * Retrieves all XML Files for a given component
		 * @param {object} oEvent the event
		 * @param {object} oEvent.data.files some file names
		 */
		retrieveXMLFiles : function (oEvent) {

			var aFiles = oEvent.data.files;

			if (aFiles) {
				var sRef = this.sSampleId ? jQuery.sap.getModulePath(this.sSampleId) : "test-resources/sap/ui/rta/dttool/emptyView";

				Promise.all(aFiles.map(function (sFile) {

					if (sFile.match(/\.xml$/i)) {
						return this.fetchSourceFile(sRef, sFile).then(function (sContent) {
							if (!this._oData) {
								this._oData = { files : [] };
							}
							this._oData.files.push({
								name : sFile,
								raw : sContent
							});
							this._aFilesAvailable.push(sFile);
						}.bind(this));
					}
				}.bind(this))).then(function () {

					var sFileName = this._getInitialFileName();

					this.getView().getModel().setProperty("/", this._oData);

					if (this._aFilesAvailable.indexOf(sFileName) === -1) {
						this.oRouter.getTargets().display("notFound");
						return;
					}

					// update <code>CodeEditor</code> content and the selected tab
					this._updateCodeEditor(sFileName);
				}.bind(this));
			}
		},

		/**
		 * Fetches a source file from a given location (if it's not in the cache)
		 * @param {string} sRef the path of the file location
		 * @param {string} sFile the file name
		 * @return {string} the source file
		 */
		fetchSourceFile : function (sRef, sFile) {

			return new Promise(function (resolve, reject) {

				var sUrl = (window.location.pathname.endsWith("integration/opaTest.qunit.html") ? "../" : "") + "../../../../../" + sRef + "/" + sFile;

				var fnSuccess = function (result) {
					this._oCodeCache[sUrl] = result;
					resolve(result);
				}.bind(this);
				var fnError = function (result) {
					this._oCodeCache[sUrl] = "not found: '" + sUrl + "'";
					reject();
				}.bind(this);

				if (!(sUrl in this._oCodeCache)) {
					this._oCodeCache[sUrl] = "";
					jQuery.ajax(sUrl, {
						async: true,
						dataType: "text",
						success: fnSuccess,
						error: fnError
					});
				} else {
					resolve(this._oCodeCache[sUrl]);
				}
			}.bind(this));
		},

		/**
		 * Updated the designtime file in the code editor
		 * @param {object} oEvent the event
		 * @param {string} oEvent.data.name the control name
		 * @param {string} oEvent.data.module the design time module
		 */
		onUpdateDTFile : function (oEvent) {

			if (oEvent) {
				var sName = oEvent.data.name,
					sDT = oEvent.data.module;

				if (sName){
					var sDTFileName = sName.match(/^.*\.(.*?)$/)[1] + ".designtime.js";
				}

				var fnNoDT = function () {

					var sDisplayName = "",
						sLib = "";

					if (sName) {
						sDisplayName = sName.match(/^.*\.(.*?)$/)[1];
						sLib = sName.replace("." + sDisplayName, "").replace(/\./g, "/");
					}

					var sFakeDTFile = "/*!\n DT Tool \n*/\n\n// Provides the Design Time Metadata for the " + sName
						+ " control\nsap.ui.define([],\n\tfunction () {\n\t\t'use strict';\n\n\t\treturn {\n\t\t\t//palette: {\n\t\t\t//\tgroup: 'CUSTOM',\n\t\t\t//\ticons: {\n\t\t\t//\t\tsvg : '"
						+ sLib + "/designtime/" + sDisplayName + ".icon.svg'\n\t\t\t//\t}\n\t\t\t//},\n\t\t\t//displayName: {\n\t\t\t//\tsingular: '" + sDisplayName + "'\n\t\t\t//}\n\t\t};\n}, /* bExport= */ false);";
					this._replaceDTFileInEditor(sDTFileName, sFakeDTFile);
				}.bind(this);

				if (!sDT) {
					fnNoDT();
					return;
				}

				var sRef = jQuery.sap.getModulePath(sDT.replace(/\/\w+\.designtime/, "")).replace(/\.\.\//g, "");

				if (this.mEdited[sDTFileName]) {
					this._replaceDTFileInEditor(sDTFileName, this.mEdited[sDTFileName]);
				} else {
					this.fetchSourceFile(sRef, sDTFileName).then(function (sDtFile) {
						this._replaceDTFileInEditor(sDTFileName, sDtFile);
					}.bind(this), fnNoDT);
				}

			} else {
				this._replaceDTFileInEditor();
			}
		},

		/**
		 * removes the dt file from the icon tab header and editor and adds a new one if sFileName and sDTFile are passed
		 * @param {string} sFileName the name of the new dt file
		 * @param {string} sDTFile the content of the new dt file
		 */
		_replaceDTFileInEditor : function (sFileName, sDTFile) {

			var oModel = this.getView().getModel();

			var aFiles = oModel.getProperty("/files");

			aFiles.some(function (oFile, iIndex) {
				if (oFile.name.match(/^.*?\.(.*)$/)[1] === "designtime.js") {
					aFiles.splice(iIndex, 1);
					return true;
				}
			});

			if (sFileName && sDTFile) {
				aFiles.push({
					name : sFileName,
					raw : sDTFile,
					dt : true
				});
			} else {
				sFileName = aFiles[0].name;
			}

			oModel.setProperty("/fileName", sFileName);
			oModel.setProperty("/files", aFiles);
			this._updateCodeEditor(sFileName);
		},

		/**
		 * Updates the value of the CodeEditor
		 * @param {string} sFileName the filename
		 */
		_updateCodeEditor : function (sFileName) {
			var oCodeEditor = this._getCodeEditor(),
				oAceInstance = oCodeEditor._getEditorInstance();



			// TODO Find a new place for this set of commands
			oAceInstance.setTheme("ace/theme/github");
			oAceInstance.getSession().setMode("ace/mode/javascript");
			oAceInstance.getSession().setUseWrapMode(true);
			oAceInstance.getSession().setNewLineMode("windows");
			oAceInstance.setOption('minLines', 40);
			oAceInstance.setAutoScrollEditorIntoView(false);
			oAceInstance.setOption('maxLines', 40);
			oAceInstance.setShowPrintMargin(false);
			oAceInstance.renderer.setShowGutter(true);
			oAceInstance.$blockScrolling = Infinity;

			var sType = sFileName.match(/.*\.(.*?)$/)[1];
				sType = sType.replace("js", "javascript");

			// set the <code>CodeEditor</code> new code base and its type - xml, js, json or css.
			oCodeEditor.setValue(this._getCode(sFileName));

			oCodeEditor.setType(sType);

			// set the <code>CodeEditor</code> scroll pos to line 0
			oAceInstance.gotoLine(/*line*/0, /*column*/0, /*animate*/false);

			jQuery.sap.delayedCall(0, this, function(){
				oAceInstance.resize(true);
			});
		},

		/**
		 * Called when a Tab of the IconTabHeader is selected
		 * @param {sap.ui.base.Event} oEvent the event
		 */
		onTabSelect : function (oEvent) {
			var sKey = oEvent.getParameters().key;
			this.getView().getModel().setProperty("/fileName", sKey);
			this._updateCodeEditor(sKey);
		},

		/**
		 * sends the new dt data to the iframe when the dt file is updated in the editor
		 * @param {sap.ui.base.Event} oEvent the event
		 */
		onCodeEditorLiveChange : function (oEvent) {

			var oCurrentFile;
			var sName = this.byId("tabHead").getSelectedKey();

			if (!sName) {
				return;
			}

			this.getView().getModel().getData().files.some(function (oFile) {
				if (oFile.name === sName) {
					oCurrentFile = oFile;
					return true;
				}
			});

			if (!oCurrentFile.dt) {
				return;
			}

			try {
				var sText = oEvent.getSource().getCurrentValue();
				this.mEdited[sName] = sText;

				this.getView().getModel().getData().files.some(function (oFile, iIndex) {
					if (oFile.name === sName) {
						this.getView().getModel().setProperty("/files/" + iIndex + "/raw", sText);
						return true;
					}
				}.bind(this));

				// TODO: check Compliance
				/*eslint-disable no-new-func */
				var fnDesigntime = new Function(sText);
				/*eslint-enable no-new-func */

				var fnSapUiDefine = sap.ui.define;
				var oResult = null;
				sap.ui.define = function(s, fnFunction) {
					oResult = fnFunction();
				};
				fnDesigntime();
				sap.ui.define = fnSapUiDefine;

				if (oResult) {

					this.oPostMessageBus.publish({
						target : this.getIFrameWindow(),
						origin : this.getIFrameWindow().origin,
						channelId : "dtTool",
						eventId : "editorDTData",
						data : {
							dtData : JSON.parse(JSON.stringify(oResult))
						}
					});
				}

			} catch (ex) {
				//jQuery.sap.log.error("Invalid effective DT data");
			}
		},

		/**
		 * Returns the code of a file with a given name
		 * @param {string} sFileName the file name
		 * @returns {string} the code
		 */
		_getCode : function (sFileName) {
			var aFiles = this.getView().getModel().getData().files,
				sCode = "";

			aFiles.some(function(oFile) {
				if (oFile.name === sFileName) {
					sCode = oFile.raw;
					return true;
				}
			});
			return sCode;
		},

		/**
		 * returns the initial file name
		 * @returns {string} the initial file name
		 */
		_getInitialFileName : function() {
			return (this._oData
					&& this._oData.files
					&& this._oData.files.length > 0
					&& this._oData.files[0].name) || null;
		},

		/**
		 * returns the CodeEditor
		 * @returns {sap.ui.codeeditor.CodeEditor} the CodeEditor
		 */
		_getCodeEditor : function() {
			if (!this.oCodeEditor) {
				this.oCodeEditor = this.byId("codeEditor");
			}

			return this.oCodeEditor;
		}
	 });
});