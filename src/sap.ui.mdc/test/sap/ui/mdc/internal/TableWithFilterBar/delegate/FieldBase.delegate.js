/*!
 * ${copyright}
 */

sap.ui.define([
	"delegates/odata/v4/FieldBaseDelegate"
], function(
	ODataV4FieldBaseDelegate
) {
	"use strict";

	var FieldBaseDelegate = Object.assign({}, ODataV4FieldBaseDelegate);

	/*
	* With these overrides, we customize our typeahead suggestion matching mechanisms
	*
	* Case sensitivity:
	*
	* Entering "f" in the Books overview language FilterField will show the key-based autocompletion text "FA"
	* Entering "F" in the same field will not show autocompletion
	* Entering "p" or "P" in same field will show the description based autocompletion text "Persian"
	*
	* Accept any suggestions:
	*
	* Entering "erature" in the Books overview Genre field will lead to a suggest of "british literature"
	* This suggest can then be confirmed for the field, even if it does not visually match the input.
	*
	*
	* Note: This code depends on a custom implementation of ValueHelp.delegate#getFirstMatch
	*/

	FieldBaseDelegate.isInputMatchingText = function(oField, sUserInput, sText, bDescription, bCaseSensitive) {

		const oPayload = oField.getPayload();

		if (oPayload && oPayload.hasOwnProperty("acceptAnySuggestions")) { // Always use autocomplete value
			return true;
        }

		if (oPayload && oPayload.hasOwnProperty("autoCompleteCaseSensitive")) { // ignore configuration of ValueHelp (to allow check key and description in a different way)
			if (oPayload.autoCompleteCaseSensitive === "key" && !bDescription) {
				return sText.normalize().startsWith(sUserInput.normalize());
			} else if (oPayload.autoCompleteCaseSensitive === "description" && bDescription) {
				return sText.normalize().startsWith(sUserInput.normalize());
			} else if (oPayload.autoCompleteCaseSensitive === true) {
				return sText.normalize().startsWith(sUserInput.normalize());
			} else {
				return sText.normalize().toLowerCase().startsWith(sUserInput.normalize().toLowerCase());
			}
        }

		return ODataV4FieldBaseDelegate.isInputMatchingText.apply(this, arguments);
	};

	FieldBaseDelegate.getAutocompleteOutput = function(oField, oCondition, sKey, sDescription, bKeyMatch, bDescriptionMatch) {

		const oPayload = oField.getPayload();

		if (oPayload && oPayload.hasOwnProperty("acceptAnySuggestions")) { // Always use autocomplete value
			return true;
        }

		if (oPayload.hasOwnProperty("autoCompleteCaseSensitive")) {
			if (bDescriptionMatch) {
				return sDescription;
			} else if (bKeyMatch) {
				return sKey;
			}
		}

		return ODataV4FieldBaseDelegate.getAutocompleteOutput.apply(this, arguments);

	};

	return FieldBaseDelegate;
});
