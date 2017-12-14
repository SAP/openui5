/*!
 * ${copyright}
 */

/**
 * Contains rule validation functionality such as validating version, rule collections, id and strings.
 */
sap.ui.define([],
	function() {
	'use strict';

	/**
	* @classdesc
	* <h3>Overview</h3>
	* The RuleValidator gives access to the validation functionality for each rule..
	* <h3>Usage</h3>
	* Value from the databindings is passed to each static method of the RuleValidator class. Then the value can be proccessed and a response from type boolean will be returned signifing if the value has been validated or not.
	*  @name sap.ui.support.RuleValidator
	* @returns {object} Instance of the <code>RuleValidator</code>
	* @private
	*/
	var RuleValidator = {

	/**
	* Validates version.
	* Positive cases :
	* - "-"
	* - "*"
	* - "<digit>.<digit><digit>"
	*
	* @private
	* @param {string} sVersion Version number in string format - could be - * or numeric.
	* @returns {boolean} Boolean response if the provided version is valid.
	*/
	validateVersion: function(sVersion) {

		if (!sVersion || typeof sVersion !== 'string') {
			return false;
		}

		//Match 0 or 1 of the following symbols - "*" or "-" or the following pattern of digits - "<digit>.<digit><digit>"
		var versionRegEx = /^\*$|^\-$|^\d\.\d\d$/;

		if (sVersion.match(versionRegEx)) {
			return true;
		}

		return false;

	},

	/**
	* Validates any given collection.
	* Basically you can validate Audiences, Categories, Severity etc - everything that meets the criteria
	*
	* Positive cases :
	* - "Capitalcase"
	*
	* @private
	* @param {array} aEnum Enum to be validated.
	* @param {array} oEnumComparison Enum comparison.
	* @returns {boolean} Boolean response if the provided collection is valid.
	*/
	validateRuleCollection: function(aEnum, oEnumComparison) {

		if (aEnum && Array.isArray(aEnum) && aEnum.length) {

			for (var i = 0; i < aEnum.length; i++) {

				if (oEnumComparison.hasOwnProperty(aEnum[i])) {
					continue;
				} else {
					return false;
				}

			}

			return true;
		}

		return false;
	},

	/**
	* Validates the id of a rule each id. The Id has to be of type string, and needs to be camelCase.
	*
	* Positive cases :
	* - "validId"
	*
	* @private
	* @param {string} sId Id in string format.
	* @returns {boolean} Boolean response if the provided id is valid.
	*/
	validateId: function(sId) {

			//Match camelCase - case sensitive
			var idRegEx = /^[a-z][a-zA-Z]+$/;

			if (
				!sId || typeof sId !== 'string') {
				return false;
			}

			if (sId.match(idRegEx) && this.validateStringLength(sId, 6, 50)) {
				return true;
			}

			return false;
	},

	/**
	* Validates string by a specified minimum and maximum characters.
	*
	* @private
	* @param {string} sString String to be validated.
	* @param {number} iMin Minimum amount of characters.
	* @param {number} iMax Maximum amount of characters.
	* @returns {boolean} Boolean response if the provided string is valid.
	*/
	validateStringLength: function(sString, iMin, iMax) {
		return iMin <= sString.length && sString.length <= iMax;
	}
};

return RuleValidator;
}, false);