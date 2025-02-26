sap.ui.define([
], function() {
	"use strict";

	var oTestSuite = {
		name: "TestSuite for sap.ui.core: GTP testcase CORE/OPA",
		defaults: {
			ui5: {
				animation: false
			},
			qunit: {
				version: 2
			},
			sinon: {
				version: 4,
				qunitBridge: true,
				useFakeTimers: false
			}
		},
		tests: {
			"qunitPause": {
				title: "QUnit Page for qunitPause"
			},

			"actions/Action": {
				title: "QUnit Page for sap.ui.test.actions.Action"
			},

			"actions/DnD": {
				title: "QUnit Page for sap.ui.test.actions.Drag and sap.ui.test.actions.Drop",
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

			"actions/EnterText": {
				title: "QUnit Page for sap.ui.test.actions.EnterText",
				qunit: {
					testTimeout: 5000
				}
			},

			"actions/Press2": {
				/* Hasher -> own page needed */
				page: "test-resources/sap/ui/core/qunit/opa/actions/Press.qunit2.html",
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
				}
			},

			"sap/ui/core/demokit/sample/matcher/BindingPath/testsuite.qunit.html": {
				page: "test-resources/sap/ui/core/demokit/sample/matcher/BindingPath/testsuite.qunit.html",
				title: "Opa Sample for Binding Path Matcher",
				ui5: {
					libs: "sap.m"
				}
			},

			"sap/ui/core/demokit/sample/matcher/Descendant/testsuite.qunit.html": {
				page: "test-resources/sap/ui/core/demokit/sample/matcher/Descendant/testsuite.qunit.html",
				title: "Opa Sample for Descendant Matcher",
				ui5: {
					libs: "sap.m"
				}
			},

			"sap/ui/core/demokit/sample/matcher/I18NText/testsuite.qunit.html": {
				page: "test-resources/sap/ui/core/demokit/sample/matcher/I18NText/testsuite.qunit.html",
				title: "Opa Sample for I18N Text Matcher",
				ui5: {
					libs: "sap.m"
				}
			},

			"sap/ui/core/demokit/sample/matcher/LabelFor/testsuite.qunit.html": {
				page: "test-resources/sap/ui/core/demokit/sample/matcher/LabelFor/testsuite.qunit.html",
				title: "Opa Sample for LabelFor Matcher",
				ui5: {
					libs: "sap.m"
				}
			},

			"sap/ui/core/demokit/sample/OpaAction/testsuite.qunit.html": {
				page: "test-resources/sap/ui/core/demokit/sample/OpaAction/testsuite.qunit.html",
				title: "Opa sample for triggering actions on controls",
				ui5: {
					libs: "sap.m"
				},
				loader: {
					paths: {
						appUnderTest: "./applicationUnderTest",
						"sap/ui/demo/mock": "../../../../../../sap/ui/documentation/sdk/"
					}
				}
			},

			"demokit/sample/OpaAutoWaitParams/OpaAutoWaitParams": {
				page: "test-resources/sap/ui/core/demokit/sample/OpaAutoWaitParams/OpaAutoWaitParams.html?sap-ui-animation=false",
				title: "OPA5 AutoWait Parameters"
			},

			"sap/ui/core/demokit/sample/OpaBusyIndicator/testsuite.qunit.html": {
				page: "test-resources/sap/ui/core/demokit/sample/OpaBusyIndicator/testsuite.qunit.html",
				title: "Testing busy controls with OPA5"
			},

			"sap/ui/core/demokit/sample/OpaById/testsuite.qunit.html": {
				page: "test-resources/sap/ui/core/demokit/sample/OpaById/testsuite.qunit.html",
				title: "Opa sample for retrieving controls by id"
			},

			"sap/ui/core/demokit/sample/OpaDynamicWait/testsuite.qunit.html": {
				page: "test-resources/sap/ui/core/demokit/sample/OpaDynamicWait/testsuite.qunit.html",
				title: "Opa sample for nested actions"
			},

			"sap/ui/core/demokit/sample/OpaMatchers/testsuite.qunit.html": {
				page: "test-resources/sap/ui/core/demokit/sample/OpaMatchers/testsuite.qunit.html",
				title: "Opa sample for matchers"
			},

			"sap/ui/core/demokit/sample/OpaPageObject/testsuite.qunit.html": {
				page: "test-resources/sap/ui/core/demokit/sample/OpaPageObject/testsuite.qunit.html",
				title: "Opa sample for PageObjects",
				loader: {
					paths: {
						"myApp/test": "./"
					}
				}
			},

			"sap/ui/core/demokit/sample/OpaStartup/iStartMyAppInAFrame/testsuite.qunit.html": {
				page: "test-resources/sap/ui/core/demokit/sample/OpaStartup/iStartMyAppInAFrame/testsuite.qunit.html",
				title: "Opa sample for starting an app with a frame",
				ui5: {
					libs: "sap.m"
				}
			},

			"sap/ui/core/demokit/sample/OpaStartup/iStartMyUIComponent/testsuite.qunit.html": {
				page: "test-resources/sap/ui/core/demokit/sample/OpaStartup/iStartMyUIComponent/testsuite.qunit.html",
				title: "OPA sample for starting an app with a component",
				ui5: {
					libs: "sap.m"
				},
				loader: {
					paths: {
						"sap/ui/sample/appUnderTest": "./applicationUnderTest",
						"sap/ui/sample/appUnderTest/view": "./applicationUnderTest/view",
						"sap/ui/demo/mock": "../../../../../../../sap/ui/documentation/sdk/"
					}
				}
			},

			"sap/ui/core/demokit/sample/OpaStaticAreaControls/testsuite.qunit.html": {
				page: "test-resources/sap/ui/core/demokit/sample/OpaStaticAreaControls/testsuite.qunit.html",
				title: "Retrieving controls in the static area with OPA5"
			},

			"sap/ui/core/demokit/sample/OpaTestLibrary/testsuite.qunit.html": {
				page: "test-resources/sap/ui/core/demokit/sample/OpaTestLibrary/testsuite.qunit.html",
				title: "OPA5 Test Library Sample"
			},

			"sap/ui/core/demokit/sample/OpaURLParameters/iStartMyAppInAFrameWithURLParameters/testsuite.qunit.html": {
				page: "test-resources/sap/ui/core/demokit/sample/OpaURLParameters/iStartMyAppInAFrameWithURLParameters/testsuite.qunit.html",
				title: "Opa sample passing URL parameters to the IFrame"
			},

			"sap/ui/core/demokit/sample/OpaURLParameters/iStartMyUIComponentWithURLParameters/testsuite.qunit.html": {
				page: "test-resources/sap/ui/core/demokit/sample/OpaURLParameters/iStartMyUIComponentWithURLParameters/testsuite.qunit.html",
				title: "OPA sample passing URL parameters"
			},

			"launchers/componentLauncher": {
				title: "QUnit Page for sap.ui.test.launchers.componentLauncher",
				loader: {
					paths: {
						"samples" : "test-resources/sap/ui/core/samples/"
					}
				}
			},

			"launchers/iFrameLauncher": {
				title: "QUnit Page for sap.ui.test.launchers.iFrameLauncher",
				loader: {
					paths: {
						"fixture": "test-resources/sap/ui/core/qunit/opa/fixture/"
					}
				}
			},

			"matchers/AggregationContainsPropertyEquals": {
				title: "QUnit Page for sap.ui.test.matchers.AggregationContainsPropertyEqual"
			},

			"matchers/AggregationEmpty": {
				title: "QUnit Page for sap.ui.test.matchers.AggregationEmpty"
			},

			"matchers/AggregationFilled": {
				title: "QUnit Page for sap.ui.test.matchers.AggregationFilled"
			},

			"matchers/AggregationLengthEquals": {
				title: "QUnit Page for AggregationLengthEquals"
			},

			"matchers/Ancestor": {
				title: "QUnit Page for sap.ui.test.matchers.Ancestor"
			},

			"matchers/BindingPath": {
				title: "QUnit Page for sap.ui.test.matchers.BindingPath"
			},

			"matchers/Descendant": {
				title: "QUnit Page for sap.ui.test.matchers.Descendant"
			},

			"matchers/I18NText": {
				title: "QUnit Page for sap.ui.test.matchers.I18NText"
			},

			"matchers/Interactable": {
				title: "QUnit Page for sap.ui.test.matchers.Interactable",
				autostart: false
			},

			"matchers/LabelFor": {
				title: "QUnit Page for sap.ui.test.matchers.LabelFor"
			},

			"matchers/MatcherFactory": {
				title: "QUnit Page for sap.ui.test.matchers.MatcherFactory"
			},

			"matchers/Properties": {
				title: "QUnit Page for sap.ui.test.matchers.Properties"
			},

			"matchers/PropertyStrictEquals": {
				title: "QUnit Page for sap.ui.test.matchers.PropertyStrictEquals"
			},

			"matchers/Sibling": {
				title: "QUnit Page for sap.ui.test.matchers.Sibling"
			},

			"matchers/Visible": {
				title: "QUnit Page for sap.ui.test.matchers.Visible"
			},

			"matchers/_Busy": {
				title: "QUnit Page for sap.ui.test.matchers._Busy"
			},

			"matchers/_Editable": {
				title: "QUnit Page for sap.ui.test.matchers._Editable"
			},

			"matchers/_Enabled": {
				title: "QUnit Page for sap.ui.test.matchers._Enabled"
			},

			"matchers/_Visitor": {
				title: "QUnit Page for sap.ui.test.matchers._Visitor"
			},

			"Opa": {
				title: "QUnit Page for sap.ui.test.Opa",
				qunit: {
					// needed for tests that unload OPA
					reorder: false
				}
			},

			"opa5/_ParameterValidator": {
				title: "QUnit Page for sap.ui.test.Opa5 - _ParameterValidator"
			},

			"opa5/actions": {
				title: "QUnit Page for sap.ui.test.Opa5 - Actions"
			},

			"opa5/autoWait": {
				title: "QUnit Page for sap.ui.test.Opa5 - autoWait",
				loader: {
					paths: {
						"fixture": "test-resources/sap/ui/core/qunit/opa/fixture/"
					}
				}
			},

			"opa5/basics": {
				title: "QUnit Page for sap.ui.test.Opa5 - Basics"
			},

			"opa5/component": {
				title: "QUnit Page for sap.ui.test.Opa5 - Component",
				loader: {
					paths: {
						"samples" : "test-resources/sap/ui/core/samples/"
					}
				}
			},

			"opa5/iFrame": {
				title: "QUnit Page for sap.ui.test.Opa5 - iFrame common tests"
			},

			"opa5/iFrameLogging": {
				title: "QUnit Page for sap.ui.test.Opa5 - iFrame logging"
			},

			"opa5/matchersInFrame": {
				title: "QUnit Page for sap.ui.test.Opa5 - matchers in iFrame"
			},

			"opa5/launchers": {
				title: "QUnit Page for sap.ui.test.Opa5 - Launchers",
				loader: {
					paths: {
						"samples" : "test-resources/sap/ui/core/samples/"
					}
				}
			},

			"opa5/logging": {
				title: "QUnit Page for sap.ui.test.Opa5 - Logging"
			},

			"opa5/matchers": {
				title: "QUnit Page for sap.ui.test.Opa5 - Matchers",
				// in sinon v4, there is a timing issue in "Should execute a matcher and pass its value to success if no control is searched"
				sinon: {
					version: 1,
					qunitBridge: true
				}
			},

			"Opa5Extensions": {
				title: "QUnit Page for sap.ui.test.Opa5"
			},

			"Opa5PageObject": {
				title: "QUnit Page for sap.ui.test.Opa5 Page Objects"
			},

			"OpaIntegration": {
				title: "QUnit Page for sap.ui.test.Opa"
			},

			"OpaPlugin": {
				title: "QUnit Page for sap.ui.test.OpaPlugin",
				ui5: {
					libs: ["sap.m"]
				},
				loader: {
					paths: {
						"fixture": "test-resources/sap/ui/core/qunit/opa/fixture/"
					}
				}
			},

			"opaQunit": {
				title: "QUnit Page for sap.ui.test.opaQunit"
			},

			"pipelines/ActionPipeline": {
				title: "QUnit Page for sap.ui.test.pipelines.ActionPipeline"
			},

			"pipelines/MatcherPipeline": {
				title: "QUnit Page for sap.ui.test.pipelines.MatcherPipeline"
			},

			"pipelines/PipelineFactory": {
				title: "QUnit Page for sap.ui.test.pipelines.PipelineFactory"
			},

			"_ControlFinder": {
				title: "QUnit Page for sap.ui.test._ControlFinder"
			},

			"_LogCollector": {
				title: "QUnit Page for sap.ui.test._LogCollector"
			},

			"_OpaLogger": {
				title: "QUnit Page for sap.ui.test._OpaLogger"
			},

			"_OpaUriParameterParser": {
				title: "QUnit Page for sap.ui.test._OpaUriParameterParser"
			},

			"_UsageReport": {
				title: "QUnit Page for sap.ui.test._UsageReport"
			},

			"RecordReplay": {
				title: "QUnit Page for sap.ui.test.RecordReplay"
			},

			"selectors/selectors": {
				title: "QUnit Page for sap.ui.test.selectors"
			},

			"_BrowserLogCollector": {
				title: "QUnit Page for sap.ui.test._BrowserLogCollector"
			},

			"OpaBuilder": {
				title: "QUnit Page for sap.ui.test.OpaBuilder"
			}
		}
	};

	return oTestSuite;
});
