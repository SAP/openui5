sap.ui.define(['./util/EnvHelper', "sap/base/util/merge"], function (EnvHelper, merge) {
	"use strict";

	var mConfig =  {
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
					"sap/ui/demo/mock": "test-resources/sap/ui/documentation/sdk/"
				}
			},
			page: "test-resources/sap/ui/mdc/qunit/teststarter.qunit.html?testsuite={suite}&test={name}",
			autostart: true, // Whether to call QUnit.start() when the test setup is done
			module: "./{name}.qunit"
		},
		tests: {
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
			"Table": {
				group: "Table",
				coverage: {
					only: "[sap/ui/mdc]",
					never: "[sap/ui/mdc/qunit]",
					branchTracking: true
				},
				module: "./table/Table.qunit",
				qunit: {
					reorder: false
				}
			},
			"ResponsiveTableType": {
				group: "Table",
				coverage: {
					only: "[sap/ui/mdc]",
					never: "[sap/ui/mdc/qunit]",
					branchTracking: true
				},
				module: "./table/ResponsiveTableType.qunit",
				qunit: {
					reorder: false
				}
			},
			"TableDelegate": {
				group: "Table",
				module: "./table/TableDelegate.qunit",
				qunit: {
					reorder: false
				}
			},
			"odata.v4.TableDelegate": {
				group: "Delegates",
				module: "./odata/v4/TableDelegate.qunit",
				qunit: {
					reorder: false
				}
			},
			"Column": {
				group: "Table",
				coverage: {
					only: "[sap/ui/mdc]",
					never: "[sap/ui/mdc/qunit]",
					branchTracking: true
				},
				module: "./table/Column.qunit",
				qunit: {
					reorder: false
				}
			},
			"CreationRow": {
				group: "Table",
				coverage: {
					only: "[sap/ui/mdc]",
					never: "[sap/ui/mdc/qunit]",
					branchTracking: true
				},
				module: "./table/CreationRow.qunit",
				qunit: {
					reorder: false
				}
			},
			"Menu": {
				group: "Table",
				coverage: {
					only: "[sap/ui/mdc]",
					never: "[sap/ui/mdc/qunit]",
					branchTracking: true
				},
				module: "./table/Menu.qunit",
				qunit: {
					reorder: false
				}
			},
			"TableFlex": {
				group: "Table",
				coverage: {
					only: "[sap/ui/mdc]",
					never: "[sap/ui/mdc/qunit]",
					branchTracking: true
				},
				module: "./table/TableFlex.qunit",
				qunit: {
					reorder: false
				}
			},
			"TableSettings": {
				group: "Table",
				coverage: {
					only: "[sap/ui/mdc]",
					never: "[sap/ui/mdc/qunit]",
					branchTracking: true
				},
				module: "./table/TableSettings.qunit",
				qunit: {
					reorder: false
				}
			},
			"TablePropertyHelper": {
				group: "Table",
				coverage: {
					only: "[sap/ui/mdc]",
					never: "[sap/ui/mdc/qunit]",
					branchTracking: true
				},
				module: "./table/PropertyHelper.qunit",
				qunit: {
					reorder: false
				}
			},
			"TablePropertyHelper - V4Analytics": {
				group: "Table",
				coverage: {
					only: "[sap/ui/mdc]",
					never: "[sap/ui/mdc/qunit]",
					branchTracking: true
				},
				module: "./table/V4AnalyticsPropertyHelper.qunit",
				qunit: {
					reorder: false
				}
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
			"MemoryLeak": {
				group: "Basic",
				module: "./MemoryLeak.qunit",
				qunit: {
					// MemoryLeakCheck loads qunit-1
					version: 1,
					// make sure results are consistent/stable and the "statistics" test in the end is actually run in the end
					reorder: false
				},
				// tests are added asynchronously, hence autostart is disabled and QUnit.start is called later
				autostart: false
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

			"TypeUtil": {
				group: "Util",
				module: "./util/TypeUtil.qunit",
				coverage: {
					only: "[sap/ui/mdc/util]"
				},
				sinon: false
			},
			"ODataTypeUtil": {
				group: "Util",
				module: "./odata/TypeUtil.qunit",
				coverage: {
					only: "[sap/ui/mdc/odata]"
				},
				sinon: true
			},
			"ODataV4TypeUtil": {
				group: "Util",
				module: "./odata/v4/TypeUtil.qunit",
				coverage: {
					only: "[sap/ui/mdc/odata/v4]"
				},
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
				"Chart": {
					group: "Chart",
					module: "./chart/Chart.qunit",
					ui5: {
						libs: [
							"sap.ui.fl", "sap.ui.mdc"
						]
					}
				},
				"ChartToolbar": {
					group: "Chart",
					module: "./chart/ChartToolbar.qunit",
					ui5: {
						libs: [
							"sap.ui.fl", "sap.ui.mdc"
						]
					}
				},
				"ChartBreadcrumbs": {
					group: "Chart",
					module: "./chart/ChartBreadcrumbs.qunit",
					ui5: {
						libs: [
							"sap.ui.fl", "sap.ui.mdc"
						]
					}
				},/* TO-Do: Check whether this is still needed with new MDC Chart
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
				}
			}
		});
	}

	return mConfig;

});
