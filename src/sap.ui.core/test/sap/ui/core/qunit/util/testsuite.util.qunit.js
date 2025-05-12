sap.ui.define(["sap/ui/Device"], function (Device) {

	"use strict";
	return {
		name: "TestSuite for sap.ui.core: GTP testcase CORE/UTILS",
		defaults: {
			qunit: {
				versions: {
					"2.18": {
						module: "test-resources/sap/ui/core/qunit/thirdparty/qunit-2.18",
						css: "test-resources/sap/ui/core/qunit/thirdparty/qunit-2.18.css"
					}
				},
				version: 2,
				reorder: false
			},
			sinon: {
				versions: {
					"14.0": {
						module: "test-resources/sap/ui/core/qunit/thirdparty/sinon-14.0",
						bridge: "sap/ui/qunit/sinon-qunit-bridge"
					}
				},
				version: 4,
				qunitBridge: true,
				useFakeTimers: false
			},
			ui5: {
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
			reflection: {
				page: "test-resources/sap/ui/core/qunit/util/reflection/testsuite.reflection.qunit.html"
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
				],
				qunit: {
					version: "2.18"
				},
				sinon: {
					version: "14.0"
				}
			},
			SyncPromise: {
				coverage: {
					only: "sap/ui/base/SyncPromise"
				},
				qunit: {
					version: "2.18"
				},
				sinon: {
					version: "14.0"
				}
			},
			TestUtils: {
				coverage: {
					only: "sap/ui/test/TestUtils"
				},
				module: [
					"test-resources/sap/ui/test/qunit/TestUtils.qunit"
				],
				qunit: {
					version: "2.18"
				},
				sinon: {
					version: "14.0"
				}
			},
			XMLPreprocessor: {
				coverage: {
					only: "sap/ui/core/util/XMLPreprocessor"
				},
				qunit: {
					version: "2.18"
				},
				sinon: {
					version: "14.0"
				}
			}

		}
	};
});
