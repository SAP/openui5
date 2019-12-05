sap.ui.define(function() {

	"use strict";
	return {
		name: "TestSuite for sap.ui.core: GTP testcase CORE/DATABINDING",
		defaults: {
			qunit: {
				version: 2,
				testTimeout: 6000
			},
			sinon: {
				version: 4,
				qunitBridge: true,
				useFakeTimers: false
			},
			loader : {
				paths : {
					"sap/ui/core/qunit" : "test-resources/sap/ui/core/qunit"
				}
			},
			module: "test-resources/sap/ui/core/qunit/{name}.qunit"
		},
		tests: {
			BindingParser: {
				title: "sap.ui.base.BindingParser - QUnit Tests",
				coverage : {
					only : "sap/ui/base/BindingParser"
				}
			},
			CalculatedFields: {
				title: "Calculated Fields - QUnit Tests",
				ui5: {
					language: "en-US"
				}
			},
			ClientModel: {
				title: "sap.ui.model.ClientModel - QUnit Tests",
				ui5: {
					language: "en-US"
				}
			},
			CompositeBinding: {
				title: "sap.ui.model.CompositeBinding - QUnit Tests",
				ui5: {
					language: "en-US"
				}
			},
			DataBinding: {
				title: "DataBinding - QUnit Tests"
			},
			DataState: {
				title: "sap.ui.model.DataState - QUnit Tests"
			},
			ExpressionParser: {
				title: "sap.ui.base.ExpressionParser - QUnit Tests",
				coverage : {
					only : "sap/ui/base/ExpressionParser"
				}
			},
			Filter: {
				title: "sap.ui.model.Filter - QUnit Tests",
				ui5: {
					language: "en-US"
				}
			},
			FilterProcessor: {
				title: "sap.ui.model.FilterProcessor - QUnit Tests"
			},
			ListBinding: {
				title: "sap.ui.model.ListBinding - QUnit Tests"
			},
			MasterDetail: {
				title: "QUnit tests: databinding MasterDetail"
			},
			ODataAnnotations: {
				title: "sap.ui.model.odata.ODataAnnotations - QUnit Tests",
				module: [
					"test-resources/sap/ui/core/qunit/odata/ODataAnnotations.qunit"
				],
				ui5: {
					language: "en-US"
				}
			},
			ODataListBinding: {
				title: "sap.ui.model.odata.ODataListBinding - QUnit Tests",
				module: [
					"test-resources/sap/ui/core/qunit/odata/v1/ODataListBinding.qunit"
				]
			},
			ODataMessageParser: {
				title: "sap.ui.model.ODataMessageParser - QUnit Tests",
				module: [
					"test-resources/sap/ui/core/qunit/odata/ODataMessageParser.qunit"
				]
			},
			ODataMessageParserNoFakeService: {
				title: "sap.ui.model.odata.ODataMessageParser (ODataMessageParserNoFakeService.qunit)",
				module: [
					"test-resources/sap/ui/core/qunit/odata/ODataMessageParserNoFakeService.qunit"
				]
			},
			ODataMetadata: {
				qunit: {
					reorder: false
				},
				title: "sap.ui.model.odata.ODataMetadata - QUnit Tests",
				module: [
					"test-resources/sap/ui/core/qunit/odata/ODataMetadata.qunit"
				],
				sinon: 1 // because MockServer is used which has a hard dependency to sinon V1
			},
			ODataModel: {
				title: "sap.ui.model.odata.ODataModel - QUnit Tests",
				module: [
					"test-resources/sap/ui/core/qunit/odata/v1/ODataModel.qunit"
				]
			},
			ODataSharedMetadata: {
				title: "sap.ui.model.odata.ODataModel - Shared Metadata QUnit Tests",
				module: [
					"test-resources/sap/ui/core/qunit/odata/v1/ODataSharedMetadata.qunit"
				],
				sinon: {
					useFakeTimers: true
				}
			},
			ODataTreeBinding: {
				title: "sap.ui.model.odata.ODataTreeBinding - QUnit Tests",
				module: [
					"test-resources/sap/ui/core/qunit/odata/v1/ODataTreeBinding.qunit"
				],
				sinon: 1 // because MockServer is used which has a hard dependency to sinon V1
			},
			ODataUtils: {
				title: "sap.ui.model.odata.ODataUtils - QUnit Tests",
				module: [
					"test-resources/sap/ui/core/qunit/odata/ODataUtils.qunit"
				]
			},
			ResourceBinding: {
				title: "sap.ui.model.resource.ResourcePropertyBinding (ResourceBinding.qunit)",
				module: [
					"test-resources/sap/ui/core/qunit/resource/ResourceBinding.qunit"
				],
				loader: {
					paths: {
						testdata: 'test-resources/sap/ui/core/qunit/testdata'
					}
				}
			},
			ResourceModel: {
				title: "sap.ui.model.resource.ResourceModel",
				module: [
					"test-resources/sap/ui/core/qunit/resource/ResourceModel.qunit"
				],
				loader: {
					paths: {
						testdata: 'test-resources/sap/ui/core/qunit/testdata',
						'sap/ui/testlib': 'test-resources/sap/ui/core/qunit/testdata/uilib'
					}
				},
				ui5: {
					language: "en",
					originInfo: true
				}
			},
			StaticBinding: {
				title: "sap.ui.model.StaticBinding - QUnit Tests",
				ui5: {
					language: "en-US"
				}
			},
			TreeBindingUtils: {
				title: "sap.ui.model.TreeBindingUtils - QUnit Tests"
			},
			ManagedObjectModel: {
				title: "QUnit tests: sap.ui.model.base.ManagedObjectModel",
				page: "test-resources/sap/ui/core/qunit/ManagedObjectModel.qunit.html"
			},
			"analytics/AnalyticalBinding": {
				coverage : {
					only : "sap/ui/model/analytics/"
				},
				loader : {
					paths : {
						"sap/ui/core/qunit/analytics" : "test-resources/sap/ui/core/qunit/analytics"
					}
				},
				sinon: {
					version: 1
				},
				title: "sap.ui.model.analytics.AnalyticalBinding - QUnit Tests"
			},
			"analytics/odata4analytics": {
				coverage : {
					only : "sap/ui/model/analytics/"
				},
				loader : {
					paths : {
						"sap/ui/core/qunit/analytics" : "test-resources/sap/ui/core/qunit/analytics"
					}
				},
				sinon: {
					version: 1
				},
				title: "sap.ui.model.analytics.odata4analytics - QUnit Tests"
			},
			"odata/AnnotationHelper": {
				coverage : {
					only : "[sap/ui/model/odata/AnnotationHelper,sap/ui/model/odata/_AnnotationHelper]"
				},
				module: [
					"test-resources/sap/ui/core/qunit/odata/AnnotationHelper.qunit",
					"test-resources/sap/ui/core/qunit/odata/_AnnotationHelperBasics.qunit",
					"test-resources/sap/ui/core/qunit/odata/_AnnotationHelperExpression.qunit"
				],
				title: "sap.ui.model.odata.AnnotationHelper - QUnit Tests"
			},
			"odata/ODataMetaModel": {
				coverage : {
					only : "[sap/ui/model/odata/ODataMetaModel,sap/ui/model/odata/_ODataMetaModelUtils]"
				},
				module: [
					"test-resources/sap/ui/core/qunit/odata/ODataMetaModel.qunit",
					"test-resources/sap/ui/core/qunit/odata/_ODataMetaModelUtils.qunit"
				],
				title: "sap.ui.model.odata.ODataMetaModel - QUnit Tests"
			}
		}
	};
});
