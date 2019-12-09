/*!
 * ${copyright}
 */

// Provides control sap.m.FormattedText.
sap.ui.define([
	'./library',
	'sap/ui/core/Control',
	'./FormattedTextAnchorGenerator',
	'./FormattedTextRenderer',
	"sap/base/Log",
	"sap/base/security/URLWhitelist",
	"sap/base/security/sanitizeHTML"
],
function(
	library,
	Control,
	FormattedTextAnchorGenerator,
	FormattedTextRenderer,
	Log,
	URLWhitelist,
	sanitizeHTML0
	) {
		"use strict";


		// shortcut for sap.m.LinkConversion
		var LinkConversion = library.LinkConversion;

		/**
		 * Constructor for a new FormattedText.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * The FormattedText control allows the usage of a limited set of tags for inline display of formatted text in HTML format.
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
					 * Text in HTML format.
					 * The following tags are supported:
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
					 *	<li><code>u</code></li>
					 *	<li><code>dl</code></li>
					 *	<li><code>dt</code></li>
					 *	<li><code>dl</code></li>
					 *	<li><code>ul</code></li>
					 *	<li><code>ol</code></li>
					 *	<li><code>li</code></li>
					 * </ul>
					 * <p><code>class, style,</code> and <code>target</code> attributes are allowed.
					 * If <code>target</code> is not set, links open in a new window by default.
					 * <p>Only safe <code>href</code> attributes can be used. See {@link module:sap/base/security/URLWhitelist URLWhitelist}.
					 *
					 * <b>Note:</b> Keep in mind that not supported HTML tags and
					 * the content nested inside them are both not rendered by the control.
					 */
					htmlText: {type: "string", group: "Misc", defaultValue: ""},

					/**
					 * Optional width of the control in CSS units.
					 */
					width: {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : null},

					/**
					 * Determines whether strings that appear to be links will be converted to HTML anchor tags,
					 * and what are the criteria for recognizing them.
					 * @since 1.45.5
					 */
					convertLinksToAnchorTags: {type: "sap.m.LinkConversion", group: "Behavior", defaultValue: LinkConversion.None},

					/**
					 * Determines the <code>target</code> attribute of the generated HTML anchor tags.
					 *
					 * <b>Note:</b> Applicable only if <code>ConvertLinksToAnchorTags</code> property is used with a value other than <code>sap.m.LinkConversion.None</code>.
					 * Options are the standard values for the <code>target</code> attribute of the HTML anchor tag:
					 * <code>_self</code>, <code>_top</code>, <code>_blank</code>, <code>_parent</code>, <code>_search</code>.
					 * @since 1.45.5
					 */
					convertedLinksDefaultTarget: {type: "string", group: "Behavior", defaultValue: "_blank"},

					/**
					 *  Optional height of the control in CSS units.
					 */
					height: {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : null}
				},
				aggregations: {

					/**
					* List of <code>sap.m.Link</code> controls that will be used to replace the placeholders in the text.
					* Placeholders are replaced according to their indexes. The placeholder with index %%0 will be replaced
					* by the first link in the aggregation, etc.
					*/
					controls: {type: "sap.m.Link", multiple: true, singularName: "control"}
				}
			}
		});

		/*
		 * These are the rules for the FormattedText
		 */
		var _defaultRenderingRules = {
			// rules for the allowed attributes
			ATTRIBS: {
				'style' : 1,
				'class' : 1,
				'a::href' : 1,
				'a::target' : 1
			},
			// rules for the allowed tags
			ELEMENTS: {
				// Text Module Tags
				'a' : {cssClass: 'sapMLnk'},
				'abbr': 1,
				'blockquote': 1,
				'br': 1,
				'cite': 1,
				'code': 1,
				'em': 1,
				'h1': {cssClass: 'sapMTitle sapMTitleStyleH1'},
				'h2': {cssClass: 'sapMTitle sapMTitleStyleH2'},
				'h3': {cssClass: 'sapMTitle sapMTitleStyleH3'},
				'h4': {cssClass: 'sapMTitle sapMTitleStyleH4'},
				'h5': {cssClass: 'sapMTitle sapMTitleStyleH5'},
				'h6': {cssClass: 'sapMTitle sapMTitleStyleH6'},
				'p': 1,
				'pre': 1,
				'strong': 1,
				'span': 1,
				'u' : 1,

				// List Module Tags
				'dl': 1,
				'dt': 1,
				'dd': 1,
				'ol': 1,
				'ul': 1,
				'li': 1
			}
		},
		_limitedRenderingRules = {
			ATTRIBS: {
				'a::href' : 1,
				'a::target' : 1
			},
			ELEMENTS: {
				'a' : {cssClass: 'sapMLnk'},
				'em': 1,
				'strong': 1,
				'u': 1
			}
		};

		/**
		 * Holds the internal list of allowed and evaluated HTML elements and attributes
		 * @private
		 */
		FormattedText.prototype._renderingRules = _defaultRenderingRules;

		/**
		 * Initialization hook for the FormattedText, which creates a list of rules with allowed tags and attributes.
		 */
		FormattedText.prototype.init = function () {
		};

		/**
		 * Sanitizes attributes on an HTML tag.
		 *
		 * @param {string} tagName An HTML tag name in lower case
		 * @param {array} attribs An array of alternating names and values
		 * @return {array} The sanitized attributes as a list of alternating names and values. Value <code>null</code> removes the attribute.
		 * @private
		 */
		function fnSanitizeAttribs (tagName, attribs) {

			var sWarning;
			var attr,
				value,
				addTarget = tagName === "a";
			// add UI5 specific classes when appropriate
			var cssClass = this._renderingRules.ELEMENTS[tagName].cssClass || "";

			for (var i = 0; i < attribs.length; i += 2) {
				// attribs[i] is the name of the tag's attribute.
				// attribs[i+1] is its corresponding value.
				// (i.e. <span class="foo"> -> attribs[i] = "class" | attribs[i+1] = "foo")
				attr = attribs[i];
				value = attribs[i + 1];

				if (!this._renderingRules.ATTRIBS[attr] && !this._renderingRules.ATTRIBS[tagName + "::" + attr]) {
					sWarning = 'FormattedText: <' + tagName + '> with attribute [' + attr + '="' + value + '"] is not allowed';
					Log.warning(sWarning, this);
					// to remove the attribute by the sanitizer, set the value to null
					attribs[i + 1] = null;
					continue;
				}

				// sanitize hrefs
				if (attr == "href") { // a::href
					if (!URLWhitelist.validate(value)) {
						Log.warning("FormattedText: incorrect href attribute:" + value, this);
						attribs[i + 1] = "#";
						addTarget = false;
					}
				}
				if (attr == "target") { // a::target already exists
					addTarget = false;
				}

				// add UI5 classes to the user defined
				if (cssClass && attr.toLowerCase() == "class") {
					attribs[i + 1] = cssClass + " " + value;
					cssClass = "";
				}
			}

			if (addTarget) {
				attribs.push("target");
				attribs.push("_blank");
			}

			// add UI5 classes, if not done before
			if (cssClass) {
				attribs.push("class");
				attribs.push(cssClass);
			}

			return attribs;
		}

		function fnPolicy (tagName, attribs) {
			if (this._renderingRules.ELEMENTS[tagName]) {
				return fnSanitizeAttribs.call(this, tagName, attribs);
			} else {
				var sWarning = '<' + tagName + '> is not allowed';
				Log.warning(sWarning, this);
			}
		}

		/**
		 * Sanitizes HTML tags and attributes according to a given policy.
		 *
		 * @param {string} sText The HTML to sanitize
		 * @return {string} The sanitized HTML
		 * @private
		 */
		function sanitizeHTML(sText) {
			return sanitizeHTML0(sText, {
				tagPolicy: fnPolicy.bind(this),
				uriRewriter: function (sUrl) {
					// by default we use the URL whitelist to check the URLs
					if (URLWhitelist.validate(sUrl)) {
						return sUrl;
					}
				}
			});
		}

		// prohibit a new window from accessing window.opener.location
		function openExternalLink (oEvent) {
			var newWindow = window.open();
			newWindow.opener = null;
			newWindow.location = oEvent.currentTarget.href;
			oEvent.preventDefault();
		}

		FormattedText.prototype.onAfterRendering = function () {
			this.$().find('a[target="_blank"]').on("click", openExternalLink);
		};

		FormattedText.prototype._getDisplayHtml = function (){
			var sText = this.getHtmlText(),
				sAutoGenerateLinkTags = this.getConvertLinksToAnchorTags();

			if (sAutoGenerateLinkTags === library.LinkConversion.None) {
				return sText;
			}

			sText = FormattedTextAnchorGenerator.generateAnchors(sText, sAutoGenerateLinkTags, this.getConvertedLinksDefaultTarget());

			return sanitizeHTML.call(this, sText);
		};

		/**
		 * Defines the HTML text to be displayed.
		 * @param {string} sText HTML text as a string
		 * @return {sap.m.FormattedText} this for chaining
		 * @public
		 */
		FormattedText.prototype.setHtmlText = function (sText) {
			return this.setProperty("htmlText", sanitizeHTML.call(this, sText));
		};

		/**
		 * Sets should a limited list of rendering rules be used instead of the default one. This limited list
		 * will evaluate only a small subset of the default HTML elements and attributes.
		 * @param {boolean} bLimit Should the control use the limited list
		 * @private
		 * @ui5-restricted sap.m.MessageStrip
		 */
		FormattedText.prototype._setUseLimitedRenderingRules = function (bLimit) {
			this._renderingRules = bLimit ? _limitedRenderingRules : _defaultRenderingRules;
		};


		return FormattedText;
	});