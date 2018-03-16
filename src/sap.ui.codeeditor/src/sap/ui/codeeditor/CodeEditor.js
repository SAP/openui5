/*!
 * ${copyright}
 */

/*global ace */

sap.ui.define([
	'jquery.sap.global',
	'sap/ui/core/Control',
	'sap/ui/codeeditor/js/ace/ace',
	'sap/ui/codeeditor/js/ace/ext-language_tools',
	'sap/ui/codeeditor/js/ace/ext-beautify',
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
	 * NOTE: There is a known limitation where CodeEditor won't work within IconTabBar on Internet Explorer. There
	 * is a way to achieve the same functionality - an example of IconTabHeader and a CodeEditor can be found
	 * in the CodeEditor's samples.
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
					 * Possible types are: abap, abc, actionscript, ada, apache_conf, applescript, asciidoc, assembly_x86,
					 * autohotkey, batchfile, bro, c9search, c_cpp, cirru, clojure, cobol, coffee, coldfusion, csharp, css,
					 * curly, d, dart, diff, django, dockerfile, dot, drools, eiffel, ejs, elixir, elm, erlang, forth, fortran,
					 * ftl, gcode, gherkin, gitignore, glsl, gobstones, golang, groovy, haml, handlebars, haskell, haskell_cabal,
					 * haxe, hjson, html, html_elixir, html_ruby, ini, io, jack, jade, java, javascript, json, jsoniq, jsp, jsx, julia,
					 * kotlin, latex, lean, less, liquid, lisp, live_script, livescript, logiql, lsl, lua, luapage, lucene, makefile, markdown,
					 * mask, matlab, mavens_mate_log, maze, mel, mips_assembler, mipsassembler, mushcode, mysql, nix, nsis, objectivec,
					 * ocaml, pascal, perl, pgsql, php, plain_text, powershell, praat, prolog, properties, protobuf, python, r,
					 * razor, rdoc, rhtml, rst, ruby, rust, sass, scad, scala, scheme, scss, sh, sjs, smarty, snippets,
					 * soy_template, space, sql, sqlserver, stylus, svg, swift, swig, tcl, tex, text, textile, toml, tsx,
					 * twig, typescript, vala, vbscript, velocity, verilog, vhdl, wollok, xml, xquery, yaml
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
					 * Sets whether the editor height should auto expand to a maximum number of lines. After reaching
					 * the maximum number of lines specified, the content of the <code>CodeEditor</code> will become scrollable.
					 *
					 * <b>Note:</b> Keep in mind that the auto expand <code>CodeEditor</code> behavior requires the
					 * <code>height</code> property to be set to <code>auto</code>.
					 *
					 * @since 1.48.1
					 */
					maxLines: {
						type: "int",
						group: "Behavior",
						defaultValue: 0
					},
					/**
					 * Sets the editors color theme
					 * Possible values are: default, hcb, hcb_bright, hcb_blue,
					 * theme-ambiance, chaos, chrome, clouds, clouds_midnight, cobalt, crimson_editor, dawn, dreamweaver, eclipse,
					 * github, gob, gruvbox, idle_fingers, iplastic, katzenmilch, kr_theme, kuroir, merbivore, merbivore_soft,
					 * mono_industrial, monokai, pastel_on_dark, solarized_dark, solarized_light, sqlserver, terminal, textmate,
					 * tomorrow, tomorrow_night, tomorrow_night_blue, tomorrow_night_bright, tomorrow_night_eighties, twilight,
					 * vibrant_ink, xcode
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

	// require language tools
	var oLangTools = ace.require("ace/ext/language_tools");

	/**
	 * @private
	 */
	CodeEditor.prototype.init = function() {
		var oDomRef = document.createElement("div");
		this._oEditorDomRef = oDomRef;
		this._oEditorDomRef.style.height = "100%";
		this._oEditorDomRef.style.width = "100%";
		this._oEditor = ace.edit(oDomRef);

		var oSession = this._oEditor.getSession();

		// Ensure worker is used only when the CodeEditor has focus.
		// This helps preventing race conditions between the framework's
		// lifecycle and the Ace editor's lifecycle.
		oSession.setUseWorker(false);

		oSession.setValue("");
		oSession.setUseWrapMode(true);
		oSession.setMode("ace/mode/javascript");
		this._oEditor.setTheme("ace/theme/tomorrow");

		this._oEditor.setOptions({
			enableBasicAutocompletion: true,
			enableSnippets: true,
			enableLiveAutocompletion: true
		});

		this._oEditor.renderer.setShowGutter(true);

		// Do not scroll to end of input when setting value
		// it has been reported as annoying to end users
		// when they have to scroll to the beginning of content
		this._oEditor.$blockScrolling = Infinity;

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

		// This is required for BCP:1880235178
		this._oEditor.textInput.setReadOnly(!bValue);
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
	 * @param {string} sTheme See property documentation for accepted values
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
		this._oEditor.getSession().setValue(this.getProperty("value"));
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
		var oDomRef = this.getDomRef(),
			oPropertyDefaults = this.getMetadata().getPropertyDefaults();

		setTimeout(function() {
			if (this.getMaxLines() === oPropertyDefaults.maxLines && this.getHeight() === oPropertyDefaults.height
				&& oDomRef.height < 20) {
				oDomRef.style.height = "3rem";
			}
		}.bind(this), 0);

		oDomRef.appendChild(this._oEditorDomRef);

		// force text update
		this._oEditor.renderer.updateText();
	};

	/**
	 * Sets <code>maxLines</code> property.
	 * @param {int} iMaxLines Maximum number of lines the editor should display
	 * @override
	 * @public
	 * @since 1.48.1
	 */
	CodeEditor.prototype.setMaxLines = function (iMaxLines) {
		this._oEditor.setOption("maxLines", iMaxLines);
		return this.setProperty("maxLines", iMaxLines, true);
	};

	/**
	 * Defines custom completer - object implementing a getCompletions method.
	 * The method has two parameters - fnCallback method and context object.
	 * Context object provides details about oPos and sPrefix as provided by ACE.
	 * @param {object} oCustomCompleter Object with getCompletions method
	 * @public
	 * @since 1.52
	 */
	CodeEditor.prototype.addCustomCompleter = function (oCustomCompleter) {
		oLangTools.addCompleter({
			getCompletions: function (oEditor, oSession, oPos, sPrefix, fnCallback) {
				oCustomCompleter.getCompletions(fnCallback, {
					oPos: oPos,
					sPrefix: sPrefix
				});
			}
		});
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

	/**
	 * Sets <code>visible</code> property.
	 * @param {boolean} bVisible Whether the code editor is visible.
	 * @override
	 * @public
	 * @since 1.54.1
	 */
	CodeEditor.prototype.setVisible = function(bVisible) {
		if (this.getVisible() !== bVisible) {
			this.setProperty("visible", bVisible);
			//trigger re-rendering as the usual invalidation is turned off by default.
			this.rerender();
		}
		return this;
	};

	/**
	 * Pretty-prints the content of the editor
	 * @public
	 * @since 1.54.1
	 */
	CodeEditor.prototype.prettyPrint = function () {
		ace.require("ace/ext/beautify").beautify(this._oEditor.session);
	};

	CodeEditor.prototype.destroy = function (bSuppressInvalidate) {
		this._oEditor.destroy(bSuppressInvalidate);
		Control.prototype.destroy.call(this, bSuppressInvalidate);
	};

	CodeEditor.prototype.onfocusout = function () {
		this._oEditor.getSession().setUseWorker(false);
	};

	CodeEditor.prototype.onfocusin = function () {
		if (!this.getEditable()) {
			document.activeElement.blur(); // prevent virtual keyboard from opening when control is not editable
		}
		this._oEditor.getSession().setUseWorker(true);
	};

	return CodeEditor;
}, /* bExport= */true);
