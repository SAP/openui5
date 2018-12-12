/*!
 * ${copyright}
 */

/*global history */
sap.ui.define([
		"sap/ui/documentation/sdk/controller/BaseController",
		"sap/m/library",
		"sap/ui/model/json/JSONModel",
		"sap/uxap/ThrottledTaskHelper"
	], function (BaseController, mobileLibrary, JSONModel, ThrottledTask) {
		"use strict";

		var SRC_FILE_NAMES = {
			HTML: "index.html",
			XML: "App.view.xml",
			JS: "App.controller.js"
		},

		/* acceptable values for the <code>type</code> property of the <code>sap.ui.codeeditor.CodeEditor</code> */
		SRC_FILE_TYPES = {};
		SRC_FILE_TYPES[SRC_FILE_NAMES.HTML] = "html";
		SRC_FILE_TYPES[SRC_FILE_NAMES.XML] = "xml";
		SRC_FILE_TYPES[SRC_FILE_NAMES.JS] = "javascript";


		return BaseController.extend("sap.ui.documentation.sdk.controller.LiveEditor", {

			/**
			 * Called when the controller is instantiated.
			 * @public
			 */
			onInit: function () {

				this._oSrcFileContent = {};

				this._oViewModel = new JSONModel({
					autoPreview: true,
					selectedFileName: SRC_FILE_NAMES.XML, // initially select the xml file
					selectedFileType: SRC_FILE_TYPES[SRC_FILE_NAMES.XML],
					selectedFileContent: ""
				});

				this.getView().setModel(this._oViewModel, "viewModel");

				// fetch the initial content of the sample files
				new JSONModel(sap.ui.require.toUrl('sap/ui/documentation/sdk/model') + '/LiveEditorData.json').attachRequestCompleted(function (oEvent) {
					var oData = oEvent.getSource().getData();
					if (oData[SRC_FILE_NAMES.HTML]) {
						oData[SRC_FILE_NAMES.HTML] = oData[SRC_FILE_NAMES.HTML].replace(/&sol;/g, "/");
					}
					this._oSrcFileContent = oData;
					this.showFileInEditor(SRC_FILE_NAMES.XML); // initially show the xml file

				}.bind(this));

				this.getView().byId("resultBox").addEventDelegate({ onAfterRendering: this.requestExecuteCurrentSrc.bind(this) });

				// flags for minor performance optimization:
				// indicators to temporarily suppress the processing of the editor content
				// (while switching the currently displayed file in the editor)
				this._bSuppressRemoveOnce = false;
				this._bSuppressInsertOnce = false;

				// additional performance optimization:
				// throttle the output of src changes
				this._oThrottledTask = null;
			},

			onSrcLiveChange: function(oEvent) {
				var sText = oEvent.getParameter("value"),
					sAction = oEvent.getParameter("editorEvent").action,
					sSelectedFileName;

				// minor performance optimization:
				// skip further processing IF 'remove' event is caused by *switch to show another file* in the editor (instead of change in file *content*)
				if ((this._bSuppressRemoveOnce === true) && (sAction === "remove")) {
					this._bSuppressRemoveOnce = false;
					return;
				}

				// minor performance optimization:
				// skip further processing IF 'insert' event is caused by *switch to show another file* in the editor (instead of change in file *content*)
				if ((this._bSuppressInsertOnce === true) && (sAction === "insert")) {
					this._bSuppressInsertOnce = false;
					return;
				}

				sSelectedFileName = this._oViewModel.getProperty("/selectedFileName");

				// there is no two way-binding for *live*-changes in the edited text
				// => explicitly update the data object
				this._oSrcFileContent[sSelectedFileName] = sText;

				// throttle the execution of src upon live-changes
				// (for performance reasons)
				if (this._oViewModel.getProperty("/autoPreview")) {
					this.requestExecuteCurrentSrc();
				}
			},

			requestExecuteCurrentSrc: function (){
				this._getExecuteSrcThrottledTask().reSchedule(false, {}).catch(function(reason) {
					// suppress
				});
			},

			createFrame: function() {
				var oFrameEl = document.createElement("iframe");
				oFrameEl.id = "outputWindow";
				oFrameEl.width = "100%";
				oFrameEl.className = "editorOutputWindow";
				oFrameEl.src = sap.ui.require.toUrl('sap/ui/documentation/sdk/util/') + 'liveEditorOutput.html';
				oFrameEl.sandbox = "allow-forms allow-modals allow-pointer-lock allow-popups allow-scripts";
				return oFrameEl;
			},

			onFileSwitch: function(oEvent) {
				var sSelectedFileName = oEvent.getParameter("selectedKey");
				// minor performance optimization: set flags to suppress the processing of the editor content once only
				// before changing the currently displayed file in the editor
				// to avoid redundant code re-evaluation
				// (as changing the currently displayed file in the editor
				// will cause a 'remove' and then 'insert' events to be fired by the editor,
				// but there is no actual src change to be processed)
				this._bSuppressRemoveOnce = true;
				this._bSuppressInsertOnce = true;
				this.showFileInEditor(sSelectedFileName);
			},

			showFileInEditor: function(sSrcFileName) {
				this._oViewModel.setProperty("/selectedFileContent", this._oSrcFileContent[sSrcFileName]);
				this._oViewModel.setProperty("/selectedFileType", SRC_FILE_TYPES[sSrcFileName]);
			},

			_getExecuteSrcThrottledTask: function() {
				var fnExecuteCurrentSrc;

				if (!this._oThrottledTask) {

					// function is private to be sure it is *never directly* called
					// but only via throttledTask
					fnExecuteCurrentSrc = function (){
						var oFrameWrapperEl = this.getView().byId('outputWindowWrapper').getDomRef(),
							oFrameEl;

						if (oFrameWrapperEl) {
							while (oFrameWrapperEl.firstChild) { // empty old content
								oFrameWrapperEl.removeChild(oFrameWrapperEl.firstChild);
							}
							oFrameEl = this.createFrame();
							oFrameEl.onload = function(){
								if (oFrameEl.contentWindow) {
									oFrameEl.contentWindow.postMessage(jQuery.extend({}, this._oSrcFileContent), "*");
									oFrameEl.onload = null;
								}
							}.bind(this);
							oFrameWrapperEl.appendChild(oFrameEl);
						}
					};

					this._oThrottledTask = new ThrottledTask(
						fnExecuteCurrentSrc, //function to execute
						500, // throttle delay
						this); // context
				}
				return this._oThrottledTask;
			}
		});
	}
);