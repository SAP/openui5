/*!
* ${copyright}
*/

// Provides control sap.m.Text
sap.ui.define([
	'./library',
	'sap/ui/core/Control',
	'sap/ui/core/library',
	'sap/m/HyphenationSupport',
	"./TextRenderer"
],
function(library, Control, coreLibrary, HyphenationSupport, TextRenderer) {
	"use strict";

	// shortcut for sap.ui.core.TextAlign
	var TextAlign = coreLibrary.TextAlign;

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.m.WrappingType
	var WrappingType = library.WrappingType;

	// shortcut for sap.m.EmptyIndicator
	var EmptyIndicatorMode = library.EmptyIndicatorMode;

	/**
	 * Constructor for a new Text.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>Text</code> control can be used for embedding longer text paragraphs,
	 * that need text wrapping, into your app.
	 * If the configured text value contains HTML code or script tags, those will be
	 * escaped.
	 *
	 * As of version 1.60, you can hyphenate the text with the use of the
	 * <code>wrappingType</code> property. For more information, see
	 * {@link topic:6322164936f047de941ec522b95d7b70 Text Controls Hyphenation}.
	 *
	 * <b>Note:</b> Line breaks will always be visualized except when the
	 * <code>wrapping</code> property is set to <code>false</code>. In addition, tabs and
	 * whitespace can be preserved by setting the <code>renderWhitespace</code> property
	 * to <code>true</code>.
	 *
	 * @extends sap.ui.core.Control
	 * @implements sap.ui.core.IShrinkable, sap.ui.core.IFormContent, sap.ui.core.ISemanticFormContent, sap.ui.core.ILabelable
	 *
	 * @borrows sap.ui.core.ISemanticFormContent.getFormFormattedValue as #getFormFormattedValue
	 * @borrows sap.ui.core.ISemanticFormContent.getFormValueProperty as #getFormValueProperty
	 * @borrows sap.ui.core.ISemanticFormContent.getFormObservingProperties as #getFormObservingProperties
	 * @borrows sap.ui.core.ISemanticFormContent.getFormRenderAsControl as #getFormRenderAsControl
	 * @borrows sap.ui.core.ILabelable.hasLabelableHTMLElement as #hasLabelableHTMLElement
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @alias sap.m.Text
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/text/ Text}
	 * @see {@link topic:f94deb45de184a3a87850b75d610d9c0 Text}
	 */
	var Text = Control.extend("sap.m.Text", /** @lends sap.m.Text.prototype */ {
		metadata: {

			interfaces: [
				"sap.ui.core.IShrinkable",
				"sap.ui.core.IFormContent",
				"sap.ui.core.ISemanticFormContent",
				"sap.m.IHyphenation",
				"sap.m.IToolbarInteractiveControl",
				"sap.ui.core.ILabelable"
			],
			library: "sap.m",
			properties: {

				/**
				 * Determines the text to be displayed.
				 */
				text: { type: "string", group: "Data", defaultValue: '', bindable: "bindable" },

				/**
				 * Available options for the text direction are LTR and RTL. By default the control inherits the text direction from its parent control.
				 */
				textDirection: { type: "sap.ui.core.TextDirection", group: "Appearance", defaultValue: TextDirection.Inherit },

				/**
				 * Enables text wrapping.
				 */
				wrapping: { type: "boolean", group: "Appearance", defaultValue: true },

				/**
				 * Defines the type of text wrapping to be used (hyphenated or normal).
				 *
				 * <b>Note:</b> This property takes effect only when the <code>wrapping</code>
				 * property is set to <code>true</code>.
				 *
				 * @since 1.60
				 */
				wrappingType : {type: "sap.m.WrappingType", group : "Appearance", defaultValue : WrappingType.Normal},

				/**
				 * Sets the horizontal alignment of the text.
				 */
				textAlign: { type: "sap.ui.core.TextAlign", group: "Appearance", defaultValue: TextAlign.Begin },

				/**
				 * Sets the width of the Text control. By default, the Text control uses the full width available. Set this property to restrict the width to a custom value.
				 */
				width: { type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: null },

				/**
				 * Limits the number of lines for wrapping texts.
				 *
				 * @since 1.13.2
				 */
				maxLines: { type: "int", group: "Appearance", defaultValue: null },

				/**
				 * Specifies how whitespace and tabs inside the control are handled. If true, whitespace will be preserved by the browser.
				 * Depending on wrapping property text will either only wrap on line breaks or wrap when necessary, and on line breaks.
				 *
				 * @since 1.51
				 */
				renderWhitespace: { type: "boolean", group: "Appearance", defaultValue: false },

				/**
				 * Specifies if an empty indicator should be displayed when there is no text.
				 *
				 * @since 1.87
				 */
				emptyIndicatorMode: { type: "sap.m.EmptyIndicatorMode", group: "Appearance", defaultValue: EmptyIndicatorMode.Off }
			},

			designtime: "sap/m/designtime/Text.designtime"
		},

		renderer: TextRenderer
	});

	/**
	 * Gets the text.
	 *
	 * @public
	 * @param {boolean} [bNormalize] Indication for normalized text.
	 * @returns {string} Text value.
	 */
	Text.prototype.getText = function (bNormalize) {
		// returns the text value and normalize line-ending character for rendering
		var sText = this.getProperty("text");

		// handle line ending characters for renderer
		if (bNormalize) {
			return sText.replace(/\r\n|\n\r|\r/g, "\n");
		}

		return sText;
	};

	/**
	 * Determines whether max lines should be rendered or not.
	 *
	 * @protected
	 * @returns {HTMLElement|null} Max lines of the text.
	 * @since 1.22
	 */
	Text.prototype.hasMaxLines = function () {
		return (this.getWrapping() && this.getMaxLines() > 1);
	};

	/**
	 * Returns the text node container's DOM reference.
	 * This can be different from <code>getDomRef</code> when inner wrapper is needed.
	 *
	 * @protected
	 * @returns {HTMLElement|null} DOM reference of the text.
	 * @since 1.22
	 */
	Text.prototype.getTextDomRef = function () {
		if (!this.getVisible()) {
			return null;
		}

		if (this.hasMaxLines()) {
			return this.getDomRef("inner");
		}

		return this.getDomRef();
	};

	/**
	 * Gets the accessibility information for the text.
	 *
	 * @protected
	 * @returns {sap.ui.core.AccessibilityInfo} Accessibility information for the text.
	 * @see sap.ui.core.Control#getAccessibilityInfo
	 */
	Text.prototype.getAccessibilityInfo = function () {
		return { description: this.getText() };
	};

	/**
	 * Required by the {@link sap.m.IToolbarInteractiveControl} interface.
	 * Determines if the Control is interactive.
	 *
	 * @returns {boolean} If it is an interactive Control
	 *
	 * @private
	 * @ui5-restricted sap.m.OverflowToolBar, sap.m.Toolbar
	 */
	Text.prototype._getToolbarInteractive = function () {
		return false;
	};

	/**
	 * Gets a map of texts which should be hyphenated.
	 *
	 * @private
	 * @returns {Object<string,string>} The texts to be hyphenated.
	 */
	Text.prototype.getTextsToBeHyphenated = function () {
		return {
			"main": this.getText(true)
		};
	};

	/**
	 * Gets the DOM refs where the hyphenated texts should be placed.
	 *
	 * @private
	 * @returns {map|null} The elements in which the hyphenated texts should be placed
	 */
	Text.prototype.getDomRefsForHyphenatedTexts = function () {
		return {
			"main": this.getTextDomRef()
		};
	};

	Text.prototype.getFormFormattedValue = function () {
		return this.getText();
	};

	Text.prototype.getFormValueProperty = function () {
		return "text";
	};

	Text.prototype.getFormObservingProperties = function() {
		return ["text"];
	};

	Text.prototype.getFormRenderAsControl = function () {
		return true;
	};

	/**
	 * Returns if the control can be bound to a label
	 *
	 * @returns {boolean} <code>true</code> if the control can be bound to a label
	 * @public
	 */
	Text.prototype.hasLabelableHTMLElement = function () {
		return false;
	};

	// Add hyphenation to Text functionality
	HyphenationSupport.mixInto(Text.prototype);

	return Text;
});
