sap.ui.define(function() {

	"use strict";
	return {
		name: "TestSuite for Topic: Dom",
		defaults: {
			qunit: {
				version: 2
			},
			module: "test-resources/sap/ui/core/qunit/{name}.qunit"

		},
		tests: {
			isBehindOtherElement: {
				title: "sap.ui.dom.isBehindOtherElement",
				qunit: {
					reorder: false
				}
			}
		}
	};
});
