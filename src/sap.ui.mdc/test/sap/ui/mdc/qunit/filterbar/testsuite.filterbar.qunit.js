sap.ui.define([
	"sap/ui/Device"
],function(
	Device
){
	"use strict";
	var oUnitTest =  {
		name: "Package 'sap.ui.mdc.filterbar'",
		defaults: {
			group: "FilterBar",
			qunit: {
				version: 2
			},
			sinon: {
				version: 4
			},
			ui5: {
				language: "en-US",
				rtl: false, // Whether to run the tests in RTL mode
				libs: [
					"sap.ui.mdc"
				], // Libraries to load upfront in addition to the library which is tested (sap.ui.mdc), if null no libs are loaded
				"xx-waitForTheme": true
				// Whether the start of the test should be delayed until the theme is applied
			},
			coverage: {
				only: "[sap/ui/mdc]", // Which files to show in the coverage report, if null, no files are excluded from coverage
				branchCoverage: true
				// Whether to enable standard branch coverage
			},
			loader: {
				paths: {
					"sap/ui/mdc/qunit": "test-resources/sap/ui/mdc/qunit/",
					"sap/ui/core/qunit": "test-resources/sap/ui/core/qunit/"
				}
			},
			page: "test-resources/sap/ui/mdc/qunit/teststarter.qunit.html?testsuite={suite}&test={name}",
			autostart: true,
			module: "./{name}.qunit"
		},
		tests: {
			"FilterBar": {
				group: "FilterBar",
				module: "./FilterBar.qunit"
			},
			"FilterBarBase": {
				group: "FilterBarBase",
				module: "./FilterBarBase.qunit"
			},
			"AdaptationFilterBar": {
				group: "FilterBar",
				module: "./AdaptationFilterBar.qunit"
			},
			"FilterBarWithVariants": {
				group: "FilterBar",
				module: "./FilterBarWithVariants.qunit"
			},
			"FilterBarFlex": {
				group: "FilterBar",
				module: "./FilterBarFlex.qunit"
			},
			"GenericFilterBarDelegate": {
				group: "FilterBar",
				module: "./vh/GenericFilterBarDelegate.qunit"
			},
			"valueHelp.FilterBar": {
				group: "FilterBar",
				module: "./vh/FilterBar.qunit"
			},
			"valueHelp.CollectiveSearchSelect": {
				group: "FilterBar",
				module: "./vh/CollectiveSearchSelect.qunit"
			}
		}
	};

	return oUnitTest;
});
