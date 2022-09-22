/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Ancestor",
	"testutils/opa/filterfield/waitForFilterField",
	"testutils/opa/field/waitForField",
	"sap/base/util/deepEqual",
	"testutils/opa/field/Assertions",
	"testutils/opa/filterfield/Assertions",
	"testutils/opa/matchers/DateValue",
	"testutils/opa/Utils"

], function(Opa5, Ancestor, waitForFilterField, waitForField, deepEqual, FieldAssertions, FilterFieldAssertions, DateValue, Utils) {
	"use strict";

	var fnConvertDatesToStrings = function(aDates) {
		return aDates.map(function(oDate) {
			return oDate.toString();
		});
	};

	var iShouldSeeFilterFieldWithInnerControlProperties = function(oFilterFieldProperties, sInnerControlType, oInnerControlProperties) {
		var oMatcher = new DateValue();
		if (oInnerControlProperties.dateValue) {
			oMatcher.setDateValue(oInnerControlProperties.dateValue);
			delete oInnerControlProperties.dateValue;
		}
		if (oInnerControlProperties.secondDateValue) {
			oMatcher.setSecondDateValue(oInnerControlProperties.secondDateValue);
			delete oInnerControlProperties.secondDateValue;
		}
		return FilterFieldAssertions.iShouldSeeTheFilterFieldWithInnerControl.call(this, oFilterFieldProperties, {
			controlType: sInnerControlType,
			properties: oInnerControlProperties,
			matchers: oMatcher
		});
	};

	Opa5.createPageObjects({
		onTheApp: {
			actions: {

			},
			assertions: {
				iShouldSeeFieldWithInnerControl: function(sId, sInnerControlType) {
					return FieldAssertions.iShouldSeeTheFieldWithInnerControl.call(this, sId, {
						controlType: sInnerControlType,
						success: function(aInnerControls) {
							Opa5.assert.ok(aInnerControls.length === 1, "Found inner Control '" + sInnerControlType + "' for Field with ID '" + sId + "'");
						},
						errorMessage: "Could not find inner Control '" + sInnerControlType + "' for Field with ID '" + sId + "'"
					});
				},
				iShouldSeeFieldWithValueState: function(sId, sValueState, sValueStateText) {
					return FieldAssertions.iShouldSeeTheField.call(this, {
						id: sId,
						valueState: sValueState,
						valueStateText: sValueStateText
					});
				},
				iShouldSeeFieldWithDatePickerProperties: function(oFieldProperties, oDatePickerProperties) {
					var oMatcher;
					if (oDatePickerProperties.dateValue) {
						oMatcher = new DateValue({
							dateValue: oDatePickerProperties.dateValue
						});
						delete oDatePickerProperties.dateValue;
					}
					return FieldAssertions.iShouldSeeTheFieldWithInnerControl.call(this, oFieldProperties, {
						controlType: "sap.m.DatePicker",
						properties: oDatePickerProperties,
						matchers: oMatcher
					});
				},
				iShouldSeeFieldWithFieldInputProperties: function(oFieldProperties, oFieldInputProperties) {
					return FieldAssertions.iShouldSeeTheFieldWithInnerControl.call(this, oFieldProperties, {
						controlType: "sap.ui.mdc.field.FieldInput",
						properties: oFieldInputProperties
					});
				},
				iShouldSeeFilterFieldWithInnerControl: function(oFilterFieldProperties, sInnerControlType) {
					return FilterFieldAssertions.iShouldSeeTheFilterFieldWithInnerControl.call(this, oFilterFieldProperties, {
						controlType: sInnerControlType,
						success: function(aInnerControls) {
							Opa5.assert.ok(aInnerControls.length === 1, "Found inner Control '" + sInnerControlType + "' for FilterField with properties " + JSON.stringify(oFilterFieldProperties));
						},
						errorMessage: "Could not find inner Control '" + sInnerControlType + "' for FilterField with properties " + JSON.stringify(oFilterFieldProperties)
					});
				},
				iShouldSeeFilterFieldWithDatePickerProperties: function(oFilterFieldProperties, oDatePickerProperties) {
					return iShouldSeeFilterFieldWithInnerControlProperties.call(this, oFilterFieldProperties, "sap.m.DatePicker", oDatePickerProperties);
				},
				iShouldSeeFilterFieldWithTimePickerProperties: function(oFilterFieldProperties, oTimePickerProperties) {
					return iShouldSeeFilterFieldWithInnerControlProperties.call(this, oFilterFieldProperties, "sap.m.TimePicker", oTimePickerProperties);
				},
				iShouldSeeFilterFieldWithDateTimePickerProperties: function(oFilterFieldProperties, oDateTimePickerProperties) {
					return iShouldSeeFilterFieldWithInnerControlProperties.call(this, oFilterFieldProperties, "sap.m.DateTimePicker", oDateTimePickerProperties);
				},
				iShouldSeeFilterFieldWithDateRangeSelectionProperties: function(oFilterFieldProperties, oDateRangeSelectionProperties) {
					return iShouldSeeFilterFieldWithInnerControlProperties.call(this, oFilterFieldProperties, "sap.m.DateRangeSelection", oDateRangeSelectionProperties);
				},
				iShouldSeeFilterFieldWithDynamicDateRangeProperties: function(oFilterFieldProperties, oDynamicDateRangeProperties) {
					return waitForFilterField.call(this, Utils.enhanceWaitFor(oFilterFieldProperties, {
						success: function(oFilterField) {
							this.waitFor({
								controlType: "sap.m.DynamicDateRange",
								matchers: new Ancestor(oFilterField),
								check: function(aInnerControls) {
									var aValues = fnConvertDatesToStrings(aInnerControls[0].getValue().values);
									return deepEqual(aValues, fnConvertDatesToStrings(oDynamicDateRangeProperties.value.values)) && aInnerControls[0].getValue().operator === oDynamicDateRangeProperties.value.operator;
								},
								success: function(aDynamicDateRanges) {
									Opa5.assert.ok(aDynamicDateRanges.length === 1, "sap.m.DynamicDateRange found with properties: " + JSON.stringify(oDynamicDateRangeProperties));
									this.waitFor({
										controlType: "sap.m.internal.DynamicDateRangeInput",
										properties: {
											value: oDynamicDateRangeProperties.innerControlValue
										},
										matchers: new Ancestor(aDynamicDateRanges[0]),
										success: function(aDynamicDateRangeInputs) {
											Opa5.assert.ok(aDynamicDateRangeInputs.length === 1, "sap.m.internal.DynamicDateRangeInput found with value: " +  oDynamicDateRangeProperties.innerControlValue);
										}
									});
								}
							});
						}
					}));
				}
			}
		}
	});
});