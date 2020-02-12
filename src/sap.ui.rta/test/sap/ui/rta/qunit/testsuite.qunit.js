sap.ui.define([
	"sap/base/util/merge",
	"sap/base/Log"
], function (
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
				libs: ["sap.ui.rta"],
				"xx-waitForTheme": "init"
			},
			coverage: {
				only: ["sap/ui/rta"],
				branchTracking: true
			},
			page: "test-resources/sap/ui/rta/qunit/testsandbox.qunit.html?test={name}",
			autostart: true
		},
		tests: {
			AggregationBinding: {},
			"enablement/elementActionTest": {
				coverage: {
					only: ["sap/ui/rta/enablement/elementActionTest"]
				}
			},

			// Services:
			"service/Action": {
				group: 'Service',
				coverage: {
					only: ["sap/ui/rta/service/Action"]
				},
				ui5: {
					flexibilityServices: '[{"connector": "LocalStorageConnector"}]'
				}
			},
			"service/ControllerExtension": {
				group: 'Service',
				coverage: {
					only: ["sap/ui/rta/service/ControllerExtension"]
				}
			},
			"service/Outline": {
				group: 'Service',
				coverage: {
					only: ["sap/ui/rta/service/Outline"]
				},
				ui5: {
					resourceroots: {
						testdata: "test-resources/sap/ui/rta/testdata/"
					}
				}
			},
			"service/Selection": {
				group: 'Service',
				coverage: {
					only: ["sap/ui/rta/service/Selection"]
				}
			},
			"service/Property": {
				group: 'Service',
				coverage: {
					only: ["sap/ui/rta/service/Property"]
				}
			},

			"client/Client": {
				group: 'Client',
				coverage: {
					only: ["sap/ui/rta/Client"]
				}
			},

			// Toolbar
			"toolbar/Base": {
				group: 'Toolbar',
				coverage: {
					only: ["sap/ui/rta/toolbar/Base"]
				}
			},
			"toolbar/Adaptation": {
				group: 'Toolbar',
				coverage: {
					only: ["sap/ui/rta/toolbar/Adaptation"]
				}
			},
			"toolbar/Fiori": {
				group: 'Toolbar',
				coverage: {
					only: ["sap/ui/rta/toolbar/Fiori"]
				}
			},

			// Plugins
			"plugin/additionalElements/AddElementsDialog": {
				group: "Plugin",
				coverage: {
					only: ["sap/ui/rta/plugin/additionalElements/AddElementsDialog"]
				}
			},
			"plugin/additionalElements/AdditionalElementsPlugin": {
				group: "Plugin",
				coverage: {
					only: ["sap/ui/rta/plugin/additionalElements/AdditionalElementsPlugin"]
				}
			},
			"plugin/iframe/SettingsDialog": {
				group: "Plugin",
				coverage: {
					only: ["sap/ui/rta/plugin/iframe/SettingsDialog"]
				}
			},
			"plugin/iframe/URLBuilderDialog": {
				group: "Plugin",
				coverage: {
					only: ["sap/ui/rta/plugin/iframe/URLBuilderDialog"]
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
				coverage: {
					only: [
						"sap/ui/rta/plugin/iframe/AddIFrame",
						"sap/ui/rta/plugin/BaseCreate"
					]
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

			// Commands
			"command/BaseCommand": {
				group: "Command",
				coverage: {
					only: ["sap/ui/rta/command/BaseCommand"]
				},
				ui5: {
					"xx-designMode": true
				}
			},
			"command/AddODataProperty": {
				group: "Command",
				coverage: {
					only: ["sap/ui/rta/command/AddODataProperty"]
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
			"command/CustomAdd": {
				group: "Command",
				coverage: {
					only: ["sap/ui/rta/command/CustomAdd"]
				}
			},
			"command/Combine": {
				group: "Command",
				coverage: {
					only: ["sap/ui/rta/command/Combine"]
				}
			},
			"command/ControlVariantConfigure": {
				group: "Command",
				coverage: {
					only: ["sap/ui/rta/command/ControlVariantConfigure"]
				}
			},
			"command/ControlVariantDuplicate": {
				group: "Command",
				coverage: {
					only: ["sap/ui/rta/command/ControlVariantDuplicate"]
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
				}
			},
			"command/Remove": {
				group: "Command",
				coverage: {
					only: ["sap/ui/rta/command/Remove"]
				}
			},
			"command/Rename": {
				group: "Command",
				coverage: {
					only: ["sap/ui/rta/command/Rename"]
				}
			},
			"command/Settings": {
				group: "Command",
				coverage: {
					only: ["sap/ui/rta/command/Settings"]
				}
			},
			"command/Split": {
				group: "Command",
				coverage: {
					only: ["sap/ui/rta/command/Split"]
				}
			},
			"command/Stack": {
				group: "Command",
				coverage: {
					only: ["sap/ui/rta/command/Stack"]
				}
			},
			"command/appDescriptor/AddLibrary": {
				group: "Command",
				coverage: {
					only: ["sap/ui/rta/command/appDescriptor/AddLibrary"]
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

			// DesignTime Tool
			"dttool/controls/ListItem": {
				group: 'DtTool',
				coverage: {
					only: ["sap/ui/rta/dttool/controls/DTToolListItem"]
				},
				ui5: {
					resourceroots: {
						"sap.ui.rta.dttool": "test-resources/sap/ui/rta/dttool/"
					}
				}
			},
			"dttool/controls/OutlineTree": {
				group: 'DtTool',
				coverage: {
					only: ["sap/ui/rta/dttool/controls/OutlineTree"]
				},
				ui5: {
					resourceroots: {
						"sap.ui.rta.dttool": "test-resources/sap/ui/rta/dttool/"
					}
				}
			},

			// API
			"api/startKeyUserAdaptation": {
				group: "API",
				coverage: {
					only: ["sap/ui/rta/api/startKeyUserAdaptation"]
				}
			}
		}

	};

	var bCompAvailable = false;
	var oXhr = new XMLHttpRequest();
	oXhr.onreadystatechange = function() {
		if (this.readyState === 4) {
			switch (this.status) {
				case 200:
				case 304:
					bCompAvailable = JSON.parse(this.responseText).libraries.some(function (mLibrary) {
						return mLibrary.name === 'sap.ui.comp';
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
				"plugin/additionalElements/AdditionalElementsAnalyzer": {
					group: "Plugin",
					coverage: {
						only: ["sap/ui/rta/plugin/additionalElements/AdditionalElementsAnalyzer"]
					},
					ui5: {
						resourceroots: {
							"sap.ui.rta.test.additionalElements": "test-resources/sap/ui/rta/internal/testdata/additionalElements/"
						}
					},
					autostart: false // test calls QUnit.start after some async initialization
				},
				"plugin/additionalElements/AdditionalElementsAnalyzerOData": {
					group: "Plugin",
					coverage: {
						only: ["sap/ui/rta/plugin/additionalElements/AdditionalElementsAnalyzerOData"]
					},
					ui5: {
						resourceroots: {
							"sap.ui.rta.test.additionalElements": "test-resources/sap/ui/rta/internal/testdata/additionalElements/"
						}
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
				"util/BindingsExtractor": {
					coverage: {
						only: ["sap/ui/rta/util/BindingsExtractor"]
					},
					ui5: {
						resourceroots: {
							"sap.ui.rta.test.additionalElements": "test-resources/sap/ui/rta/internal/testdata/additionalElements/"
						}
					}
				},
				"util/PopupManager": {
					coverage: {
						only: ["sap/ui/rta/util/PopupManager"]
					}
				},
				"util/hasStableId": {
					coverage: {
						only: ["sap/ui/rta/util/hasStableId"]
					}
				},
				"util/validateFlexEnabled": {
					coverage: {
						only: ["sap/ui/rta/util/validateFlexEnabled"]
					},
					ui5: {
						flexibilityServices: '[{"connector": "LocalStorageConnector", "layers": ["ALL"]}]'
					}
				},
				"util/validateStableIds": {
					coverage: {
						only: ["sap/ui/rta/util/validateStableIds"]
					}
				},
				"util/showMessageBox": {
					coverage: {
						only: ["sap/ui/rta/util/showMessageBox"]
					}
				},
				ContextMenu: { // Integration
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
					},
					autostart: false // test calls QUnit.start after some async initialization
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
						}
					}
				},
				"RuntimeAuthoring-3": {
					coverage: {
						only: ["sap/ui/rta/RuntimeAuthoring"]
					},
					ui5: {
						flexibilityServices: '[{"connector": "LocalStorageConnector"}]',
						resourceroots: {
							qunit: "test-resources/sap/ui/rta/qunit/",
							"sap.ui.rta.qunitrta": "test-resources/sap/ui/rta/internal/testdata/qunit_rta/",
							"sap.ui.rta.test": "test-resources/sap/ui/rta/internal/testdata/rta/"
						}
					}
				},
				"integration/SimpleFormRemove": {
					group: "Integration",
					ui5: {
						libs: "sap.ui.layout, sap.ui.rta",
						resourceroots: {
							"sap.ui.rta.test": "test-resources/sap/ui/rta/internal/testdata/rta/"
						}
					}
				},
				Utils: {
					coverage: {
						only: ["sap/ui/rta/Utils"]
					},
					ui5: {
						libs: 'sap.ui.rta, sap.uxap',
						resourceroots: {
							qunit: "test-resources/sap/ui/rta/qunit/",
							"sap.ui.rta.test": "test-resources/sap/ui/rta/internal/testdata/rta/",
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
