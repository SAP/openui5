sap.ui.define(function() {

	"use strict";
	return {
		name: "TestSuite for sap.ui.core.service: Service Injection",
		defaults: {
			qunit: {
				version: 2
			},
			loader: {
				paths: {
					"samples/components": "test-resources/sap/ui/core/samples/components/"
				}
			}
		},
		tests: {
			"Service": {
				title: "QUnit test: Service Injection",
				ui5: {
					libs: "sap.m",
					language: "en"
				},
				sinon: {
					version: 1,
					qunitBridge: true,
					useFakeTimers: false
				}
			}
		}
	};
});
