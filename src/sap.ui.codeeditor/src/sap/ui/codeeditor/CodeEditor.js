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
	"sap/ui/core/Control",
	"sap/ui/core/Lib",
	"sap/ui/core/RenderManager",
	"sap/ui/core/ResizeHandler",
	"sap/ui/dom/includeStylesheet",
	"sap/ui/thirdparty/jquery",
	"sap/ui/codeeditor/js/ace/ace",
	"sap/base/strings/capitalize",
	"sap/ui/codeeditor/js/ace/ext-language_tools",
	"sap/ui/codeeditor/js/ace/ext-beautify",
	"sap/ui/codeeditor/js/ace/mode-javascript",
	"sap/ui/codeeditor/js/ace/mode-json"
], function(
	library,
	Control,
	Library,
	RenderManager,
	ResizeHandler,
	includeStylesheet,
	jQuery,
	ace,
	capitalize
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
	 * Use this control in scenarios where the user should be able to inspect and edit source code.
	 * The control currently uses the third-party code editor Ace.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.46
	 * @alias sap.ui.codeeditor.CodeEditor
	 */
	var CodeEditor = Control.extend("sap.ui.codeeditor.CodeEditor", {
		metadata: {
			library: "sap.ui.codeeditor",
			properties: {
				/**
				 * The value displayed in the code editor.
				 */
				value: { type: "string", group: "Misc", defaultValue: "" },
				/**
				 * The type of the code in the editor used for syntax highlighting.
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
				 * red, puppet, php_laravel_blade, mixal, jssm, fsharp, edifact, csp, cssound_score, cssound_orchestra, cssound_document
				 */
				type: { type: "string", group: "Appearance", defaultValue: "javascript" },
				/**
				 * The width of the code editor.
				 */
				width: { type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: "100%" },
				/**
				 * The height of the code editor.
				 * A minimal height of 3rem will be applied in case the height is less than 20px.
				 */
				height: { type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: "100%" },
				/**
				 * Sets whether the code in the editor can be changed by the user.
				 */
				editable: { type: "boolean", group: "Behavior", defaultValue: true },
				/**
				 * Sets whether line numbers should be shown.
				 */
				lineNumbers: { type: "boolean", group: "Behavior", defaultValue: true },
				/**
				 * Sets whether the code is automatically selected if a value is set.
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
				 * Sets the editor color theme.
				 * Possible values are:
				 * <ul>
				 * <li>default: best fitting to the current UI5 theme</li>
				 * <li>any light theme from the list: chrome, clouds, crimson_editor, dawn, dreamweaver, eclipse, github, iplastic, solarized_light,
				 * textmate, tomorrow, xcode, kuroir, katzenmilch, sqlserver
				 * </li>
				 * <li>any dark theme from the list: hcb, hcb_bright, hcb_blue, ambiance, chaos, clouds_midnight, dracula, cobalt, gruvbox, gob, idle_fingers, kr_theme,
				 * merbivore, merbivore_soft, mono_industrial, monokai, nord_dark, one_dark, pastel_on_dark, solarized_dark, terminal, tomorrow_night,
				 * tomorrow_night_blue, tomorrow_night_bright, tomorrow_night_eighties, twilight, vibrant_ink, github_dark
				 * </li>
				 * </ul>
				 */
				colorTheme: { type: "string", group: "Behavior", defaultValue: "default" },
				/**
				 * Sets whether to show syntax hints in the editor. This flag is only available if line numbers are shown.
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
						 * The underlying change event of the third-party code editor.
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
				const sColorTheme = oControl.getColorTheme();

				oRM.openStart("div", oControl).class("sapCEd");
				if (sColorTheme === "default") {
					oRM.class("sapCEdTheme" + capitalize(sColorTheme));
				}
				oRM.style("width", oControl.getWidth())
					.style("height", oControl.getHeight())
					.attr("data-sap-ui-syntaxhints", oControl.getSyntaxHints())
					.attr("role", "application")
					.attr("aria-roledescription", Library.getResourceBundleFor("sap.ui.codeeditor").getText("CODEEDITOR_ROLE_DESCRIPTION"));

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
	ace.config.set("loadWorkerFromBlob", false);
	ace.config.set("useStrictCSP", true);

	// require language tools
	var oLangTools = ace.require("ace/ext/language_tools");

	/**
	 * @private
	 */
	CodeEditor.prototype.init = function() {
		this._bIsRenderingPhase = false;

		this._oEditorDomRef = document.createElement("div");
		this._oEditorDomRef.id = this.getId() + "-editor";
		this._oEditorDomRef.style.height = "100%";
		this._oEditorDomRef.style.width = "100%";

		this._oEditor = ace.edit(this._oEditorDomRef);
		this._oDefaultTheme = {
			cssClass: "ace-default",
			isDark: false,
			cssText: ""
		};
		this._oEditor.setTheme(this._oDefaultTheme);

		var oSession = this._oEditor.getSession();

		// Ensure worker is used only when the CodeEditor has focus.
		// This helps preventing race conditions between the framework's
		// lifecycle and the Ace editor's lifecycle.
		oSession.setUseWorker(false);

		oSession.setValue("");
		oSession.setUseWrapMode(true);
		oSession.setMode("ace/mode/javascript");

		includeStylesheet(
			sap.ui.require.toUrl("sap/ui/codeeditor/js/ace/css/ace.css"),
			"sap-ui-codeeditor-ace"
		);

		this._oEditor.setOptions({
			enableBasicAutocompletion: true,
			enableSnippets: true,
			enableLiveAutocompletion: true,
			enableKeyboardAccessibility: true
		});

		this._oEditor.textInput.getElement().id = this.getId() + "-editor-textarea";
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

			if (this._bIsRenderingPhase) {
				return;
			}

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
		this._oEditor.getSession().setUseWorker(false); // explicitly disable worker usage, in case the ace mode is still loading, to avoid worker initialization after destroy
		jQuery(this._oEditorDomRef).remove(); // remove DOM node together with all event listeners
		this._oEditorDomRef = null;
		this._oEditor = null;
	};

	/**
	 * @private
	 */
	CodeEditor.prototype.onBeforeRendering = function() {

		this._bIsRenderingPhase = true;

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
		this._bIsRenderingPhase = false;

		var oDomRef = this.getDomRef(),
			oPropertyDefaults = this.getMetadata().getPropertyDefaults();

		setTimeout(function() {
			if (this.getMaxLines() === oPropertyDefaults.maxLines && this.getHeight() === oPropertyDefaults.height
				&& oDomRef.height < 20) {
				oDomRef.style.height = "3rem";
			}
		}.bind(this), 0);

		oDomRef.appendChild(this._oEditorDomRef);

		this._oEditor.setReadOnly(!this.getEditable());

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
	 * Returns the DOMNode ID to be used for the "labelFor" attribute of the label.
	 *
	 * By default, this is the ID of the control itself.
	 *
	 * @return {string} ID to be used for the <code>labelFor</code>
	 * @public
	 */
	CodeEditor.prototype.getIdForLabel = function () {
		return this.getId() + "-editor-textarea";
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
	 * Sets the color theme  of the code editor
	 * @param {string} sTheme See property documentation for accepted values
	 * @returns {this} Returns <code>this</code> to allow method chaining
	 * @public
	 */
	CodeEditor.prototype.setColorTheme = function(sTheme) {
		this.setProperty("colorTheme", sTheme);

		if (sTheme === "default") {
			this._oEditor.setTheme(this._oDefaultTheme);

			return this;
		}

		if (sTheme === "hcb") {
			sTheme = "tomorrow_night";
		} else if (sTheme === "hcb_bright") {
			sTheme = "tomorrow_night_bright";
		} else if (sTheme === "hcb_blue") {
			sTheme = "tomorrow_night_blue";
		}

		this._oEditor.setTheme("ace/theme/" + sTheme);

		includeStylesheet(
			sap.ui.require.toUrl("sap/ui/codeeditor/js/ace/css/theme/" + sTheme + ".css"),
			"sap-ui-codeeditor-theme-" + sTheme
		);

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
	 * Context object provides details about oPos and sPrefix as provided by the third-party code editor.
	 * @param {{getCompletions: function}} oCustomCompleter Object with getCompletions method
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
	 * Returns the third-party code editor instance
	 * <b>Caution:</b> Using the third-party code editor instance introduces a dependency to that internal editor. Future changes in the internal editor might lead to undefined behavior, so it should only be used in justified cases.
	 * @returns {object} the internal third-party code editor instance
	 * @private
	 * @ui5-restricted
	 * @deprecated As of version 1.121, use the public <code>CodeEditor.prototype.getAceEditor</code> instead.
	 */
	CodeEditor.prototype.getInternalEditorInstance = function() {
		return this._oEditor;
	};

	/**
	 * Returns the internal instance of the third-party Ace code editor.
	 *
	 * <b>Note:</b> This control is based on third-party open-source software, and there might be incompatible changes introduced by the code owner in their future releases.
	 * @returns {object} the internal third-party Ace code editor instance
	 * @public
	 * @since 1.121
	 */
	CodeEditor.prototype.getAceEditor = function() {
		return this._oEditor;
	};

	/**
	 * Pretty-prints the content of the editor.
	 *
	 * <b>Note:</b> Works well for PHP. For other editor types (modes),
	 * the content might not be formatted well.
	 * In such cases it is recommended to use your own formatting.
	 * @public
	 * @since 1.54.1
	 */
	CodeEditor.prototype.prettyPrint = function () {
		ace.require("ace/ext/beautify").beautify(this._oEditor.session);
	};

	CodeEditor.prototype.onfocusout = function () {
		this._oEditor.getSession().setUseWorker(false);
	};

	CodeEditor.prototype.onfocusin = function () {
		this._oEditor.getSession().setUseWorker(true);
	};

	CodeEditor.prototype.getFocusDomRef = function () {
		const domRef = this.getDomRef();

		if (!domRef) {
			return null;
		}

		if (document.activeElement === domRef.querySelector(".ace_text-input")) {
			return domRef.querySelector(".ace_text-input");
		}

		return domRef.querySelector(".ace_scroller.ace_keyboard-focus");
	};

	return CodeEditor;
});