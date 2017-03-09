/*!
 * ${copyright}
 */

/*global ace */

sap.ui.define([
	'jquery.sap.global',
	"sap/ui/core/Control",
	'sap/ui/codeeditor/js/ace/ace',
	'sap/ui/codeeditor/js/ace/mode-javascript',
	'sap/ui/codeeditor/js/ace/mode-json'
], function(jQuery, Control) {
	"use strict";

	/**
	 * Constructor for a new CodeEditor.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Allows to visualize source code of various types with syntax highlighting, line numbers in editable and read only mode.
	 * Use this controls in scenarios where the user should be able to inspect and edit source code.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.codeeditor.CodeEditor
	 */
	var CodeEditor = Control.extend("sap.ui.codeeditor.CodeEditor",
		{
			metadata: {
				library: "sap.ui.core",
				properties: {
					/**
					 * The value displayed in the code editor
					 */
					value: {
						type: "string",
						group: "Misc",
						defaultValue: ""
					},
					/**
					 * The type of the code in the editor used for syntax highlighting
					 * Possible types are javascript (default), json, html, xml and  css.
					 */
					type: {
						type: "string",
						group: "Appearance",
						defaultValue: "javascript"
					},
					/**
					 * The width of the code editor
					 */
					width: {
						type: "sap.ui.core.CSSSize",
						group: "Appearance",
						defaultValue: "100%"
					},
					/**
					 * The height of the code editor.
					 * A minimal height of 3rem will be applied in case the height is less than 20px.
					 */
					height: {
						type: "sap.ui.core.CSSSize",
						group: "Appearance",
						defaultValue: "100%"
					},
					/**
					 * Sets whether the code in the editor can be changed by the user
					 */
					editable: {
						type: "boolean",
						group: "Behavior",
						defaultValue: true
					},
					/**
					 * Sets whether line numbers should be shown
					 */
					lineNumbers: {
						type: "boolean",
						group: "Behavior",
						defaultValue: true
					},
					/**
					 * Sets whether the code is automatically selected if a value is set
					 */
					valueSelection: {
						type: "boolean",
						group: "Behavior",
						defaultValue: false
					},
					/**
					 * Sets the editors color theme
					 * possible values
					 */
					colorTheme: {
						type: "string",
						group: "Behavior",
						defaultValue: "default"
					},
					/**
					 * Sets whether to show syntax hints the editor. This flag is only available if line numbers are shown.
					 */
					syntaxHints: {
						type: "boolean",
						group: "Behavior",
						defaultValue: true
					}
				},
				events: {
					liveChange: {},
					change: {}
				},
				defaultProperty: "content"
			},
			renderer: function(oRm, oControl) {
				oRm.write("<div ");
				oRm.writeControlData(oControl);
				oRm.addStyle("width", oControl.getWidth());
				oRm.addStyle("height", oControl.getHeight());
				oRm.addClass("sapCEd");
				oRm.writeAttributeEscaped("data-sap-ui-syntaxhints", oControl.getSyntaxHints());
				oRm.writeStyles();
				oRm.writeClasses();
				oRm.write(">");
				oRm.write("</div>");
			}
		});

	//configure the source paths
	var sPath = jQuery.sap.getModulePath("sap.ui.codeeditor.js.ace");
	ace.config.set("basePath", sPath);

	/**
	 * @private
	 */
	CodeEditor.prototype.init = function() {
		var oDomRef = document.createElement("div");
		this._oEditorDomRef = oDomRef;
		this._oEditorDomRef.style.height = "100%";
		this._oEditorDomRef.style.width = "100%";
		this._oEditor = ace.edit(oDomRef);

		this._oEditor.setValue("");
		this._oEditor.getSession().setUseWrapMode(true);
		this._oEditor.getSession().setMode("ace/mode/javascript");
		this._oEditor.setTheme("ace/theme/tomorrow");
		this._oEditor.renderer.setShowGutter(true);
		var that = this;

		this._oEditor.addEventListener("change", function(oEvent) {
			var sValue = that.getCurrentValue();
			that.fireLiveChange({
				value: sValue,
				editorEvent: oEvent
			});
		});
		this._oEditor.addEventListener("blur", function(oEvent) {
			var sValue = that.getCurrentValue(),
				sCurrentValue = that.getValue();
			that.setProperty("value", sValue, true);
			if (sValue != sCurrentValue) {
				that.fireChange({
					value: sValue,
					oldValue: sCurrentValue
				});
			}
		});
	};

	/**
	 * Avoids invalidation of the code editor
	 * @returns {sap.ui.codeeditor.CodeEditor} Returns <code>this</code> to allow method chaining
	 * @private
	 */
	CodeEditor.prototype.invalidate = function() {
		//no invalidation needed.
		return this;
	};

	/**
	 * Sets whether the code editor is editable or not
	 * @param {boolean} bValue true to allow editing, otherwise false
	 * @returns {sap.ui.codeeditor.CodeEditor} Returns <code>this</code> to allow method chaining
	 * @public
	 */
	CodeEditor.prototype.setEditable = function(bValue) {
		this.setProperty("editable", bValue, true);
		if (bValue) {
			//show the cursor
			this._oEditor.renderer.$cursorLayer.element.style.display = "";
		} else {
			//hide the cursor
			this._oEditor.renderer.$cursorLayer.element.style.display = "none";
		}
		this._oEditor.setReadOnly(!this.getEditable());
		return this;
	};

	/**
	 * Sets the focus to the code editor
	 * @returns {sap.ui.codeeditor.CodeEditor} Returns <code>this</code> to allow method chaining
	 * @public
	 */
	CodeEditor.prototype.focus = function() {
		this._oEditor.focus();
		return this;
	};

	/**
	 * Sets the type of the code editors value used for syntax highlighting
	 * @param {string} sType javascript (default), html, xml, css
	 * @returns {sap.ui.codeeditor.CodeEditor} Returns <code>this</code> to allow method chaining
	 * @public
	 */
	CodeEditor.prototype.setType = function(sType) {
		this.setProperty("type", sType, true);
		this._oEditor.getSession().setMode("ace/mode/" + this.getType());
		return this;
	};

	/**
	 * Sets whether syntax hints should be shown or not
	 * Hints are only visible if <code>lineNumbers</code> is set to true.
	 * @param {boolean} bShow true(default) to show the syntax hints
	 * @returns {sap.ui.codeeditor.CodeEditor} Returns <code>this</code> to allow method chaining
	 * @public
	 */
	CodeEditor.prototype.setSyntaxHints = function(bShow) {
		this.setProperty("syntaxHints", bShow, true);
		this._oEditor.renderer.setShowGutter(this.getLineNumbers());
		if (this.getDomRef()) {
			this.getDomRef().setAttribute("data-sap-ui-syntaxhints", bShow);
		}
		return this;
	};

	/**
	 * Sets the color theme  of the code editor
	 * @param {string} sTheme 'default', 'hcb', 'hcb_bright', 'hcb_blue'
	 * @returns {sap.ui.codeeditor.CodeEditor} Returns <code>this</code> to allow method chaining
	 * @public
	 */
	CodeEditor.prototype.setColorTheme = function(sTheme) {
		this.setProperty("colorTheme", sTheme, true);
		if (sTheme === "default") {
			sTheme = "tomorrow";
		} else if (sTheme === "hcb") {
			sTheme = "tomorrow_night";
		} else if (sTheme === "hcb_bright") {
			sTheme = "tomorrow_night_bright";
		} else if (sTheme === "hcb_blue") {
			sTheme = "tomorrow_night_blue";
		}
		this._oEditor.setTheme("ace/theme/" + sTheme);
		return this;
	};

	/**
	 * Sets the value of the code editor
	 * @param {string} sValue the value of the code editor
	 * @returns {sap.ui.codeeditor.CodeEditor} Returns <code>this</code> to allow method chaining
	 * @public
	 */
	CodeEditor.prototype.setValue = function(sValue) {
		this.setProperty("value", sValue, true);
		this._oEditor.setValue(this.getProperty("value"));
		if (!this.getValueSelection()) {
			this._oEditor.selection.clearSelection();
		}
		return this;
	};

	/**
	 * Returns the current value of the code editor
	 * @returns {string} Returns the current value of the code editor
	 * @public
	 */
	CodeEditor.prototype.getCurrentValue = function () {
		return this._oEditor.getValue();
	};

	/**
	 * Sets whether line numbers should be shown or not
	 * @param {boolean} bValue true to show line numbers
	 * @returns {sap.ui.codeeditor.CodeEditor} Returns <code>this</code> to allow method chaining
	 * @public
	 */
	CodeEditor.prototype.setLineNumbers = function(bValue) {
		this.setProperty("lineNumbers", bValue, true);
		this._oEditor.renderer.setShowGutter(this.getLineNumbers());
		return this;
	};

	/**
	 * @private
	 */
	CodeEditor.prototype.onAfterRendering = function() {
		var oDomRef = this.getDomRef();
		setTimeout(function() {
			if (oDomRef.height < 20) {
				oDomRef.style.height = "3rem";
			}
		}, 1000);

		this.getDomRef().appendChild(this._oEditorDomRef);

		// force text update
		this._oEditor.renderer.updateText();
	};

	/**
	 * Returns the internal ace editor instance
	 * @returns {object} the internal ace editor instance
	 * @private
	 * @sap-restricted
	 */
	CodeEditor.prototype._getEditorInstance = function() {
		return this._oEditor;
	};

	return CodeEditor;
}, /* bExport= */true);
