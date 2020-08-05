/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/validator/IsPatternMatch"
], function (
	IsPatternMatch
) {
	"use strict";

	return {
		async: false,
		errorMessage: "BASE_EDITOR.VALIDATOR.FAILED_PATTERN_TEST",
		validate: function (aValues, oConfig) {
			return (aValues || []).every(function (sValue) {
				return IsPatternMatch.validate(sValue, oConfig);
			});
		}
	};
});
