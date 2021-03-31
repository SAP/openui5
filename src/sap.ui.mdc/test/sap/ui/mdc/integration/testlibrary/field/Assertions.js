/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Ancestor",
	"sap/base/util/deepEqual",
	"./waitForField"
], function(
	Opa5,
	Ancestor,
	deepEqual,
	waitForField
) {
	"use strict";

	return {

		iShouldSeeTheFieldWithValues: function(sId, oValues) {
			return waitForField.call(this, {
				properties: {
					id: sId
				},
				check: function(aFields) {
					var oField = aFields[0];
					return deepEqual(oField.getValue(), oValues);
				},
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

