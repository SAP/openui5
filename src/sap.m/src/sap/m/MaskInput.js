/*!
 * ${copyright}
 */

// Provides control sap.m.MaskInput.
sap.ui.define(['./InputBase', './MaskEnabler', './MaskInputRenderer'], function(InputBase, MaskEnabler, MaskInputRenderer) {
	"use strict";


	/**
	 * Constructor for a new MaskInput.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>sap.m.MaskInput</code> control allows users to easily enter data in a certain format and in a fixed-width input
	 * (for example: date, time, phone number, credit card number, currency, IP address, MAC address, and others).
	 *
	 * @author SAP SE
	 * @extends sap.m.InputBase
	 * @version ${version}
	 *
	 * @constructor
	 * @public
	 * @since 1.34.0
	 * @alias sap.m.MaskInput
	 * @see {@link fiori:https://experience.sap.com/fiori-design-web/generic-mask-input/ Mask Input}
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var MaskInput = InputBase.extend("sap.m.MaskInput", /** @lends sap.m.MaskInput.prototype */ {
		metadata: {
			library: "sap.m",
			properties: {

				/**
				 * Defines a placeholder symbol. Shown at the position where there is no user input yet.
				 */
				placeholderSymbol: {type: "string", group: "Misc", defaultValue: "_"},

				/**
				 * Mask defined by its characters type (respectively, by its length).
				 * You should consider the following important facts:
				 * 1. The mask characters normally correspond to an existing rule (one rule per unique char).
				 * Characters which don't, are considered immutable characters (for example, the mask '2099', where '9' corresponds to a rule
				 * for digits, has the characters '2' and '0' as immutable).
				 * 2. Adding a rule corresponding to the <code>placeholderSymbol</code> is not recommended and would lead to an unpredictable behavior.
				 * 3. You can use the special escape character '^' called "Caret" prepending a rule character to make it immutable.
				 * Use the double escape '^^' if you want to make use of the escape character as an immutable one.
				 */
				mask: {type: "string", group: "Misc", defaultValue: null}
			},
			aggregations: {

				/**
				 A list of validation rules (one rule per mask character).
				 */
				rules: {type: "sap.m.MaskInputRule", multiple: true, singularName: "rule"}
			}
		}
	});

	MaskEnabler.call(MaskInput.prototype);

	/**
	 * Returns if the mask is enabled.
	 *
	 * @returns {boolean}
	 * @private
	 */
	MaskInput.prototype._isMaskEnabled = function () {
		return true;
	};

	return MaskInput;

});
