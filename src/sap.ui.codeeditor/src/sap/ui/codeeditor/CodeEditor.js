/*!
 * ${copyright}
 */

sap.ui.loader.config({
	shim: {
		'sap/ui/codeeditor/js/ace/ace': {
			exports: 'ace'
		},
		'sap/ui/codeeditor/js/ace/ext-language_tools': {
			deps: ['sap/ui/codeeditor/js/ace/ace']
		},
		'sap/ui/codeeditor/js/ace/ext-beautify': {
			deps: ['sap/ui/codeeditor/js/ace/ace']
		},
		'sap/ui/codeeditor/js/ace/mode-javascript': {
			deps: ['sap/ui/codeeditor/js/ace/ace']
		},
		'sap/ui/codeeditor/js/ace/mode-json': {
			deps: ['sap/ui/codeeditor/js/ace/ace']
		}
	}
});

sap.ui.define([
	"./library",
	"sap/ui/core/Core",
	"sap/ui/core/Control",
	"sap/ui/core/RenderManager",
	"sap/ui/core/ResizeHandler",
	"sap/ui/Device",
	"sap/ui/thirdparty/jquery",
	"sap/ui/codeeditor/js/ace/ace",
	"sap/ui/codeeditor/js/ace/ext-language_tools",
	"sap/ui/codeeditor/js/ace/ext-beautify",
	"sap/ui/codeeditor/js/ace/mode-javascript",
	"sap/ui/codeeditor/js/ace/mode-json"
], function (
	library,
	Core,
	Control,
	RenderManager,
	ResizeHandler,
	Device,
	jQuery,
	ace
) {
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
	var CodeEditor = Control.extend("sap.ui.codeeditor.CodeEditor", {
		metadata: {
			library: "sap.ui.core",
			properties: {
				/**
				 * The value displayed in the code editor
				 */
				value: { type: "string", group: "Misc", defaultValue: "" },
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
				 * twig, typescript, vala, vbscript, velocity, verilog, vhdl, wollok, xml, xquery, yaml, terraform, slim, redshift,
				 * red, puppet, php_laravel_blade, mixal, jssm, fsharp, edifact, csp, cssound_score, cssound_orchestra, cssound_document,
				 */
				type: { type: "string", group: "Appearance", defaultValue: "javascript" },
				/**
				 * The width of the code editor
				 */
				width: { type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: "100%" },
				/**
				 * The height of the code editor.
				 * A minimal height of 3rem will be applied in case the height is less than 20px.
				 */
				height: { type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: "100%" },
				/**
				 * Sets whether the code in the editor can be changed by the user
				 */
				editable: { type: "boolean", group: "Behavior", defaultValue: true },
				/**
				 * Sets whether line numbers should be shown
				 */
				lineNumbers: { type: "boolean", group: "Behavior", defaultValue: true },
				/**
				 * Sets whether the code is automatically selected if a value is set
				 */
				valueSelection: { type: "boolean", group: "Behavior", defaultValue: false },
				/**
				 * Sets whether the editor height should auto expand to a maximum number of lines. After reaching
				 * the maximum number of lines specified, the content of the <code>CodeEditor</code> will become scrollable.
				 *
				 * <b>Note:</b> Keep in mind that the auto expand <code>CodeEditor</code> behavior requires the
				 * <code>height</code> property to be set to <code>auto</code>.
				 *
				 * @since 1.48.1
				 */
				maxLines: { type: "int", group: "Behavior", defaultValue: 0 },
				/**
				 * Sets the editors color theme
				 * Possible values are: default, hcb, hcb_bright, hcb_blue,
				 * theme-ambiance, chaos, chrome, clouds, clouds_midnight, cobalt, crimson_editor, dawn, dreamweaver, eclipse,
				 * github, gob, gruvbox, idle_fingers, iplastic, katzenmilch, kr_theme, kuroir, merbivore, merbivore_soft,
				 * mono_industrial, monokai, pastel_on_dark, solarized_dark, solarized_light, sqlserver, terminal, textmate,
				 * tomorrow, tomorrow_night, tomorrow_night_blue, tomorrow_night_bright, tomorrow_night_eighties, twilight, dracula
				 * vibrant_ink, xcode
				 */
				colorTheme: { type: "string", group: "Behavior", defaultValue: "default" },
				/**
				 * Sets whether to show syntax hints the editor. This flag is only available if line numbers are shown.
				 */
				syntaxHints: { type: "boolean", group: "Behavior", defaultValue: true }
			},
			events: {

				/**
				 * Fired when the value is changed by user interaction - each keystroke, delete, paste, etc.
				 */
				liveChange: {
					parameters: {
						/**
						 * The current value of the code editor.
						 */
						value: { type: "string" },
						/**
						 * The underlying change event of the Ace code editor.
						 */
						editorEvent: { type: "object" }
					}
				},

				/**
				 * Fired when the value has changed and the focus leaves the code editor.
				 */
				change: {
					parameters: {
						/**
						 * The current value of the code editor.
						 */
						value: { type: "string" },
						/**
						 * The old value of the code editor.
						 */
						oldValue: { type: "string" }
					}
				}
			},
			defaultProperty: "content"
		},

		renderer: {
			apiVersion: 2,
			render: function (oRM, oControl) {
				oRM.openStart("div", oControl).class("sapCEd")
					.style("width", oControl.getWidth())
					.style("height", oControl.getHeight())
					.attr("data-sap-ui-syntaxhints", oControl.getSyntaxHints())
					.attr("role", "application")
					.attr("aria-roledescription", Core.getLibraryResourceBundle("sap.ui.codeeditor").getText("CODEEDITOR_ROLE_DESCRIPTION"));

				var sTooltip = oControl.getTooltip_AsString();
				if (sTooltip) {
					oRM.attr("title", sTooltip);
				}
				oRM.openEnd();
				oRM.close("div");
			}
		}
	});

	//configure the source paths
	var sPath = sap.ui.require.toUrl("sap/ui/codeeditor/js/ace");
	ace.config.set("basePath", sPath);

	// require language tools
	var oLangTools = ace.require("ace/ext/language_tools");

	/**
	 * @private
	 */
	CodeEditor.prototype.init = function() {
		this._oEditorDomRef = document.createElement("div");
		this._oEditorDomRef.style.height = "100%";
		this._oEditorDomRef.style.width = "100%";

		this._oEditor = ace.edit(this._oEditorDomRef);
		var oSession = this._oEditor.getSession();

		// Ensure worker is used only when the CodeEditor has focus.
		// This helps preventing race conditions between the framework's
		// lifecycle and the Ace editor's lifecycle.
		oSession.setUseWorker(false);

		oSession.setValue("");
		oSession.setUseWrapMode(true);
		oSession.setMode("ace/mode/javascript");

		var sUiTheme = Core.getConfiguration().getTheme().toLowerCase();
		var sEditorTheme = "tomorrow";
		if (sUiTheme.indexOf("hcb") > -1) {
			sEditorTheme = "chaos";
		} else if (sUiTheme.indexOf("hcw") > -1) {
			sEditorTheme = "github";
		} else if (sUiTheme === "sap_fiori_3") {
			sEditorTheme = "crimson_editor";
		} else if (sUiTheme === "sap_fiori_3_dark") {
			sEditorTheme = "clouds_midnight";
		}
		this._oEditor.setTheme("ace/theme/" + sEditorTheme);

		this._oEditor.setOptions({
			enableBasicAutocompletion: true,
			enableSnippets: true,
			enableLiveAutocompletion: true
		});

		this._oEditor.renderer.setShowGutter(true);

		this._oEditor.addEventListener("change", function (oEvent) {
			if (!this.getEditable()) {
				return;
			}
			var sValue = this.getCurrentValue();
			this.fireLiveChange({
				value: sValue,
				editorEvent: oEvent
			});
		}.bind(this));

		this._oEditor.addEventListener("blur", function () {
			var sValue = this.getCurrentValue(),
				sCurrentValue = this.getValue();
			this.setProperty("value", sValue, true);
			if (sValue != sCurrentValue && this.getEditable()) {
				this.fireChange({
					value: sValue,
					oldValue: sCurrentValue
				});
			}
		}.bind(this));

		// if editor is in dialog with transform applied, the tooltip position has to be adjusted
		this._oEditor.addEventListener("showGutterTooltip", function (tooltip) {
			if (Device.browser.internet_explorer) {
				// the transform property does not effect the position of tooltip in IE
				return;
			}

			var $tooltip = jQuery(tooltip.$element),
				$dialog = $tooltip.parents(".sapMDialog");

			if ($dialog && $dialog.css("transform")) {
				var mDialogPosition = $dialog.position();
				$tooltip.css("transform", "translate(-" + mDialogPosition.left + "px, -" + mDialogPosition.top + "px)");
			}
		});
	};

	/**
	 * @private
	 */
	CodeEditor.prototype.exit = function() {
		this._deregisterResizeListener();
		this._oEditor.destroy(); // clear ace intervals
		jQuery(this._oEditorDomRef).remove(); // remove DOM node together with all event listeners
		this._oEditorDomRef = null;
		this._oEditor = null;
	};

	/**
	 * @private
	 */
	CodeEditor.prototype.onBeforeRendering = function() {
		var oDomRef = this.getDomRef();
		if (oDomRef && !RenderManager.isPreservedContent(oDomRef)) {
			RenderManager.preserveContent(oDomRef);
		}

		this._deregisterResizeListener();
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

		var bEditable = this.getEditable();
		this._oEditor.setReadOnly(!bEditable);
		if (bEditable) {
			this._oEditor.renderer.$cursorLayer.element.style.display = "";
		} else {
			//hide the cursor
			this._oEditor.renderer.$cursorLayer.element.style.display = "none";
		}

		this._oEditor.getSession().setMode("ace/mode/" + this.getType());
		this._oEditor.setOption("maxLines", this.getMaxLines());
		this._oEditor.renderer.setShowGutter(this.getLineNumbers());

		this._oEditor.getSession().setValue(this.getValue());
		if (!this.getValueSelection()) {
			this._oEditor.selection.clearSelection();
		}

		// force text update
		this._oEditor.renderer.updateText();
		this._oEditor.resize();

		this._registerResizeListener();
	};

	/**
	 * @private
	 */
	CodeEditor.prototype._registerResizeListener = function() {
		if (!this._iResizeListenerId) {
			// listen once for resize of the _oEditorDomRef, in some ui5 containers (sap.m.App for example) this can happen very late and ace editor does not handle it
			this._iResizeListenerId = ResizeHandler.register(this._oEditorDomRef, function() {
				this._oEditor.resize(); // force the ace editor to recalculate height
			}.bind(this));
		}
	};

	/**
	 * @private
	 */
	CodeEditor.prototype._deregisterResizeListener = function() {
		// Unregister the resize listener used for fixing initial resize, to prevent double registering.
		if (this._iResizeListenerId) {
			ResizeHandler.deregister(this._iResizeListenerId);
			this._iResizeListenerId = null;
		}
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
	 * Returns the current value of the code editor
	 * @returns {string} Returns the current value of the code editor
	 * @public
	 */
	CodeEditor.prototype.getCurrentValue = function () {
		return this._oEditor.getValue();
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
	 * @ui5-restricted
	 */
	CodeEditor.prototype._getEditorInstance = function() {
		return this._oEditor;
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
		this._oEditor.getSession().setUseWorker(true);
	};

	return CodeEditor;
});