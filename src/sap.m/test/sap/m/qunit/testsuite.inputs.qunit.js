sap.ui.define([
	"sap/ui/Device",
	"./testsuite.mobile.qunit"
], function(Device, ConfigMobile) {
	"use strict";

	var oConfig = {
		name: "QUnit TestSuite for sap.m input controls",
		defaults: ConfigMobile.defaults,
		tests: {}
	};
	var aTestsToExecute = [
		"ComboBox",
		"DatePicker",
		"DateRangeSelection",
		"DateTimeField",
		"DateTimeInput",
		"DateTimePicker",
		"FeedInput",
		"Input",
		"InputBase",
		"MaskInput",
		"MultiComboBox",
		"MultiInput",
		"StepInput",
		"SuggestionsPopover",
		"TextArea",
		"TimePicker",
		"Token",
		"Tokenizer",
		"ValueStateMessage"
	];
	var oInputUtilTests = {
		"inputUtils/highlightDOMElements": {
			title: "QUnit Page for sap.m.inputs.highlightDOMElements",
			ui5: {
				compatVersion: "1.81"
			},
			qunit: {
				version: 2
			}
		},
		"inputUtils/highlightItemsWithContains": {
			title: "QUnit Page for sap.m.inputs.highlightItemsWithContains",
			ui5: {
				compatVersion: "1.120"
			},
			qunit: {
				version: 2
			}
		},
		"inputUtils/wordStartsWithValue": {
			title: "QUnit Page for sap.m.inputs.wordStartsWithValue",
			ui5: {
				compatVersion: "1.81"
			},
			qunit: {
				version: 2
			}
		},
		"inputUtils/completeTextSelected": {
			title: "QUnit Page for sap.m.inputs.completeTextSelected",
			ui5: {
				compatVersion: "1.83"
			},
			qunit: {
				version: 2
			}
		},
		"inputUtils/scrollToItem": {
			title: "QUnit Page for sap.m.inputs.scrollToItem",
			ui5: {
				compatVersion: "1.84"
			},
			qunit: {
				version: 2
			}
		},
		"inputUtils/selectionRange": {
			title: "QUnit Page for sap.m.inputs.selectionRange",
			ui5: {
				compatVersion: "1.88"
			},
			qunit: {
				version: 2
			}
		},
		"inputUtils/calculateSelectionStart": {
			title: "QUnit Page for sap.m.inputs.calculateSelectionStart",
			ui5: {
				compatVersion: "1.88"
			},
			qunit: {
				version: 2
			}
		}
	};

	aTestsToExecute.forEach(function (sTest) {
		oConfig.tests[sTest] = ConfigMobile.tests[sTest];
	});

	for (var test in oInputUtilTests) {
		oConfig.tests[test] = oInputUtilTests[test];
	}

	return oConfig;
});
