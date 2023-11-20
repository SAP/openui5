sap.ui.define(function() {

	"use strict";
	return {
		name: "TestSuite for sap.ui.core.service: Service Injection",
		defaults: {
			loader: {
				paths: {
					"samples/components": "test-resources/sap/ui/core/samples/components/"
				}
			},
			qunit: {
				version: 2
			},
			sinon: {
				version: 4,
				qunitBridge: true,
				useFakeTimers: false
			}
		},
		tests: {
			"Service": {
				title: "QUnit test: Service Injection",
				ui5: {
					libs: "sap.m",
					language: "en"
				}
			},
			"Service_unavoidablySync": {
				title: "QUnit test: Service Injection (sync)",
				ui5: {
					libs: "sap.m",
					language: "en"
				}
			}
		}
	};
});
