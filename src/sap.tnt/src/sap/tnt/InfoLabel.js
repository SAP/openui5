/*!
 * ${copyright}
 */

// Provides control sap.tnt.InfoLabel
sap.ui.define([
	"./library",
	"sap/ui/core/ControlBehavior",
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"sap/ui/core/Control",
	"./InfoLabelRenderer"
], function(library, ControlBehavior, Library, CoreLibrary, Control, InfoLabelRenderer) {
	"use strict";

	// shortcut for library.RenderMode
	var RenderMode = library.RenderMode;

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = CoreLibrary.TextDirection;

	/**
	 * Constructor for a new <code>InfoLabel</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>InfoLabel</code> is a small non-interactive control which contains text information and non-semantic color chosen from a list of predefined color schemes. It serves the purpose to attract the user attention to some piece of information (state, quantity, condition, etc.).
	 *
	 * <h3>Overview</h3>
	 *
	 * The control visualizes text information without user interaction.
	 * The  text-background color pair can be changed by setting a number between 1 and 10 that corresponds to the 10 predefined color combinations of the <code>colorScheme</code> property.
	 * The control is designed to be vertically aligned with UI5 Input and Button control families.
	 * When using <code>InfoLabel</code> in non-editable <code>Forms</code>, <code>Tables</code>, etc., set <code>displayOnly=true</code> for best visual results.
	 *
	 * <h3>Usage Guidelines</h3>
	 * <ul>
	 * <li>If the text is longer than the width of the control, it doesn’t wrap. Instead, it’s represented as ellipsis. </li>
	 * <li>When truncated, the full text in the control is not visible. Therefore, it’s recommended to make more space for longer items to be fully displayed.</li>
	 * <li>Colors are not semantic and have no visual representation in sap_belize_hcb, sap_belize_hcw, sap_fiori_3_hcb and sap_fiori_3_hcw themes.</li>
	 * <li>The control shows plain text only, formatting is not visualized.</li>
	 * </ul>
	 *
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.54
	 * @alias sap.tnt.InfoLabel
	 */
	var InfoLabel = Control.extend("sap.tnt.InfoLabel", /** @lends sap.tnt.InfoLabel.prototype */ {
		metadata: {
			interfaces: [
				"sap.ui.core.IFormContent"
			],
			library: "sap.tnt",
			properties: {
				/**
				 * Specifies the text inside the <code>InfoLabel</code> control.
				 */
				text: { type: "string", group: "Data", defaultValue: "", bindable: "bindable" },
				/**
				 * Specifies the type of the <code>InfoLabel</code> paddings - loose or narrow.
				 * <b>Note:</b> By default the padding is loose. It is recommended to use narrow (smaller) paddings for numeric texts.
				 * <b>Note:</b> In Horizon theme there is only one mode and setting this property will not have effect.
				 */
				renderMode: { type: "sap.tnt.RenderMode", defaultValue: RenderMode.Loose, group: "Appearance" },
				/**
				 * Specifies the fill and text color of the control. Accepts a number between 1 and 10 as a value.
				 * You can choose from 10 predefined background and text color combinations.
				 * The color schemes are non-semantic, you can select them according to your own preferences.
				 * <b>Note:</b> ColorScheme 10 is available only in Fiori 3 and Horizon themes.
				 * The default <code>colorScheme</code> is 7.
				 */
				colorScheme: { type: "int", group: "Misc", defaultValue: 7 },
				/**
				 * Specifies the width of the <code>InfoLabel</code> control. By default, the <code>InfoLabel</code> control has the width of the content. Set this property to restrict the width to a custom value.
				 */
				width: { type: "sap.ui.core.CSSSize", group: "Dimension", defaultValue: null },

				/**
				* Determines if the <code>InfoLabel</code> is in <code>displayOnly</code> mode.
				* When set to <code>true</code> the control size adjusts to fit other controls, for example non-editable <code>Forms</code>.
				*/
				displayOnly: { type: "boolean", group: "Appearance", defaultValue: false },

				/**
				 * Available options for the text direction are LTR and RTL. By default the control inherits the text direction from its parent control.
				 */
				textDirection: { type: "sap.ui.core.TextDirection", group: "Appearance", defaultValue: TextDirection.Inherit },

				/**
				 * Defines the icon to be displayed as graphical element within the <code>InfoLabel</code>.
				 * It can be an icon from the icon font.
				 *
				 * @since 1.74
				 */
				icon : {type : "sap.ui.core.URI", group : "Appearance", defaultValue: "" }

			}
		},

		renderer: InfoLabelRenderer
	});

	InfoLabel.prototype.init = function () {
		// Init static text for ARIA
		if (ControlBehavior.isAccessibilityEnabled() && !InfoLabelRenderer._sAriaText) {
			var oRB = Library.getResourceBundleFor("sap.tnt");
			InfoLabelRenderer._sAriaText = oRB.getText("INFOLABEL_DEFAULT");
			InfoLabelRenderer._sAriaTextEmpty = oRB.getText("INFOLABEL_EMPTY");
		}
	};

	/**
	* <code>InfoLabel</code> must not be stretched in Form because should have the size of its text.
	* @return {boolean} true the <code>InfoLabel</code> should not be stretched in 100% in Forms
	* @private
	*/
	InfoLabel.prototype.getFormDoNotAdjustWidth = function () {
		return true;
	};

	return InfoLabel;
});