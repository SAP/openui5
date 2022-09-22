/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Matcher",
	"sap/ui/test/matchers/Ancestor",
	"sap/base/util/deepEqual",
	"./waitForField",
	"../Utils",
	"sap/ui/mdc/enum/EditMode",
	"../matchers/DOMRef"
], function(
	Opa5,
	Matcher,
	Ancestor,
	deepEqual,
	waitForField,
	Utils,
	EditMode,
	DOMRef
) {
	"use strict";

	var aDatePickerControls = [
		"sap.m.DatePicker",
		"sap.m.TimePicker",
		"sap.m.DateTimePicker"
	];

	return {

		iShouldSeeTheField: function(vIdentifier, sValue) {
			return waitForField.call(this, Utils.enhanceWaitFor(vIdentifier, {
				success: function (oField) {
					if (sValue) {
						var oContent = oField._getContent()[0];
						var sControlType = oContent.getMetadata().getName();
						var bIsDatePicker = aDatePickerControls.includes(sControlType);

						this.waitFor({
							controlType: sControlType,
							properties: !bIsDatePicker && Utils.removeUndefinedValues({
								value: sControlType === "sap.ui.mdc.field.FieldInput" ? sValue : undefined,
								text: (sControlType === "sap.m.Text" || sControlType === "sap.m.Link") ? sValue : undefined
							}),
							matchers: bIsDatePicker ? [ new Ancestor(oField) ].concat(new DOMRef({
								elementType: "input",
								attributes: {
									value: sValue
								}
							})) : new Ancestor(oField),
							success: function(aInnerControls) {
								Opa5.assert.equal(aInnerControls.length, 1, "Found expected value for the given sap.ui.mdc.Field");
							}
						});
					}
				},
				errorMessage: "The field stores the unexpected value"
			}));
		},
		iShouldSeeTheFieldWithInnerControl: function(vIdentifier, oConfig) {
			return waitForField.call(this, Utils.enhanceWaitFor(vIdentifier, {
				success: function(oField) {
					this.waitFor(Object.assign({
						success: function(aInnerControls) {
							Opa5.assert.ok(aInnerControls.length === 1, "Found inner Control for Field with identifier '" + JSON.stringify(vIdentifier) + "'");
						},
						errorMessage: "Could not find inner Control for Field with identifier '" + JSON.stringify(vIdentifier) + "'"
					}, oConfig, {
						matchers: oConfig.matchers ? [].concat(oConfig.matchers, new Ancestor(oField)) : new Ancestor(oField)
					}));
				}
			}));
		}
    };
});

