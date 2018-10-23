sap.ui.define(function () {

	"use strict";
	return {
		name: "TestSuite for DataType and Formatter",
		defaults: {
			qunit: {
				version: 1
			},
			sinon: {
				version: 1,
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
			},
			Boolean: {
				page: "test-resources/sap/ui/core/qunit/odata/type/Boolean.qunit.html",
				title: "QUnit Page for sap/ui/model/odata/type/Boolean"
			},
			Date: {
				page: "test-resources/sap/ui/core/qunit/odata/type/Date.qunit.html",
				title: "QUnit Page for sap/ui/model/odata/type/Date"
			},
			DateTimeBase: {
				page: "test-resources/sap/ui/core/qunit/odata/type/DateTimeBase.qunit.html",
				title: "QUnit Page for sap/ui/model/odata/type/DateTimeBase"
			},
			Decimal: {
				page: "test-resources/sap/ui/core/qunit/odata/type/Decimal.qunit.html",
				title: "QUnit Page for sap/ui/model/odata/type/Decimal"
			},
			Double: {
				page: "test-resources/sap/ui/core/qunit/odata/type/Double.qunit.html",
				title: "QUnit Page for sap/ui/model/odata/type/Double"
			},
			Guid: {
				page: "test-resources/sap/ui/core/qunit/odata/type/Guid.qunit.html",
				title: "QUnit Page for sap/ui/model/odata/type/Guid"
			},
			Int: {
				page: "test-resources/sap/ui/core/qunit/odata/type/Int.qunit.html",
				title: "QUnit Page for sap/ui/model/odata/type/Int"
			},
			Int64: {
				page: "test-resources/sap/ui/core/qunit/odata/type/Int64.qunit.html",
				title: "QUnit Page for sap/ui/model/odata/type/Int64"
			},
			ODataType: {
				page: "test-resources/sap/ui/core/qunit/odata/type/ODataType.qunit.html",
				title: "QUnit Page for sap/ui/model/odata/type/ODataType"
			},
			Raw: {
				page: "test-resources/sap/ui/core/qunit/odata/type/Raw.qunit.html",
				title: "QUnit Page for sap/ui/model/odata/type/Raw"
			},
			Single: {
				page: "test-resources/sap/ui/core/qunit/odata/type/Single.qunit.html",
				title: "QUnit Page for sap/ui/model/odata/type/Single"
			},
			Stream: {
				page: "test-resources/sap/ui/core/qunit/odata/type/Stream.qunit.html",
				title: "QUnit Page for sap/ui/model/odata/type/Stream"
			},
			String: {
				page: "test-resources/sap/ui/core/qunit/odata/type/String.qunit.html",
				title: "QUnit Page for sap/ui/model/odata/type/String"
			},
			Time: {
				page: "test-resources/sap/ui/core/qunit/odata/type/Time.qunit.html",
				title: "QUnit Page for sap/ui/model/odata/type/Time"
			},
			TimeOfDay: {
				page: "test-resources/sap/ui/core/qunit/odata/type/TimeOfDay.qunit.html",
				title: "QUnit Page for sap/ui/model/odata/type/TimeOfDay"
			}
		}
	};
});
