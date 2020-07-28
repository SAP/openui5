/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/cardEditor/validator/IsPatternMatch"
], function (
	IsPatternMatch
) {
	"use strict";

	return {
		async: false,
		errorMessage: "CARD_EDITOR.VALIDATOR.FAILED_PATTERN_TEST",
		validate: function (aValues, oConfig) {
			return (aValues || []).every(function (sValue) {
				return IsPatternMatch.validate(sValue, oConfig);
			});
		}
	};
});
