sap.ui.define(function () {
	"use strict";

	return {
		name: "QUnit test suite for Shop Administration Tool",
		defaults: {
			page: "ui5://test-resources/sap/ui/demo/toolpageapp/Test.qunit.html?testsuite={suite}&test={name}",
			qunit: {
				version: 2
			},
			sinon: {
				version: 1
			},
			ui5: {
				theme: "sap_horizon"
			},
			loader: {
				paths: {
					"sap/ui/demo/toolpageapp": "../"
				}
			}
		},
		tests: {
			"unit/unitTests": {
				title: "Unit tests for Shop Administration Tool"
			},
			"integration/opaTests": {
				title: "Integration tests for Shop Administration Tool"
			}
		}
	};
});