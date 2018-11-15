sap.ui.define(function () {
	"use strict";

	return {
		name : "TestSuite for sap.ui.core: GTP testcase CORE/ODATAV4",
		defaults : {
			group : "OData V4",
			qunit : {
				version : "edge",
				reorder : false
			},
			sinon : {
				version : "edge"
			},
			ui5 : {
				language : "en-US",
				rtl : false,
				libs : null,
				"xx-waitForTheme" : true
			},
			coverage : {
				only : "[sap/ui/model/odata/v4]",
				branchTracking : true
			},
			loader : {
				paths : {
					"sap/ui/core/sample" : "test-resources/sap/ui/core/demokit/sample"
				}
			},
			autostart : true
		},
		tests : {
			"_AnnotationHelperExpression" : {},
			"AnnotationHelper" : {},
			"Context" : {},
			"ODataBinding" : {},
			"ODataContextBinding" : {},
			"ODataListBinding" : {},
			"ODataMetaModel" : {},
			"ODataModel" : {},
			"ODataModel.integration" : {},
			"ODataParentBinding" : {},
			"ODataPropertyBinding" : {},
			"ODataUtils" : {},
			"lib/_AggregationCache" : {},
			"lib/_AggregationHelper" : {},
			"lib/_Batch" : {},
			"lib/_Cache" : {},
			"lib/_GroupLock" : {},
			"lib/_Helper" : {},
			"lib/_MetadataConverter" : {},
			"lib/_MetadataRequestor" : {},
			"lib/_Parser" : {},
			"lib/_Requestor" : {},
			"lib/_V2MetadataConverter" : {},
			"lib/_V2Requestor" : {},
			"lib/_V4MetadataConverter" : {},
			"OPA.ListBinding" : {
				module : [
					"sap/ui/core/sample/common/pages/Any",
					"sap/ui/core/sample/odata/v4/ListBinding/Opa.qunit",
					"sap/ui/core/sample/odata/v4/ListBinding/pages/Main"
				],
				coverage : {
					only : "[/odata/type/,/odata/v4/]"
				}
			},
			"OPA.ListBindingTemplate" : {
				module : [
					"sap/ui/core/sample/common/pages/Any",
					"sap/ui/core/sample/odata/v4/ListBindingTemplate/Opa.qunit"
				],
				coverage : {
					only : "[/odata/type/,/odata/v4/,XMLPreprocessor]"
				}
			},
			"OPA.SalesOrders" : {
				module : [
					"sap/ui/core/sample/common/pages/Any",
					"sap/ui/core/sample/odata/v4/SalesOrders/Opa.SalesOrderMessageHandling.qunit",
					"sap/ui/core/sample/odata/v4/SalesOrders/Opa.SalesOrderTypeDeterminationAndDelete.qunit",
					"sap/ui/core/sample/odata/v4/SalesOrders/Opa.SalesOrderChangeContext.qunit",
					"sap/ui/core/sample/odata/v4/SalesOrders/Opa.SalesOrderCreate.qunit",
					"sap/ui/core/sample/odata/v4/SalesOrders/Opa.SalesOrderCreateRelative.qunit",
					"sap/ui/core/sample/odata/v4/SalesOrders/Opa.SalesOrderWriteNonDeferredGroup.qunit",
					"sap/ui/core/sample/odata/v4/SalesOrders/pages/Main"
				],
				coverage : {
					only : "[/odata/type/,/odata/v4/]"
				}
			},
			"OPA.SalesOrdersTemplate" : {
				module : [
					"sap/ui/core/sample/common/pages/Any",
					"sap/ui/core/sample/odata/v4/SalesOrdersTemplate/Opa.qunit",
					"sap/ui/core/sample/odata/v4/SalesOrdersTemplate/pages/Main"
				],
				coverage : {
					only : "[/odata/type/,/odata/v4/,XMLPreprocessor]"
				}
			},
			"OPA.SalesOrderTP100_V2" : {
				module : [
					"sap/ui/core/sample/common/pages/Any",
					"sap/ui/core/sample/odata/v4/SalesOrderTP100_V2/Opa.qunit",
					"sap/ui/core/sample/odata/v4/SalesOrderTP100_V2/pages/Main"
				],
				coverage : {
					only : "[/odata/type/,/odata/v4/]"
				}
			},
			"OPA.SalesOrderTP100_V4" : {
				module : [
					"sap/ui/core/sample/common/pages/Any",
					"sap/ui/core/sample/odata/v4/SalesOrderTP100_V4/Opa.qunit",
					"sap/ui/core/sample/odata/v4/SalesOrderTP100_V4/pages/Main"
				],
				coverage : {
					only : "[/odata/type/,/odata/v4/]"
				}
			},
			"OPA.Sticky" : {
				module : [
					"sap/ui/core/sample/common/pages/Any",
					"sap/ui/core/sample/odata/v4/Sticky/Opa.qunit",
					"sap/ui/core/sample/odata/v4/Sticky/pages/Main"
				],
				coverage : {
					only : "[/odata/type/,/odata/v4/]"
				}
			},
			"OPA.ViewTemplate.Types" : {
				module : [
					"sap/ui/core/sample/common/pages/Any",
					"sap/ui/core/sample/ViewTemplate/types/Opa.qunit",
					"sap/ui/core/sample/ViewTemplate/types/pages/Main"
				],
				coverage : {
					only : "[/odata/type/,/odata/v4/,ODataMetaModel,XMLPreprocessor,AnnotationHelper]"
				}
			}
		}
	};
});
