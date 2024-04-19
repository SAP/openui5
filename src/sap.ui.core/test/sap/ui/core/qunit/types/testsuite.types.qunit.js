sap.ui.define(function () {

	"use strict";
	return {
		name: "TestSuite for DataType and Formatter",
		defaults: {
			qunit: {
				version: 2
			},
			sinon: {
				version: 4,
				qunitBridge: true
			},
			ui5: {
				language: "en-US"
			}
		},
		tests: {
			CompositeType: {
				coverage : {
					only : "sap/ui/model/CompositeType"
				},
				title: "QUnit Page for sap/ui/model/CompositeType"
			},
			Date: {
				coverage : {
					only : "sap/ui/model/type/Date"
				},
				title: "QUnit Page for sap/ui/model/type/Date"
			},
			DateFormat: {
				coverage : {
					only : "sap/ui/core/format/DateFormat"
				},
				title: "QUnit Page for sap/ui/core/format/DateFormat"
			},
			DateFormatTimezones: {
				coverage : {
					only : "sap/ui/core/format/DateFormat"
				},
				title: "QUnit Page for sap/ui/core/format/DateFormatTimezones"
			},
			DateInterval: {
				coverage : {
					only : "sap/ui/model/type/DateInterval"
				},
				title: "QUnit Page for sap/ui/model/type/DateInterval"
			},
			FormatUtils : {
				coverage : {
					only : "sap/ui/core/format/FormatUtils"
				},
				module : "./../format/FormatUtils.qunit",
				title : "QUnit Page for sap/ui/core/format/FormatUtils"
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
			SimpleType: {
				coverage : {
					only : "sap/ui/model/SimpleType"
				},
				title: "QUnit Page for sap/ui/model/SimpleType"
			},
			Types: {
				coverage : {
					only : "[sap/ui/model/type/Boolean,sap/ui/model/type/String,sap/ui/model/type/Integer,sap/ui/model/type/Float,sap/ui/model/type/Currency,sap/ui/model/type/Unit,sap/ui/model/type/Time,sap/ui/model/type/DateTime,sap/ui/model/type/TimeInverval,sap/ui/model/type/DateTimeInterval,sap/ui/model/type/FileSize]"
				},
				title: "QUnit Page for sap/ui/model/type/*"
			},
			ValidationHooks: {
				title: "QUnit Page for ValidationHooks",
				ui5: {
					libs: "sap.m"
				}
			}
		}
	};
});
