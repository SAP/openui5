/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Matcher",
	"sap/ui/test/matchers/Ancestor",
	"sap/base/util/deepEqual",
	"./waitForFilterField"
], function(
	Opa5,
	Matcher,
	Ancestor,
	deepEqual,
	waitForFilterField
) {
	"use strict";

	var fnPrepareConditions = function(aConditions) {
		aConditions.forEach(function(oCondition) {
			oCondition.values.forEach(function(vValue) {
				if (vValue instanceof Date) {
					oCondition.values[oCondition.values.indexOf(vValue)] = vValue.toString();
				}
			});
		});
		return aConditions;
	};

	return {

		iShouldSeeTheFilterFieldWithValues: function(oProperties, oValues) {
			var oConditionsMatcher = new Matcher();
			oConditionsMatcher.isMatching = function(oControl) {
				var aConditions = oValues.conditions || [];
				return deepEqual(fnPrepareConditions(oControl.getConditions()), fnPrepareConditions(aConditions));
			};
			return waitForFilterField.call(this, {
				matchers: oConditionsMatcher,
				properties: oProperties,
				success: onFilterFieldWithExpectedConditionsFound,
				errorMessage: "The filter field stores the unexpected conditions"
			});

			function onFilterFieldWithExpectedConditionsFound(oFilterField) {
				var sConditionMessage = 'The expected conditions are stored for the filter field with properties "' + JSON.stringify(oProperties) + '"';
				Opa5.assert.ok(true, sConditionMessage);

				if (!Array.isArray(oValues.formattedValues)) {
					return;
				}

				oValues.formattedValues.forEach(function(sValue) {
					var sFormattedValueMessage = 'The expected value "' + sValue + '" is displayed into the filter field with properties "' + JSON.stringify(oProperties) + '"';

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

