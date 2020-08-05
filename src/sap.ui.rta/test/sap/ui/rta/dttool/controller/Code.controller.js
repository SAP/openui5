sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/mvc/Controller",
	"sap/ui/documentation/sdk/controller/util/ControlsInfo",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/postmessage/Bus",
	"sap/ui/rta/dttool/util/DTToolUtils"
], function (
	jQuery,
	Controller,
	ControlsInfo,
	JSONModel,
	PostMessageBus,
	DTToolUtils
) {
	"use strict";
	return Controller.extend("sap.ui.rta.dttool.controller.Code", {

		_aMockFiles : ["products.json", "supplier.json", "img.json"],

		onInit: function () {
			this.oPostMessageBus = PostMessageBus.getInstance();

			this.mEdited = {};

			this.oPostMessageBus.subscribe("dtTool", "iFrameReady", this.onIFrameReady, this)
				.subscribe("dtTool", "files", this.retrieveXMLFiles, this)
				.subscribe("dtTool", "updateDesignTimeFile", this.onUpdateDTFile, this)
				.subscribe("dtTool", "updatePropertyFile", this.loadPropertyData, this);

			this.getView().setModel(new JSONModel());

			this.oRouter = DTToolUtils.getRouter(this);
			this.oRouter.getRoute("sample").attachMatched(this._onRouteMatched, this);
			this.oRouter.getRoute("home").attachMatched(this._onRouteMatched, this);
			this._oCodeCache = {};
			this._setEditorConfig();
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
						target : DTToolUtils.getIframeWindow(),
						origin : DTToolUtils.getIframeWindow().origin,
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
					//TODO: Workaround
					oData.samples[this._sId] = {id: this._sId, name: "Custom: " + this._sId};

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
					target : DTToolUtils.getIframeWindow(),
					origin : DTToolUtils.getIframeWindow().origin,
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
				DTToolUtils.getRouter(this).getTargets().display("notFound");
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
						target : DTToolUtils.getIframeWindow(),
						origin : DTToolUtils.getIframeWindow().origin,
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
				//FIXME: The resource roots should be set in the html file but they are overwritten somewhere
				sap.ui.loader.config({
					paths: {"sap/m/sample": "./../../../../sap/m/demokit/sample/"}
				});
				var sRef = this.sSampleId ? sap.ui.require.toUrl(this.sSampleId.replace(/\./g, "/")) : "test-resources/sap/ui/rta/dttool/emptyView";

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
		 * @param {boolean} bUseTestResources whether to load the resource from the test directory
		 * @return {Promise<string>} the source file
		 */
		fetchSourceFile : function (sRef, sFile, bUseTestResources) {
			return new Promise(function (fnResolve, fnReject) {
				if (bUseTestResources && /(.*)\/resources\//.test(sRef)) {
					sRef = sRef.replace("/resources/", "/test-resources/");
				}
				var sUrl = sRef + "/" + sFile;

				var fnSuccess = function (sResult) {
					this._oCodeCache[sUrl] = sResult;
					fnResolve(sResult);
				}.bind(this);
				var fnError = function () {
					this._oCodeCache[sUrl] = "not found: '" + sUrl + "'";
					if (bUseTestResources) {
						fnReject();
					} else {
						//TODO: Workaround - Check if file is inside test-resouces
						return this.fetchSourceFile(sRef, sFile, true);
					}
				}.bind(this);

				if (!(sUrl in this._oCodeCache)) {
					this._oCodeCache[sUrl] = "";
					jQuery.ajax(sUrl, {
						async: true,
						dataType: "text",
						success: fnSuccess,
						error: fnError.bind(this)
					});
				} else {
					fnResolve(this._oCodeCache[sUrl]);
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
				var sName = oEvent.data.name;
				var sDT = oEvent.data.module;

				var sDTFileName = sName ? sName.match(/^.*\.(.*?)$/)[1] + ".designtime.js" : null;

				var fnNoDT = function () {
					var sDisplayName = "";
					var sLib = "";

					if (sName) {
						sDisplayName = sName.match(/^.*\.(.*?)$/)[1];
						sLib = sName.replace("." + sDisplayName, "").replace(/\./g, "/");
					}

					var sFakeDTFile = "/*!\n DT Tool \n*/\n\n// Provides the Design Time Metadata for the " + sName
						+ " control\nsap.ui.define([],\n\tfunction () {\n\t\t'use strict';\n\n\t\treturn {\n\t\t\t//palette: {\n\t\t\t//\tgroup: 'CUSTOM',\n\t\t\t//\ticons: {\n\t\t\t//\t\tsvg : '"
						+ sLib + "/designtime/" + sDisplayName + ".icon.svg'\n\t\t\t//\t}\n\t\t\t//},\n\t\t\t//displayName: {\n\t\t\t//\tsingular: '" + sDisplayName + "'\n\t\t\t//}\n\t\t};\n}, /* bExport= */ false);";
					this._replaceDTFileInEditor(sDTFileName, sFakeDTFile);
				}.bind(this);

				if (!sName && !sDT) {
					this._addFile(null, null, false, "designtime.js");
					return;
				} else if (!sDT) {
					fnNoDT();
					return;
				}

				var sRef = sap.ui.require.toUrl(sDT.replace(/\/\w+\.designtime/, ""))/*.replace(/\.\.\//g, "")*/;

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
		 * Loads a DTF file inside the editor
		 * @param {string} sFileName the name of the new dt file
		 * @param {string} sDTFile the content of the new dt file
		 */
		_replaceDTFileInEditor : function (sFileName, sDTFile) {
			this._addFile(sFileName, sDTFile, true, "designtime.js");
		},

		/**
		 * Updates the value of the CodeEditor
		 * @param {string} sFileName the filename
		 */
		_updateCodeEditor : function (sFileName) {
			if (!sFileName) {
				return;
			}
			var oCodeEditor = this._getCodeEditor();
			var oAceInstance = oCodeEditor._getEditorInstance();
			var sType = sFileName.match(/.*\.(.*?)$/)[1];
			if (sType === "js") { //Don't use replace because of json
				sType = "javascript";
			}

			// set the <code>CodeEditor</code> new code base and its type - xml, js, json or css.
			oCodeEditor.setValue(this._getCode(sFileName));

			oCodeEditor.setType(sType);

			// set the <code>CodeEditor</code> scroll pos to line 0
			oAceInstance.gotoLine(/*line*/0, /*column*/0, /*animate*/false);

			jQuery.sap.delayedCall(0, this, function() {
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
						target : DTToolUtils.getIframeWindow(),
						origin : DTToolUtils.getIframeWindow().origin,
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
		 * Called when a control is selected for RTA inside the iframe, displays computed designtime metadata
		 * @param {sap.ui.base.Event} oEvent Event
		 */
		loadPropertyData: function (oEvent) {
			var sControlId = oEvent.data.id;
			var oActions = oEvent.data.actions || [];
			if (sControlId) {
				DTToolUtils.getRTAClient().getService("property").then(function (oPropertyService) {
					oPropertyService.get(sControlId).then(function(oPropertyData) {
						var sProperties = JSON.stringify(Object.assign({actions: oActions}, oPropertyData), null, "\t");
						var sFileName = sControlId.split("--").slice(-1)[0] + ".properties.json";
						this._addFile(sFileName, sProperties, false, "properties.json");
					}.bind(this));
				}.bind(this));
			} else {
				this._addFile(null, null, false, "properties.json");
			}
		},

		/**
		 * removes a file with the same type from the icon tab header and editor and adds a new one if sFileName and sRawFile are passed
		 * @param {string} sFileName the name of the new file
		 * @param {string} sRawFile the content of the new file
		 * @param {boolean} bIsDTFile Whether the file is a DTM file or not
		 * @param {string} sFileType The type of the file which should be removed
		 */
		_addFile: function (sFileName, sRawFile, bIsDTFile, sFileType) {
			var sFileTypeMatcher = /^.*\.(.*\..*)$/;
			var oModel = this.getView().getModel();
			var aFiles = oModel.getProperty("/files");
			if (!sFileType) {
				sFileType = sFileName.match(sFileTypeMatcher)[1];
			}

			aFiles.some(function (oFile, iIndex) {
				if (oFile.name.match(sFileTypeMatcher)[1] === sFileType) {
					aFiles.splice(iIndex, 1);
					return true;
				}
			});

			if (sRawFile) {
				aFiles.push({
					name: sFileName || "untitled." + (sFileType || ""),
					raw: sRawFile,
					dt: bIsDTFile
				});
			}

			oModel.setProperty("/fileName", sFileName);
			oModel.setProperty("/files", aFiles);
			this._updateCodeEditor(sFileName);
		},

		/**
		 * Configure the ace code editor
		 */
		_setEditorConfig: function () {
			var oCodeEditor = this._getCodeEditor();
			var oAceInstance = oCodeEditor._getEditorInstance();

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
		},

		/**
		 * Returns the code of a file with a given name
		 * @param {string} sFileName the file name
		 * @returns {string} the code
		 */
		_getCode : function (sFileName) {
			var aFiles = this.getView().getModel().getData().files;
			var sCode = "";

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