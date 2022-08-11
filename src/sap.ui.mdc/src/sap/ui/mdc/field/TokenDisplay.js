/*!
 * ${copyright}
 */

sap.ui.define([
	'sap/m/Token',
	'sap/ui/mdc/field/TokenDisplayRenderer'
	], function(
		Token,
		TokenDisplayRenderer
	) {
	"use strict";

	/**
	 * Constructor for a new <code>TokenDisplay</code>.
	 *
	 * The <code>TokenDisplay</code> control enhances the {@link sap.m.Token Token} control to add ARIA attributes
	 * and other {@link sap.ui.mdc.field.FieldBase FieldBase}-specific logic.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class The <code>TokenDisplay</code> control is used to render a field inside a control based on {@link sap.ui.mdc.field.FieldBase FieldBase}.
	 * @extends sap.m.Token
	 * @version ${version}
	 * @constructor
	 * @abstract
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.TokenDisplay
	 * @since 1.99.0
	 * @alias sap.ui.mdc.field.TokenDisplay
	 */
	var TokenDisplay = Token.extend("sap.ui.mdc.field.TokenDisplay", /** @lends sap.ui.mdc.field.TokenDisplay.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				_delimiter: {
					type: "string",
					defaultValue: "·",
					visibility: "hidden"
				}
			}
		},
		renderer: TokenDisplayRenderer
	});

	TokenDisplay.prototype.init = function() {
		Token.prototype.init.apply(this, arguments);

		if (!this._oResourceBundle) {
			this._oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
		}
		this.setProperty("_delimiter", this._oResourceBundle.getText("field.SEPARATOR").trim());
	};

	// make the TokenDisplay instance not selectabled
	TokenDisplay.prototype.getSelected = function() {
		return false;
	};

	TokenDisplay.prototype.focus = function() {
		return;
	};

	return TokenDisplay;

});
