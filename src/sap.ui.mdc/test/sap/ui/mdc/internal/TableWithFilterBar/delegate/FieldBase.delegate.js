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

	FieldBaseDelegate.isInputMatchingText = function(oField, sUserInput, sText, bDescription, bCaseSensitive) {

		const oPayload = oField.getPayload();

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

		if (oPayload.hasOwnProperty("autoCompleteCaseSensitive")) {
			// also show key, if text of description don't match with user input (Test language with entering "f")
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
