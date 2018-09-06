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
				version: 1,
				qunitBridge: true,
				useFakeTimers: false
			},
			ui5: {
				noConflict: true
			},
			loader: {
				paths: {
					"static": "test-resources/sap/ui/core/qunit/util/static/"
				}
			}
		},
		tests: {
			BusyIndicator: {},
			BusyIndicatorNoCore: {
				bootCore: false,
				qunit: {
					// first test boots the Core
					reorder: false
				}
			},
			BusyIndicatorRTL: {
				ui5: {
					rtl: true
				}
			},
			"jQuery.sap.FrameOptions-meta-tag-override-mode": {
				beforeBootstrap: "./beforeBootstrap/jQuery.sap.FrameOptions-meta-tag",
				ui5: {
					frameOptions: "deny"
				}
			},
			"jQuery.sap.FrameOptions-meta-tag-override-service": {
				beforeBootstrap: "./beforeBootstrap/jQuery.sap.FrameOptions-meta-tag",
				ui5: {
					whitelistService: "/url/to/service/via/ui5/config"
				}
			},
			"jQuery.sap.FrameOptions-meta-tag": {
				beforeBootstrap: "./beforeBootstrap/jQuery.sap.FrameOptions-meta-tag"
			},
			"jQuery.sap.FrameOptions": {
				sinon: {
					useFakeTimers: true
				}
			},
			"jQuery.sap.measure": {},
			"jQuery.sap.Version": {},
			"jquery.sap.dom": {
				group: "jQuery plugins",
				autostart: false,
				beforeBootstrap: "./beforeBootstrap/jQuery.sap.dom",
				qunit: {
					reorder: false
				}
			},
			"jquery.sap.encoder": {
				group: "jQuery plugins"
			},
			"jquery.sap.history": {
				group: "jQuery plugins",
				qunit: {
					// FIXME: Quick fix for the moment
					version: 1
				},
				skip: Device.browser.msie
			},
			"jquery.sap.logger": {
				group: "jQuery plugins",
				ui5: {
					logLevel: "WARNING"
				}
			},
			"jquery.sap.promise": {
				group: "jQuery plugins"
			},
			"jquery.sap.properties": {
				group: "jQuery plugins",
				loader: {
					paths: {
						"testdata": "test-resources/sap/ui/core/qunit/testdata/"
					}
				}
			},
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
			"jquery.sap.script": {
				group: "jQuery plugins"
			},
			"jquery.sap.storage": {
				group: "jQuery plugins"
			},
			"jquery.sap.strings": {
				group: "jQuery plugins"
			},
			"jquery.sap.trace": {
				group: "jQuery plugins",
				skip: Device.browser.phantomJS,
				beforeBootstrap: "./beforeBootstrap/jQuery.sap.trace"
			},
			"jquery.sap.unicode": {
				group: "jQuery plugins"
			},
			"jquery.sap.xml": {
				group: "jQuery plugins"
			},
			LabelEnablement: {},
			Mobile: {},
			Popup: {
				page: "test-resources/sap/ui/core/qunit/util/Popup.qunit.html",
				qunit: {
					reorder: false
				}
			},
			"postmessage/Bus": {
				sinon: {
					version: 4
				},
				coverage: {
					only: "[sap/ui/core/postmessage/Bus]"
				}
			},
			"postmessage/ConfirmationDialog": {
				coverage: {
					only: "[sap/ui/core/postmessage/confirmationDialog]"
				}
			},
			SelectionModel: {},
			Serializer: {},
			"support/SupportTool": {
				loader: {
					paths: {
						"sap/ui/test": "../"
					}
				}
			},
			"support/TechnicalInfo": {},
			"support/TechnicalInfo.opa": {
				ui5: {
					libs: "sap.m",
					language: "EN"
				}
			},
			Export: {},
			ExportTypeCSV: {},
			"reflection/BaseTreeModifier": {
				coverage: {
					only: "[sap/ui/core/util/reflection]"
				},
				loader: {
					paths: {
						"sap/ui/test": "test-resources/sap/ui/core/qunit/component/testdata"
					}
				}
			},
			"reflection/JsControlTreeModifier": {
				sinon: {
					version: 4
				},
				coverage: {
					only: "[sap/ui/core/util/reflection]"
				},
				loader: {
					paths: {
						"sap/ui/test": "test-resources/sap/ui/core/qunit/component/testdata"
					}
				}
			},
			"reflection/XmlTreeModifier": {
				coverage: {
					only: "[sap/ui/core/util/reflection]"
				},
				loader: {
					paths: {
						"sap/ui/test": "test-resources/sap/ui/core/qunit/component/testdata"
					}
				}
			},
			ValueStateSupport: {
				ui5: {
					libs: "sap.ui.commons"
				}
			},
			ViewSerializer: {
				ui5: {
					libs: "sap.ui.commons"
				},
				loader: {
					paths: {
						"serializer/view": "test-resources/sap/ui/core/qunit/testdata/serializer/"
					}
				}
			},
			SapPcpWebSocket: {},
			WebSocket: {},
			ViewTemplate: {
				page: "test-resources/sap/ui/core/demokit/sample/ViewTemplate/scenario/Opa.qunit.html",
				title: "QUnit tests for ViewTemplate scenario"
			},
			SyncPromise: {
				page: "test-resources/sap/ui/core/qunit/SyncPromise.qunit.html",
				title: "QUnit tests for Sync Promises"
			},
			TestUtils: {
				page: "test-resources/sap/ui/test/qunit/TestUtils.qunit.html",
				title: "QUnit tests for Utils"
			},
			XMLPreprocessor: {
				page: "test-resources/sap/ui/core/qunit/util/XMLPreprocessor.qunit.html",
				title: "QUnit tests for XMLPreprocessor"
			}

		}
	};
});
