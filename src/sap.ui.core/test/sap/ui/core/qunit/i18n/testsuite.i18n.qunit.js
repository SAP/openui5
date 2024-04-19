sap.ui.define(function() {

	"use strict";
	return {
		name: "TestSuite for sap.ui.core: GTP testcase CORE/I18N",
		defaults: {
			ui5: {
				language: "en-US"
			},
			qunit: {
				version: 2
			},
			sinon: {
				version: 4
			}
		},
		tests: {
			"_Calendars": {
				module: "./../date/_Calendars.qunit",
				coverage: {
					only: "sap/ui/core/date/_Calendars"
				}
			},
			"CalendarUtils": {
				coverage: {
					only: "sap/ui/core/date/CalendarUtils"
				}
			},
			"CalendarWeekNumbering": {
				coverage: {
					only: "sap/ui/core/date/CalendarWeekNumbering"
				}
			},
			"Buddhist": {
				coverage: {
					only: "sap/ui/core/date/Buddhist"
				}
			},
			"Islamic": {
				coverage: {
					only: "sap/ui/core/date/Islamic"
				}
			},
			"Japanese": {
				coverage: {
					only: "sap/ui/core/date/Japanese"
				}
			},
			"Locale": {
				coverage: {
					only: "sap/ui/core/Locale"
				}
			},
			"LocaleData": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				}
			},
			"GenericLocaleData": {},
			"Persian": {
				coverage: {
					only: "sap/ui/core/date/Persian"
				}
			},
			"ResourceBundle": {
				module: "./../base/i18n/ResourceBundle.qunit",
				coverage: {
					only: "sap/base/i18n/ResourceBundle"
				}
			},
			"Formatting": {
				module: "./../base/i18n/Formatting.qunit",
				uriParams: {
					"sap-ui-ABAP-date-format": "2",
					"sap-ui-ABAP-number-format": "X",
					"sap-ui-ABAP-time-format": "3"
				},
				bootCore: false,
				ui5: {
					language: undefined
				},
				coverage: {
					only: "sap/base/i18n/Formatting"
				}
			},
			"Localization": {
				module: "./../base/i18n/Localization.qunit",
				ui5: {
					language: undefined
				},
				coverage: {
					only: "sap/base/i18n/Localization",
					instrumenter: "istanbul"
				}
			},
			"UI5Date": {
				coverage: {
					only: "sap/ui/core/date/UI5Date"
				}
			},
			"UniversalDate": {
				coverage: {
					only: "sap/ui/core/date/UniversalDate"
				}
			},
			"UniversalDateUtils": {
				title: "sap.ui.core.date.UniversalDateUtils: UniversalDate Utility Functions",
				coverage: {
					only: "sap/ui/core/date/UniversalDateUtils"
				}
			},
			"TimezoneUtils": {
				coverage: {
					only: "sap/base/i18n/date/TimezoneUtils"
				},
				title: "QUnit Page for sap/base/i18n/date/TimezoneUtils"
			}
		}
	};
});
