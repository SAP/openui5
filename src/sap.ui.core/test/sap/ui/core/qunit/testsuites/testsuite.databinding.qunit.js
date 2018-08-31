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
			module: "test-resources/sap/ui/core/qunit/{name}.qunit"
		},
		tests: {
			BindingParser: {
				title: "sap.ui.base.BindingParser - QUnit Tests"
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
				title: "sap.ui.base.ExpressionParser - QUnit Tests"
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
			ODataMetadata: {
				title: "sap.ui.model.odata.ODataMetadata - QUnit Tests",
				module: [
					"test-resources/sap/ui/core/qunit/odata/ODataMetadata.qunit"
				]
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
				]
			},
			ODataUtils: {
				title: "sap.ui.model.odata.ODataUtils - QUnit Tests",
				module: [
					"test-resources/sap/ui/core/qunit/odata/ODataUtils.qunit"
				]
			},
			ResourceBinding: {
				title: "sap.ui.model.resource.ResourcePropertyBinding - QUnit Tests",
				module: [
					"test-resources/sap/ui/core/qunit/resource/ResourceBinding.qunit"
				],
				loader: {
					paths: {
						testdata: 'test-resources/sap/ui/core/qunit/testdata'
					}
				},
				ui5: {
					language: "en"
				}
			},
			ResourceModel: {
				title: "sap.ui.model.resource.ResourceModel - QUnit Tests",
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
			TreeBindingUtils: {
				title: "sap.ui.model.TreeBindingUtils - QUnit Tests"
			},
			ManagedObjectModel: {
				title: "QUnit tests: sap.ui.model.base.ManagedObjectModel",
				page: "test-resources/sap/ui/core/qunit/ManagedObjectModel.qunit.html"
			},
			/*
			 * the following tests have not been migrated
			 */
			AnalyticalBinding: {
				page: "test-resources/sap/ui/core/qunit/analytics/AnalyticalBinding.qunit.html",
				title: "sap.ui.model.analytics.AnalyticalBinding - QUnit Tests",
				qunit: {
					version: 1
				},
				sinon: {
					version: 1,
					qunitBridge: true
				}
			},
			odata4analytics: {
				page: "test-resources/sap/ui/core/qunit/analytics/odata4analytics.qunit.html",
				title: "sap.ui.model.analytics.odata4analytics - QUnit Tests",
				qunit: {
					version: 1
				},
				sinon: {
					version: 1,
					qunitBridge: true
				}
			},
			AnnotationHelper: {
				page: "test-resources/sap/ui/core/qunit/odata/AnnotationHelper.qunit.html",
				title: "sap.ui.model.odata.AnnotationHelper - QUnit Tests",
				qunit: {
					version: 2
				},
				sinon: {
					version: 4,
					qunitBridge: true
				}
			},
			ODataMetaModel: {
				page: "test-resources/sap/ui/core/qunit/odata/ODataMetaModel.qunit.html",
				title: "sap.ui.model.odata.ODataMetaModel - QUnit Tests",
				qunit: {
					version: 2
				},
				sinon: {
					version: 4,
					qunitBridge: true
				}
			}
		}
	};
});
