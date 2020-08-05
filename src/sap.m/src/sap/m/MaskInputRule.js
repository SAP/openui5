/*!
 * ${copyright}
 */

// Provides control sap.m.MaskInputRule.
sap.ui.define(['sap/ui/core/Element', "sap/base/Log"], function(Element, Log) {
	"use strict";

	/**
	 * Constructor for a new MaskInputRule.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The <code>sap.m.MaskInputRule</code> control holds the mapping of a single <code>maskFormatSymbol</code>
	 * to the regular expression <code>regex</code> that defines the allowed characters for the rule.
	 *
	 * @author SAP SE
	 * @extends sap.ui.core.Element
	 * @version ${version}
	 * @public
	 * @constructor
	 * @since 1.34.0
	 * @alias sap.m.MaskInputRule
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var MaskInputRule = Element.extend("sap.m.MaskInputRule", /** @lends sap.m.MaskInputRule.prototype */ {
		metadata : {
			library : "sap.m",
			properties : {

				/**
				 * Defines the symbol used in the mask format which will accept a certain range of characters.
				 */
				maskFormatSymbol: {type: "string", group: "Misc", defaultValue: "*"},

				/**
				 * Defines the allowed characters as a regular expression.
				 */
				regex: {type: "string", group: "Misc", defaultValue: "[a-zA-Z0-9]"}
			}
		}
	});

	/*
	 * Sets <code>maskFormatSymbol</code> property.
	 * @override
	 * @param {String} sNewMaskFormatSymbol The new format symbol
	 * @returns {sap.m.MaskInputRule} The <code>this</code> pointer for chaining
	 */
	MaskInputRule.prototype.setMaskFormatSymbol = function (sNewMaskFormatSymbol) {
		var bIsMaskSymbolValid = validateMaskFormatSymbol.call(this, sNewMaskFormatSymbol);

		if (bIsMaskSymbolValid) {
			this.setProperty("maskFormatSymbol", sNewMaskFormatSymbol);
		}
		return this;
	};

	/*
	 * Sets <code>regex</code> property.
	 * @override
	 * @param {String} sNewRegex The new regular expression
	 * @returns {sap.m.MaskInputRule} The <code>this</code> pointer for chaining
	 */
	MaskInputRule.prototype.setRegex = function (sNewRegex) {
		var bIsRegexValid = validateRegex.call(this, sNewRegex);

		if (bIsRegexValid) {
			this.setProperty("regex", sNewRegex);
		}
		return this;
	};

	/**
	 * Converts the rule into a string.
	 * @returns {String} String representation of this instance
	 */
	MaskInputRule.prototype.toString = function(){
		return this.getMaskFormatSymbol() + ":" + this.getRegex();
	};

	/********************************************************************************************
	 ********************************* Private methods ******************************************
	 ********************************************************************************************/

	/**
	 * Checks if the specified symbol is valid.
	 * @param {string} sNewSymbol Symbol to be validated
	 * @returns {boolean} True if the specified symbol is valid, false otherwise
	 * @private
	 */
	function validateMaskFormatSymbol(sNewSymbol) {
		if (/^.$/i.test(sNewSymbol)) {
			return true;
		}
		Log.error("The mask format symbol '" + sNewSymbol + "' is not valid");
		return false;
	}

	/**
	 * Checks if the specified regular expression is valid.
	 * @param {String} sRegex The regular expression string to be validated
	 * @returns {boolean} True of the specified regular expression string is valid, false otherwise
	 * @private
	 */
	function validateRegex(sRegex) {
		if (/.+/i.test(sRegex)) {
			return true;
		}
		Log.error("The regex value '" + sRegex + "' is not valid");
		return false;
	}

	return MaskInputRule;

});