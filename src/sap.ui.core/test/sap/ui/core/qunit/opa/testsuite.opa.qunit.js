sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/Device"
], function(merge, Device) {
	"use strict";

	var oCommonTests = {
		"actions/Action": {
			_page: "test-resources/sap/ui/core/qunit/opa/actions/Action.qunit.html?noglobals=true&sap-ui-animation=false",
			title: "QUnit Page for sap.ui.test.actions.Action",
			sinon: {
				version: 1,
				qunitBridge: true
			},
			module: "./actions/Action.qunit"
		},
		"actions/EnterText": {
			_page: "test-resources/sap/ui/core/qunit/opa/actions/EnterText.qunit.html?noglobals=true&sap-ui-animation=false",
			title: "QUnit Page for sap.ui.test.actions.EnterText",
			qunit: {
				testTimeout: 5000
			},
			sinon: {
				version: 1,
				qunitBridge: true
			},
			module: "./actions/EnterText.qunit"
		},
		"actions/Press": {
			/* Hasher -> own page needed */
			page: "test-resources/sap/ui/core/qunit/opa/actions/Press.qunit.html?test={name}",
			title: "QUnit Page for sap.ui.test.actions.Press",
			loader: {
				paths: {
					"samples" : "test-resources/sap/ui/core/samples/",
					"unitTests" : "test-resources/sap/ui/core/qunit/opa/"
				}
			},
			qunit: {
				// The noglobals check is disabled because IE11 creates false negative from the blindlayer
				// which is kept in the DOM as global variable
				noglobals: !Device.browser.msie
			},
			sinon: {
				version: 1,
				qunitBridge: true,
				useFakeTimers: false
			},
			module: "./actions/Press.qunit"
		},
		"autowaiter/autoWaiter": {
			_page: "test-resources/sap/ui/core/qunit/opa/autowaiter/autoWaiter.qunit.html?noglobals=true&sap-ui-animation=false",
			title: "QUnit Page for sap.ui.test.autoWaiter",
			sinon: {
				version: 1,
				qunitBridge: true
			},
			module: "./autowaiter/autoWaiter.qunit"
		},
		"demokit/sample/matcher/BindingPath/Opa": {
			page: "test-resources/sap/ui/core/demokit/sample/matcher/BindingPath/Opa.html?noglobals=true&sap-ui-animation=false",
			title: "Opa Sample for Binding Path Matcher",
			ui5: {
				libs: "sap.m"
			}
		},
		"demokit/sample/matcher/I18NText/Opa": {
			page: "test-resources/sap/ui/core/demokit/sample/matcher/I18NText/Opa.html?noglobals=true&sap-ui-animation=false",
			title: "Opa Sample for I18N Text Matcher",
			ui5: {
				libs: "sap.m"
			}
		},
		"demokit/sample/OpaById/Opa": {
			page: "test-resources/sap/ui/core/demokit/sample/OpaById/Opa.html?noglobals=true&sap-ui-animation=false",
			title: "Opa sample for retrieving controls by id"
		},
		"demokit/sample/OpaDynamicWait/Opa": {
			page: "test-resources/sap/ui/core/demokit/sample/OpaDynamicWait/Opa.html?noglobals=true&sap-ui-animation=false",
			title: "Opa sample for nested actions"
		},
		"demokit/sample/OpaMatchers/OpaMatchers": {
			page: "test-resources/sap/ui/core/demokit/sample/OpaMatchers/OpaMatchers.html?noglobals=true&sap-ui-animation=false",
			title: "Opa sample for matchers"
		},
		"demokit/sample/OpaPageObject/OpaPageObject": {
			page: "test-resources/sap/ui/core/demokit/sample/OpaPageObject/OpaPageObject.html?noglobals=true&sap-ui-animation=false",
			title: "Opa sample for PageObjects",
			loader: {
				paths: {
					"myApp/test": "./"
				}
			}
		},
		"demokit/sample/OpaStartup/iStartMyAppInAFrame/iStartMyAppInAFrame": {
			page: "test-resources/sap/ui/core/demokit/sample/OpaStartup/iStartMyAppInAFrame/iStartMyAppInAFrame.html?noglobals=true&sap-ui-animation=false",
			title: "Opa sample for starting an app with a frame",
			ui5: {
				libs: "sap.m",
				theme: "sap_belize"
			}
		},
		"demokit/sample/OpaStartup/iStartMyAppInAFrame/iStartMyAppInAFrameDebug": {
			page: "test-resources/sap/ui/core/demokit/sample/OpaStartup/iStartMyAppInAFrame/iStartMyAppInAFrame.html?sap-ui-debug=true",
			title: "Opa sample for starting an app with a frame",
			ui5: {
				libs: "sap.m",
				theme: "sap_belize"
			}
		},
		"demokit/sample/OpaStartup/iStartMyUIComponent/iStartMyUIComponent": {
			page: "test-resources/sap/ui/core/demokit/sample/OpaStartup/iStartMyUIComponent/iStartMyUIComponent.html?noglobals=true&sap-ui-animation=false",
			title: "OPA sample for starting an app with a component",
			ui5: {
				libs: "sap.m",
				theme: "sap_belize"
			},
			loader: {
				paths: {
					"sap/ui/sample/appUnderTest": "./applicationUnderTest",
					"sap/ui/sample/appUnderTest/view": "./applicationUnderTest/view",
					"sap/ui/demo/mock": "../../../../../../../sap/ui/documentation/sdk/"
				}
			}
		},
		"launchers/componentLauncher": {
			_page: "test-resources/sap/ui/core/qunit/opa/launchers/componentLauncher.qunit.html?noglobals=true&sap-ui-animation=false",
			title: "QUnit Page for sap.ui.test.launchers.componentLauncher",
			loader: {
				paths: {
					"samples" : "test-resources/sap/ui/core/samples/"
				}
			},
			sinon: {
				version: 1,
				qunitBridge: true
			},
			module: "./launchers/componentLauncher.qunit"
		},
		"matchers/AggregationContainsPropertyEquals": {
			_page: "test-resources/sap/ui/core/qunit/opa/matchers/AggregationContainsPropertyEquals.qunit.html?noglobals=true&sap-ui-animation=false",
			title: "QUnit Page for sap.ui.test.matchers.AggregationContainsPropertyEqual",
			sinon: {
				version: 1,
				qunitBridge: true
			},
			module: "./matchers/AggregationContainsPropertyEquals.qunit"
		},
		"matchers/AggregationEmpty": {
			_page: "test-resources/sap/ui/core/qunit/opa/matchers/AggregationEmpty.qunit.html?noglobals=true&sap-ui-animation=false",
			title: "QUnit Page for sap.ui.test.matchers.AggregationEmpty",
			module: "./matchers/AggregationEmpty.qunit"
		},
		"matchers/AggregationFilled": {
			_page: "test-resources/sap/ui/core/qunit/opa/matchers/AggregationFilled.qunit.html?noglobals=true&sap-ui-animation=false",
			title: "QUnit Page for sap.ui.test.matchers.AggregationFilled",
			sinon: {
				version: 1,
				qunitBridge: true
			},
			module: "./matchers/AggregationFilled.qunit"
		},
		"matchers/AggregationLengthEquals": {
			_page: "test-resources/sap/ui/core/qunit/opa/matchers/AggregationLengthEquals.qunit.html?noglobals=true&sap-ui-animation=false",
			title: "QUnit Page for AggregationLengthEquals",
			sinon: {
				version: 1,
				qunitBridge: true
			},
			module: "./matchers/AggregationLengthEquals.qunit"
		},
		"matchers/Ancestor": {
			_page: "test-resources/sap/ui/core/qunit/opa/matchers/Ancestor.qunit.html?noglobals=true&sap-ui-animation=false",
			title: "QUnit Page for sap.ui.test.matchers.Ancestor",
			module: "./matchers/Ancestor.qunit"
		},
		"matchers/BindingPath": {
			_page: "test-resources/sap/ui/core/qunit/opa/matchers/BindingPath.qunit.html?noglobals=true&sap-ui-animation=false",
			title: "QUnit Page for sap.ui.test.matchers.BindingPath",
			sinon: {
				version: 1,
				qunitBridge: true
			},
			module: "./matchers/BindingPath.qunit"
		},
		"matchers/I18NText": {
			_page: "test-resources/sap/ui/core/qunit/opa/matchers/I18NText.qunit.html?noglobals=true&sap-ui-animation=false",
			title: "QUnit Page for sap.ui.test.matchers.I18NText",
			sinon: {
				version: 1,
				qunitBridge: true
			},
			module: "./matchers/I18NText.qunit"
		},
		"matchers/Interactable": {
			_page: "test-resources/sap/ui/core/qunit/opa/matchers/Interactable.qunit.html?noglobals=true&sap-ui-animation=false",
			title: "QUnit Page for sap.ui.test.matchers.Interactable",
			sinon: {
				version: 1,
				qunitBridge: true
			},
			module: "./matchers/Interactable.qunit",
			autostart: false
		},
		"matchers/LabelFor": {
			_page: "test-resources/sap/ui/core/qunit/opa/matchers/LabelFor.qunit.html?noglobals=true&sap-ui-animation=false",
			title: "QUnit Page for sap.ui.test.matchers.LabelFor",
			sinon: {
				version: 1,
				qunitBridge: true
			},
			module: "./matchers/LabelFor.qunit"
		},
		"matchers/MatcherFactory": {
			_page: "test-resources/sap/ui/core/qunit/opa/matchers/MatcherFactory.qunit.html?noglobals=true&sap-ui-animation=false",
			title: "QUnit Page for sap.ui.test.matchers.MatcherFactory",
			sinon: {
				version: 1,
				qunitBridge: true
			},
			module: "./matchers/MatcherFactory.qunit"
		},
		"matchers/Properties": {
			_page: "test-resources/sap/ui/core/qunit/opa/matchers/Properties.qunit.html?noglobals=true&sap-ui-animation=false",
			title: "QUnit Page for sap.ui.test.matchers.Properties",
			sinon: {
				version: 1
			},
			module: "./matchers/Properties.qunit"
		},
		"matchers/PropertyStrictEquals": {
			_page: "test-resources/sap/ui/core/qunit/opa/matchers/PropertyStrictEquals.qunit.html?noglobals=true&sap-ui-animation=false",
			title: "QUnit Page for sap.ui.test.matchers.PropertyStrictEquals",
			sinon: {
				version: 1,
				qunitBridge: true
			},
			module: "./matchers/PropertyStrictEquals.qunit"
		},
		"matchers/Visible": {
			_page: "test-resources/sap/ui/core/qunit/opa/matchers/Visible.qunit.html?noglobals=true&sap-ui-animation=false",
			title: "QUnit Page for sap.ui.test.matchers.Visible",
			sinon: {
				version: 1,
				qunitBridge: true
			},
			module: "./matchers/Visible.qunit"
		},
		"Opa": {
			_page: "test-resources/sap/ui/core/qunit/opa/Opa.qunit.html?noglobals=true&sap-ui-animation=false",
			title: "QUnit Page for sap.ui.test.Opa",
			qunit: {
				// needed for tests that unload OPA
				reorder: false
			},
			sinon: {
				version: 1,
				qunitBridge: true,
				useFakeTimers: true
			},
			module: "./Opa.qunit"
		},
		"opa5/_ParameterValidator": {
			_page: "test-resources/sap/ui/core/qunit/opa/opa5/_ParameterValidator.qunit.html?noglobals=true&sap-ui-animation=false",
			title: "QUnit Page for sap.ui.test.Opa5 - _ParameterValidator",
			sinon: {
				version: 1,
				qunitBridge: true
			},
			module: "./opa5/_ParameterValidator.qunit"
		},
		"opa5/actions": {
			_page: "test-resources/sap/ui/core/qunit/opa/opa5/actions.qunit.html?noglobals=true&sap-ui-animation=false",
			title: "QUnit Page for sap.ui.test.Opa5 - Actions",
			sinon: {
				version: 1,
				qunitBridge: true
			},
			module: "./opa5/actions.qunit"
		},
		"opa5/basics": {
			_page: "test-resources/sap/ui/core/qunit/opa/opa5/basics.qunit.html?noglobals=true&sap-ui-animation=false",
			title: "QUnit Page for sap.ui.test.Opa5 - Basics",
			sinon: {
				version: 1,
				qunitBridge: true
			},
			module: "./opa5/basics.qunit"
		},
		"opa5/component": {
			_page: "test-resources/sap/ui/core/qunit/opa/opa5/component.qunit.html?noglobals=true&sap-ui-animation=false",
			title: "QUnit Page for sap.ui.test.Opa5 - Component",
			loader: {
				paths: {
					"samples" : "test-resources/sap/ui/core/samples/"
				}
			},
			sinon: {
				version: 1,
				qunitBridge: true
			},
			module: "./opa5/component.qunit"
		},
		"opa5/iFrame": {
			_page: "test-resources/sap/ui/core/qunit/opa/opa5/iFrame.qunit.html?noglobals=true&sap-ui-animation=false",
			title: "QUnit Page for sap.ui.test.Opa5 - iFrame",
			sinon: {
				version: 1,
				qunitBridge: true
			},
			module: "./opa5/iFrame.qunit"
		},
		"opa5/launchers": {
			_page: "test-resources/sap/ui/core/qunit/opa/opa5/launchers.qunit.html?noglobals=true&sap-ui-animation=false",
			title: "QUnit Page for sap.ui.test.Opa5 - Launchers",
			loader: {
				paths: {
					"samples" : "test-resources/sap/ui/core/samples/"
				}
			},
			sinon: {
				version: 1,
				qunitBridge: true
			},
			module: "./opa5/launchers.qunit"
		},
		"opa5/logging": {
			_page: "test-resources/sap/ui/core/qunit/opa/opa5/logging.qunit.html?noglobals=true&sap-ui-animation=false",
			title: "QUnit Page for sap.ui.test.Opa5 - Logging",
			sinon: {
				version: 1,
				qunitBridge: true
			},
			module: "./opa5/logging.qunit"
		},
		"opa5/matchers": {
			_page: "test-resources/sap/ui/core/qunit/opa/opa5/matchers.qunit.html?noglobals=true&sap-ui-animation=false",
			title: "QUnit Page for sap.ui.test.Opa5 - Matchers",
			sinon: {
				version: 1,
				qunitBridge: true,
				useFakeTimers: false
			},
			module: "./opa5/matchers.qunit"
		},
		"Opa5Extensions": {
			_page: "test-resources/sap/ui/core/qunit/opa/Opa5Extensions.qunit.html?noglobals=true&sap-ui-animation=false",
			title: "QUnit Page for sap.ui.test.Opa5",
			loader: {
				paths: {
					"testResources" : "testResources/"
				}
			},
			sinon: {
				version: 1
			},
			module: "./Opa5Extensions.qunit"
		},
		"Opa5PageObject": {
			_page: "test-resources/sap/ui/core/qunit/opa/Opa5PageObject.qunit.html?sap-ui-xx-noless=true",
			title: "QUnit Page for sap.ui.test.Opa5 Page Objects",
			sinon: {
				version: 1,
				qunitBridge: true
			},
			module: "./Opa5PageObject.qunit"
		},
		"OpaIntegration": {
			_page: "test-resources/sap/ui/core/qunit/opa/OpaIntegration.qunit.html?noglobals=true&sap-ui-animation=false",
			title: "QUnit Page for sap.ui.test.Opa",
			module: "./OpaIntegration.qunit"
		},
		"OpaPlugin": {
			_page: "test-resources/sap/ui/core/qunit/opa/OpaPlugin.qunit.html?noglobals=true&sap-ui-animation=false",
			title: "QUnit Page for sap.ui.test.OpaPlugin",
			ui5: {
				libs: ["sap.ui.commons", "sap.m"]
			},
			sinon: {
				version: 1,
				qunitBridge: true
			},
			module: "./OpaPlugin.qunit",
			autostart: false
		},
		"opaQunit": {
			_page: "test-resources/sap/ui/core/qunit/opa/opaQunit.qunit.html?noglobals=true&sap-ui-animation=false",
			title: "QUnit Page for sap.ui.test.opaQunit",
			sinon: {
				version: 1,
				qunitBridge: true
			},
			module: "./opaQunit.qunit"
		},
		"pipelines/ActionPipeline": {
			_page: "test-resources/sap/ui/core/qunit/opa/pipelines/ActionPipeline.qunit.html?noglobals=true&sap-ui-animation=false",
			title: "QUnit Page for sap.ui.test.pipelines.ActionPipeline",
			sinon: {
				version: 1,
				qunitBridge: true
			},
			module: "./pipelines/ActionPipeline.qunit"
		},
		"pipelines/MatcherPipeline": {
			_page: "test-resources/sap/ui/core/qunit/opa/pipelines/MatcherPipeline.qunit.html?noglobals=true&sap-ui-animation=false",
			title: "QUnit Page for sap.ui.test.pipelines.MatcherPipeline",
			sinon: {
				version: 1,
				qunitBridge: true
			},
			module: "./pipelines/MatcherPipeline.qunit"
		},
		"pipelines/PipelineFactory": {
			page: "test-resources/sap/ui/core/qunit/opa/pipelines/PipelineFactory.qunit.html?noglobals=true&sap-ui-animation=false",
			title: "QUnit Page for sap.ui.test.pipelines.PipelineFactory",
			sinon: {
				version: 1,
				qunitBridge: true
			},
			module: "./pipelines/PipelineFactory.qunit"
		},
		"_ControlFinder": {
			_page: "test-resources/sap/ui/core/qunit/opa/_ControlFinder.qunit.html?noglobals=true&sap-ui-animation=false",
			title: "QUnit Page for sap.ui.test._ControlFinder",
			ui5: {
				logLevel: "ERROR"
			},
			sinon: {
				version: 1,
				qunitBridge: true
			},
			module: "./_ControlFinder.qunit"
		},
		"_LogCollector": {
			_page: "test-resources/sap/ui/core/qunit/opa/_LogCollector.qunit.html?noglobals=true&sap-ui-animation=false",
			title: "QUnit Page for sap.ui.test._LogCollector",
			ui5: {
				logLevel: "ERROR"
			},
			sinon: {
				version: 1,
				qunitBridge: true
			},
			module: "./_LogCollector.qunit"
		},
		"_OpaLogger": {
			_page: "test-resources/sap/ui/core/qunit/opa/_OpaLogger.qunit.html?noglobals=true&sap-ui-animation=false",
			title: "QUnit Page for sap.ui.test._OpaLogger",
			ui5: {
				logLevel: "ERROR"
			},
			sinon: {
				version: 1,
				qunitBridge: true
			},
			module: "./_OpaLogger.qunit"
		},
		"_UsageReport": {
			_page: "test-resources/sap/ui/core/qunit/opa/_UsageReport.qunit.html?noglobals=true&sap-ui-animation=false",
			title: "QUnit Page for sap.ui.test._UsageReport",
			sinon: {
				version: 1,
				qunitBridge: true
			},
			module: "./_UsageReport.qunit"
		}
	};

	var oTestSuite = {
		name: "TestSuite for sap.ui.core: GTP testcase CORE/OPA",
		defaults: {
			qunit: {
				noglobals: true
			},
			ui5: {
				animation: false
			}
		},
		tests: {
			"demokit/sample/OpaAction/Opa": {
				page: "test-resources/sap/ui/core/demokit/sample/OpaAction/Opa.html",
				title: "Opa sample for triggering actions on controls",
				ui5: {
					libs: "sap.m",
					theme: "sap_belize"
				},
				loader: {
					paths: {
						appUnderTest: "./applicationUnderTest",
						"sap/ui/demo/mock": "../../../../../../sap/ui/documentation/sdk/"
					}
				}
			}
		}
	};

	Object.keys(oCommonTests).forEach(function(name) {
		oTestSuite.tests[name + "1"] = merge({}, oCommonTests[name], {qunit: { version: 1 }});
		oTestSuite.tests[name + "2"] = merge({}, oCommonTests[name], {qunit: { version: 2 }});
		if ( oTestSuite.tests[name + "2"].page ) {
			oTestSuite.tests[name + "2"].page = oTestSuite.tests[name + "2"].page + "&sap-ui-qunitversion=2";
		}
		if ( oTestSuite.tests[name + "2"].title ) {
			oTestSuite.tests[name + "2"].title = oTestSuite.tests[name + "2"].title + " (QUnit 2)";
		}
	});

	return oTestSuite;
});
