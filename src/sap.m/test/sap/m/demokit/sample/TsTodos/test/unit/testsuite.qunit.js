sap.ui.define(function () {
	"use strict";

	return {
		name: "QUnit test suite for TSTodos",
		defaults: {
			page: "ui5://test-resources/sap/m/sample/TsTodos/Test.qunit.html?testsuite={suite}&test={name}",
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
					"sap/m/sample/TsTodos":"../../webapp"
				}
			}
		},
		tests: {
			"unitTests": {
				title: "Unit tests for Todo App"
			}
		}
	};
});