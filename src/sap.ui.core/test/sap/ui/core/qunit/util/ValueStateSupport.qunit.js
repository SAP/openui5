/*global QUnit */

sap.ui.define([
	"sap/m/CheckBox",
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"sap/ui/core/ValueStateSupport"
], function (CheckBox, Library, coreLibrary, ValueStateSupport) {
	"use strict";

	var element, errorText, warningText, successText;

	QUnit.test("Element Creation", function(assert) {
		element = new CheckBox(); // dependency to commons lib, but a control with valueState is required
		assert.ok(element, "element must have been created");
	});


	QUnit.test("Value State texts", function(assert) {
		var rb = Library.getResourceBundleFor("sap.ui.core");
		errorText = rb.getText("VALUE_STATE_ERROR");
		warningText = rb.getText("VALUE_STATE_WARNING");
		successText = rb.getText("VALUE_STATE_SUCCESS");

		assert.ok(errorText.length > 4, "There should be some error text available");
		assert.ok(warningText.length > 4, "There should be some warning text available");
		assert.ok(successText.length > 4, "There should be some success text available");
	});


	QUnit.test("getAdditionalText() with sap.ui.core.Element", function(assert) {
		var result = ValueStateSupport.getAdditionalText(element);
		assert.equal(result, null, "text should not be returned when there is no special state");

		// null
		result = ValueStateSupport.getAdditionalText(null);
		assert.equal(result, null, "text should not be returned when there is no special state");

		// error
		element.setValueState(coreLibrary.ValueState.Error);
		result = ValueStateSupport.getAdditionalText(element);
		assert.equal(result, errorText, "text should be the error text when there is the error state");

		// warning
		element.setValueState(coreLibrary.ValueState.Warning);
		result = ValueStateSupport.getAdditionalText(element);
		assert.equal(result, warningText, "text should be the warning text when there is the warning state");

		// success
		element.setValueState(coreLibrary.ValueState.Success);
		result = ValueStateSupport.getAdditionalText(element);
		assert.equal(result, successText, "text should be the success text when there is the success state");

		// none
		element.setValueState(coreLibrary.ValueState.None);
		result = ValueStateSupport.getAdditionalText(element);
		assert.equal(result, null, "text should not be returned when there is no special state");
	});


	QUnit.test("getAdditionalText() with sap.ui.core.ValueState", function(assert) {
		var result = ValueStateSupport.getAdditionalText("Hello");
		assert.equal(result, null, "text should not be returned when there is no special state");

		// error
		result = ValueStateSupport.getAdditionalText(coreLibrary.ValueState.Error);
		assert.equal(result, errorText, "text should be the error text when there is the error state");

		// warning
		result = ValueStateSupport.getAdditionalText(coreLibrary.ValueState.Warning);
		assert.equal(result, warningText, "text should be the warning text when there is the warning state");

		// success
		result = ValueStateSupport.getAdditionalText(coreLibrary.ValueState.Success);
		assert.equal(result, successText, "text should be the success text when there is the success state");

		// none
		result = ValueStateSupport.getAdditionalText(coreLibrary.ValueState.None);
		assert.equal(result, null, "text should not be returned when there is no special state");
	});


	QUnit.test("With tooltip", function(assert) {
		element.setValueState(coreLibrary.ValueState.None);
		var result = ValueStateSupport.enrichTooltip(element, "test");
		assert.equal(result, "test", "tooltip should remain unchanged when there is no special state");

		// error
		element.setValueState(coreLibrary.ValueState.Error);
		result = ValueStateSupport.enrichTooltip(element, "test");
		assert.equal(result, "test - " + errorText, "tooltip should have the error text when there is the error state");

		// warning
		element.setValueState(coreLibrary.ValueState.Warning);
		result = ValueStateSupport.enrichTooltip(element, "test");
		assert.equal(result, "test - " + warningText, "tooltip should have the warning text when there is the warning state");

		// success
		element.setValueState(coreLibrary.ValueState.Success);
		result = ValueStateSupport.enrichTooltip(element, "test");
		assert.equal(result, "test - " + successText, "tooltip should have the success text when there is the success state");

		// none
		element.setValueState(coreLibrary.ValueState.None);
		result = ValueStateSupport.enrichTooltip(element, "test");
		assert.equal(result, "test", "tooltip should remain unchanged when there is no special state");
	});


	QUnit.test("With no tooltip", function(assert) {
		var result = ValueStateSupport.enrichTooltip(element, null);
		assert.equal(result, null, "tooltip should remain empty when there is no special state");

		// error
		element.setValueState(coreLibrary.ValueState.Error);
		result = ValueStateSupport.enrichTooltip(element, null);
		assert.equal(result, errorText, "tooltip should be the error text when there is the error state");

		// warning
		element.setValueState(coreLibrary.ValueState.Warning);
		result = ValueStateSupport.enrichTooltip(element, null);
		assert.equal(result, warningText, "tooltip should be the warning text when there is the warning state");

		// success
		element.setValueState(coreLibrary.ValueState.Success);
		result = ValueStateSupport.enrichTooltip(element, null);
		assert.equal(result, successText, "tooltip should be the success text when there is the success state");

		// none
		element.setValueState(coreLibrary.ValueState.None);
		result = ValueStateSupport.enrichTooltip(element, null);
		assert.equal(result, null, "tooltip should remain empty when there is no special state");
	});
});