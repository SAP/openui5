sap.ui.define(function() {

	"use strict";

	return {
		name: "TestSuite for sap.ui.core.webc",
		defaults: {
			qunit: {
				version: 2
			},
			sinon: {
				version: 4
			},
			module: "test-resources/sap/ui/core/qunit/webc/{name}.qunit"
		},
		tests: {
			WebComponent: {
				title: "sap.ui.core.webc.WebComponent"
			}
		}
	};
});
