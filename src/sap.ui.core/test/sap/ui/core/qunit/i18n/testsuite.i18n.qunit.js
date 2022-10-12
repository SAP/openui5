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
			"CalendarUtils": {
				coverage : {
					only : "sap/ui/core/date/CalendarUtils"
				}
			},
			"Buddhist": {
				coverage : {
					only : "sap/ui/core/date/Buddhist"
				}
			},
			"Islamic": {
				coverage : {
					only : "sap/ui/core/date/Islamic"
				}
			},
			"Japanese": {
				coverage : {
					only : "sap/ui/core/date/Japanese"
				}
			},
			"Locale": {
				coverage : {
					only : "sap/ui/core/Locale"
				}
			},
			"LocaleData": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				}
			},
			"GenericLocaleData": {},
			"Persian": {
				coverage : {
					only : "sap/ui/core/date/Persian"
				}
			},
			"ResourceBundle": {
				module: "./../base/i18n/ResourceBundle.qunit",
				coverage : {
					only : "sap/base/i18n/ResourceBundle"
				}
			},
			"UniversalDate": {
				coverage : {
					only : "sap/ui/core/date/UniversalDate"
				}
			},
			"UniversalDateUtils": {
				title: "sap.ui.core.date.UniversalDateUtils: UniversalDate Utility Functions",
				coverage : {
					only : "sap/ui/core/date/UniversalDateUtils"
				}
			}
		}
	};
});
