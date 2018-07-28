sap.ui.define(function() {

	"use strict";
	return {
		name: "TestSuite for sap.ui.core: GTP testcase CORE/CORE",
		defaults: {
			ui5: {
				language: "en-US"
			},
			qunit: {
				version: 2
			},
			sinon: {
				version: 1
			}
		},
		tests: {
			"Buddhist": {
			},
			"Islamic": {
			},
			"Japanese": {
			},
			"Locale": {
				sinon: false
			},
			"LocaleData": {
				qunit: {
					reorder: false // currency digits test seems to depend on execution order
				},
				sinon: false
			},
			"Persian": {
			},
			"UniversalDate": {
			}
		}
	};
});
