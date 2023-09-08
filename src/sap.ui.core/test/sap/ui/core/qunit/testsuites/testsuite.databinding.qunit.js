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
			AnnotationParserNoFakeService: {
				title: "sap.ui.model.odata.AnnotationParser (AnnotationParserNoFakeService.qunit)",
				module: [
					"test-resources/sap/ui/core/qunit/odata/AnnotationParserNoFakeService.qunit"
				]
			},
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
			ClientListBinding : {
				title: "sap.ui.model.ClientListBinding - QUnit Tests",
				module: [
					"test-resources/sap/ui/core/qunit/model/ClientListBinding.qunit"
				]
			},
			ClientModel: {
				title: "sap.ui.model.ClientModel - QUnit Tests",
				ui5: {
					language: "en-US"
				}
			},
			ClientPropertyBinding : {
				title: "sap.ui.model.ClientPropertyBinding - QUnit Tests",
				module: [
					"test-resources/sap/ui/core/qunit/model/ClientPropertyBinding.qunit"
				]
			},
			ClientTreeBinding: {
				title: "sap.ui.model.ClientTreeBinding - QUnit Tests",
				module: ["test-resources/sap/ui/core/qunit/model/ClientTreeBinding.qunit"]
			},
			ClientTreeBindingAdapter: {
				title: "sap.ui.model.ClientTreeBindingAdapter - QUnit Tests",
				module: [
					"test-resources/sap/ui/core/qunit/model/ClientTreeBindingAdapter.qunit"
				]
			},
			CompositeBinding: {
				title: "sap.ui.model.CompositeBinding - QUnit Tests",
				ui5: {
					language: "en-US"
				}
			},
			CompositeDataState: {
				title: "sap.ui.model.CompositeDataState - QUnit Tests",
				module: [
					"test-resources/sap/ui/core/qunit/model/CompositeDataState.qunit"
				]
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
			ListBinding: {
				title: "sap.ui.model.ListBinding - QUnit Tests"
			},
			/** @deprecated As of version 1.11.1 reason bindContext*/
			MasterDetail: {
				title: "QUnit tests: databinding MasterDetail",
				module: [
					"test-resources/sap/ui/core/qunit/MasterDetail_legacyAPIs.qunit"
				]
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
			/** @deprecated As of version 1.66.0 */
			ODataListBinding: {
				title: "sap.ui.model.odata.ODataListBinding - QUnit Tests",
				module: [
					"test-resources/sap/ui/core/qunit/odata/ODataListBinding_legacyAPIs.qunit"
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
			ODataMetadataNoFakeService: {
				title: "sap.ui.model.odata.ODataMetadata (ODataMetadataNoFakeService.qunit)",
				module: [
					"test-resources/sap/ui/core/qunit/odata/ODataMetadataNoFakeService.qunit"
				]
			},
			/** @deprecated As of version 1.48.0 */
			ODataModel: {
				title: "sap.ui.model.odata.ODataModel - QUnit Tests",
				module: [
					"test-resources/sap/ui/core/qunit/odata/ODataModel_legacyAPIs.qunit"
				]
			},
			/** @deprecated As of version 1.48.0 reason sap.ui.model.odata.ODataModel */
			ODataSharedMetadata: {
				title: "sap.ui.model.odata.ODataModel - Shared Metadata QUnit Tests",
				module: [
					"test-resources/sap/ui/core/qunit/odata/ODataSharedMetadata_legacyAPIs.qunit"
				],
				sinon: {
					useFakeTimers: true
				}
			},
			/** @deprecated As of version 1.28.0 */
			ODataTreeBinding: {
				title: "sap.ui.model.odata.ODataTreeBinding - QUnit Tests",
				module: [
					"test-resources/sap/ui/core/qunit/odata/ODataTreeBinding_legacyAPIs.qunit"
				],
				sinon: 1 // because MockServer is used which has a hard dependency to sinon V1
			},
			ODataTreeBindingAdapter: {
				title: "sap.ui.model.odata.ODataTreeBindingApter - QUnit Tests",
				module: [
					"test-resources/sap/ui/core/qunit/odata/ODataTreeBindingAdapter.qunit"
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
				}
			},
			StaticBinding: {
				title: "sap.ui.model.StaticBinding - QUnit Tests",
				ui5: {
					language: "en-US"
				}
			},
			TreeBinding: {
				title: "sap.ui.model.TreeBinding",
				module: [
					"test-resources/sap/ui/core/qunit/model/TreeBinding.qunit"
				]
			},
			TreeBindingAdapter: {
				title: "sap.ui.model.TreeBindingAdapter - QUnit Tests",
				module: [
					"test-resources/sap/ui/core/qunit/model/TreeBindingAdapter.qunit"
				]
			},
			TreeBindingProxy: {
				title: "sap.ui.model.TreeBindingProxy - QUnit Tests",
				module: [
					"test-resources/sap/ui/core/qunit/model/controlhelper/TreeBindingProxy.qunit"
				]
			},
			TreeBindingUtils: {
				title: "sap.ui.model.TreeBindingUtils - QUnit Tests"
			},
			ManagedObjectModel: {
				title: "QUnit tests: sap.ui.model.base.ManagedObjectModel",
				coverage : {
					only : "sap/ui/model/base"
				}
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
			"analytics/AnalyticalTreeBindingAdapter": {
				title: "sap.ui.model.analytics.AnalyticalTreeBindingAdapter",
				module: [
					"test-resources/sap/ui/core/qunit/analytics/AnalyticalTreeBindingAdapter.qunit"
				]
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
			"analytics/ODataModelAdapter": {
				title: "sap.ui.model.analytics.ODataModelAdapter",
				module: [
					"test-resources/sap/ui/core/qunit/analytics/ODataModelAdapter.qunit"
				]
			},
			"model/_Helper": {
				title: "sap.ui.model._Helper"
			},
			"model/Binding": {
				title: "sap.ui.model.Binding"
			},
			"model/Context": {
				title: "sap.ui.model.Context"
			},
			"model/ContextBinding": {
				title: "sap.ui.model.ContextBinding"
			},
			"model/Filter": {
				title: "sap.ui.model.Filter"
			},
			"model/FilterProcessor": {
				title: "sap.ui.model.FilterProcessor"
			},
			"model/ListBinding": {
				title: "sap.ui.model.ListBinding"
			},
			"model/Model": {
				title: "sap.ui.model.Model"
			},
			"model/PropertyBinding": {
				title: "sap.ui.model.PropertyBinding"
			},
			"model/Sorter": {
				title: "sap.ui.model.Sorter"
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
