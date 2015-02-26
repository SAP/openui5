/*!
 * ${copyright}
 */

// Provides control sap.ui.commons.FormattedTextView.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control', 'jquery.sap.encoder'],
	function(jQuery, library, Control/* , jQuerySap */) {
	"use strict";


	
	/**
	 * Constructor for a new FormattedTextView.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Allows to use a limited set of HTML tags for display
	 * @extends sap.ui.core.Control
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.9.0
	 * @alias sap.ui.commons.FormattedTextView
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FormattedTextView = Control.extend("sap.ui.commons.FormattedTextView", /** @lends sap.ui.commons.FormattedTextView.prototype */ { metadata : {
	
		library : "sap.ui.commons",
		properties : {
			/**
			 * The ARIA role for the control.
			 */
			accessibleRole : {type : "sap.ui.core.AccessibleRole", group : "Accessibility", defaultValue : sap.ui.core.AccessibleRole.Document},
	
			/**
			 * Text with placeholders
			 */
			htmlText : {type : "string", group : "Misc", defaultValue : ""}
		},
		aggregations : {
	
			/**
			 * Array of controls that should be replaced within htmlText
			 */
			controls : {type : "sap.ui.commons.FormattedTextViewControl", multiple : true, singularName : "control"}
		}
	}});
	
	
	
	
	
	(function() {
		FormattedTextView.prototype.init = function() {
			this._aAllowedInterfaces = [];
			this._aAllowedInterfaces[0] = "sap.ui.commons.FormattedTextViewControl";
	
			/*
			 * these are the rules for the FormattedTextView
			 */
			this._ftv = {};
	
			// rules for the allowed attributes
			this._ftv.ATTRIBS = {
				'span::class' : 1,
				'div::class' : 1,
				'div::id' : 1,
				'span::id' : 1,
				'embed::data-index' : 1
			};
	
			// rules for the allowed tags
			this._ftv.ELEMENTS = {
				// Text Module Tags
				'abbr' : 1,
				'acronym' : 1,
				'address' : 1,
				'blockquote' : 1,
				'br' : 1,
				'cite' : 1,
				'code' : 1,
				'dfn' : 1,
				'div' : 1,
				'em' : 1,
				'h1' : 1,
				'h2' : 1,
				'h3' : 1,
				'h4' : 1,
				'h5' : 1,
				'h6' : 1,
				'kbd' : 1,
				'p' : 1,
				'pre' : 1,
				'q' : 1,
				'samp' : 1,
				'strong' : 1,
				'span' : 1,
				'var' : 1,
	
				// List Module Tags
				'dl' : 1,
				'dt' : 1,
				'dd' : 1,
				'ol' : 1,
				'ul' : 1,
				'li' : 1,
	
				// Special Tags
				// this is the placeholder for the controls
				'embed' : 1
	
			// TODO maybe add these tags (if someone really need this)
			// 'a' : 1, currently used via Link-Control
			// 'img' : 1, currently used via Image-Control
			};
		};
		FormattedTextView.prototype.exit = function() {
			delete this._aAllowedInterfaces;
	
			delete this._ftv;
		};
	
		FormattedTextView.prototype.hasControls = function() {
			var aControls = this.getAggregation("controls");
			if (aControls && aControls.length > 0) {
				return true;
			}
			return false;
		};
	
		/**
		 * Sanitizes attributes on an HTML tag.
		 *
		 * @private
		 * @param {string}
		 *            tagName An HTML tag name in lowercase.
		 * @param {Array.<?string>} attribs An array of alternating names and values.
		 * @return {Array.<?string>} The sanitized attributes as a list of
		 *         alternating names and values, where a null value means to omit
		 *         the attribute.
		 */
		var fnSanitizeAttribs = function(tagName, attribs) {
			for ( var i = 0; i < attribs.length; i += 2) {
				// attribs[i] is the name of the tag's attribute.
				// attribs[i+1] is its corresponding value.
				// (i.e. <span class="foo"> -> attribs[i] = "class" | attribs[i+1] =
				// "foo")
	
				var sAttribKey = tagName + "::" + attribs[i];
	
				if (this._ftv.ATTRIBS[sAttribKey]) {
					// keep the value of this class
					if (tagName === "embed") {
						var intPattern = /^[0-9]*$/;
						if (!attribs[i + 1].match(intPattern)) {
							// attribs[i + 1] = null;
							return null;
						}
					}
				} else {
					var sWarning = '<' + tagName + '> with attribute [' + attribs[i] + '="' + attribs[i + 1] + '"] is not allowed and cut';
					jQuery.sap.log.warning(sWarning, this);
	
					// to remove this attribute by the sanitizer the value has to be
					// set to null
					attribs[i + 1] = null;
				}
	
			}
			return attribs;
		};
	
		/**
		 * Sanitizes HTML tags and attributes according to a given policy.
		 *
		 * @private
		 * @param {string}
		 *            inputHtml The HTML to sanitize.
		 * @param {function(string,string[])} tagPolicy A function that decides which
		 *            tags to accept and sanitizes their attributes (see
		 *            makeHtmlSanitizer above for details).
		 * @return {string} The sanitized HTML.
		 */
		var fnPolicy = function(tagName, attribs) {
			if (this._ftv.ELEMENTS[tagName]) {
				var proxiedSanatizedAttribs = jQuery.proxy(fnSanitizeAttribs, this);
				return proxiedSanatizedAttribs(tagName, attribs);
			} else {
				var sWarning = '<' + tagName + '> is not allowed and cut (and its content)';
				jQuery.sap.log.warning(sWarning, this);
			}
		};
	
		FormattedTextView.prototype.setHtmlText = function(sText) {
			var sSanitizedText = "";
	
			// use a proxy for policy to access the control's private variables
			var fnProxiedPolicy = jQuery.proxy(fnPolicy, this);
	
			// using the sanitizer that is already set to the encoder
			sSanitizedText = jQuery.sap._sanitizeHTML(sText, {
				tagPolicy : fnProxiedPolicy
			});
	
			this.setProperty("htmlText", sSanitizedText);
		};
	
		var fnSetControls = function(aControls, oThis) {
			if (oThis.hasControls()) {
				oThis.removeAllAggregation("controls");
			}
	
			var bIsArray = jQuery.isArray(aControls);
			if (bIsArray && aControls.length > 0) {
				// iterate through the given array but suppress invalidate
				for ( var i = 0; i < aControls.length; i++) {
					oThis.addAggregation("controls", aControls[i], true);
				}
				oThis.invalidate();
			}
		};
	

		/**
		 * Sets text with placeholders and given array of controls
		 *
		 * @param {string} sHtmlText
		 *         Contains the corresponding HTML-text
		 * @param {sap.ui.commons.FormattedTextViewControl} oControls
		 *         Array of controls that should be used within given HTML-text
		 * @type void
		 * @public
		 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
		 */
		FormattedTextView.prototype.setContent = function(sHtmlText, aControls) {
			// set the text using existing checks and method
			this.setHtmlText(sHtmlText);
	
			// validate and set content of controls corresponding to given HTML-text
			// with place holders
			fnSetControls(aControls, this);
		};
	}());

	return FormattedTextView;

}, /* bExport= */ true);
