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
				loader: {
					paths: {
						"sap/ui/testlib": "test-resources/sap/ui/core/qunit/testdata/uilib/"
					}
				},
				ui5: {
					libs: "sap.ui.testlib"
				}
			},
			DataType: {
				coverage : {
					only : "sap/ui/base/DataType"
				},
				title: "QUnit Page for sap/ui/base/DataType"
			},
			DateFormat: {
				coverage : {
					only : "sap/ui/core/format/DateFormat"
				},
				title: "QUnit Page for sap/ui/core/format/DateFormat"
			},
			ListFormat: {
				coverage : {
					only : "sap/ui/core/format/ListFormat"
				},
				title: "QUnit Page for sap/ui/core/format/ListFormat"
			},
			NumberFormat: {
				coverage : {
					only : "sap/ui/core/format/NumberFormat"
				},
				title: "QUnit Page for sap/ui/core/format/NumberFormat"
			},
			NumberFormatCurrencies: {
				coverage : {
					only : "sap/ui/core/format/NumberFormatCurrencies"
				},
				title: "QUnit Page for sap/ui/core/format/NumberFormatCurrencies"
			},
			NumberFormatCurrenciesTrailing: {
				coverage : {
					only : "sap/ui/core/format/NumberFormatCurrenciesTrailing"
				},
				title: "QUnit Page for sap/ui/core/format/NumberFormatCurrenciesTrailing"
			},
			FileSizeFormat: {
				coverage : {
					only : "sap/ui/core/format/FileSizeFormat"
				},
				title: "QUnit Page for sap/ui/core/format/FileSizeFormat"
			},
			Types: {
				coverage : {
					only : "[sap/ui/model/type/Boolean,sap/ui/model/type/String,sap/ui/model/type/Integer,sap/ui/model/type/Float,sap/ui/model/type/Currency,sap/ui/model/type/Unit,sap/ui/model/type/Date,sap/ui/model/type/Time,sap/ui/model/type/DateTime,sap/ui/model/type/DateInterval,sap/ui/model/type/TimeInverval,sap/ui/model/type/DateTimeInterval,sap/ui/model/type/FileSize]"
				},
				title: "QUnit Page for sap/ui/model/type/*"
			},
			ValidationHooks: {
				title: "QUnit Page for ValidationHooks",
				ui5: {
					libs: "sap.ui.commons"
				}
			}
		}
	};
});
