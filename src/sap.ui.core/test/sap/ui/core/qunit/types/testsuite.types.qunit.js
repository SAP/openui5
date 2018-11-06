sap.ui.define(function () {

	"use strict";
	return {
		name: "TestSuite for DataType and Formatter",
		defaults: {
			qunit: {
				version: 1
			},
			sinon: {
				version: 4,
				qunitBridge: true
			},
			ui5: {
				originInfo: true,
				language: "en-US"
			}
		},
		tests: {
			AlternativeTypes: {
				title: "QUnit Page for AlternativeTypes",
				beforeBootstrap: "./beforeBootstrap",
				loader: {
					paths: {
						"sap/ui/testlib": "test-resources/sap/ui/core/qunit/testdata/uilib/"
					}
				}
			},
			DataType: {
				title: "QUnit Page for sap/ui/base/DataType"
			},
			DateFormat: {
				title: "QUnit Page for sap/ui/core/format/DateFormat"
			},
			ListFormat: {
				title: "QUnit Page for sap/ui/core/format/ListFormat"
			},
			NumberFormat: {
				title: "QUnit Page for sap/ui/core/format/NumberFormat"
			},
			FileSizeFormat: {
				title: "QUnit Page for sap/ui/core/format/FileSizeFormat"
			},
			Types: {
				title: "QUnit Page for sap/ui/model/type/*"
			},
			ValidationHooks: {
				title: "QUnit Page for ValidationHooks",
				beforeBootstrap: "./beforeBootstrap",
				ui5: {
					libs: "sap.ui.commons"
				}
			}
		}
	};
});
