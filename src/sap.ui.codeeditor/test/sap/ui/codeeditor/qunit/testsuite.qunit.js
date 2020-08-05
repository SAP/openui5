sap.ui.define(function() {
	"use strict";

	return {
		name: "QUnit TestSuite for sap.ui.codeeditor",
		defaults: {
			group: "Default",
			qunit: {
				version: "edge"
			},
			sinon: {
				version: 1
			},
			ui5: {
				language: "en",
				rtl: false,
				libs: ["sap.ui.codeeditor", "sap.m"],
				"xx-waitForTheme": true
			},
			coverage: {
				only: ["sap/ui/codeeditor"]
			},
			page: "test-resources/sap/ui/codeeditor/qunit/testsandbox.qunit.html?test={name}",
			autostart: true
		},
		tests: {
			"CodeEditor": {
				coverage: {
					only: ["sap/ui/codeeditor/CodeEditor"]
				}
			}
		}
	};
});