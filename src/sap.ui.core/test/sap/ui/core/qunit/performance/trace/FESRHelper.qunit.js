/*global QUnit*/
sap.ui.define([
	'sap/ui/performance/trace/FESRHelper',
	'sap/ui/core/Element'
], function(FESRHelper, Element) {
	"use strict";

	QUnit.module("FESRHelper API");

	QUnit.test("setSemanticStepname", function(assert) {
		assert.expect(4);
		var oExpectedResult = {};

		// Test on Element without existing custom data
		var oElement = new Element();
		FESRHelper.setSemanticStepname(oElement, "Event1", "SemanticStepName1");
		oExpectedResult[FESRHelper.FESR_NAMESPACE] = {
			"Event1": "SemanticStepName1"
		};
		assert.deepEqual(oElement.data("sap-ui-custom-settings"), oExpectedResult, "Correct semantic annotation available on element");

		FESRHelper.setSemanticStepname(oElement, "Event2", "SemanticStepName2");
		oExpectedResult[FESRHelper.FESR_NAMESPACE] = {
			"Event1": "SemanticStepName1",
			"Event2": "SemanticStepName2"
		};
		assert.deepEqual(oElement.data("sap-ui-custom-settings"), oExpectedResult, "Correct semantic annotation available on element");

		// Test for Element with existing custom data 'sap-ui-custom-settings'
		oElement = new Element();
		oExpectedResult =  {
			"someOtherSettings": "settingsValue"
		};
		oElement.data("sap-ui-custom-settings", oExpectedResult);
		FESRHelper.setSemanticStepname(oElement, "Event3", "SemanticStepName3");
		oExpectedResult[FESRHelper.FESR_NAMESPACE] = {
			"Event3": "SemanticStepName3"
		};
		assert.deepEqual(oElement.data("sap-ui-custom-settings"), oExpectedResult, "Correct semantic annotation available on element");

		FESRHelper.setSemanticStepname(oElement, "Event4", "SemanticStepName4");
		oExpectedResult[FESRHelper.FESR_NAMESPACE] = {
			"Event3": "SemanticStepName3",
			"Event4": "SemanticStepName4"
		};
		assert.deepEqual(oElement.data("sap-ui-custom-settings"), oExpectedResult, "Correct semantic annotation available on element");
	});

	QUnit.test("getSemanticStepname", function(assert) {
		assert.expect(2);
		var oElement = new Element(),
			oCustomData = {};

		oCustomData[FESRHelper.FESR_NAMESPACE] = {
			"Event1": "SemanticStepName1",
			"Event2": "SemanticStepName2"
		};
		oElement.data("sap-ui-custom-settings", oCustomData);

		assert.strictEqual(FESRHelper.getSemanticStepname(oElement, "Event1"), "SemanticStepName1", "Correct semantic annotation for 'Event1' available on element");
		assert.strictEqual(FESRHelper.getSemanticStepname(oElement, "Event2"), "SemanticStepName2", "Correct semantic annotation for 'Event2'  available on element");
	});
});
