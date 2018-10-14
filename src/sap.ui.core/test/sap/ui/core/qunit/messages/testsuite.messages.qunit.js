sap.ui.define(function() {
	"use strict";

	return {
		name: "TestSuite for sap.ui.core: GTP testcase CORE/MESSAGES",
		defaults: {
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
			DataBindingMessages: {
				title: "Test Page for DataBinding Messages"
			},
			"Message": {
				title: "QUnit tests: Messaging"
			},
			"messagesGeneral": {
				ui5: {
					libs: "sap.m,sap.ui.layout",
					language: "en",
					"xx-handleValidation": true
				}
			},
			"messagesUsage": {
				title: "QUnit tests: Messaging",
				loader: {
					paths: {
						"components": "test-resources/sap/ui/core/qunit/messages/components"
					}
				},
				ui5: {
					// test checks for hard coded English texts
					language: "en"
				}
			}
		}
	};
});
