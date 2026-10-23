/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/BindingParser",
	"sap/ui/core/Lib"
], function(
	BindingParser,
	Lib
) {
	"use strict";

	const EMPTY_TEXT_KEY = "\xa0"; // &nbsp; in Unicode
	const oValidators = {
		noBindingText: {
			validatorFunction(sNewText) {
				let oBindingParserResult;
				try {
					oBindingParserResult = BindingParser.complexParser(sNewText, undefined, true);
				} catch (error) {
					return false;
				}
				return !(oBindingParserResult && typeof oBindingParserResult === "object");
			},
			errorMessage: Lib.getResourceBundleFor("sap.ui.rta").getText("RENAME_BINDING_ERROR_TEXT")
		},
		sameText: {
			validatorFunction(sNewText, sOldText) {
				return sNewText !== sOldText;
			},
			errorMessage: "sameTextError"
		},
		noEmptyText: {
			validatorFunction(sNewText) {
				return sNewText !== EMPTY_TEXT_KEY;
			},
			errorMessage: Lib.getResourceBundleFor("sap.ui.rta").getText("RENAME_EMPTY_ERROR_TEXT")
		}
	};

	function validateText(sNewText, sOldText, oAction) {
		let sErrorText;
		const aValidators = oAction?.validators || [];
		const aValidatorsToRun = [
			...(oAction?.skipSameTextValidator ? [] : ["sameText"]),
			"noBindingText",
			...aValidators
		];

		aValidatorsToRun.some(function(vValidator) {
			let oValidator;

			if (
				typeof vValidator === "string" && oValidators[vValidator]
			) {
				oValidator = oValidators[vValidator];
			} else {
				oValidator = vValidator;
			}

			if (!oValidator.validatorFunction(sNewText, sOldText)) {
				sErrorText = oValidator.errorMessage;
				return true;
			}

			return false;
		});

		if (sErrorText) {
			throw Error(sErrorText);
		}
	}

	/**
	 * Trims the given text and returns the empty-text sentinel ("\xa0") when the trimmed result is
	 * empty. Input fields keep the raw user text while typing; callers use this to normalize the
	 * value for validation, change detection and the saved value, so trailing spaces are never saved.
	 *
	 * @param {string} sText - Raw text to normalize
	 * @returns {string} The trimmed text, or the empty-text sentinel when the trimmed text is empty
	 * @private
	 * @ui5-restricted sap.ui.rta
	 */
	validateText.getTrimmedText = function(sText) {
		const sTrimmedText = (sText || "").trim();
		return sTrimmedText.length ? sTrimmedText : EMPTY_TEXT_KEY;
	};

	return validateText;
});