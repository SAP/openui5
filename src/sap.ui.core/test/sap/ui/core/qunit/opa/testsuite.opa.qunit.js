sap.ui.define([
	"sap/base/util/merge"
], function(merge) {
	"use strict";

	var oCommonTests = {
		"qunitPause": {
			title: "QUnit Page for qunitPause",
			module: "./qunitPause.qunit"
		},
		"actions/Action": {
			title: "QUnit Page for sap.ui.test.actions.Action",
			module: "./actions/Action.qunit"
		},
		"actions/EnterText": {
			title: "QUnit Page for sap.ui.test.actions.EnterText",
			qunit: {
				testTimeout: 5000
			},
			module: "./actions/EnterText.qunit"
		},
		"actions/DnD": {
			title: "QUnit Page for sap.ui.test.actions.Drag and sap.ui.test.actions.Drop",
			module: "./actions/DnD.qunit",
			loader: {
				paths: {
					"sap/f/sample": "test-resources/sap/f/demokit/sample",
					"sap/m/sample": "test-resources/sap/m/demokit/sample",
					"sap/ui/table/sample": "test-resources/sap/ui/table/demokit/sample",
					"sap/ui/demo/mock": "test-resources/sap/ui/documentation/sdk/",
					"docu": "../../../../../documentation.html"
				}
			}
		},
		"actions/Press": {
			/* Hasher -> own page needed */
			page: "test-resources/sap/ui/core/qunit/opa/actions/Press.qunit{qunitVersion}.html",
			title: "QUnit Page for sap.ui.test.actions.Press",
			loader: {
				paths: {
					"samples" : "test-resources/sap/ui/core/samples/",
					"unitTests" : "test-resources/sap/ui/core/qunit/opa/"
				}
			},
			ui5: {
				libs: "sap.m",
				language: "en-US"
			},
			module: "./actions/Press.qunit"
		},
		"actions/Scroll": {
			title: "QUnit Page for sap.ui.test.actions.Scroll",
			module: "./actions/Scroll.qunit",
			loader: {
				paths: {
					"sap/uxap/sample": "test-resources/sap/uxap/demokit/sample",
					"sap/m/sample": "test-resources/sap/m/demokit/sample",
					"sap/ui/demo/mock": "test-resources/sap/ui/documentation/sdk/"
				}
			}
		},
		"autowaiter/autoWaiter": {
			title: "QUnit Page for sap.ui.test.autoWaiter",
			qunit: {
				reorder: false // to ensure that _XHRWaiter tests are executed last
			},
			// in sinon v4, there is a timing issue in autoWaiterAsync tests
			sinon: {
				version: 1,
				qunitBridge: true
			},
			loader: {
				paths: {
					"fixture": "test-resources/sap/ui/core/qunit/opa/fixture/"
				}
			},
			module: "./autowaiter/autoWaiter.qunit"
		},
		"demokit/sample/matcher/BindingPath/Opa": {
			page: "test-resources/sap/ui/core/demokit/sample/matcher/BindingPath/Opa.html?sap-ui-animation=false",
			title: "Opa Sample for Binding Path Matcher",
			ui5: {
				libs: "sap.m"
			}
		},
		"demokit/sample/matcher/I18NText/Opa": {
			page: "test-resources/sap/ui/core/demokit/sample/matcher/I18NText/Opa.html?sap-ui-animation=false",
			title: "Opa Sample for I18N Text Matcher",
			ui5: {
				libs: "sap.m"
			}
		},
		"demokit/sample/matcher/LabelFor/Opa": {
			page: "test-resources/sap/ui/core/demokit/sample/matcher/LabelFor/Opa.html?sap-ui-animation=false",
			title: "Opa Sample for LabelFor Matcher",
			ui5: {
				libs: "sap.m"
			}
		},
		"demokit/sample/matcher/Descendant/Opa": {
			page: "test-resources/sap/ui/core/demokit/sample/matcher/Descendant/Opa.html?sap-ui-animation=false",
			title: "Opa Sample for Descendant Matcher",
			ui5: {
				libs: "sap.m"
			}
		},
		"demokit/sample/OpaAutoWaitParams/OpaAutoWaitParams": {
			page: "test-resources/sap/ui/core/demokit/sample/OpaAutoWaitParams/OpaAutoWaitParams.html?sap-ui-animation=false",
			title: "OPA5 AutoWait Parameters"
		},
		"demokit/sample/OpaBusyIndicator/OpaBusyIndicator": {
			page: "test-resources/sap/ui/core/demokit/sample/OpaBusyIndicator/OpaBusyIndicator.html?sap-ui-animation=false",
			title: "Testing busy controls with OPA5"
		},
		"demokit/sample/OpaById/Opa": {
			page: "test-resources/sap/ui/core/demokit/sample/OpaById/Opa.html?sap-ui-animation=false",
			title: "Opa sample for retrieving controls by id"
		},
		"demokit/sample/OpaDynamicWait/Opa": {
			page: "test-resources/sap/ui/core/demokit/sample/OpaDynamicWait/Opa.html?sap-ui-animation=false",
			title: "Opa sample for nested actions"
		},
		"demokit/sample/OpaMatchers/OpaMatchers": {
			page: "test-resources/sap/ui/core/demokit/sample/OpaMatchers/OpaMatchers.html?sap-ui-animation=false",
			title: "Opa sample for matchers"
		},
		"demokit/sample/OpaPageObject/OpaPageObject": {
			page: "test-resources/sap/ui/core/demokit/sample/OpaPageObject/OpaPageObject.html?sap-ui-animation=false",
			title: "Opa sample for PageObjects",
			loader: {
				paths: {
					"myApp/test": "./"
				}
			}
		},
		"demokit/sample/OpaStartup/iStartMyAppInAFrame/iStartMyAppInAFrame": {
			page: "test-resources/sap/ui/core/demokit/sample/OpaStartup/iStartMyAppInAFrame/iStartMyAppInAFrame.html?sap-ui-animation=false",
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
			page: "test-resources/sap/ui/core/demokit/sample/OpaStartup/iStartMyUIComponent/iStartMyUIComponent.html?sap-ui-animation=false",
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
		"demokit/sample/OpaStaticAreaControls/OpaStaticAreaControls": {
			page: "test-resources/sap/ui/core/demokit/sample/OpaStaticAreaControls/OpaStaticAreaControls.html?sap-ui-animation=false",
			title: "Retrieving controls in the static area with OPA5"
		},
		"demokit/sample/OpaTestLibrary/OpaTestLibrary": {
			page: "test-resources/sap/ui/core/demokit/sample/OpaTestLibrary/OpaTestLibrary.html?sap-ui-animation=false",
			title: "OPA5 Test Library Sample"
		},
		"demokit/sample/OpaURLParameters/iStartMyAppInAFrameWithURLParameters/iStartMyAppInAFrameWithURLParameters": {
			page: "test-resources/sap/ui/core/demokit/sample/OpaURLParameters/iStartMyAppInAFrameWithURLParameters/iStartMyAppInAFrameWithURLParameters.html?sap-ui-animation=false",
			title: "Opa sample passing URL parameters to the IFrame"
		},
		"demokit/sample/OpaURLParameters/iStartMyUIComponentWithURLParameters/iStartMyUIComponentWithURLParameters": {
			page: "test-resources/sap/ui/core/demokit/sample/OpaURLParameters/iStartMyUIComponentWithURLParameters/iStartMyUIComponentWithURLParameters.html?sap-ui-animation=false",
			title: "OPA sample passing URL parameters"
		},
		"launchers/componentLauncher": {
			title: "QUnit Page for sap.ui.test.launchers.componentLauncher",
			loader: {
				paths: {
					"samples" : "test-resources/sap/ui/core/samples/"
				}
			},
			module: "./launchers/componentLauncher.qunit"
		},
		"launchers/iFrameLauncher": {
			title: "QUnit Page for sap.ui.test.launchers.iFrameLauncher",
			loader: {
				paths: {
					"fixture": "test-resources/sap/ui/core/qunit/opa/fixture/"
				}
			},
			module: "./launchers/iFrameLauncher.qunit"
		},
		"matchers/AggregationContainsPropertyEquals": {
			title: "QUnit Page for sap.ui.test.matchers.AggregationContainsPropertyEqual",
			module: "./matchers/AggregationContainsPropertyEquals.qunit"
		},
		"matchers/AggregationEmpty": {
			title: "QUnit Page for sap.ui.test.matchers.AggregationEmpty",
			module: "./matchers/AggregationEmpty.qunit"
		},
		"matchers/AggregationFilled": {
			title: "QUnit Page for sap.ui.test.matchers.AggregationFilled",
			module: "./matchers/AggregationFilled.qunit"
		},
		"matchers/AggregationLengthEquals": {
			title: "QUnit Page for AggregationLengthEquals",
			module: "./matchers/AggregationLengthEquals.qunit"
		},
		"matchers/Ancestor": {
			title: "QUnit Page for sap.ui.test.matchers.Ancestor",
			module: "./matchers/Ancestor.qunit"
		},
		"matchers/Descendant": {
			title: "QUnit Page for sap.ui.test.matchers.Descendant",
			module: "./matchers/Descendant.qunit"
		},
		"matchers/Sibling": {
			title: "QUnit Page for sap.ui.test.matchers.Sibling",
			module: "./matchers/Sibling.qunit"
		},
		"matchers/BindingPath": {
			title: "QUnit Page for sap.ui.test.matchers.BindingPath",
			module: "./matchers/BindingPath.qunit"
		},
		"matchers/I18NText": {
			title: "QUnit Page for sap.ui.test.matchers.I18NText",
			module: "./matchers/I18NText.qunit"
		},
		"matchers/Interactable": {
			title: "QUnit Page for sap.ui.test.matchers.Interactable",
			module: "./matchers/Interactable.qunit",
			autostart: false
		},
		"matchers/LabelFor": {
			title: "QUnit Page for sap.ui.test.matchers.LabelFor",
			module: "./matchers/LabelFor.qunit"
		},
		"matchers/MatcherFactory": {
			title: "QUnit Page for sap.ui.test.matchers.MatcherFactory",
			module: "./matchers/MatcherFactory.qunit"
		},
		"matchers/Properties": {
			title: "QUnit Page for sap.ui.test.matchers.Properties",
			module: "./matchers/Properties.qunit"
		},
		"matchers/PropertyStrictEquals": {
			title: "QUnit Page for sap.ui.test.matchers.PropertyStrictEquals",
			module: "./matchers/PropertyStrictEquals.qunit"
		},
		"matchers/Visible": {
			title: "QUnit Page for sap.ui.test.matchers.Visible",
			module: "./matchers/Visible.qunit"
		},
		"matchers/_Visitor": {
			title: "QUnit Page for sap.ui.test.matchers._Visitor",
			module: "./matchers/_Visitor.qunit"
		},
		"matchers/_Busy": {
			title: "QUnit Page for sap.ui.test.matchers._Busy",
			module: "./matchers/_Busy.qunit"
		},
		"matchers/_Enabled": {
			title: "QUnit Page for sap.ui.test.matchers._Enabled",
			module: "./matchers/_Enabled.qunit"
		},
		"matchers/_Editable": {
			title: "QUnit Page for sap.ui.test.matchers._Editable",
			module: "./matchers/_Editable.qunit"
		},
		"Opa": {
			title: "QUnit Page for sap.ui.test.Opa",
			qunit: {
				// needed for tests that unload OPA
				reorder: false
			},
			module: "./Opa.qunit"
		},
		"opa5/_ParameterValidator": {
			title: "QUnit Page for sap.ui.test.Opa5 - _ParameterValidator",
			module: "./opa5/_ParameterValidator.qunit"
		},
		"opa5/actions": {
			title: "QUnit Page for sap.ui.test.Opa5 - Actions",
			module: "./opa5/actions.qunit"
		},
		"opa5/autoWait": {
			title: "QUnit Page for sap.ui.test.Opa5 - autoWait",
			loader: {
				paths: {
					"fixture": "test-resources/sap/ui/core/qunit/opa/fixture/"
				}
			},
			module: "./opa5/autoWait.qunit"
		},
		"opa5/basics": {
			title: "QUnit Page for sap.ui.test.Opa5 - Basics",
			module: "./opa5/basics.qunit"
		},
		"opa5/component": {
			title: "QUnit Page for sap.ui.test.Opa5 - Component",
			loader: {
				paths: {
					"samples" : "test-resources/sap/ui/core/samples/"
				}
			},
			module: "./opa5/component.qunit"
		},
		"opa5/iFrame": {
			title: "QUnit Page for sap.ui.test.Opa5 - iFrame common tests",
			module: "./opa5/iFrame.qunit"
		},
		"opa5/iFrameLogging": {
			title: "QUnit Page for sap.ui.test.Opa5 - iFrame logging",
			module: "./opa5/iFrameLogging.qunit"
		},
		"opa5/matchersInFrame": {
			title: "QUnit Page for sap.ui.test.Opa5 - matchers in iFrame",
			module: "./opa5/matchersInFrame.qunit"
		},
		"opa5/launchers": {
			title: "QUnit Page for sap.ui.test.Opa5 - Launchers",
			loader: {
				paths: {
					"samples" : "test-resources/sap/ui/core/samples/"
				}
			},
			module: "./opa5/launchers.qunit"
		},
		"opa5/logging": {
			title: "QUnit Page for sap.ui.test.Opa5 - Logging",
			module: "./opa5/logging.qunit"
		},
		"opa5/matchers": {
			title: "QUnit Page for sap.ui.test.Opa5 - Matchers",
			module: "./opa5/matchers.qunit",
			// in sinon v4, there is a timing issue in "Should execute a matcher and pass its value to success if no control is searched"
			sinon: {
				version: 1,
				qunitBridge: true
			}
		},
		"Opa5Extensions": {
			title: "QUnit Page for sap.ui.test.Opa5",
			module: "./Opa5Extensions.qunit"
		},
		"Opa5PageObject": {
			title: "QUnit Page for sap.ui.test.Opa5 Page Objects",
			module: "./Opa5PageObject.qunit"
		},
		"OpaIntegration": {
			title: "QUnit Page for sap.ui.test.Opa",
			module: "./OpaIntegration.qunit"
		},
		"OpaPlugin": {
			title: "QUnit Page for sap.ui.test.OpaPlugin",
			ui5: {
				libs: ["sap.m"]
			},
			module: "./OpaPlugin.qunit",
			loader: {
				paths: {
					"fixture": "test-resources/sap/ui/core/qunit/opa/fixture/"
				}
			}
		},
		"opaQunit": {
			title: "QUnit Page for sap.ui.test.opaQunit",
			module: "./opaQunit.qunit"
		},
		"pipelines/ActionPipeline": {
			title: "QUnit Page for sap.ui.test.pipelines.ActionPipeline",
			module: "./pipelines/ActionPipeline.qunit"
		},
		"pipelines/MatcherPipeline": {
			title: "QUnit Page for sap.ui.test.pipelines.MatcherPipeline",
			module: "./pipelines/MatcherPipeline.qunit"
		},
		"pipelines/PipelineFactory": {
			title: "QUnit Page for sap.ui.test.pipelines.PipelineFactory",
			module: "./pipelines/PipelineFactory.qunit"
		},
		"_ControlFinder": {
			title: "QUnit Page for sap.ui.test._ControlFinder",
			module: "./_ControlFinder.qunit"
		},
		"_LogCollector": {
			title: "QUnit Page for sap.ui.test._LogCollector",
			module: "./_LogCollector.qunit"
		},
		"_OpaLogger": {
			title: "QUnit Page for sap.ui.test._OpaLogger",
			module: "./_OpaLogger.qunit"
		},
		"_OpaUriParameterParser": {
			title: "QUnit Page for sap.ui.test._OpaUriParameterParser",
			module: "./_OpaUriParameterParser.qunit"
		},
		"_UsageReport": {
			title: "QUnit Page for sap.ui.test._UsageReport",
			module: "./_UsageReport.qunit"
		},
		"RecordReplay": {
			title: "QUnit Page for sap.ui.test.RecordReplay",
			module: "./RecordReplay.qunit"
		},
		"selectors/selectors": {
			title: "QUnit Page for sap.ui.test.selectors",
			module: "./selectors/selectors.qunit"
		},
		"_BrowserLogCollector": {
			title: "QUnit Page for sap.ui.test._BrowserLogCollector",
			module: "./_BrowserLogCollector.qunit"
		},
		"OpaBuilder": {
			title: "QUnit Page for sap.ui.test.OpaBuilder",
			module: "./OpaBuilder.qunit"
		}
	};

	var oTestSuite = {
		name: "TestSuite for sap.ui.core: GTP testcase CORE/OPA",
		defaults: {
			ui5: {
				animation: false
			},
			sinon: {
				version: 4,
				qunitBridge: true,
				useFakeTimers: false
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

	Object.keys(oCommonTests).forEach(function (name) {
		oTestSuite.tests[name + "1"] = merge({}, oCommonTests[name], {qunit: { version: 1 }});
		oTestSuite.tests[name + "2"] = merge({}, oCommonTests[name], {qunit: { version: 2 }});

		// temporary solution to run Press suite with both qunit 1 and 2: press.qunit.html should be part of opa testsuite but nested suites are not supported
		if (oTestSuite.tests[name + "1"].page) {
			oTestSuite.tests[name + "1"].page = oTestSuite.tests[name + "1"].page.replace("{qunitVersion}", "1");
		}
		if ( oTestSuite.tests[name + "2"].page ) {
			oTestSuite.tests[name + "2"].page = oTestSuite.tests[name + "2"].page.replace("{qunitVersion}", "2");
			oTestSuite.tests[name + "2"].page += (oTestSuite.tests[name + "2"].page.includes("?") ? "&" : "?") + "sap-ui-qunitversion=2";
		}

		if ( oTestSuite.tests[name + "2"].title ) {
			oTestSuite.tests[name + "2"].title = oTestSuite.tests[name + "2"].title + " (QUnit 2)";
		}
	});

	return oTestSuite;
});
