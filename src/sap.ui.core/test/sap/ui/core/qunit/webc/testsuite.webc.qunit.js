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
			loader:{
				paths:{
					"webc": "test-resources/sap/ui/core/qunit/webc/"
				}
			},
			module: "test-resources/sap/ui/core/qunit/webc/{name}.qunit"
		},
		tests: {
			WebComponent: {
				title: "sap.ui.core.webc.WebComponent",
				coverage: {
					only: ["sap/ui/core/webc"]
				}
			}
		}
	};
});
