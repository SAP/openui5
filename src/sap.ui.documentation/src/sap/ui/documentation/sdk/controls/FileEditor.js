/*!
 * ${copyright}
 */
sap.ui.define(
	[
		"../util/FileUtils",
		"sap/base/util/extend",
		"sap/m/IconTabHeader",
		"sap/m/IconTabFilter",
		"sap/m/Image",
		"sap/m/MessageStrip",
		"sap/ui/codeeditor/CodeEditor",
		"sap/ui/core/Control"
	],
	function(FileUtils, extend, IconTabHeader, IconTabFilter, Image, MessageStrip, CodeEditor, Control) {
		"use strict";
		var FileEditor = Control.extend("sap.ui.documentation.sdk.controls.FileEditor", {
			metadata: {
				properties: {
					/**
					 * Array containing list of objects which have property name and link
					 */
					files: {
						type: "object[]",
						defaultValue: []
					},
					editable: {
						type: "boolean",
						defaultValue: true
					}
				},
				aggregations: {
					_header: {
						type: "sap.ui.core.Control",
						multiple: false,
						visibility: "hidden"
					},
					_editor: {
						type: "sap.ui.core.Control",
						multiple: false,
						visibility: "hidden"
					},
					_readOnlyWarningStrip: {
						type: "sap.ui.core.Control",
						multiple: false,
						visibility: "hidden"
					},
					_errorsStrip: {
						type: "sap.ui.core.Control",
						multiple: false,
						visibility: "hidden"
					},
					_schemaErrorsStrip: {
						type: "sap.ui.core.Control",
						multiple: false,
						visibility: "hidden"
					},
					_image: {
						type: "sap.ui.core.Control",
						multiple: false,
						visibility: "hidden"
					}
				},
				events: {
					beforeFileChange: {
						parameters : {
							/**
							 * Changed file
							 */
							sFile : {type : "string"}
						}
					},
					fileChange: {},
					fileSwitch: {
						parameters: {
							editable: { type: "boolean" }
						}
					}
				}
			},
			renderer: {
				apiVersion: 2,
				render: function(oRm, oFileEditor) {
					oRm.openStart("div", oFileEditor)
						.class("sapUiFileEditor")
						.style("height", "100%")
						.openEnd();

					oRm.openStart("div")
						.class("sapUiFileEditorHeader")
						.openEnd();
					oRm.renderControl(oFileEditor._getErrorsStrip());
					oRm.renderControl(oFileEditor._getSchemaErrorsStrip());
					oRm.renderControl(oFileEditor._getReadOnlyWarningStrip());

					if (oFileEditor.getFiles().length > 1) {
						oRm.renderControl(oFileEditor._getHeader());
					}

					oRm.close("div");

					oRm.openStart("div")
						.class("sapUiFileEditorContent")
						.openEnd();
					oRm.renderControl(oFileEditor._getImage());
					oRm.renderControl(oFileEditor._getEditor());
					oRm.close("div");

					oRm.close("div");
				}
			}
		});

		FileEditor.prototype.init = function() {
			this._bFetch = false;
			this._aFiles = [];
		};

		FileEditor.prototype.onBeforeRendering = function() {
			if (!this._bFetch) {
				return;
			}

			this._bFetch = false;
			this._fetchContents();
		};

		FileEditor.prototype.setFiles = function(aFiles) {
			this._getHeader().destroyItems();
			this._bFetch = true;
			this._bFirstRefresh = 2;
			this._createInternalFiles(aFiles);

			return this.setProperty("files", aFiles);
		};

		FileEditor.prototype._getHeader = function() {
			var oHeader = this.getAggregation("_header");

			if (!oHeader) {
				oHeader = new IconTabHeader(this.getId() + "-header", {
					select: this._onFileSwitch.bind(this)
				});
				this.setAggregation("_header", oHeader);
			}

			return oHeader;
		};

		FileEditor.prototype._getEditor = function() {
			var oEditor = this.getAggregation("_editor");

			if (!oEditor) {
				oEditor = new CodeEditor(this.getId() + "-editor", {
					liveChange: this._onFileEdit.bind(this),
					syntaxHints: false
				});

				oEditor._oEditor.session.on("changeAnnotation", this._onSyntaxError.bind(this));
				oEditor._oEditor.completers = []; // This will prevent all auto complete and suggestions of the editor
				this.setAggregation("_editor", oEditor);
			}

			return oEditor;
		};

		FileEditor.prototype._getReadOnlyWarningStrip = function() {
			var oStrip = this.getAggregation("_readOnlyWarningStrip");

			if (!oStrip) {
				oStrip = new MessageStrip({
					showIcon: true,
					type: "Information",
					text: "This file is read-only.",
					visible: false
				});
				this.setAggregation("_readOnlyWarningStrip", oStrip);
			}

			return oStrip;
		};

		FileEditor.prototype._getErrorsStrip = function() {
			var oStrip = this.getAggregation("_errorsStrip");

			if (!oStrip) {
				oStrip = new MessageStrip({
					showIcon: true,
					type: "Error",
					visible: false
				});
				this.setAggregation("_errorsStrip", oStrip);
			}

			return oStrip;
		};

		FileEditor.prototype._getSchemaErrorsStrip = function() {
			var oStrip = this.getAggregation("_schemaErrorsStrip");

			if (!oStrip) {
				oStrip = new MessageStrip({
					showIcon: true,
					type: "Error",
					visible: false
				});
				this.setAggregation("_schemaErrorsStrip", oStrip);
			}

			return oStrip;
		};

		FileEditor.prototype._getImage = function() {
			var oImage = this.getAggregation("_image");

			if (!oImage) {
				oImage = new Image(this.getId() + "-image", {
					width: "100%"
				});
				this.setAggregation("_image", oImage);
			}

			return oImage;
		};

		FileEditor.prototype._update = function() {
			var sSelectedFileKey = this._getHeader().getSelectedKey(),
				sFileExtension = sSelectedFileKey.split(".").pop(),
				iSelectedFileIndex = this._aFiles.findIndex(function(oEl) {
					return oEl.key === sSelectedFileKey;
				}),
				oSelectedFile = this._aFiles[iSelectedFileIndex],
				bEditable = oSelectedFile.editable;

			//choose code editor type dependent on file type
			//default editor type 'javascript' applies syntax checks on editor content
			switch (sFileExtension) {
				case "js":
					sFileExtension = "javascript";
					break;
				case "cds":
					//no code editor type available for file type 'cds'
					//choosing editor type with nice coloring and no syntax checks
					sFileExtension = "red";
					break;
				default:
					//keep as is
					break;
			}

			this._getReadOnlyWarningStrip().setVisible(!bEditable);

			this._getErrorsStrip().setVisible(false);
			this._getSchemaErrorsStrip().setVisible(false);

			if (FileUtils.isBlob(sSelectedFileKey)) {
				this._getImage()
					.setSrc(oSelectedFile.content)
					.setVisible(true);

				this._getEditor().setVisible(false);
			} else {
				this._bPreventLiveChange = true;
				this._getEditor()
					.setEditable(bEditable)
					.setType(sFileExtension)
					.setValue(oSelectedFile.content)
					.setVisible(true);
				this._bPreventLiveChange = false;

				this._getImage().setVisible(false);
			}

			this.fireFileSwitch({
				editable: bEditable
			});
		};

		FileEditor.prototype._createIconTabFilters = function() {
			// destroy existing items so we can a clean state after reset
			this._getHeader().destroyItems();

			this._aFiles.forEach(
				function(oFile) {
					this._getHeader().addItem(
						new IconTabFilter({
							key: oFile.key,
							text: oFile.name
						})
					);
				}.bind(this)
			);
		};
		FileEditor.mimetypes = {
			"js": "text/javascript",
			"json": "application/json",
			"html": "text/html",
			"properties": "text/plain"
		};

		FileEditor.prototype._fetchContents = function() {
			var aFetchPromises = this._aFiles.map(function(oFile) {
				var sUrl = oFile.url,
					sType = sUrl.substring(oFile.url.lastIndexOf(".") + 1);
				oFile._type = FileEditor.mimetypes[sType] || "text/plain";
				oFile.promise = FileUtils.fetch(sUrl);
				return oFile.promise;
			});

			Promise.all(aFetchPromises)
				.then(
					function(aData) {
						aData.map(
							function(sData, i) {
								this._aFiles[i]._url = URL.createObjectURL(new Blob([sData], { type: this._aFiles[i]._type }));
								this._aFiles[i].content = sData;
							}.bind(this)
						);

						this._getHeader().setSelectedKey(this._aFiles[0].key);
						this._createIconTabFilters();
						this._update();
						window.postMessage("sampleLoaded");
					}.bind(this)
				)
				.catch(
					function(sErr) {
						this._getErrorsStrip()
							.setVisible(true)
							.setText(sErr);
					}.bind(this)
				);
		};

		FileEditor.prototype._onFileSwitch = function(oEvent) {
			this._update();
		};

		FileEditor.prototype._onFileEdit = function(oEvent) {
			if (this._bFirstRefresh > 0 && oEvent.mParameters.editorEvent.action === "insert") {
				this._bFirstRefresh--;
				return;
			}
			if (this._bPreventLiveChange) {
				return;
			}
			if (oEvent.getParameter("value") === "") {
				return;
			}
			if (this._bClearButtonPressed && oEvent.getParameter("value") === "") {
				this._bClearButtonPressed = false;
				return;
			}

			var oCurrentKey = this.getAggregation("_header").getSelectedKey();
			var aFiles = this._aFiles;
			var oCurrentFile = aFiles.find(function(oFile) {
				return oFile.key === oCurrentKey;
			});
			if (!oCurrentFile || oCurrentFile.content === oEvent.getParameter("value")) {
				return;
			}

			this.fireBeforeFileChange({sFile: oCurrentKey});

			oCurrentFile.content = oEvent.getParameter("value");
			var that = this;
			fetch(oCurrentFile.url, { method: "POST", body: oCurrentFile.content })
				.then(function(res) {
					return res.text();
				})
				.then(function(res2) {
					that.fireFileChange();
				})
				.catch(function(err) {});
		};

		FileEditor.prototype._setClearButtonPressed = function (bPressed) {
			this._bClearButtonPressed = true;
		};

		FileEditor.prototype._findIndex = function(sName) {
			return this._aFiles.findIndex(function(oFile) {
				return oFile.key === sName;
			});
		};

		FileEditor.prototype._onSyntaxError = function() {
			var aErrorAnnotations = this._getEditor()._oEditor.session.$annotations,
				sMessage = "";

			if (aErrorAnnotations && aErrorAnnotations.length) {
				aErrorAnnotations.forEach(function(oError) {
					sMessage += "Line " + String(oError.row) + ": " + oError.text + "\n";
				});
				this._getErrorsStrip()
					.setVisible(true)
					.setText(sMessage);
			} else {
				this._getErrorsStrip().setVisible(false);
			}
		};

		FileEditor.prototype._createInternalFiles = function(aFiles) {
			this._aFiles = aFiles.map(function(oFile) {
				return extend({}, oFile, {
					content: "",
					promise: null
				});
			});
		};

		FileEditor.prototype.hideSchemaErrors = function() {
			this._getSchemaErrorsStrip().setVisible(false);
		};

		FileEditor.prototype.getFilesWithContent = function() {
			var aFetchPromises = this._aFiles.map(function(oFile) {
				return oFile.promise;
			});

			return Promise.all(aFetchPromises).then(
				function() {
					return this._aFiles;
				}.bind(this)
			);
		};

		FileEditor.prototype.showError = function(sError) {
			this._getErrorsStrip()
				.setVisible(true)
				.setText(sError);
		};

		return FileEditor;
	}
);
