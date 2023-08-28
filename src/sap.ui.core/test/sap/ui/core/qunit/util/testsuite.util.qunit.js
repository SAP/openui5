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