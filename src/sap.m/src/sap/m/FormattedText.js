/*!
 * ${copyright}
 */

// Provides control sap.m.FormattedText.
sap.ui.define(['jquery.sap.global', './library', 'sap/ui/core/Control'],
	function (jQuery, library, Control) {
		"use strict";


		/**
		 * Constructor for a new FormattedText.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * The FormattedText control allows the usage of a limited set of tags for in-line display of formatted text in HTML format.
		 * @extends sap.ui.core.Control
		 * @version ${version}
		 *
		 * @constructor
		 * @public
		 * @since 1.38.0
		 * @alias sap.m.FormattedText
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var FormattedText = Control.extend("sap.m.FormattedText", /** @lends sap.m.FormattedText.prototype */ {
			metadata: {

				library: "sap.m",
				properties: {
					/**
					 * The ARIA role for the control.
					 */
					accessibleRole: {
						type: "sap.ui.core.AccessibleRole",
						group: "Accessibility",
						defaultValue: sap.ui.core.AccessibleRole.Document
					},

					/**
					 * Text in HTML format.
					 * The following tags are allowed:
					 * <ul>
					 *	<li><code>a</code></li>
					 *	<li><code>abbr</code></li>
					 *	<li><code>blockquote</code></li>
					 *	<li><code>br</code></li>
					 *	<li><code>cite</code></li>
					 *	<li><code>code</code></li>
					 *	<li><code>em</code></li>
					 *	<li><code>h1</code></li>
					 *	<li><code>h2</code></li>
					 *	<li><code>h3</code></li>
					 *	<li><code>h4</code></li>
					 *	<li><code>h5</code></li>
					 *	<li><code>h6</code></li>
					 *	<li><code>p</code></li>
					 *	<li><code>pre</code></li>
					 *	<li><code>strong</code></li>
					 *	<li><code>span</code></li>
					 *	<li><code>dl</code></li>
					 *	<li><code>dt</code></li>
					 *	<li><code>dl</code></li>
					 *	<li><code>ul</code></li>
					 *	<li><code>ol</code></li>
					 *	<li><code>li</code></li>
					 * </ul>
					 * <code>class, style,</code> and <code>target</code> attributes are allowed.
					 * Only safe <code>href</code> attributes can be used. See {@link jQuery.sap.validateUrl}
					 */
					htmlText: {type: "string", group: "Misc", defaultValue: ""}
				}
			}
		});

		/*
		 * these are the rules for the FormattedText
		 */
		var _renderingRules = {};

		// rules for the allowed attributes
		_renderingRules.ATTRIBS = {
			'style' : 1,
			'class' : 1,
			'a::href' : 1
		};

		// rules for the allowed tags
		_renderingRules.ELEMENTS = {
			// Text Module Tags
			'a' : 1,
			'abbr': 1,
			'blockquote': 1,
			'br': 1,
			'cite': 1,
			'code': 1,
			'em': 1,
			'h1': 1,
			'h2': 1,
			'h3': 1,
			'h4': 1,
			'h5': 1,
			'h6': 1,
			'p': 1,
			'pre': 1,
			'strong': 1,
			'span': 1,

			// List Module Tags
			'dl': 1,
			'dt': 1,
			'dd': 1,
			'ol': 1,
			'ul': 1,
			'li': 1
		};

		/**
		 * Initialization hook for the FormattedText, which creates a list of rules with allowed tags and attributes.
		 */
		FormattedText.prototype.init = function () {
		};

		/**
		 * Sanitizes attributes on an HTML tag.
		 *
		 * @param {string} tagName An HTML tag name in lowercase
		 * @param {array} attribs An array of alternating names and values
		 * @return {array} The sanitized attributes as a list of alternating names and values. Null value means to omit the attribute
		 * @private
		 */
		function fnSanitizeAttribs (tagName, attribs) {

			var sWarning;
			var attr, value, openNewWindow;

			for (var i = 0; i < attribs.length; i += 2) {
				// attribs[i] is the name of the tag's attribute.
				// attribs[i+1] is its corresponding value.
				// (i.e. <span class="foo"> -> attribs[i] = "class" | attribs[i+1] =
				// "foo")
				attr = attribs[i];
				value = attribs[i + 1];
				var sAttribKey = tagName + "::" + attr;

				if (!_renderingRules.ATTRIBS[sAttribKey] && !_renderingRules.ATTRIBS[attr]) {
					sWarning = 'FormattedText: <' + tagName + '> with attribute [' + attr + '="' + value + '"] is not allowed';
					jQuery.sap.log.warning(sWarning, this);
					// to remove this attribute by the sanitizer the value has to be
					// set to null
					attribs[i + 1] = null;
				} else if (attr.toLowerCase() == "href") { // a::href
					if (!jQuery.sap.validateUrl(value)) {
						jQuery.sap.log.warning("FormattedText: incorrect href attribute:" + value, this);
						attribs[i + 1] = "#";
					} else {
						openNewWindow = true;
					}
				}
			}
			if (openNewWindow) {
				attribs.push("target");
				attribs.push("_blank");
			}
			return attribs;
		}

		/**
		 * Sanitizes HTML tags and attributes according to a given policy.
		 *
		 * @param {string} inputHtml The HTML to sanitize
		 * @param {function(string,string[])} tagPolicy Determines which
		 *            tags to accept and sanitizes their attributes (see
		 *            makeHtmlSanitizer above for details)
		 * @return {string} The sanitized HTML
		 * @private
		 */
		function fnPolicy (tagName, attribs) {
			if (_renderingRules.ELEMENTS[tagName]) {
				return fnSanitizeAttribs(tagName, attribs);
			} else {
				var sWarning = '<' + tagName + '> is not allowed';
				jQuery.sap.log.warning(sWarning, this);
			}
		}

		/**
		 * Sets the HTML text to be displayed.
		 * @param {string} sText HTML text as a string
		 * @public
		 */
		FormattedText.prototype.setHtmlText = function (sText) {
			var sSanitizedText = "";

			function uriRewriter (sUrl) {
				// by default we use the URL whitelist to check the URL's
				if (jQuery.sap.validateUrl(sUrl)) {
					return sUrl;
				}
			}

			// using the sanitizer that is already set to the encoder
			sSanitizedText = jQuery.sap._sanitizeHTML(sText, {
				tagPolicy: fnPolicy,
				uriRewriter: uriRewriter
			});

			this.setProperty("htmlText", sSanitizedText);
		};

		return FormattedText;

	}, /* bExport= */ true);
