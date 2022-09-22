/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Matcher",
	"sap/ui/test/matchers/Ancestor",
	"sap/base/util/deepEqual",
	"./waitForFilterField",
	"../Utils",
	"../matchers/DOMRef"
], function(
	Opa5,
	Matcher,
	Ancestor,
	deepEqual,
	waitForFilterField,
	Utils,
	DOMRef
) {
	"use strict";

	var aDatePickerControls = [
		"sap.m.DatePicker",
		"sap.m.TimePicker",
		"sap.m.DateTimePicker",
		"sap.m.DateRangeSelection",
		"sap.m.DynamicDateRange"
	];

	return {

		iShouldSeeTheFilterField: function(vIdentifier, vValues) {
			return waitForFilterField.call(this, Utils.enhanceWaitFor(vIdentifier, {
				success: function(oFilterField) {
					//	Check for mutliple fields (e.g. UOM to check both fields for values)
					var oContent = oFilterField._getContent()[0];
					var sControlType = oContent.getMetadata().getName();
					var aValues = vValues && [].concat(vValues);
					var bIsDatePicker = aDatePickerControls.includes(sControlType);

					if (aValues && aValues.length) {
						var iMaxConditions = oFilterField.getMaxConditions();
						Opa5.assert.ok(iMaxConditions <= aValues.length || iMaxConditions === -1, "Given fitting amount of values to search for.");

						if (iMaxConditions === 1) {
							var sValue = aValues[0];
							this.waitFor({
								controlType: sControlType,
								properties: !bIsDatePicker && Utils.removeUndefinedValues({
									value: sControlType === "sap.ui.mdc.field.FieldInput" ? sValue : undefined,
									text: sControlType === "sap.m.Text" ? sValue : undefined
								}),
								matchers: bIsDatePicker ? [ new Ancestor(oFilterField) ].concat(new DOMRef({
									elementType: "input",
									attributes: {
										value: sValue
									}
								})) : new Ancestor(oFilterField),
								success: function(aInnerControls) {
									Opa5.assert.equal(aInnerControls.length, 1, "Found expected value for the given sap.ui.mdc.Field");
								}
							});
						} else {
							// In case of ValueState = Error we assume that the last given value is falsy.
							if (oFilterField.getValueState() === "Error") {
								this.waitFor({
									controlType: sControlType,
									matchers: new DOMRef({
										elementType: "input",
										attributes: {
											value: aValues.pop()
										}
									})
								});
							}

							var sTokenControlType = sControlType === "sap.ui.mdc.field.FieldMultiInput" ? "sap.m.Token" : "sap.ui.mdc.field.TokenDisplay";
							aValues.forEach(function(vValue) {
								this.waitFor({
									controlType: sTokenControlType,
									matchers: new Ancestor(oFilterField, false),
									properties: {
										text: vValue
									}
								});
							}.bind(this));
						}
					}
				},
				errorMessage: "The filter field stores the unexpected value"
			}));
		},
		iShouldSeeTheFilterFieldWithInnerControl: function(vIdentifier, oConfig) {
			return waitForFilterField.call(this, Utils.enhanceWaitFor(vIdentifier, {
				success: function(oFilterField) {
					this.waitFor(Object.assign({
						success: function(aInnerControls) {
							Opa5.assert.ok(aInnerControls.length === 1, "Found inner Control for FilterField with identifier '" + JSON.stringify(vIdentifier) + "'");
						},
						errorMessage: "Could not find inner Control for FilterField with identifier '" + JSON.stringify(vIdentifier) + "'"
					}, oConfig, {
						matchers: oConfig.matchers ? [].concat(oConfig.matchers, new Ancestor(oFilterField)) : new Ancestor(oFilterField)
					}));
				}
			}));
		}
	};
});

