sap.ui.define([
	"sap/base/util/merge",
	"sap/base/Log"
], function(
	merge,
	Log
) {
	"use strict";

	var mConfig = {
		name: "sap.ui.rta",
		defaults: {
			group: "Default",
			qunit: {
				version: 2
			},
			sinon: false,
			ui5: {
				language: "en",
				libs: ["sap.ui.core", "sap.m", "sap.ui.fl", "sap.ui.dt", "sap.ui.rta", "sap.ui.layout"],
				"xx-waitForTheme": "init"
			},
			coverage: {
				only: ["sap/ui/rta"],
				branchTracking: true
			},
			page: "test-resources/sap/ui/rta/qunit/testsandbox.qunit.html?testsuite={suite}&test={name}",
			autostart: true
		},
		// keep tests in alphabetical order!
		tests: {
			// Opa Testsuite
			"opa/testsuite": {
				title: "Opa Testsuite",
				group: "Opa Testsuite",
				page: "test-resources/sap/ui/rta/qunit/opa/testsuite.opa.qunit.html"
			},

			// API
			"api/startKeyUserAdaptation": {
				group: "API",
				coverage: {
					only: ["sap/ui/rta/api/startKeyUserAdaptation"]
				}
			},
			"api/startAdaptation": {
				group: "API",
				coverage: {
					only: ["sap/ui/rta/api/startAdaptation"]
				}
			},

			// AppContexts
			"appContexts/controller/ManageContexts.controller": {
				group: "AppContexts",
				coverage: {
					only: ["sap/ui/rta/appContexts/controller/ManageContexts.controller"]
				}
			},

			// AppVariant
			"appVariant/AppVariantDialog": {
				group: "AppVariant",
				coverage: {
					only: ["sap/ui/rta/appVariant/AppVariantDialog"]
				}
			},
			"appVariant/AppVariantManager": {
				group: "AppVariant",
				coverage: {
					only: ["sap/ui/rta/appVariant/AppVariantManager"]
				}
			},
			"appVariant/AppVariantOverviewDialog": {
				group: "AppVariant",
				coverage: {
					only: ["sap/ui/rta/appVariant/AppVariantOverviewDialog"]
				}
			},
			"appVariant/AppVariantUtils": {
				group: "AppVariant",
				coverage: {
					only: ["sap/ui/rta/appVariant/AppVariantUtils"]
				}
			},
			"appVariant/Feature": {
				group: "AppVariant",
				coverage: {
					only: ["sap/ui/rta/appVariant/Feature"]
				}
			},
			"appVariant/ManageAppsController": {
				group: "AppVariant",
				coverage: {
					only: ["sap/ui/rta/appVariant/manageApps/webapp/controller/ManageApps.controller"]
				}
			},
			"appVariant/ManageAppsUtils": {
				group: "AppVariant",
				coverage: {
					only: ["sap/ui/rta/appVariant/Utils"]
				}
			},
			"appVariant/S4HanaCloudBackend": {
				group: "AppVariant",
				coverage: {
					only: ["sap/ui/rta/appVariant/S4HanaCloudBackend"]
				}
			},

			// Client
			"client/Client": {
				group: "Client",
				coverage: {
					only: ["sap/ui/rta/Client"]
				}
			},

			// Commands
			"command/appDescriptor/AddLibrary": {
				group: "Command",
				coverage: {
					only: ["sap/ui/rta/command/appDescriptor/AddLibrary"]
				}
			},
			"command/compVariant/CompVariantContent": {
				group: "Command",
				coverage: {
					only: ["sap/ui/rta/command/compVariant/CompVariantContent"]
				}
			},
			"command/compVariant/CompVariantSaveAs": {
				group: "Command",
				coverage: {
					only: ["sap/ui/rta/command/compVariant/CompVariantSaveAs"]
				}
			},
			"command/compVariant/CompVariantSwitch": {
				group: "Command",
				coverage: {
					only: ["sap/ui/rta/command/compVariant/CompVariantSwitch"]
				}
			},
			"command/compVariant/CompVariantUpdate": {
				group: "Command",
				coverage: {
					only: ["sap/ui/rta/command/compVariant/CompVariantUpdate"]
				}
			},
			"command/AddDelegateProperty": {
				group: "Command",
				coverage: {
					only: ["sap/ui/rta/command/AddProperty"]
				},
				ui5: {
					resourceroots: {
						"rta/test": "test-resources/sap/ui/rta/"
					}
				}
			},
			"command/AddIFrame": {
				group: "Command",
				coverage: {
					only: ["sap/ui/rta/command/AddIFrame"]
				},
				ui5: {
					resourceroots: {
						"rta/test": "test-resources/sap/ui/rta/"
					}
				}
			},
			"command/AddXML": {
				group: "Command",
				coverage: {
					only: ["sap/ui/rta/command/AddXML"]
				},
				ui5: {
					"xx-designMode": true
				}
			},
			"command/AddXMLAtExtensionPoint": {
				group: "Command",
				coverage: {
					only: ["sap/ui/rta/command/AddXMLAtExtensionPoint"]
				},
				ui5: {
					"xx-designMode": true
				}
			},
			"command/AppDescriptorCommand": {
				group: "Command",
				coverage: {
					only: ["sap/ui/rta/command/AppDescriptorCommand"]
				}
			},
			"command/BaseCommand": {
				group: "Command",
				coverage: {
					only: ["sap/ui/rta/command/BaseCommand"]
				},
				ui5: {
					"xx-designMode": true
				}
			},
			"command/BindProperty": {
				group: "Command",
				coverage: {
					only: ["sap/ui/rta/command/BindProperty"]
				},
				ui5: {
					resourceroots: {
						"rta/test": "test-resources/sap/ui/rta/"
					}
				}
			},
			"command/Combine": {
				group: "Command",
				coverage: {
					only: ["sap/ui/rta/command/Combine"]
				},
				ui5: {
					resourceroots: {
						"rta/test": "test-resources/sap/ui/rta/"
					}
				}
			},
			"command/ControlVariantConfigure": {
				group: "Command",
				coverage: {
					only: ["sap/ui/rta/command/ControlVariantConfigure"]
				}
			},
			"command/ControlVariantSave": {
				group: "Command",
				coverage: {
					only: ["sap/ui/rta/command/ControlVariantSave"]
				}
			},
			"command/ControlVariantSaveAs": {
				group: "Command",
				coverage: {
					only: ["sap/ui/rta/command/ControlVariantSaveAs"]
				}
			},
			"command/ControlVariantSetTitle": {
				group: "Command",
				coverage: {
					only: ["sap/ui/rta/command/ControlVariantSetTitle"]
				}
			},
			"command/ControlVariantSwitch": {
				group: "Command",
				coverage: {
					only: ["sap/ui/rta/command/ControlVariantSwitch"]
				}
			},
			"command/CreateContainer": {
				group: "Command",
				coverage: {
					only: ["sap/ui/rta/command/CreateContainer"]
				},
				ui5: {
					resourceroots: {
						"rta/test": "test-resources/sap/ui/rta/"
					}
				}
			},
			"command/CustomAdd": {
				group: "Command",
				coverage: {
					only: ["sap/ui/rta/command/CustomAdd"]
				},
				ui5: {
					resourceroots: {
						"rta/test": "test-resources/sap/ui/rta/"
					}
				}
			},
			"command/LocalReset": {
				group: "Command",
				coverage: {
					only: ["sap/ui/rta/command/LocalReset"]
				}
			},
			"command/LREPSerializer": {
				group: "Command",
				coverage: {
					only: ["sap/ui/rta/command/LREPSerializer"]
				},
				ui5: {
					resourceroots: {
						qunit: "test-resources/sap/ui/rta/qunit/",
						"sap.ui.rta.qunitrta": "test-resources/sap/ui/rta/internal/testdata/qunit_rta/",
						"sap.ui.rta.test": "test-resources/sap/ui/rta/internal/testdata/rta/"
					},
					flexibilityServices: '[{"connector": "SessionStorageConnector"}]'
				}
			},
			"command/Move": {
				group: "Command",
				coverage: {
					only: ["sap/ui/rta/command/Move"]
				},
				ui5: {
					resourceroots: {
						"rta/test": "test-resources/sap/ui/rta/"
					}
				}
			},
			"command/Property": {
				group: "Command",
				coverage: {
					only: ["sap/ui/rta/command/Property"]
				},
				ui5: {
					resourceroots: {
						"rta/test": "test-resources/sap/ui/rta/"
					}
				}
			},
			"command/Remove": {
				group: "Command",
				coverage: {
					only: ["sap/ui/rta/command/Remove"]
				},
				ui5: {
					resourceroots: {
						"rta/test": "test-resources/sap/ui/rta/"
					}
				}
			},
			"command/Rename": {
				group: "Command",
				coverage: {
					only: ["sap/ui/rta/command/Rename"]
				},
				ui5: {
					resourceroots: {
						"rta/test": "test-resources/sap/ui/rta/"
					}
				}
			},
			"command/Resize": {
				group: "Command",
				coverage: {
					only: ["sap/ui/rta/command/Resize"]
				},
				ui5: {
					resourceroots: {
						"rta/test": "test-resources/sap/ui/rta/"
					}
				}
			},
			"command/Reveal": {
				group: "Command",
				coverage: {
					only: ["sap/ui/rta/command/Reveal"]
				},
				ui5: {
					resourceroots: {
						"rta/test": "test-resources/sap/ui/rta/"
					}
				}
			},
			"command/Settings": {
				group: "Command",
				coverage: {
					only: ["sap/ui/rta/command/Settings"]
				},
				ui5: {
					resourceroots: {
						"rta/test": "test-resources/sap/ui/rta/"
					}
				}
			},
			"command/Split": {
				group: "Command",
				coverage: {
					only: ["sap/ui/rta/command/Split"]
				},
				ui5: {
					resourceroots: {
						"rta/test": "test-resources/sap/ui/rta/"
					}
				}
			},
			"command/Stack": {
				group: "Command",
				coverage: {
					only: ["sap/ui/rta/command/Stack"]
				}
			},

			// DesignTime Tool
			"dttool/controls/ListItem": {
				group: "DtTool",
				coverage: {
					only: ["sap/ui/rta/internal/dttool/controls/DTToolListItem"]
				},
				ui5: {
					resourceroots: {
						"sap.ui.rta.internal.dttool": "test-resources/sap/ui/rta/internal/dttool/"
					}
				}
			},
			"dttool/controls/OutlineTree": {
				group: "DtTool",
				coverage: {
					only: ["sap/ui/rta/internal/dttool/controls/OutlineTree"]
				},
				ui5: {
					resourceroots: {
						"sap.ui.rta.internal.dttool": "test-resources/sap/ui/rta/internal/dttool/"
					}
				}
			},

			// Element Action Test
			"enablement/elementActionTest": {
				coverage: {
					only: ["sap/ui/rta/enablement/elementActionTest"]
				}
			},

			// Integration tests
			"integration/SimpleFormRemove": {
				group: "Integration",
				ui5: {
					libs: "sap.ui.layout, sap.ui.rta",
					resourceroots: {
						"sap.ui.rta.test": "test-resources/sap/ui/rta/internal/testdata/rta/"
					}
				}
			},

			// Plugins
			"plugin/additionalElements/AddElementsDialog": {
				group: "Plugin",
				coverage: {
					only: ["sap/ui/rta/plugin/additionalElements/AddElementsDialog"]
				}
			},
			"plugin/additionalElements/ActionExtractor": {
				group: "Plugin",
				coverage: {
					only: ["sap/ui/rta/plugin/additionalElements/ActionExtractor"]
				}
			},
			"plugin/additionalElements/AdditionalElementsPlugin": {
				group: "Plugin",
				coverage: {
					only: [
						"sap/ui/rta/plugin/additionalElements/AdditionalElementsPlugin",
						"sap/ui/rta/plugin/additionalElements/ActionExtractor",
						"sap/ui/rta/plugin/additionalElements/CommandBuilder",
						"sap/ui/rta/plugin/additionalElements/AdditionalElementsUtils"
					]
				}
			},
			"plugin/additionalElements/AdditionalElementsPluginContextMenu": {
				group: "Plugin",
				coverage: {
					only: ["sap/ui/rta/plugin/additionalElements/AdditionalElementsPlugin"]
				}
			},
			"plugin/additionalElements/AddElementsMultipleAggregations": {
				group: "Plugin",
				coverage: {
					only: [
						"sap/ui/rta/plugin/additionalElements/AdditionalElementsPlugin",
						"sap/ui/rta/plugin/additionalElements/ActionExtractor",
						"sap/ui/rta/plugin/additionalElements/CommandBuilder",
						"sap/ui/rta/plugin/additionalElements/AdditionalElementsUtils"
					]
				}
			},
			"plugin/iframe/AddIFrameDialog": {
				group: "Plugin",
				coverage: {
					only: ["sap/ui/rta/plugin/iframe/AddIFrameDialog"]
				}
			},
			"plugin/iframe/urlCleaner": {
				group: "Plugin",
				coverage: {
					only: ["sap/ui/rta/plugin/iframe/urlCleaner"]
				}
			},
			"plugin/iframe/AddIFrame": {
				group: "Plugin",
				autostart: false,
				coverage: {
					only: [
						"sap/ui/rta/plugin/iframe/AddIFrame",
						"sap/ui/rta/plugin/BaseCreate"
					]
				}
			},
			"plugin/AddXMLAtExtensionPoint": {
				group: "Plugin",
				coverage: {
					only: ["sap/ui/rta/plugin/AddXMLAtExtensionPoint"]
				},
				ui5: {
					resourceroots: {
						testComponent: "test-resources/sap/ui/rta/qunit/testComponent"
					}
				}
			},
			"plugin/Combine": {
				group: "Plugin",
				coverage: {
					only: ["sap/ui/rta/plugin/Combine"]
				}
			},
			"plugin/ControlVariant": {
				group: "Plugin",
				coverage: {
					only: ["sap/ui/rta/plugin/ControlVariant"]
				}
			},
			"plugin/CreateContainer": {
				group: "Plugin",
				autostart: false,
				coverage: {
					only: [
						"sap/ui/rta/plugin/CreateContainer",
						"sap/ui/rta/plugin/BaseCreate"
					]
				}
			},
			"plugin/CutPaste": {
				group: "Plugin",
				coverage: {
					only: ["sap/ui/rta/plugin/CutPaste"]
				}
			},
			"plugin/DragDrop": {
				group: "Plugin",
				coverage: {
					only: ["sap/ui/rta/plugin/DragDrop"]
				}
			},
			"plugin/EasyAdd": {
				group: "Plugin",
				coverage: {
					only: ["sap/ui/rta/plugin/EasyAdd"]
				}
			},
			"plugin/EasyRemove": {
				group: "Plugin",
				coverage: {
					only: ["sap/ui/rta/plugin/EasyRemove"]
				}
			},
			"plugin/LocalReset": {
				group: "Plugin",
				coverage: {
					only: ["sap/ui/rta/plugin/LocalReset"]
				}
			},
			"plugin/Plugin": {
				group: "Plugin",
				coverage: {
					only: ["sap/ui/rta/plugin/Plugin"]
				}
			},
			"plugin/Remove": {
				group: "Plugin",
				coverage: {
					only: ["sap/ui/rta/plugin/Remove"]
				}
			},
			"plugin/Rename": {
				group: "Plugin",
				coverage: {
					only: ["sap/ui/rta/plugin/Rename"]
				}
			},
			"plugin/Resize": {
				group: "Plugin",
				coverage: {
					only: ["sap/ui/rta/plugin/Resize"]
				}
			},
			"plugin/ResizeRTL": {
				group: "Plugin",
				coverage: {
					only: ["sap/ui/rta/plugin/Resize"]
				},
				ui5: {
					rtl: true
				}
			},
			"plugin/Selection": {
				group: "Plugin",
				coverage: {
					only: ["sap/ui/rta/plugin/Selection"]
				}
			},
			"plugin/Settings": {
				group: "Plugin",
				coverage: {
					only: ["sap/ui/rta/plugin/Settings"]
				}
			},
			"plugin/Split": {
				group: "Plugin",
				coverage: {
					only: ["sap/ui/rta/plugin/Split"]
				}
			},
			"plugin/Stretch": {
				group: "Plugin",
				coverage: {
					only: ["sap/ui/rta/plugin/Stretch"]
				}
			},

			// Services:
			"service/Action": {
				group: "Service",
				coverage: {
					only: ["sap/ui/rta/service/Action"]
				},
				ui5: {
					flexibilityServices: '[{"connector": "LocalStorageConnector"}]'
				}
			},
			"service/ControllerExtension": {
				group: "Service",
				coverage: {
					only: ["sap/ui/rta/service/ControllerExtension"]
				}
			},
			"service/Outline": {
				group: "Service",
				coverage: {
					only: ["sap/ui/rta/service/Outline"]
				},
				ui5: {
					resourceroots: {
						testdata: "test-resources/sap/ui/rta/testdata/",
						testComponent: "test-resources/sap/ui/rta/qunit/testComponent"
					}
				}
			},
			"service/Selection": {
				group: "Service",
				coverage: {
					only: ["sap/ui/rta/service/Selection"]
				}
			},
			"service/Property": {
				group: "Service",
				coverage: {
					only: ["sap/ui/rta/service/Property"]
				},
				ui5: {
					flexibilityServices: '[{"connector": "SessionStorageConnector"}]'
				}
			},

			// Toolbar
			"toolbar/Base": {
				group: "Toolbar",
				coverage: {
					only: ["sap/ui/rta/toolbar/Base"]
				}
			},
			"toolbar/Adaptation": {
				group: "Toolbar",
				coverage: {
					only: ["sap/ui/rta/toolbar/Adaptation"]
				}
			},
			"toolbar/OverflowToolbarButton": {
				group: "Toolbar",
				coverage: {
					only: ["sap/ui/rta/toolbar/OverflowToolbarButton"]
				}
			},
			"toolbar/translation/Translation": {
				group: "Toolbar",
				coverage: {
					only: ["sap/ui/rta/toolbar/translation/Translation"]
				}
			},
			"toolbar/Fiori": {
				group: "Toolbar",
				coverage: {
					only: ["sap/ui/rta/toolbar/Fiori"]
				}
			},
			"toolbar/FioriLike": {
				group: "Toolbar",
				coverage: {
					only: ["sap/ui/rta/toolbar/FioriLike"]
				}
			},

			// utilities
			"util/adaptationStarter": {
				group: "util",
				coverage: {
					only: ["sap/ui/rta/util/adaptationStarter"]
				}
			},
			"util/PluginManager": {
				group: "util",
				coverage: {
					only: ["sap/ui/rta/util/PluginManager"]
				}
			},
			"util/PopupManager": {
				group: "util",
				coverage: {
					only: ["sap/ui/rta/util/PopupManager"]
				}
			},
			"util/hasStableId": {
				group: "util",
				coverage: {
					only: ["sap/ui/rta/util/hasStableId"]
				}
			},
			"util/validateFlexEnabled": {
				group: "util",
				coverage: {
					only: ["sap/ui/rta/util/validateFlexEnabled"]
				},
				ui5: {
					flexibilityServices: '[{"connector": "LocalStorageConnector", "layers": ["ALL"]}]'
				}
			},
			"util/validateStableIds": {
				group: "util",
				coverage: {
					only: ["sap/ui/rta/util/validateStableIds"]
				}
			},
			"util/showMessageBox": {
				group: "util",
				coverage: {
					only: ["sap/ui/rta/util/showMessageBox"]
				}
			},
			"util/changeVisualization/categories/MoveVisualization": {
				group: "Change visualization",
				coverage: {
					only: [
						"sap/ui/rta/util/changeVisualization/categories/MoveVisualization"
					]
				}
			},
			"util/changeVisualization/categories/RenameVisualization": {
				group: "Change visualization",
				coverage: {
					only: [
						"sap/ui/rta/util/changeVisualization/categories/RenameVisualization"
					]
				}
			},
			"util/changeVisualization/categories/SplitVisualization": {
				group: "Change visualization",
				coverage: {
					only: [
						"sap/ui/rta/util/changeVisualization/categories/SplitVisualization"
					]
				}
			},
			"util/changeVisualization/ChangeIndicator": {
				group: "Change visualization",
				coverage: {
					only: [
						"sap/ui/rta/util/changeVisualization/ChangeIndicator"
					]
				}
			},
			"util/changeVisualization/ChangeIndicatorRegistry": {
				group: "Change visualization",
				coverage: {
					only: [
						"sap/ui/rta/util/changeVisualization/ChangeIndicatorRegistry"
					]
				}
			},
			"Generic Testsuite": {
				page: "test-resources/sap/ui/rta/qunit/testsuite.generic.qunit.html"
			}
		}
	};

	var bCompAvailable = false;
	var oXhr = new XMLHttpRequest();
	oXhr.onreadystatechange = function () {
		if (this.readyState === 4) {
			switch (this.status) {
				case 200:
				case 304:
					bCompAvailable = JSON.parse(this.responseText).libraries.some(function (mLibrary) {
						return mLibrary.name === "sap.ui.comp";
					});
					break;
				default:
					Log.info("Sorry, can't find file with library versions ¯\\_(ツ)_/¯");
			}
		}
	};

	oXhr.open("GET", sap.ui.require.toUrl("sap-ui-version.json"), false);
	oXhr.send();

	if (bCompAvailable) {
		mConfig = merge({}, mConfig, {
			tests: {
				ContextMenu: {
					ui5: {
						resourceroots: {
							qunit: "test-resources/sap/ui/rta/qunit/",
							"sap.ui.rta.qunitrta": "test-resources/sap/ui/rta/internal/testdata/qunit_rta/",
							"sap.ui.rta.test": "test-resources/sap/ui/rta/internal/testdata/rta/"
						},
						flexibilityServices: '[{"connector": "SessionStorageConnector"}]'
					},
					qunit: {
						reorder: false
					},
					autostart: false
				},
				RuntimeAuthoring: {
					coverage: {
						only: ["sap/ui/rta/RuntimeAuthoring"]
					},
					ui5: {
						resourceroots: {
							qunit: "test-resources/sap/ui/rta/qunit/",
							"sap.ui.rta.qunitrta": "test-resources/sap/ui/rta/internal/testdata/qunit_rta/",
							"sap.ui.rta.test": "test-resources/sap/ui/rta/internal/testdata/rta/"
						}
					}
				},
				"RuntimeAuthoring-2": {
					coverage: {
						only: ["sap/ui/rta/RuntimeAuthoring"]
					},
					ui5: {
						resourceroots: {
							qunit: "test-resources/sap/ui/rta/qunit/",
							"sap.ui.rta.qunitrta": "test-resources/sap/ui/rta/internal/testdata/qunit_rta/",
							"sap.ui.rta.test": "test-resources/sap/ui/rta/internal/testdata/rta/"
						},
						flexibilityServices: '[{"connector": "SessionStorageConnector"}]'
					}
				},
				"RuntimeAuthoring-3": {
					coverage: {
						only: ["sap/ui/rta/RuntimeAuthoring"]
					},
					ui5: {
						flexibilityServices: '[{"connector": "SessionStorageConnector"}]',
						resourceroots: {
							qunit: "test-resources/sap/ui/rta/qunit/",
							"sap.ui.rta.qunitrta": "test-resources/sap/ui/rta/internal/testdata/qunit_rta/",
							"sap.ui.rta.test": "test-resources/sap/ui/rta/internal/testdata/rta/"
						}
					}
				},
				"RuntimeAuthoring-versioning": {
					coverage: {
						only: ["sap/ui/rta/RuntimeAuthoring"]
					},
					ui5: {
						flexibilityServices: '[{"connector": "SessionStorageConnector"}]',
						resourceroots: {
							qunit: "test-resources/sap/ui/rta/qunit/",
							"sap.ui.rta.qunitrta": "test-resources/sap/ui/rta/internal/testdata/qunit_rta/",
							"sap.ui.rta.test": "test-resources/sap/ui/rta/internal/testdata/rta/"
						}
					}
				},
				Utils: {
					coverage: {
						only: ["sap/ui/rta/Utils"]
					},
					ui5: {
						libs: "sap.ui.rta, sap.uxap",
						resourceroots: {
							qunit: "test-resources/sap/ui/rta/qunit/",
							"sap.ui.rta.test": "test-resources/sap/ui/rta/internal/testdata/rta/",
							"sap.ui.rta.test.additionalElements": "test-resources/sap/ui/rta/internal/testdata/additionalElements/"
						}
					}
				},
				"integration/BasicFunctionality": {
					group: "Integration",
					ui5: {
						resourceroots: {
							qunit: "test-resources/sap/ui/rta/qunit/",
							"sap.ui.rta.qunitrta": "test-resources/sap/ui/rta/internal/testdata/qunit_rta/",
							"sap.ui.rta.test": "test-resources/sap/ui/rta/internal/testdata/rta/"
						},
						flexibilityServices: '[{"connector": "SessionStorageConnector"}]'
					}
				},
				"integration/EndToEnd": {
					group: "Integration",
					ui5: {
						resourceroots: {
							qunit: "test-resources/sap/ui/rta/qunit/",
							"sap.ui.rta.qunitrta": "test-resources/sap/ui/rta/internal/testdata/qunit_rta/",
							"sap.ui.rta.test": "test-resources/sap/ui/rta/internal/testdata/rta/"
						},
						flexibilityServices: '[{"connector": "SessionStorageConnector"}]'
					}
				},
				"plugin/additionalElements/AdditionalElementsAnalyzer": {
					group: "Plugin",
					coverage: {
						only: ["sap/ui/rta/plugin/additionalElements/AdditionalElementsAnalyzer"]
					},
					ui5: {
						resourceroots: {
							"sap.ui.rta.test.additionalElements": "test-resources/sap/ui/rta/internal/testdata/additionalElements/"
						}
					}
				},
				"plugin/additionalElements/AdditionalElementsAnalyzerOData": {
					group: "Plugin",
					coverage: {
						only: ["sap/ui/rta/plugin/additionalElements/AdditionalElementsAnalyzer"]
					},
					ui5: {
						resourceroots: {
							"sap.ui.rta.test.additionalElements": "test-resources/sap/ui/rta/internal/testdata/additionalElements/"
						}
					}
				},
				"plugin/CompVariant": {
					group: "Plugin",
					coverage: {
						only: ["sap/ui/rta/plugin/CompVariant"]
					},
					ui5: {
						flexibilityServices: '[{"connector": "SessionStorageConnector"}]'
					}
				},
				"plugin/RTAElementMover": {
					group: "Plugin",
					coverage: {
						only: ["sap/ui/rta/plugin/RTAElementMover"]
					},
					ui5: {
						resourceroots: {
							"sap.ui.rta.test.additionalElements": "test-resources/sap/ui/rta/internal/testdata/additionalElements/"
						}
					}
				},
				"util/changeVisualization/ChangeVisualization": {
					group: "Change visualization",
					coverage: {
						only: [
							"sap/ui/rta/util/changeVisualization/ChangeVisualization",
							"sap/ui/rta/util/changeVisualization/ChangeIndicator"
						]
					},
					ui5: {
						resourceroots: {
							qunit: "test-resources/sap/ui/rta/qunit/",
							"sap.ui.rta.qunitrta": "test-resources/sap/ui/rta/internal/testdata/qunit_rta/",
							"sap.ui.rta.test": "test-resources/sap/ui/rta/internal/testdata/rta/"
						}
					}
				},
				"util/BindingsExtractor": {
					group: "util",
					coverage: {
						only: ["sap/ui/rta/util/BindingsExtractor"]
					},
					ui5: {
						resourceroots: {
							"sap.ui.rta.test.additionalElements": "test-resources/sap/ui/rta/internal/testdata/additionalElements/"
						}
					}
				}
			}
		});
	} else {
		Log.info("sap.ui.comp not available", "enabling tests are skipped, ensure sap.ui.comp from sapui5.runtime is loaded to execute them");
	}

	return mConfig;
});
