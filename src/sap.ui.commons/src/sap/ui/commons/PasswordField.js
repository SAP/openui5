/*!
 * ${copyright}
 */

// Provides control sap.ui.commons.PasswordField.
sap.ui.define(['jquery.sap.global', './TextField', './library', "./PasswordFieldRenderer"],
	function(jQuery, TextField, library, PasswordFieldRenderer) {
	"use strict";



	/**
	 * Constructor for a new PasswordField.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A text field with masked characters which borrows its properties and methods from TextField.
	 * @extends sap.ui.commons.TextField
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.38. Instead, use the <code>sap.m.Input</code> control.
	 * @alias sap.ui.commons.PasswordField
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var PasswordField = TextField.extend("sap.ui.commons.PasswordField", /** @lends sap.ui.commons.PasswordField.prototype */ { metadata : {

		library : "sap.ui.commons"
	}});

	PasswordField.prototype.onfocusin = function(oEvent) {

		TextField.prototype.onfocusin.apply(this, arguments);

		if (!sap.ui.Device.support.input.placeholder && this.getPlaceholder()) {
			// if browser not supports placeholder on input tag, set the password type if focused
			jQuery(this.getInputDomRef()).attr("type", "password");
		}

	};

	PasswordField.prototype.onsapfocusleave = function(oEvent) {

		if (!sap.ui.Device.support.input.placeholder && this.getPlaceholder()) {
			// if browser not supports placeholder on input tag, remove the password type if placeholder is there and not focused
			var $Input = jQuery(this.getInputDomRef());
			if (!$Input.val()) {
				$Input.removeAttr("type");
			}
		}

		TextField.prototype.onsapfocusleave.apply(this, arguments);

	};

	return PasswordField;

}, /* bExport= */ true);
