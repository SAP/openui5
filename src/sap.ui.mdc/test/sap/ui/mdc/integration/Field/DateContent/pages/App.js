/*!
 * ${copyright}
 */
sap.ui.require([
	"sap/ui/test/Opa5",
    "sap/ui/test/matchers/Ancestor",
    "testutils/opa/filterfield/waitForFilterField",
    "testutils/opa/field/waitForField",
    "sap/base/util/deepEqual"
], function(Opa5, Ancestor, waitForFilterField, waitForField, deepEqual) {
    "use strict";

    var fnCheckDateValues = function(oFilterFieldDate, oInnerControlDate) {
        return oFilterFieldDate.toString() === oInnerControlDate.toString();
    };

    var fnConvertDatesToStrings = function(aDates) {
        return aDates.map(function(oDate) {
            return oDate.toString();
        });
    };

    var iShouldSeeControlWithInnerControlProperties = function(oParentControl, sInnerControlType, oInnerControlProperties) {
        var oWaitFor = {
            controlType: sInnerControlType,
            matchers: new Ancestor(oParentControl),
            properties: {
                value: oInnerControlProperties.value
            },
            check: function(aInnerControls) {
                var oDateValue = aInnerControls[0].getDateValue();
                var bCheck = false;

                if (oInnerControlProperties.dateValue && oInnerControlProperties.secondDateValue) {
                    var oSecondDateValue = aInnerControls[0].getSecondDateValue();
                    bCheck = fnCheckDateValues(oDateValue, oInnerControlProperties.dateValue) && fnCheckDateValues(oSecondDateValue, oInnerControlProperties.secondDateValue);
                }

                if (oInnerControlProperties.dateValue) {
                    bCheck = fnCheckDateValues(oDateValue, oInnerControlProperties.dateValue);
                }
                return bCheck;
            },
            success: function(aInnerControls) {
                Opa5.assert.ok(aInnerControls.length === 1, sInnerControlType + " found with properties: " + JSON.stringify(oInnerControlProperties));
            }
        };

        // In Case of DynamicDateRange value is an object containing operator and values information
        // We also want to check the inner controls value
        if (sInnerControlType === "sap.m.DynamicDateRange") {
            delete oWaitFor.properties;
            oWaitFor.check = function(aInnerControls) {
                var aValues = fnConvertDatesToStrings(aInnerControls[0].getValue().values);
                return deepEqual(aValues, fnConvertDatesToStrings(oInnerControlProperties.value.values)) && aInnerControls[0].getValue().operator === oInnerControlProperties.value.operator;
            };
            oWaitFor.success = function(aDynamicDateRanges) {
                Opa5.assert.ok(aDynamicDateRanges.length === 1, sInnerControlType + " found with properties: " + JSON.stringify(oInnerControlProperties));
                this.waitFor({
                    controlType: "sap.m.internal.DynamicDateRangeInput",
                    properties: {
                        value: oInnerControlProperties.innerControlValue
                    },
                    matchers: new Ancestor(aDynamicDateRanges[0]),
                    success: function(aDynamicDateRangeInputs) {
                        Opa5.assert.ok(aDynamicDateRangeInputs.length === 1, "sap.m.internal.DynamicDateRangeInput found with value: " +  oInnerControlProperties.innerControlValue);
                    }
                });
            };
        }

        this.waitFor(oWaitFor);
    };

    var iShouldSeeFilterFieldWithInnerControlProperties = function(oFilterFieldProperties, sInnerControlType, oInnerControlProperties) {
        return waitForFilterField.call(this, {
            properties: oFilterFieldProperties,
            success: function(oFilterField) {
                iShouldSeeControlWithInnerControlProperties.call(this, oFilterField, sInnerControlType, oInnerControlProperties);
            }
        });
    };

    var iShouldSeeFieldWithInnerControlProperties = function(oFieldProperties, sInnerControlType, oInnerControlProperties) {
        return waitForField.call(this, {
            properties: oFieldProperties,
            success: function(oField) {
                iShouldSeeControlWithInnerControlProperties.call(this, oField, sInnerControlType, oInnerControlProperties);
            }
        });
    };

    Opa5.createPageObjects({
		onTheApp: {
			actions: {

            },
            assertions: {
                iShouldSeeFieldWithInnerControl: function(sId, sInnerControlType) {
                    return waitForField.call(this, {
                        properties: {
                            id: sId
                        },
                        success: function(oField) {
                            this.waitFor({
                                controlType: sInnerControlType,
                                matchers: new Ancestor(oField),
                                success: function(aInnerControls) {
                                    Opa5.assert.ok(aInnerControls.length === 1, "Found inner Control '" + sInnerControlType + "' for Field with ID '" + sId + "'");
                                },
                                errorMessage: "Could not find inner Control '" + sInnerControlType + "' for Field with ID '" + sId + "'"
                            });
                        }
                    });
                },
                iShouldSeeFieldWithValueState: function(sId, sValueState, sValueStateText) {
                    return waitForField.call(this, {
                        properties: {
                            id: sId,
                            valueState: sValueState,
                            valueStateText: sValueStateText
                        }
                    });
                },
                iShouldSeeFieldWithDatePickerProperties: function(oFieldProperties, oDatePickerProperties) {
                    return iShouldSeeFieldWithInnerControlProperties.call(this, oFieldProperties, "sap.m.DatePicker", oDatePickerProperties);
                },
                iShouldSeeFilterFieldWithInnerControl: function(oFilterFieldProperties, sInnerControlType) {
                    return waitForFilterField.call(this, {
                        properties: oFilterFieldProperties,
                        success: function(oFilterField) {
                            this.waitFor({
                                controlType: sInnerControlType,
                                matchers: new Ancestor(oFilterField),
                                success: function(aInnerControls) {
                                    Opa5.assert.ok(aInnerControls.length === 1, "Found inner Control '" + sInnerControlType + "' for FilterField with properties " + JSON.stringify(oFilterFieldProperties));
                                },
                                errorMessage: "Could not find inner Control '" + sInnerControlType + "' for FilterField with properties " + JSON.stringify(oFilterFieldProperties)
                            });
                        }
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
                    return iShouldSeeFilterFieldWithInnerControlProperties.call(this, oFilterFieldProperties, "sap.m.DynamicDateRange", oDynamicDateRangeProperties);
                },
                iShouldSeeFilterFieldWithTokenizer: function(oFilterFieldProperties, aTokenizerTexts) {
                    return waitForFilterField.call(this, {
                        properties: oFilterFieldProperties,
                        success: function(oFilterField) {
                            this.waitFor({
                                controlType: "sap.ui.mdc.field.FieldMultiInput",
                                matchers: new Ancestor(oFilterField),
                                success: function(aFieldMultiInputs) {
                                    Opa5.assert.equal(aFieldMultiInputs.length, 1, "Found inner 'sap.ui.mdc.field.FieldMultiInput' control");
                                    var aTokenControls = [];
                                    this.waitFor({
                                        controlType: "sap.m.Tokenizer",
                                        matchers: new Ancestor(aFieldMultiInputs[0]),
                                        success: function(aTokenizers) {
                                            Opa5.assert.equal(aTokenizers.length, 1, "Found inner 'sap.m.Tokenizer' control");
                                            this.waitFor({
                                                controlType: "sap.m.Token",
                                                matchers: new Ancestor(aTokenizers[0]),
                                                check: function(aTokens) {
                                                    return aTokens.filter(function(oToken) {
                                                        if (aTokenizerTexts.includes(oToken.getText())) {
                                                            aTokenControls.push(oToken);
                                                            return true;
                                                        }
                                                        return false;
                                                    });
                                                },
                                                success: function(aTokens) {
                                                    Opa5.assert.equal(aTokenControls.length, aTokenizerTexts.length, "Found correct amount of 'sap.m.Token' controls with given texts");
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            }
        }
    });
});