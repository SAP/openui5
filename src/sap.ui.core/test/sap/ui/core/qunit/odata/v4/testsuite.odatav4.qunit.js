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
			// the following tests set autostart=false because they require modules asynchronously
			// and start QUnit on their own
			"OPA.LateProperties" : {
				autostart : false,
				module : ["sap/ui/core/sample/odata/v4/LateProperties/Opa.qunit"]
			},
			"OPA.ListBinding" : {
				autostart : false,
				module : ["sap/ui/core/sample/odata/v4/ListBinding/Opa.qunit"]
			},
			"OPA.ListBindingTemplate" : {
				autostart : false,
				module : ["sap/ui/core/sample/odata/v4/ListBindingTemplate/Opa.qunit"]
			},
			"OPA.Products" : {
				autostart : false,
				module : ["sap/ui/core/sample/odata/v4/Products/Opa.qunit"]
			},
			"OPA.SalesOrders" : {
				autostart : false,
				module : ["sap/ui/core/sample/odata/v4/SalesOrders/Opa.qunit"]
			},
			"OPA.SalesOrdersTemplate" : {
				autostart : false,
				module : ["sap/ui/core/sample/odata/v4/SalesOrdersTemplate/Opa.qunit"]
			},
			"OPA.SalesOrderTP100_V2" : {
				autostart : false,
				module : ["sap/ui/core/sample/odata/v4/SalesOrderTP100_V2/Opa.qunit"]
			},
			"OPA.SalesOrderTP100_V4" : {
				autostart : false,
				module : ["sap/ui/core/sample/odata/v4/SalesOrderTP100_V4/Opa.qunit"]
			},
			"OPA.ServerDrivenPaging" : {
				autostart : false,
				module : ["sap/ui/core/sample/odata/v4/ServerDrivenPaging/Opa.qunit"]
			},
			"OPA.Sticky" : {
				autostart : false,
				module : ["sap/ui/core/sample/odata/v4/Sticky/Opa.qunit"]
			},
			"OPA.ViewTemplate.Types" : {
				autostart : false,
				module : ["sap/ui/core/sample/ViewTemplate/types/Opa.qunit"]
			}
		}
	};
});
