/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Matcher",
	"sap/base/util/deepEqual",
	"./waitForField"
], function(
	Opa5,
	Matcher,
	deepEqual,
	waitForField
) {
	"use strict";

	return {

		iShouldSeeTheFieldWithValues: function(sId, oValues) {
			var oMatcher = new Matcher();
			oMatcher.isMatching = function(oField) {
				return deepEqual(oField.getValue(), oValues);
			};
			return waitForField.call(this, {
				properties: {
					id: sId
				},
				matchers: oMatcher,
				success: onFieldWithExpectedValueFound,
				errorMessage: "The field stores the unexpected value"
			});

			function onFieldWithExpectedValueFound(oFilterField) {
				var sMessage = 'The expected value are stored for the field with the id "' + sId + '"';
				Opa5.assert.ok(true, sMessage);
			}
		}
    };
});

