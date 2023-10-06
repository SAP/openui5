/*!
 * ${copyright}
 */

// Provides control sap.m.FormattedText.
sap.ui.define([
	'./library',
	'sap/ui/core/library',
	'sap/ui/core/Control',
	'./FormattedTextAnchorGenerator',
	'./FormattedTextRenderer',
	"sap/base/Log",
	"sap/base/security/URLListValidator",
	"sap/base/security/sanitizeHTML",
	"sap/ui/util/openWindow",
	'sap/ui/core/Core'
],
function(
	library,
	coreLibrary,
	Control,
	FormattedTextAnchorGenerator,
	FormattedTextRenderer,
	Log,
	URLListValidator,
	sanitizeHTML0,
	openWindow,
	Core
	) {
		"use strict";


		// shortcut for sap.m.LinkConversion
		var LinkConversion = library.LinkConversion,
			TextDirection = coreLibrary.TextDirection,
			TextAlign = coreLibrary.TextAlign;

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
					 *	<li><code>bdi</code></li>
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
					 *	<li><code>dd</code></li>
					 *	<li><code>ul</code></li>
					 *	<li><code>ol</code></li>
					 *	<li><code>li</code></li>
					 * </ul>
					 * <p><code>style, dir</code> and <code>target</code> attributes are allowed.
					 * <p>If <code>target</code> is not set, links open in a new window by default.
					 * <p>Only safe <code>href</code> attributes can be used. See {@link module:sap/base/security/URLListValidator URLListValidator}.
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
					height: {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : null},

					/**
					 * Defines the directionality of the text in the <code>FormattedText</code>, e.g. right-to-left(<code>RTL</code>)
					 * or left-to-right (<code>LTR</code>).
					 *
					 * <b>Note:</b> This functionality if set to the root element. Use the <code>bdi</code> element and
					 * the <code>dir</code> attribute to set explicit direction to an element.
					 *
					 * @since 1.86.0
					 */
					textDirection: { type: "sap.ui.core.TextDirection", group: "Appearance", defaultValue: TextDirection.Inherit },

					/**
					 * Determines the text alignment in the text elements in the <code>FormattedText</code>.
					 *
					 * <b>Note:</b> This functionality if set to the root element. To set explicit alignment to an element
					 * use the <code>style</code> attribute.
					 *
					 * @since 1.86.0
					 */
					textAlign : {type : "sap.ui.core.TextAlign", group : "Appearance", defaultValue : TextAlign.Begin}
				},
				aggregations: {

					/**
					* List of <code>sap.m.Link</code> controls that will be used to replace the placeholders in the text.
					* Placeholders are replaced according to their indexes. The placeholder with index %%0 will be replaced
					* by the first link in the aggregation, etc.
					*/
					controls: {type: "sap.m.Link", multiple: true, singularName: "control"}
				}
			},

			renderer: FormattedTextRenderer
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
				'a::target' : 1,
				'dir' : 1
			},
			// rules for the allowed tags
			ELEMENTS: {
				// Text Module Tags
				'a' : {cssClass: 'sapMLnk'},
				'abbr': 1,
				'bdi' : 1,
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
				'br': 1,
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
					if (!URLListValidator.validate(value)) {
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
					// by default, we use the URLListValidator to check the URLs
					if (URLListValidator.validate(sUrl)) {
						return sUrl;
					}
				}
			});
		}

		// open links href using safe API
		function openLink (oEvent) {
			if (oEvent.originalEvent.defaultPrevented) {
				return;
			}
			oEvent.preventDefault();
			var oLink = Core.byId(oEvent.currentTarget.id);
			if (oLink && oLink.isA('sap.m.Link') && (oLink.getAccessibleRole() === library.LinkAccessibleRole.Button || !oLink.getHref())) {
				return;
			}
			openWindow(oEvent.currentTarget.href, oEvent.currentTarget.target);
		}

		FormattedText.prototype.onAfterRendering = function () {
			this.$().find('a').on("click", openLink);
			var aLinks = this.getControls(),
				oTemplate;

			aLinks.forEach(function(oLink, iCurrentIndex) {
				oTemplate = this.getDomRef("$" + iCurrentIndex);
				if (oTemplate) {
					oTemplate.replaceWith(oLink.getDomRef());
				} else {
					oLink.getDomRef().style.display = "none";
				}
			}.bind(this));

			this._sanitizeCSSPosition(this.getDomRef());
		};

		FormattedText.prototype.onBeforeRendering = function () {
			this.$().find('a').off("click", openLink);
		};

		/**
		 * Adds CSS static position to provided DOM reference internal HTML nodes.
		 *
		 * @param {Element} oDomRef DOM reference that should be sanitized
		 * @private
		 */
		FormattedText.prototype._sanitizeCSSPosition = function(oDomRef) {

			if (!oDomRef) {
				return;
			}

			var oWalker = document.createTreeWalker(
					oDomRef,
					NodeFilter.SHOW_ELEMENT
				),
				oCurrentNode = oWalker.nextNode();

			while (oCurrentNode) {
				oCurrentNode.style.setProperty("position", "static", "important");
				oCurrentNode = oWalker.nextNode();
			}
		};

		/**
		 * Returns the HTML that should be displayed.
		 *
		 * IMPORTANT NOTE: When a HTML returned by this method is being placed in the page DOM, ALWAYS call _sanitizeCSSPosition
		 * after it is rendered on the page DOM in order to sanitize the CSS position!
		 *
		 * @return {string} HTML that should be rendered
		 * @private
		 */
		FormattedText.prototype._getDisplayHtml = function (){
			var sText = this.getHtmlText(),
				sAutoGenerateLinkTags = this.getConvertLinksToAnchorTags();

			if (sAutoGenerateLinkTags === LinkConversion.None) {
				return sText;
			}

			sText = FormattedTextAnchorGenerator.generateAnchors(sText, sAutoGenerateLinkTags, this.getConvertedLinksDefaultTarget());

			return sanitizeHTML.call(this, sText);
		};

		/**
		 * Defines the HTML text to be displayed.
		 * @param {string} sText HTML text as a string
		 * @return {this} this for chaining
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

		FormattedText.prototype.getFocusDomRef = function () {
			return this.getDomRef() && this.getDomRef().querySelector("a");
		};

		return FormattedText;
	});