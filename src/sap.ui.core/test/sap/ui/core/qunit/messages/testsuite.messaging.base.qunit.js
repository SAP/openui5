sap.ui.define(function() {

	"use strict";
	return {
		name: "TestSuite for Topic: Messaging Base",
		defaults: {
			qunit: {
				version: 2
			}
		},
		tests: {
			messagesDataBinding: {
				title: "Messaging: DataBinding Messages"
			},
			Message: {
				title: "Messaging: sap.ui.core.message.Message"
			},
			MessageManager: {
				title: "Messaging: sap.ui.core.message.MessageManager"
			},
			messagesGeneral: {
				title: "Messaging: General",
				ui5: {
					libs: "sap.m,sap.ui.layout",
					language: "en",
					"xx-handleValidation": true
				}
			},
			messagesUsage: {
				title: "Messaging: Usage",
				loader: {
					paths: {
						"components": "test-resources/sap/ui/core/qunit/messages/components"
					}
				},
				ui5: {
					// test checks for hard coded English texts
					language: "en"
				}
			},
			messagesEnd2End: {
				title: "Messaging: End2End"
			}
		}
	};
});
