sap.ui.define([
	"sap/ui/Device"
], function(Device) {
	"use strict";

	const oTestSuite = {
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
				// ignore global variables introduced by recorder communication
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
			"inspector/ControlAPI": {
				title: "QUnit Page for sap.ui.testrecorder.inspector.ControlAPI"
			},
			"inspector/ControlInspector": {
				title: "QUnit Page for sap.ui.testrecorder.inspector.ControlInspector"
			},
			"inspector/ControlInspectorRepo": {
				title: "QUnit Page for sap.ui.testrecorder.inspector.ControlInspectorRepo"
			},
			"controlSelectors/ControlSelectorGenerator": {
				title: "QUnit Page for sap.ui.testrecorder.controlSelectors.ControlSelectorGenerator"
			},
			"codeSnippets/POMethodUtil": {
				title: "QUnit Page for sap.ui.testrecorder.codeSnippets.POMethodUtil"
			},
			"codeSnippets/CodeSnippetProvider": {
				title: "QUnit Page for sap.ui.testrecorder.codeSnippets.CodeSnippetProvider"
			},
			"integration/opaTests": {
				title: "QUnit Page for sap.ui.testrecorder OPA tests",
				loader: {
					paths: {
						"sap/ui/testrecorder/qunit/integration": "test-resources/sap/ui/testrecorder/qunit/integration",
						"sap/ui/testrecorder/recorderMock": "test-resources/sap/ui/testrecorder/recorderMock",
						"sap/ui/testrecorder/appMock": "test-resources/sap/ui/testrecorder/appMock",
						"sap/ui/testrecorder/fixture": "test-resources/sap/ui/testrecorder/fixture"
					}
				}
			},
			"Generic Testsuite": {
				page: "test-resources/sap/ui/testrecorder/qunit/testsuite.generic.qunit.html"
			}
		}
	};

	return oTestSuite;
});
