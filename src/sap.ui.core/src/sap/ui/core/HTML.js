/*!
 * ${copyright}
 */

// Provides control sap.ui.core.HTML.
sap.ui.define([
	'sap/ui/thirdparty/jquery',
	"sap/base/Log",
	'./Control',
	'./RenderManager',
	"./HTMLRenderer",
	"sap/base/security/sanitizeHTML"
],
	function(jQuery, Log, Control, RenderManager, HTMLRenderer, sanitizeHTML) {
	"use strict";

	// local shortcut
	var RenderPrefixes = RenderManager.RenderPrefixes;

	/**
	 * Constructor for a new HTML.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Embeds standard HTML in an SAPUI5 control tree.
	 *
	 * Security Hint: By default, the HTML content (property 'content') is not sanitized and therefore
	 * open to XSS attacks. Applications that want to show user defined input in an HTML control, should
	 * either sanitize the content on their own or activate automatic sanitizing through the
	 * {@link #setSanitizeContent sanitizeContent} property.
	 *
	 * Although this control inherits the <code>tooltip</code> aggregation/property and the
	 * <code>hasStyleClass</code>, <code>addStyleClass</code>, <code>removeStyleClass</code> and
	 * <code>toggleStyleClass</code> methods from its base class, it doesn't support them.
	 * Instead, the defined HTML content can contain a tooltip (title attribute) or custom CSS classes.
	 *
	 * For further hints about usage restrictions for this control, see also the documentation of the
	 * <code>content</code> property.
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @public
	 * @alias sap.ui.core.HTML
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var HTML = Control.extend("sap.ui.core.HTML", /** @lends sap.ui.core.HTML.prototype */ { metadata : {

		library : "sap.ui.core",
		properties : {

			/**
			 * HTML content to be displayed, defined as a string.
			 *
			 * The content is converted to DOM nodes with a call to <code>new jQuery(content)</code>, so any
			 * restrictions for the jQuery constructor apply to the content of the HTML control as well.
			 *
			 * Some of these restrictions (there might be others!) are:
			 * <ul>
			 * <li>the content must be enclosed in tags, pure text is not supported. </li>
			 * <li>if the content contains script tags, they will be executed but they will not appear in the
			 *     resulting DOM tree. When the contained code tries to find the corresponding script tag,
			 *     it will fail.</li>
			 * </ul>
			 *
			 * Please consider to consult the jQuery documentation as well.
			 *
			 * The HTML control currently doesn't prevent the usage of multiple root nodes in its DOM content
			 * (e.g. <code>setContent("&lt;div/>&lt;div/>")</code>), but this is not a guaranteed feature.
			 * The accepted content might be restricted to single root nodes in future versions.
			 * To notify applications about this fact, a warning is written in the log when multiple root nodes are used.
			 *
			 * When changing the content dynamically, ensure that the ID of the root node remains the same as the HTML
			 * control's ID. Otherwise it cannot be guaranteed that certain lifecycle events take place.
			 *
			 * @SecSink {,XSS} The content of the 'content' property is rendered 1:1 to allow the full
			 * flexibility of HTML in UI5 applications. Applications therefore must ensure, that they don't
			 * set malicious content (e.g. derived from user input). UI5 does not provide an HTML validation
			 * function. jQuery.sap.encodeHTML will encode any HTML relevant character, but this is in
			 * nearly all cases not what applications want here.
			 */
			content : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * Whether existing DOM content is preferred over the given content string.
			 *
			 * There are two scenarios where this flag is relevant (when set to true):
			 * <ul>
			 * <li>for the initial rendering: when an HTML control is added to a UIArea for the first time
			 *     and if the root node of that UIArea contained DOM content with the same id as the HTML
			 *     control, then that content will be used for rendering instead of any specified string
			 *     content</li>
			 * <li>any follow-up rendering: when an HTML control is rendered for the second or any later
			 *     time and the preferDOM flag is set, then the DOM from the first rendering is preserved
			 *     and not replaced by the string content</li>
			 * </ul>
			 *
			 * As preserving the existing DOM is the most common use case of the HTML control, the default value is true.
			 */
			preferDOM : {type : "boolean", group : "Misc", defaultValue : true},

			/**
			 * Whether to run the HTML sanitizer once the content (HTML markup) is applied or not.
			 *
			 * To configure the set of allowed URLs, you can use the {@link jQuery.sap.addUrlWhitelist whitelist API}.
			 */
			sanitizeContent : {type : "boolean", group : "Misc", defaultValue : false},

			/**
			 * Specifies whether the control is visible. Invisible controls are not rendered.
			 */
			visible : {type : "boolean", group : "Appearance", defaultValue : true}
		},
		events : {

			/**
			 * Fired after the HTML control has been rendered. Allows to manipulate the resulting DOM.
			 *
			 * When the control doesn't have string content and no preserved DOM existed for this control,
			 * then this event will fire, but there won't be a DOM node for this control.
			 */
			afterRendering : {
				parameters : {

					/**
					 * Whether the current DOM of the control has been preserved (true) or not (e.g.
					 * rendered from content property or it is an empty HTML control).
					 */
					isPreservedDOM : {type : "boolean"}
				}
			}
		}
	}});

	/**
	 * @param {string} [sSuffix=''] Suffix of the Element to be retrieved or empty
	 * @return {Element} The element's DOM reference or null
	 * @public
	 */
	HTML.prototype.getDomRef = function(sSuffix) {
		var sId = sSuffix ? this.getId() + "-" + sSuffix : this.getId();
		return ((RenderPrefixes.Dummy + sId ? window.document.getElementById(RenderPrefixes.Dummy + sId) : null)) || ((sId ? window.document.getElementById(sId) : null));
	};

	HTML.prototype.setContent = function(sContent) {

		function parseHTML(s) {
			if ( jQuery.parseHTML ) {
				var a = jQuery.parseHTML(s);
				if ( a ) {
					var start = 0, end = a.length;
					while ( start < end && a[start].nodeType != 1 ) {
						start++;
					}
					while ( start < end && a[end - 1].nodeType != 1 ) {
						end--;
					}
					if ( start > 0 || end < a.length ) {
						a = a.slice(start, end);
					}
					return jQuery(a);
				}
			}
			return jQuery(s);
		}

		if ( this.getSanitizeContent() ) {
			Log.trace("sanitizing HTML content for " + this);
			sContent = sanitizeHTML(sContent);
		}

		this.setProperty("content", sContent, true);
		if ( /* sContent && */ this.getDomRef() ) {
			var $newContent = parseHTML(this.getContent()); // TODO what if content is not HTML (e.g. #something)?
			jQuery(this.getDomRef()).replaceWith($newContent);
			this._postprocessNewContent($newContent);
		} else {
			this.invalidate();
		}
		return this;
	};

	HTML.prototype.setSanitizeContent = function(bSanitizeContent) {
		this.setProperty("sanitizeContent", bSanitizeContent, true);
		// if sanitizeContent has been enabled, set the content again to enable sanitizing on current content
		if (bSanitizeContent) {
			this.setContent(this.getContent());
		}
		return this;
	};

	HTML.prototype.onBeforeRendering = function() {
		if (!this.getPreferDOM()) {
			return;
		}

		var oDomRef = this.getDomRef();
		if (oDomRef && !RenderManager.isPreservedContent(oDomRef)) {
			// before the re-rendering move all "to-be-preserved" nodes to the preserved area
			for (var sId = oDomRef.id, oNextDomRef; oDomRef && oDomRef.getAttribute("data-sap-ui-preserve") == sId; oDomRef = oNextDomRef) {
				oNextDomRef = oDomRef.nextElementSibling;
				RenderManager.preserveContent(oDomRef, /* bPreserveRoot */ true, /* bPreserveNodesWithId */ false);
			}
		}
	};


	/**
	 * If the HTML doesn't contain own content, it tries to reproduce existing content
	 */
	HTML.prototype.onAfterRendering = function() {
		if (!this.getVisible()) {
			// Just leave the placeholder there
			return;
		}

		var $placeholder = jQuery((RenderPrefixes.Dummy + this.getId() ? window.document.getElementById(RenderPrefixes.Dummy + this.getId()) : null));
		var $oldContent = RenderManager.findPreservedContent(this.getId());
		var $newContent;
		var isPreservedDOM = false;
		if ( /*this.getContent() && */ (!this.getPreferDOM() || $oldContent.size() == 0) ) {
			// remove old, preserved content
			$oldContent.remove();
			// replace placeholder with content string
			$newContent = new jQuery(this.getContent()); // TODO what if content is not HTML (e.g. #something)?
			$placeholder.replaceWith($newContent);
		} else if ( $oldContent.size() > 0 ) {
			// replace dummy with old content
			$placeholder.replaceWith($oldContent);
			$newContent = $oldContent;
			isPreservedDOM = true;
		} else {
			$placeholder.remove();
		}

		this._postprocessNewContent($newContent);

		this.fireAfterRendering({isPreservedDOM : isPreservedDOM});

	};

	HTML.prototype._postprocessNewContent = function($newContent) {
		if ( $newContent && $newContent.size() > 0 ) {
			if ( $newContent.length > 1 ) {
				Log.warning("[Unsupported Feature]: " + this + " has rendered " + $newContent.length + " root nodes!");
			} else {
				var sContentId = $newContent.attr("id");
				if (sContentId && sContentId != this.getId()) {
					Log.warning("[Unsupported Feature]: Id of HTML Control '" + this.getId() + "' does not match with content id '" + sContentId + "'!");
				}
			}

			if (this.getPreferDOM()) {
				// set a marker that identifies all root nodes in $newContent as 'to-be-preserved'
				RenderManager.markPreservableContent($newContent, this.getId());
			}
			// and if no node has the control id, search the first without an id and set it
			if ( $newContent.find("#" + this.getId().replace(/(:|\.)/g,'\\$1')).length === 0 ) {
				$newContent.filter(":not([id])").first().attr("id", this.getId());
			}
		} else {
			Log.debug("" + this + " is empty after rendering, setting bOutput to false");
			this.bOutput = false; // clean up internal rendering bookkeeping
		}
	};

	/**
	 * Sets some new DOM content for this HTML control. The content will replace the existing content
	 * after the next rendering. Properties are not modified, but preferDOM should be set to true.
	 *
	 * @param {Element} oDom the new DOM content
	 * @return {sap.ui.core.HTML} <code>this</code> to facilitate method chaining
	 * @public
	 */
	HTML.prototype.setDOMContent = function(oDom) {
		var $newContent = jQuery(oDom);
		if ( this.getDomRef() ) {
			jQuery(this.getDomRef()).replaceWith($newContent);
			this._postprocessNewContent($newContent);
		} else {
			$newContent.appendTo(RenderManager.getPreserveAreaRef());
			if ( this.getUIArea() ) {
				this.getUIArea().invalidate();
			} // TODO fix issue with Control.rerender()
			this._postprocessNewContent($newContent); // CHECK is it okay to set bOutput to false for empty content?
		}

		return this;
	};

	HTML.prototype.setTooltip = function() {
		Log.warning("The sap.ui.core.HTML control doesn't support tooltips. Add the tooltip to the HTML content instead.");
		return Control.prototype.setTooltip.apply(this, arguments);
	};

	"hasStyleClass addStyleClass removeStyleClass toggleStyleClass".split(" ").forEach(function(method) {
		HTML.prototype[method] = function() {
			Log.warning("The sap.ui.core.HTML control doesn't support custom style classes. Manage custom CSS classes in the HTML content instead.");
			return Control.prototype[method].apply(this, arguments);
		};
	});

	return HTML;

});