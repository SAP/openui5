/*!
* ${copyright}
*/

// Provides control sap.m.ExpandableText
sap.ui.define([
	'./library',
	'sap/ui/core/Core',
	'sap/ui/core/Control',
	'sap/ui/core/library',
	'sap/ui/Device',
	'sap/m/Link',
	'sap/m/Text',
	'sap/m/Button',
	'sap/m/ResponsivePopover',
	'sap/m/HyphenationSupport',
	"./ExpandableTextRenderer"
],
function(library,
		 Core,
		 Control,
		 coreLibrary,
		 Device,
		 Link,
		 Text,
		 Button,
		 ResponsivePopover,
		 HyphenationSupport,
		 ExpandableTextRenderer) {
	"use strict";

	var MAX_CHARACTERS = 100;

	var oRb = Core.getLibraryResourceBundle("sap.m");

	var TEXT_SHOW_MORE = oRb.getText("EXPANDABLE_TEXT_SHOW_MORE");
	var TEXT_SHOW_LESS = oRb.getText("EXPANDABLE_TEXT_SHOW_LESS");

	var CLOSE_TEXT = oRb.getText("MSGBOX_CLOSE");

	// shortcut for sap.ui.core.TextAlign
	var TextAlign = coreLibrary.TextAlign;

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.m.WrappingType
	var WrappingType = library.WrappingType;

	// shortcut for sap.m.ExpandableOverflowTextMode
	var ExpandableTextOverflowMode = library.ExpandableTextOverflowMode;

	function reduceWhitespace(sText) {
		return sText.replace(/ {2,}/g, ' ').replace(/\t{2,}/g, ' ');
	}

	/**
	 * Constructor for a new ExpandableText.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>ExpandableText</code> control can be used to display long texts
	 * inside a table, list or form.
	 *
	 * <h3>Overview</h3>
	 * Only the first 100 characters from the text field are shown initially and a "More" link which allows
	 * the full text to be displayed. The <code>overflowMode</code> property determines
	 * if the full text will be displayed expanded in place (default) or in a popover.
	 * If the text is expanded a "Less" link is displayed, which allows collapsing the text field.
	 *
	 * <h3>Usage</h3>
	 *
	 * <i>When to use</i>
	 * <ul>
	 * <li>You specifically have to deal with long texts/descriptions.</li>
	 * </ul>
	 *
	 * <i>When not to use</i>
	 * <ul>
	 * <li>Do not use long texts and descriptions
	 * if you can provide short and meaningful alternatives.</li>
	 * <li>The content is critical for the user.
	 * In this case use short descriptions that can fit in.</li>
	 * </ul>
	 *
	 * @extends sap.ui.core.Control
	 * @implements sap.ui.core.IFormContent, sap.m.IHyphenation
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.87
	 * @alias sap.m.ExpandableText
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ExpandableText = Control.extend("sap.m.ExpandableText", /** @lends sap.m.ExpandableText.prototype */ {
		metadata: {

			interfaces: [
				"sap.ui.core.IFormContent",
				"sap.m.IHyphenation"
			],
			library: "sap.m",
			properties: {

				/**
				 * Determines the text to be displayed.
				 */
				text: { type: "string", defaultValue: '', bindable: "bindable" },

				/**
				 * Available options for the text direction are left-to-right (LTR) and right-to-left (RTL)
				 * By default the control inherits the text direction from its parent control.
				 */
				textDirection: { type: "sap.ui.core.TextDirection", group: "Appearance", defaultValue: TextDirection.Inherit },

				/**
				 * Defines the type of text wrapping to be used (hyphenated or normal).
				 */
				wrappingType : {type: "sap.m.WrappingType", group : "Appearance", defaultValue : WrappingType.Normal},

				/**
				 * Sets the horizontal alignment of the text.
				 */
				textAlign: { type: "sap.ui.core.TextAlign", group: "Appearance", defaultValue: TextAlign.Begin },

				/**
				 * Specifies how whitespace and tabs inside the control are handled. If true, whitespace will be preserved by the browser.
				 */
				renderWhitespace: { type: "boolean", group: "Appearance", defaultValue: false },

				/**
				 * Determines how the full text will be displayed - InPlace or Popover
				 */
				overflowMode: { type: "sap.m.ExpandableTextOverflowMode", group: "Appearance", defaultValue: ExpandableTextOverflowMode.InPlace },

				/**
				 * Determines if the text is expanded.
				 * @private
				 */
				expanded: { type: "boolean", group: "Appearance", defaultValue: false, visibility: "hidden" }
			},
			aggregations: {
				/**
				 * The "More" link.
				 * @private
				 */
				_showMoreLink: {type: 'sap.m.Link', multiple: false, visibility: "hidden"}
			},

			designtime: "sap/m/designtime/ExpandableText.designtime"
		}
	});

	/**
	 * Gets the text.
	 *
	 * @public
	 * @param {boolean} bNormalize Indication for normalized text.
	 * @returns {string} Text value.
	 */
	ExpandableText.prototype.getText = function (bNormalize) {
		// returns the text value and normalize line-ending character for rendering
		var sText = this.getProperty("text");

		// handle line ending characters for renderer
		if (bNormalize) {
			return sText.replace(/\r\n|\n\r|\r/g, "\n");
		}

		return sText;
	};

	/**
	 * Returns the text node container's DOM reference.
	 * This can be different from <code>getDomRef</code> when inner wrapper is needed.
	 *
	 * @protected
	 * @returns {HTMLElement|null} DOM reference of the text.
	 */
	ExpandableText.prototype.getTextDomRef = function () {
		if (!this.getVisible()) {
			return null;
		}

		return this.getDomRef("string");
	};

	/**
	 * Returns if the text is expandable
	 *
	 * @returns {boolean} if the text is expandable
	 * @private
	 */
	ExpandableText.prototype._isExpandable = function () {

		var sText = this.getText();

		if (!this.getRenderWhitespace()) {
			sText = reduceWhitespace(sText);
		}

		return sText.length > MAX_CHARACTERS + TEXT_SHOW_MORE.length;
	};

	/**
	 * Returns the displayed text.
	 *
	 * @returns {string} the displayed text
	 * @private
	 */
	ExpandableText.prototype._getDisplayedText = function () {

		var sText = this.getText(true);

		if (this.getProperty("expanded") || !this._isExpandable()) {
			return sText;
		}

		if (!this.getRenderWhitespace()) {
			sText = reduceWhitespace(sText);
		}

		return sText.substring(0, MAX_CHARACTERS);
	};

	ExpandableText.prototype._getShowMoreLink = function() {
		var showMoreLink = this.getAggregation('_showMoreLink');

		if (!showMoreLink) {
			showMoreLink = new Link(this.getId() + '-showMoreLink', {
				text: this.getProperty("expanded") ? TEXT_SHOW_LESS : TEXT_SHOW_MORE,
				press: function (oEvent) {
					var oText,
						bExpanded,
						oPopover;

					if (this.getOverflowMode() === ExpandableTextOverflowMode.InPlace) {
						bExpanded = !this.getProperty("expanded");
						this._getShowMoreLink().setText(bExpanded ? TEXT_SHOW_LESS : TEXT_SHOW_MORE);
						this.setProperty("expanded", bExpanded);
					} else {
						oText = new Text({
							text: this.getText(),
							textDirection: this.getTextDirection(),
							wrappingType: this.getWrappingType(),
							textAlign: this.getTextAlign(),
							renderWhitespace: this.getRenderWhitespace()
						}).addStyleClass("sapUiSmallMargin").addStyleClass("sapMExTextPopover");

						oPopover = this._oPopover;

						if (!oPopover) {
							oPopover = this._oPopover = new ResponsivePopover({
								showHeader: false
							});

							if (Device.system.phone) {
								oPopover.setEndButton(new Button({
									text: CLOSE_TEXT,
									press: function () {
										oPopover.close();
									}
								}));
							}

							this.addDependent(oPopover);
						}

						oPopover.removeAllAriaLabelledBy();
						oPopover.destroyContent();

						oPopover.addAriaLabelledBy(oText);
						oPopover.addContent(oText);

						oPopover.openBy(oEvent.getSource());
					}
				}.bind(this)
			});

			this.setAggregation("_showMoreLink", showMoreLink, true);
		}

		return showMoreLink;
	};

	/**
	 * Called when the control is destroyed.
	 */
	ExpandableText.prototype.exit = function () {
		if (this._oPopover) {
			this._oPopover.destroy();
			this._oPopover = null;
		}
	};

	/**
	 * Gets the accessibility information for the text.
	 *
	 * @protected
	 * @returns {object} Accessibility information for the text.
	 * @see sap.ui.core.Control#getAccessibilityInfo
	 */
	ExpandableText.prototype.getAccessibilityInfo = function () {
		return {
			description: this.getText()
		};
	};

	/**
	 * Gets a map of texts which should be hyphenated.
	 *
	 * @private
	 * @returns {Object<string,string>} The texts to be hyphenated.
	 */
	ExpandableText.prototype.getTextsToBeHyphenated = function () {
		return {
			"main": this._getDisplayedText(true)
		};
	};

	/**
	 * Gets the DOM refs where the hyphenated texts should be placed.
	 *
	 * @private
	 * @returns {map|null} The elements in which the hyphenated texts should be placed
	 */
	ExpandableText.prototype.getDomRefsForHyphenatedTexts = function () {
		return {
			"main": this.getTextDomRef()
		};
	};

	// Add hyphenation to ExpandableText functionality
	HyphenationSupport.mixInto(ExpandableText.prototype);

	return ExpandableText;
});