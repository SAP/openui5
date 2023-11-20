sap.ui.define(function() {
	"use strict";
	return {
		name: "QUnit TestSuite for sap.ui.webc.common",
		defaults: {
			group: "Default",
			qunit: {
				version: "edge"
			},
			sinon: {
				version: 4
			},
			ui5: {
				language: "en"
			},
			autostart: true
		},
		tests: {
			"Generic Testsuite": {
				page: "test-resources/sap/ui/webc/common/qunit/testsuite.generic.qunit.html"
			}
		}
	};
});