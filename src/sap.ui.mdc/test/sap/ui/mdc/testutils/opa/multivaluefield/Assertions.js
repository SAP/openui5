/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/matchers/Matcher",
	"sap/ui/test/matchers/Ancestor",
	"sap/base/util/deepEqual",
	"./waitForMultiValueField",
	"../Utils",
	"sap/ui/mdc/enums/FieldEditMode",
	"../matchers/DOMRef"
], function(
	Opa5,
	Matcher,
	Ancestor,
	deepEqual,
	waitForMultiValueField,
	Utils,
	FieldEditMode,
	DOMRef
) {
	"use strict";

	var aDatePickerControls = [
		"sap.m.DatePicker",
		"sap.m.TimePicker",
		"sap.m.DateTimePicker"
	];

	return {

		iShouldSeeTheMultiValueField: function(vIdentifier, sValue) {
			return waitForMultiValueField.call(this, Utils.enhanceWaitFor(vIdentifier, {
				success: function (oField) {
					if (sValue) {
						var oContent = oField.getCurrentContent()[0];
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
		iShouldSeeConditions: function(vIdentifier, aConditions) {
			return waitForMultiValueField.call(this, Utils.enhanceWaitFor(vIdentifier, {
				success: function (oMultiValueField) {
					Opa5.assert.equal(JSON.stringify(oMultiValueField.getConditions()), JSON.stringify(aConditions), "Control holds correct conditions");
				},
				errorMessage: "The MultiValueField stores the unexpected value"
			}));
		},
		iShouldSeeTheKeys: function(vIdentifier, aKeys) {
			return waitForMultiValueField.call(this, Utils.enhanceWaitFor(vIdentifier, {
				success: function (oMultiValueField) {
					oMultiValueField.getItems().forEach(function(oItem, iIndex) {
						Opa5.assert.equal(oItem.getKey(), aKeys[iIndex], "Item has correct key");
					});
				},
				errorMessage: "The MultiValueField stores the unexpected value"
			}));
		}
    };
});
