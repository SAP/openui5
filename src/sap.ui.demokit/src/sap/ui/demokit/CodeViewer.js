/*!
 * ${copyright}
 */

// Provides control sap.ui.demokit.CodeViewer.
sap.ui.define(['jquery.sap.global', 'sap/ui/commons/Button', 'sap/ui/commons/Dialog', 'sap/ui/core/Control', './library'],
	function(jQuery, Button, Dialog, Control, library) {
	"use strict";



	/**
	 * Constructor for a new CodeViewer.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Shows a piece of (Javascript) code and allows to edit it
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @name sap.ui.demokit.CodeViewer
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var CodeViewer = Control.extend("sap.ui.demokit.CodeViewer", /** @lends sap.ui.demokit.CodeViewer.prototype */ { metadata : {

		library : "sap.ui.demokit",
		properties : {

			/**
			 * The source code to display.
			 */
			source : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * The CSS width property
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Misc", defaultValue : null},

			/**
			 * The CSS height property
			 */
			height : {type : "sap.ui.core.CSSSize", group : "Misc", defaultValue : null},

			/**
			 * Whether the code can be edited or not
			 */
			editable : {type : "boolean", group : "Misc", defaultValue : false},

			/**
			 * Whether the code to have line numbering or not
			 */
			lineNumbering : {type : "boolean", group : "Misc", defaultValue : false},

			/**
			 * Whether the code viewer should be visible
			 */
			visible : {type : "boolean", group : "Misc", defaultValue : true}
		},
		events : {

			/**
			 * Called when the mouse button is clicked over the non-editable(!) control
			 */
			press : {},

			/**
			 * Called when the editor is active and should be saved
			 */
			save : {}
		}
	}});

	/*global prettyPrint *///declare unusual global vars for JSLint/SAPUI5 validation

	CodeViewer.load = function() {
		if ( !window.prettyPrint ) {
			jQuery.sap.require("sap.ui.demokit.js.google-code-prettify.prettify");
		}
	};

	CodeViewer.load();

	/**
	 * Adapts size settings of the rendered HTML in special situations
	 */
	CodeViewer.prototype.onAfterRendering = function () {
		var oDomRef = this.getDomRef();
		if ( !this.getEditable() && oDomRef && oDomRef.className.indexOf("prettyprint") !== -1 && window.prettyPrint ) {
			// TODO a call to prettyPrint() will also pretty print other CodeViewer controls -> avoid double pretty printing
			prettyPrint();
			oDomRef.className = 'sapUiCodeViewer sapUiCodeViewerRO ' + (this.aCustomStyleClasses || []).join(' ');
		}
	};

	/**
	 * Function is called when code viewer is clicked.
	 *
	 * @param oBrowserEvent the forwarded sap.ui.core.BrowserEvent
	 * @private
	 */
	CodeViewer.prototype.onclick = function(e) {
		if (!this.getEditable()) {
			this.firePress({id:this.getId()});
			e.preventDefault();
			e.stopPropagation();
		}
	};

	/**
	 * Handles the sapescape event... triggers return to non-editable mode (revert)
	 * @param {sap.ui.core.BroserEvent} oBrowserEvent the forwarded browser event
	 * @private
	 */
	CodeViewer.prototype.onsapescape = function(oBrowserEvent) {
		if ( this.getEditable() ) {
			// we do not update the source from the PRE tag, so this acts as a 'revert'
			this.setEditable(false);
		}
	};

	CodeViewer.prototype.onkeydown = function(e) {
		if ( this.getEditable() &&
			 ((e.keyCode == jQuery.sap.KeyCodes.S && e.ctrlKey && !e.shiftKey && !e.altKey) ||
			  (e.keyCode == jQuery.sap.KeyCodes.F2)) ) {
			e.preventDefault();
			e.stopPropagation();
			this.fireSave();
		}
	};

	CodeViewer.prototype.getCurrentSource = (function() {

		var SIMPLE_HTML_REGEXP = /<(\/?[^ >]+)[^>]*>|(&[^;]+;)/g,
			TAG_REPLACEMENTS = {
				"/p" : "\n",
				"br" : "\n",
				"div" : "\n"
			},
			ENTITY_REPLACEMENTS = {
				"&nbsp;" : " ",
				"&lt;" : "<",
				"&gt;" : ">",
				"&amp;" : "&"
			};

		return function() {
			var code = '',
				oDomRef = this.getDomRef();

			if ( oDomRef ) {
				// retrieve the edited source via innerHTML as this seems to be the only way to detect line breaks
				code = oDomRef.innerHTML;
				//var code = oDomRef.textContent;
				//if (!code) {
				//	// IE version
				//	code = oDomRef.innerText;
				//}

				// convert some well known tags and entities, remove all others
				code = code.replace(SIMPLE_HTML_REGEXP, function(m,m1,m2) {
					if ( m1 ) {
						m1 = m1.toLowerCase();
						if ( TAG_REPLACEMENTS[m1] ) {
							return TAG_REPLACEMENTS[m1];
						}
					} else if ( m2 ) {
						m2 = m2.toLowerCase();
						if ( ENTITY_REPLACEMENTS[m2] ) {
							return ENTITY_REPLACEMENTS[m2];
						}
					}
					return "";
				});
			}
			return code;
		};
	})();



	CodeViewer.showScript = function(sId) {
		var oDomRef = document.getElementById(sId);
		var sSource = oDomRef.innerHTML;

		if ( !oDomRef || !sSource ) {
			return;
		}

		var oClose = new Button({text:"Close", press: function() { oDialog.close();}});
		var oDialog = new Dialog({
			applyContentPadding : false,
			title : "Source Code for '" + sId + "'",
			resizable: true,
			minWidth:"400px", minHeight:"200px",
			buttons : [oClose],
			content : new CodeViewer({
				source:sSource,
				press: function() { jQuery.sap.log.info('clicked into code viewer');}}),
			defaultButton: oClose});
		oDialog.center();
		oDialog.open();
	};


	return CodeViewer;

}, /* bExport= */ true);
