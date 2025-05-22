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

	const sEmptyTextKey = "\xa0";
	const oValidators = {
		noEmptyText: {
			validatorFunction(sNewText) {
				return sNewText !== sEmptyTextKey;
			},
			errorMessage: Lib.getResourceBundleFor("sap.ui.rta").getText("RENAME_EMPTY_ERROR_TEXT")
		}
	};

	function checkPreconditionsAndThrowError(sNewText, sOldText) {
		if (sOldText === sNewText) {
			throw Error("sameTextError");
		}
		let oBindingParserResult;
		let bError;

		try {
			oBindingParserResult = BindingParser.complexParser(sNewText, undefined, true);
		} catch (error) {
			bError = true;
		}

		if (oBindingParserResult && typeof oBindingParserResult === "object" || bError) {
			throw Error(Lib.getResourceBundleFor("sap.ui.rta").getText("RENAME_BINDING_ERROR_TEXT"));
		}
	}

	return function(sNewText, sOldText, oAction) {
		checkPreconditionsAndThrowError(sNewText, sOldText);
		let sErrorText;
		const aValidators = oAction && oAction.validators || [];

		aValidators.some(function(vValidator) {
			let oValidator;

			if (
				typeof vValidator === "string" && oValidators[vValidator]
			) {
				oValidator = oValidators[vValidator];
			} else {
				oValidator = vValidator;
			}

			if (!oValidator.validatorFunction(sNewText)) {
				sErrorText = oValidator.errorMessage;
				return true;
			}

			return false;
		});

		if (sErrorText) {
			throw Error(sErrorText);
		}
	};
});