sap.ui.define(["sap/ui/Device"], function (Device) {

	"use strict";
	return {
		name: "TestSuite for sap.ui.core: GTP testcase CORE/UTILS",
		defaults: {
			qunit: {
				version: 2,
				reorder: false
			},
			sinon: {
				version: 4,
				qunitBridge: true,
				useFakeTimers: false
			},
			ui5: {
				noConflict: true,
				"xx-waitForTheme": "init"
			},
			loader: {
				paths: {
					"sap/ui/core/sample": "test-resources/sap/ui/core/demokit/sample",
					"static": "test-resources/sap/ui/core/qunit/util/static/"
				}
			}
		},
		tests: {
			AsyncHintsHelper: {},
			/**
			 * @deprecated since 1.58
			 */
			"jQuery.sap.Version": {},
			/**
			 * @deprecated since 1.58
			 */
			"jquery.sap.logger": {
				group: "jQuery plugins",
				page: "test-resources/sap/ui/core/qunit/util/jquery.sap.logger.qunit.html?sap-ui-log-level=warning"
			},
			/**
			 * @deprecated since 1.58
			 */
			"jquery.sap.properties": {
				// Skip the execution of this test, if running with Karma Runner, as the current UI5 tooling middleware leads to test failure
				// Issue reported with BCP incident 2070146288
				// Jira Backlog Item create with CPOUI5FOUNDATION-193, yet not tackled so far
				// Once the Backlog Item is done, this workaround can be removed!
				skip: !!parent.__karma__,
				group: "jQuery plugins",
				loader: {
					paths: {
						"testdata": "test-resources/sap/ui/core/qunit/testdata/"
					}
				}
			},
			/**
			 * @deprecated since 1.58
			 */
			"jquery.sap.resources": {
				group: "jQuery plugins",
				ui5: {
					language: "en"
				},
				loader: {
					paths: {
						"testdata": "test-resources/sap/ui/core/qunit/testdata/"
					}
				}
			},
			/**
			 * @deprecated since 1.58
			 */
			"jquery.sap.xml": {
				group: "jQuery plugins"
			},
			"postmessage/Bus": {
				sinon: {
					qunitBridge: false // because the bridge doesn't support nested modules yet
				},
				coverage: {
					only: "[sap/ui/core/postmessage/Bus]"
				}
			},
			"postmessage/ConfirmationDialog": {
				sinon: {
					version: 1 // because the bridge doesn't support nested modules yet
				},
				coverage: {
					only: "[sap/ui/core/postmessage/confirmationDialog]"
				}
			},
			Serializer: {},
			"support/SupportTool": {
				loader: {
					paths: {
						"sap/ui/test": "../",
						"sap/ui/test/qunitPause": "resources/sap/ui/test/qunitPause",
						"sap/ui/test/RecorderHotkeyListener": "resources/sap/ui/test/RecorderHotkeyListener"
					}
				}
			},
			"support/TechnicalInfo": {},
			"support/TechnicalInfo.opa": {
				loader: {
					map: {
						// Opa _XHRWaiter requires sap/ui/thirdparty/sinon, redirect to sinon-4
						'sap/ui/test/autowaiter': {
							'sap/ui/thirdparty/sinon': 'sap/ui/thirdparty/sinon-4'
						}
					}
				},
				ui5: {
					libs: "sap.m",
					language: "EN"
				}
			},
			"support/TechnicalInfoDebugModules.opa": {
				loader: {
					map: {
						// Opa _XHRWaiter requires sap/ui/thirdparty/sinon, redirect to sinon-4
						'sap/ui/test/autowaiter': {
							'sap/ui/thirdparty/sinon': 'sap/ui/thirdparty/sinon-4'
						}
					}
				},
				ui5: {
					libs: "sap.m",
					language: "EN"
				}
			},
			/**
			 * @deprecated since 1.73
			 */
			Export: {},
			/**
			 * @deprecated since 1.73
			 */
			ExportTypeCSV: {},
			PasteHelper: {},
			ResponsivePaddingsEnablement: {},
			"reflection/BaseTreeModifier": {
				sinon: {
					version: 4,
					qunitBridge: false
				},
				coverage: {
					only: "[sap/ui/core/util/reflection]"
				},
				loader: {
					paths: {
						"sap/ui/test": "test-resources/sap/ui/core/qunit/component/testdata",
						"sap/ui/test/qunitPause": "resources/sap/ui/test/qunitPause",
						"sap/ui/test/RecorderHotkeyListener": "resources/sap/ui/test/RecorderHotkeyListener"
					}
				}
			},
			"reflection/JsControlTreeModifier": {
				sinon: {
					version: 4,
					qunitBridge: false
				},
				coverage: {
					only: "[sap/ui/core/util/reflection]"
				},
				loader: {
					paths: {
						"sap/ui/test": "test-resources/sap/ui/core/qunit/component/testdata",
						"sap/ui/test/qunitPause": "resources/sap/ui/test/qunitPause",
						"sap/ui/test/RecorderHotkeyListener": "resources/sap/ui/test/RecorderHotkeyListener"
					}
				}
			},
			"reflection/XmlTreeModifier": {
				sinon: {
					version: 4,
					qunitBridge: false
				},
				coverage: {
					only: "[sap/ui/core/util/reflection]"
				},
				loader: {
					paths: {
						"sap/ui/test": "test-resources/sap/ui/core/qunit/component/testdata",
						"sap/ui/test/qunitPause": "resources/sap/ui/test/qunitPause",
						"sap/ui/test/RecorderHotkeyListener": "resources/sap/ui/test/RecorderHotkeyListener"
					}
				}
			},
			ViewSerializer: {
				ui5: {
					libs: "sap.m"
				},
				loader: {
					paths: {
						"serializer/view": "test-resources/sap/ui/core/qunit/testdata/serializer/"
					}
				}
			},
			/**
			 * @deprecated As of version 1.110
			 */
			ViewSerializer_legacyAPIs: {
				ui5: {
					libs: "sap.m"
				},
				loader: {
					paths: {
						"serializer/view": "test-resources/sap/ui/core/qunit/testdata/serializer_legacyAPIs/"
					}
				}
			},
			ViewTemplate: {
				autostart: false,
				coverage: {
					only: "[/odata/type/,ODataMetaModel,XMLPreprocessor,AnnotationHelper]"
				},
				module: [
					"sap/ui/core/sample/common/pages/Any",
					"sap/ui/core/sample/ViewTemplate/scenario/Opa.qunit"
				]
			},
			SyncPromise: {
				coverage: {
					only: "sap/ui/base/SyncPromise"
				}
			},
			TestUtils: {
				coverage: {
					only: "sap/ui/test/TestUtils"
				},
				module: [
					"test-resources/sap/ui/test/qunit/TestUtils.qunit"
				]
			},
			XMLPreprocessor: {
				coverage: {
					only: "sap/ui/core/util/XMLPreprocessor"
				}
			}

		}
	};
});