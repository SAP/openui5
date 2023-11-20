sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/Device"
], function(merge, Device) {
	"use strict";

	var oTests = {
		"inspector/ControlAPI": {
			title: "QUnit Page for sap.ui.testrecorder.inspector.ControlAPI",
			module: "./inspector/ControlAPI.qunit"
		},
		"inspector/ControlInspector": {
			title: "QUnit Page for sap.ui.testrecorder.inspector.ControlInspector",
			module: "./inspector/ControlInspector.qunit"
		},
		"inspector/ControlInspectorRepo": {
			title: "QUnit Page for sap.ui.testrecorder.inspector.ControlInspectorRepo",
			module: "./inspector/ControlInspectorRepo.qunit"
		},
		"controlSelectors/ControlSelectorGenerator": {
			title: "QUnit Page for sap.ui.testrecorder.controlSelectors.ControlSelectorGenerator",
			module: "./controlSelectors/ControlSelectorGenerator.qunit"
		},
		"codeSnippets/POMethodUtil": {
			title: "QUnit Page for sap.ui.testrecorder.codeSnippets.POMethodUtil",
			module: "./codeSnippets/POMethodUtil.qunit"
		},
		"codeSnippets/CodeSnippetProvider": {
			title: "QUnit Page for sap.ui.testrecorder.codeSnippets.CodeSnippetProvider",
			module: "./codeSnippets/CodeSnippetProvider.qunit"
		},
		"Generic Testsuite": {
			page: "test-resources/sap/ui/testrecorder/qunit/testsuite.generic.qunit.html"
		}
	};

	var oTestSuite = {
		name: "TestSuite for sap.ui.core: GTP testcase CORE/TEST RECORDER",
		defaults: {
			loader: {
					map: {
						"*": {
							// override sinon with sinon-4 for code that depends on OPA (which has a hard dependency to sinon)
							"sap/ui/thirdparty/sinon": "sap/ui/thirdparty/sinon-4",
							"sap/ui/thirdparty/sinon-qunit": "sap/ui/qunit/sinon-qunit-bridge"
						}
					}
			},
			qunit: {
				noglobals: false
			},
			sinon: {
				version: 4,
				qunitBridge: true
			},
			ui5: {
				animation: false
			},
			autostart: true
		},
		tests: {
			"integration/opaTests": {
				module: "./integration/opaTests.qunit",
				title: "QUnit Page for sap.ui.testrecorder OPA tests",
				loader: {
					paths: {
						"sap/ui/testrecorder/qunit/integration": "test-resources/sap/ui/testrecorder/qunit/integration",
						"sap/ui/testrecorder/recorderMock": "test-resources/sap/ui/testrecorder/recorderMock",
						"sap/ui/testrecorder/appMock": "test-resources/sap/ui/testrecorder/appMock",
						"sap/ui/testrecorder/fixture": "test-resources/sap/ui/testrecorder/fixture"
					}
				},
				qunit: {
					// ignore global variables introduced by recorder communication
					noglobals: false
				},
				autostart: false
			}
		}
	};

	Object.keys(oTests).forEach(function (name) {
		oTestSuite.tests[name + "1"] = merge({}, oTests[name], {qunit: { version: 1 }});
		oTestSuite.tests[name + "2"] = merge({}, oTests[name], {qunit: { version: 2 }});

		if (oTestSuite.tests[name + "2"].title) {
			oTestSuite.tests[name + "2"].title += " (QUnit 2)";
		}
	});

	return oTestSuite;
});
