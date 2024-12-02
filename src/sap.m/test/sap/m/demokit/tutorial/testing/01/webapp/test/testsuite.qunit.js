sap.ui.define(() => {
	"use strict";

	return {
		name: "QUnit test suite for Bulletin Board",
		defaults: {
			page: "ui5://test-resources/sap/ui/demo/bulletinboard/Test.qunit.html?testsuite={suite}&test={name}",
			qunit: {
				version: 2
			},
			sinon: {
				version: 1
			},
			ui5: {
				theme: "sap_horizon"
			},
			coverage: {
				only: "sap/ui/demo/bulletinboard/",
				never: [
					"sap/ui/demo/bulletinboard/test/",
					"sap/ui/demo/bulletinboard/localService/"
				]
			},
			loader: {
				paths: {
					"sap/ui/demo/bulletinboard": "../"
				}
			}
		},
		tests: {
			"unit/unitTests": {
				title: "Unit tests for Bulletin Board"
			},
			"integration/opaTests": {
				title: "Integration tests for Bulletin Board"
			}
		}
	};
});
