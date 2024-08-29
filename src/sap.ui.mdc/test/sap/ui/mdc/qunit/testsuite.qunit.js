sap.ui.define(['./util/EnvHelper', "sap/base/util/merge"], function (EnvHelper, merge) {
	"use strict";

	let mConfig =  {
		name: "Library 'sap.ui.mdc'", /* Just for a nice title on the pages */
		defaults: {
			group: "Library",
			qunit: {
				version: 2
			// Whether QUnit should be loaded and if so, what version
			},
			sinon: {
				version: 4
			// Whether Sinon should be loaded and if so, what version
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
					"delegates": "test-resources/sap/ui/mdc/delegates",
					"sap/ui/demo/mock": "test-resources/sap/ui/documentation/sdk/"
				}
			},
			page: "test-resources/sap/ui/mdc/qunit/teststarter.qunit.html?testsuite={suite}&test={name}",
			autostart: true, // Whether to call QUnit.start() when the test setup is done
			module: "./{name}.qunit"
		},
		tests: {
			"Condition": {
				group: "Condition",
				module: "./condition/Condition.qunit",
				coverage: {
					only: "[sap/ui/mdc/condition]"
				},
				sinon: false
			},

			"ConditionModel": {
				group: "Condition",
				module: "./condition/ConditionModel.qunit",
				coverage: {
					only: "[sap/ui/mdc/condition]"
				},
				sinon: false
			},

			"FilterConverter": {
				group: "Condition",
				module: "./condition/FilterConverter.qunit",
				coverage: {
					only: "[sap/ui/mdc/condition]"
				},
				sinon: false
			},

			"ConditionConverter": {
				group: "Condition",
				module: "./condition/ConditionConverter.qunit",
				coverage: {
					only: "[sap/ui/mdc/condition]"
				},
				sinon: false
			},

			"FilterOperatorUtil": {
				group: "Condition",
				module: "./condition/FilterOperatorUtil.qunit",
				coverage: {
					only: "[sap/ui/mdc/condition]"
				},
				sinon: false
			},

			"OperatorDynamicDateOption": {
				group: "Condition",
				module: "./condition/OperatorDynamicDateOption.qunit",
				coverage: {
					only: "[sap/ui/mdc/condition]"
				},
				sinon: false
			},

			"ActionToolbar": {
				group: "ActionToolbar",
				coverage: {
					only: "[sap/ui/mdc]",
					never: "[sap/ui/mdc/qunit]",
					branchTracking: true
				},
				module: "./actiontoolbar/ActionToolbar.qunit"
			},

			"ActionToolbarAction": {
				group: "ActionToolbar",
				coverage: {
					only: "[sap/ui/mdc]",
					never: "[sap/ui/mdc/qunit]",
					branchTracking: true
				},
				module: "./actiontoolbar/ActionToolbarAction.qunit"

			},

			"ActionToolbarActionCondenser": {
				group: "ActionToolbar",
				module: "./actiontoolbar/Condenser.qunit",
				coverage: {
					only: "[sap/ui/mdc]",
					never: "[sap/ui/mdc/qunit]",
					branchTracking: true
				},
				loader: {
					paths: {
						"sap/ui/mdc/qunit/table": "test-resources/sap/ui/mdc/qunit/table"
					}
				},
				sinon: false
			},

			"Field Testsuite" : {
				title: "Field Testsuite",
				group: "Testsuite",
				page: "test-resources/sap/ui/mdc/qunit/field/testsuite.field.qunit.html"
			},

			"Link Testsuite": {
				title: "Link Testsuite",
				group: "Testsuite",
				page: "test-resources/sap/ui/mdc/qunit/link/testsuite.link.qunit.html"
			},

			"Table Testsuite": {
				title: "Table Testsuite",
				group: "Testsuite",
				page: "test-resources/sap/ui/mdc/qunit/table/testsuite.table.qunit.html"
			},

			"FilterBar": {
				group: "FilterBar Testsuite",
				page: "test-resources/sap/ui/mdc/qunit/filterbar/testsuite.filterbar.qunit.html"
			},

			"FilterUtil": {
				group: "Util",
				module: "./util/FilterUtil.qunit"
			},

			"DateUtil": {
				group: "Util",
				module: "./util/DateUtil.qunit",
				coverage: {
					only: "[sap/ui/mdc/util]"
				},
				sinon: false
			},

			"DensityHelper": {
				group: "Util",
				module: "./util/{name}.qunit"
			},

			"PropertyHelper": {
				group: "Util",
				module: "./util/{name}.qunit"
			},

			"loadModules": {
				group: "Util",
				module: "./util/loadModules.qunit",
				coverage: {
					only: "[sap/ui/mdc/util]"
				},
				sinon: true
			},

			"EnforceSemanticRendering": {
				title: "QUnit Page for Semantic Rendering Coverage"
			},

			// "ExploredSamples": {
			// 	runAfterLoader: "sap/ui/demo/mock/qunit/SampleTesterErrorHandler",
			// 	sinon: {
			// 		version: 4
			// 	// MockServer dependencies are overrules by loader config above
			// 	},
			// 	ui5: {
			// 		libs: [
			// 			"sap.ui.mdc", "sap.ui.documentation", "sap.ui.layout", "sap.m"
			// 		],
			// 		"xx-componentPreload": "off"
			// 	},
			// 	autostart: false
			// },

			// Design Time & RTA Enabling
			"designtime/Designtime": {
				group: "DesignTime",
				module: "./designtime/Designtime.qunit"
			},

			"Designtime/Library": {
				group: "Designtime",
				module: "./designtime/Library.qunit"
			},

			"Designtime/Designtime_Table" : {
				group: "Designtime",
				module: "./designtime/Designtime_Table.qunit"
			},

			"DelegateMixin": {
				group: "Mixin",
				module: "./mixin/DelegateMixin.qunit",
				sinon: true
			},

			"AdaptationMixin": {
				group: "Mixin",
				module: "./mixin/AdaptationMixin.qunit",
				sinon: true
			},

			"FilterIntegrationMixin": {
				group: "Mixin",
				module: "./mixin/FilterIntegrationMixin.qunit",
				sinon: true
			},

			"InfoBar": {
				group: "Util",
				module: "./util/InfoBar.qunit",
				sinon: true
			},

			"PromiseCache": {
				group: "Util",
				module: "./util/PromiseCache.qunit",
				coverage: {
					only: "[sap/ui/mdc/util]"
				},
				sinon: true
			},

			"PromiseMixin": {
				group: "Mixin",
				module: "./mixin/PromiseMixin.qunit",
				sinon: true
			},

			"PropertyHelperMixin": {
				group: "Mixin",
				module: "./mixin/PropertyHelperMixin.qunit",
				sinon: true
			},

			"ValueHelp Testsuite" : {
				title: "ValueHelp Testsuite",
				group: "Testsuite",
				page: "test-resources/sap/ui/mdc/qunit/valuehelp/testsuite.valuehelp.qunit.html"
			},

			"Generic Testsuite": {
				page: "test-resources/sap/ui/mdc/qunit/testsuite.generic.qunit.html"
			},

			"TypeMap Testsuite": {
				group: "util",
				page: "test-resources/sap/ui/mdc/qunit/typemap/testsuite.typemap.qunit.html"
			},

			"Smoke Testsuite": {
				title: "Smoke Testsuite",
				group: "Testsuite",
				page: "test-resources/sap/ui/mdc/smoke/testsuite.qunit.html"
			}
		}
	};

	if (EnvHelper.isSapUI5) {
		mConfig = merge({}, mConfig, {
			tests: {
				"V4ServerTest": {
					loader: {
						paths: {
							"util": "test-resources/sap/ui/mdc/qunit/util"
						}
					},
					qunit: {
						reorder: false
					},
					autostart: false, // tests are added asynchronously because the V4 server needs to be found first
					module: "./v4server/V4ServerTest.qunit",
					sinon: false
				},
				"Integration Testsuite": {
					title: "Integration Testsuite",
					group: "Testsuite",
					page: "test-resources/sap/ui/mdc/integration/testsuite.qunit.html"
				},
                "Chart Testsuite" : {
                    title: "Chart Testsuite",
                    group: "Testsuite",
                    page: "test-resources/sap/ui/mdc/qunit/chart/testsuite.chart.qunit.html"
                },
				/* TO-Do: Check whether this is still needed with new MDC Chart
				"ChartFlex": {
					group: "Chart",
					module: "./chart/ChartFlex.qunit",
					loader: {
						paths: {
							"sap/ui/mdc/qunit/chart/Helper": "test-resources/sap/ui/mdc/qunit/chart/Helper"
						}
					},
					ui5: {
						libs: [
							"sap.ui.fl", "sap.ui.mdc"
						]
					},
					coverage: {
						only: "[sap/ui/mdc]",
						never: "[sap/ui/mdc/qunit]"
					}
				},*/
				"P13n Testsuite": {
					group: "p13n",
					page: "test-resources/sap/ui/mdc/qunit/p13n/testsuite.p13n.qunit.html"
				},

				"BaseDelegate": {
					group: "Delegates",
					module: "./BaseDelegate.qunit",
					sinon: true
				}
			}
		});
	}

	return mConfig;

});
