/*!
* ${copyright}
*/

// Provides control sap.m.ExpandableText
sap.ui.define([
	'./library',
	'sap/ui/core/Control',
	"sap/ui/core/Lib",
	'sap/ui/core/library',
	'sap/ui/core/InvisibleText',
	'sap/ui/Device',
	'sap/ui/base/ManagedObject',
	'sap/m/Link',
	'sap/m/Text',
	'sap/m/Button',
	'sap/m/ResponsivePopover',
	'sap/m/HyphenationSupport',
	"./ExpandableTextRenderer"
],
function(library,
		 Control,
		 Library,
		 coreLibrary,
		 InvisibleText,
		 Device,
		 ManagedObject,
		 Link,
		 Text,
		 Button,
		 ResponsivePopover,
		 HyphenationSupport,
		 ExpandableTextRenderer) {
	"use strict";

	var oRb = Library.getResourceBundleFor("sap.m");

	var TEXT_SHOW_MORE = oRb.getText("EXPANDABLE_TEXT_SHOW_MORE");
	var TEXT_SHOW_LESS = oRb.getText("EXPANDABLE_TEXT_SHOW_LESS");

	var CLOSE_TEXT = oRb.getText("MSGBOX_CLOSE");

	// shortcut for sap.ui.core.TextAlign
	var TextAlign = coreLibrary.TextAlign;

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.ui.core.aria.HasPopup
	var AriaHasPopup = coreLibrary.aria.HasPopup;

	// shortcut for sap.m.WrappingType
	var WrappingType = library.WrappingType;

	// shortcut for sap.m.PlacementType
	var PlacementType = library.PlacementType;

	// shortcut for sap.m.ExpandableOverflowTextMode
	var ExpandableTextOverflowMode = library.ExpandableTextOverflowMode;

	// shortcut for sap.m.EmptyIndicator
	var EmptyIndicatorMode = library.EmptyIndicatorMode;

	// shortcut for sap.m.LinkAccessibleRole
	var LinkAccessibleRole = library.LinkAccessibleRole;

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
	 * Only the first characters from the text field are shown initially and a "More" link which allows
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
				text: { type: "string", group: "Data", defaultValue: '', bindable: "bindable" },

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
				 * Specifies the maximum number of characters from the beginning of the text field that are shown initially.
				 */
				maxCharacters: { type: "int", group: "Appearance", defaultValue: 100 },

				/**
				 * Determines if the text is expanded.
				 * @private
				 */
				expanded: { type: "boolean", group: "Appearance", defaultValue: false, visibility: "hidden" },

				/**
				 * Specifies if an empty indicator should be displayed when there is no text.
				 *
				 * @since 1.91
				 */
				emptyIndicatorMode: { type: "sap.m.EmptyIndicatorMode", group: "Appearance", defaultValue: EmptyIndicatorMode.Off }
			},
			aggregations: {
				/**
				 * The "More" link.
				 * @private
				 */
				_showMoreLink: {type: 'sap.m.Link', multiple: false, visibility: "hidden"},

				/**
				 * Screen Reader ariaLabelledBy
				 */
				_ariaLabelledBy: {type: "sap.ui.core.InvisibleText", multiple: false, visibility: "hidden"}
			},

			designtime: "sap/m/designtime/ExpandableText.designtime"
		},

		renderer: ExpandableTextRenderer
	});

	ExpandableText.prototype.init = function () {
		this.setAggregation("_ariaLabelledBy", new InvisibleText());
	};

	ExpandableText.prototype.onBeforeRendering = function() {
		this._updateAriaLabelledByText();
	};

	ExpandableText.prototype._onAfterLinkRendering = function() {
		var oShowMoreLinkDomRef;

		if (!this._isExpandable() ||
			this.getOverflowMode() === ExpandableTextOverflowMode.Popover) {
			return;
		}

		oShowMoreLinkDomRef = this._getShowMoreLink().getDomRef();
		oShowMoreLinkDomRef.setAttribute("aria-expanded", this.getProperty("expanded"));
		oShowMoreLinkDomRef.setAttribute("aria-controls", this.getId() + "-string");
	};

	/**
	 * Gets the text.
	 *
	 * @public
	 * @param {boolean} [bNormalize] Indication for normalized text.
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

		return sText.length > this._getMaxCharacters() + TEXT_SHOW_MORE.length;
	};

	/**
	 * Returns the maximum number of initially displayed characters.
	 *
	 * @private
	 */
	ExpandableText.prototype._getMaxCharacters = function () {
		return Math.max(0, this.getMaxCharacters());
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

		return sText.substring(0, this._getMaxCharacters());
	};

	ExpandableText.prototype._getShowMoreLink = function() {
		var showMoreLink = this.getAggregation('_showMoreLink');

		if (!showMoreLink) {
			showMoreLink = new Link(this.getId() + '-showMoreLink', {
				accessibleRole: LinkAccessibleRole.Button,
				text: this.getProperty("expanded") ? TEXT_SHOW_LESS : TEXT_SHOW_MORE,
				ariaLabelledBy: this.getAggregation("_ariaLabelledBy"),
				press: function (oEvent) {
					var oText,
						bExpanded,
						oPopover;

					if (this.getOverflowMode() === ExpandableTextOverflowMode.InPlace) {
						bExpanded = !this.getProperty("expanded");
						showMoreLink.setText(bExpanded ? TEXT_SHOW_LESS : TEXT_SHOW_MORE);
						this.setProperty("expanded", bExpanded);
					} else {
						oText = new Text({
							text: ManagedObject.escapeSettingsValue(this.getText()),
							textDirection: this.getTextDirection(),
							wrappingType: this.getWrappingType(),
							textAlign: this.getTextAlign(),
							renderWhitespace: this.getRenderWhitespace()
						}).addStyleClass("sapUiSmallMargin").addStyleClass("sapMExTextPopover");

						oPopover = this._oPopover;

						if (oPopover && oPopover.isOpen()) {
							oPopover.close();
							return;
						}

						if (!oPopover) {
							oPopover = this._oPopover = new ResponsivePopover({
								showHeader: false,
								placement: PlacementType.HorizontalPreferredRight,
								beforeClose: this._onPopoverBeforeClose.bind(this)
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

						showMoreLink.setText(TEXT_SHOW_LESS);

						oPopover.removeAllAriaLabelledBy();
						oPopover.destroyContent();

						oPopover.addAriaLabelledBy(oText);
						oPopover.addContent(oText);

						oPopover.openBy(oEvent.getSource());

						this._updateAriaLabelledByText(true);
					}
				}.bind(this)
			});

			showMoreLink.addEventDelegate({
				onAfterRendering: this._onAfterLinkRendering
			}, this);

			this.setAggregation("_showMoreLink", showMoreLink, true);
		}

		showMoreLink.setAriaHasPopup(this.getOverflowMode() === ExpandableTextOverflowMode.InPlace ? AriaHasPopup.None : AriaHasPopup.Dialog);

		return showMoreLink;
	};

	ExpandableText.prototype._onPopoverBeforeClose = function () {
		this._getShowMoreLink().setText(TEXT_SHOW_MORE);
		this._updateAriaLabelledByText();
	};

	ExpandableText.prototype._updateAriaLabelledByText = function (bExpanded) {
		var sAriaText = "";

		bExpanded = bExpanded || this.getProperty("expanded");

		if (this.getOverflowMode() === ExpandableTextOverflowMode.Popover) {
			sAriaText = oRb.getText(bExpanded ? "EXPANDABLE_TEXT_SHOW_LESS_POPOVER_ARIA_LABEL" : "EXPANDABLE_TEXT_SHOW_MORE_POPOVER_ARIA_LABEL");
		}

		this.getAggregation("_ariaLabelledBy").setText(sAriaText);
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
	 * @returns {sap.ui.core.AccessibilityInfo} Accessibility information for the text.
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