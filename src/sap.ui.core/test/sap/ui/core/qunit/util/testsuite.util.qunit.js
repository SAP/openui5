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
					"sap/ui/core/sample" : "test-resources/sap/ui/core/demokit/sample",
					"static": "test-resources/sap/ui/core/qunit/util/static/"
				}
			}
		},
		tests: {
			AsyncHintsHelper: {},
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
			PasteHelper: {},
			"reflection/BaseTreeModifier": {
				sinon: false,
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
				sinon: false,
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
				sinon: false,
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
				coverage : {
					only : "[/odata/type/,ODataMetaModel,XMLPreprocessor,AnnotationHelper]"
				},
				module : [
					"sap/ui/core/sample/common/pages/Any",
					"sap/ui/core/sample/ViewTemplate/scenario/Opa.qunit"
				]
			},
			SyncPromise: {
				coverage : {
					only : "sap/ui/base/SyncPromise"
				},
				sinon: {
					version: 4
				}
			},
			TestUtils: {
				coverage : {
					only : "sap/ui/test/TestUtils"
				},
				module : [
					"test-resources/sap/ui/test/qunit/TestUtils.qunit"
				],
				sinon: {
					version: 4
				}
			},
			XMLPreprocessor: {
				coverage : {
					only : "sap/ui/core/util/XMLPreprocessor"
				},
				sinon: {
					version: 4
				}
			}

		}
	};
});
