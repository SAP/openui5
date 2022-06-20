/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Ancestor",
	"sap/base/util/deepEqual",
	"./waitForFilterField"
], function(
	Opa5,
	Ancestor,
	deepEqual,
	waitForFilterField
) {
	"use strict";

	return {

		iShouldSeeTheFilterFieldWithValues: function(sLabelName, oValues) {
			return waitForFilterField.call(this, {
				properties: {
					label: sLabelName
				},
				check: function(aFilterFields) {
					var oFilterField = aFilterFields[0];
					var aConditions = oValues.conditions || [];
					return deepEqual(oFilterField.getConditions(), aConditions);
				},
				success: onFilterFieldWithExpectedConditionsFound,
				errorMessage: "The filter field stores the unexpected conditions"
			});

			function onFilterFieldWithExpectedConditionsFound(oFilterField) {
				var sConditionMessage = 'The expected conditions are stored for the filter field labeled as "' + sLabelName + '"';
				Opa5.assert.ok(true, sConditionMessage);

				if (!Array.isArray(oValues.formattedValues)) {
					return;
				}

				oValues.formattedValues.forEach(function(sValue) {
					var sFormattedValueMessage = 'The expected value "' + sValue + '" is displayed into the filter field labeled as "' + sLabelName + '"';

					if (sValue === "") {
						Opa5.assert.ok(true, sFormattedValueMessage);
						return;
					}

					var sControlType;

					switch (oFilterField.getEditMode()) {
						case "Display":
							sControlType = "sap.m.Text";
							break;

						// extend to more edit modes as required

						default:
							sControlType = "sap.m.Token";
							break;
					}

					this.waitFor({
						controlType: sControlType,

						// If the available space is limited, the MultiInput control
						// renders the conditions as invisible tokens. Therefore,
						// to make the test robust, visible and invisible tokens must
						// be taken into consideration.
						visible: false, // look for visible and invisible tokens

						properties: {
							text: sValue
						},
						matchers: new Ancestor(oFilterField),
						success: function() {
							Opa5.assert.ok(true, sFormattedValueMessage);
						},
						errorMessage: 'The filter filed displays the unexpected value "' + sValue + '"'
					});
				}, this);
			}
		}
    };
});

