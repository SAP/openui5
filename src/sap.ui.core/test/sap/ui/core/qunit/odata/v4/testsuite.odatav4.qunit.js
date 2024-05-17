sap.ui.define(function () {
	"use strict";

	return {
		name : "TestSuite for sap.ui.core: GTP testcase CORE/ODATAV4",
		defaults : {
			group : "OData V4",
			qunit : {
				versions : {
					"2.18" : {
						module : "test-resources/sap/ui/core/qunit/thirdparty/qunit-2.18",
						css : "test-resources/sap/ui/core/qunit/thirdparty/qunit-2.18.css"
					}
				},
				version : "2.18",
				reorder : false
			},
			sinon : {
				versions : {
					"14.0" : {
						module : "test-resources/sap/ui/core/qunit/thirdparty/sinon-14.0",
						bridge : "sap/ui/qunit/sinon-qunit-bridge"
					}
				},
				version : "14.0",
				qunitBridge : true,
				useFakeTimer : false
			},
			ui5 : {
				language : "en-US",
				rtl : false,
				libs : [],
				"xx-waitForTheme" : "init"
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
			_AnnotationHelperExpression : {},
			AnnotationHelper : {},
			Context : {},
			ODataBinding : {},
			ODataContextBinding : {},
			ODataListBinding : {},
			ODataMetaModel : {},
			ODataModel : {},
			"ODataModel.integration" : {},
			"ODataModel.realOData" : {},
			ODataParentBinding : {},
			ODataPropertyBinding : {},
			ODataUtils : {},
			"lib/_AggregationCache" : {},
			"lib/_AggregationHelper" : {},
			"lib/_Batch" : {},
			"lib/_Cache" : {},
			"lib/_ConcatHelper" : {},
			"lib/_GroupLock" : {},
			"lib/_Helper" : {},
			"lib/_MetadataConverter" : {},
			"lib/_MetadataRequestor" : {},
			"lib/_MinMaxHelper" : {},
			"lib/_Parser" : {},
			"lib/_Requestor" : {},
			"lib/_TreeState" : {},
			"lib/_V2MetadataConverter" : {},
			"lib/_V2Requestor" : {},
			"lib/_V4MetadataConverter" : {},
			// the following tests set autostart=false because they require modules asynchronously
			// and start QUnit on their own
			// the following tests must all be named "OPA.*" so that 1Ring ignores them
			"OPA.DataAggregation" : {
				autostart : false,
				module : ["sap/ui/core/sample/odata/v4/DataAggregation/Opa.qunit"],
				realOData : false // requires stable test data
			},
			"OPA.DeepCreate" : {
				autostart : false,
				module : ["sap/ui/core/sample/odata/v4/DeepCreate/Opa.qunit"]
			},
			"OPA.Draft" : {
				autostart : false,
				module : ["sap/ui/core/sample/odata/v4/Draft/Opa.qunit"],
				realOData : false // requires stable test data
			},
			"OPA.FieldGroups" : {
				autostart : false,
				module : ["sap/ui/core/sample/odata/v4/FieldGroups/Opa.qunit"],
				realOData : false // requires stable test data
			},
			"OPA.FlexibleColumnLayout" : {
				autostart : false,
				module : ["sap/ui/core/sample/odata/v4/FlexibleColumnLayout/Opa.qunit"],
				realOData : false // requires stable test data
			},
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
			"OPA.MultipleInlineCreationRowsGrid" : {
				autostart : false,
				module : ["sap/ui/core/sample/odata/v4/MultipleInlineCreationRowsGrid/Opa.qunit"],
				realOData : false // requires stable test data
			},
			"OPA.OptimisticBatch" : {
				autostart : false,
				module : ["sap/ui/core/sample/odata/v4/LateProperties/Opa.OptimisticBatch.qunit"],
				realOData : false // works also with realOData, but this is not needed
			},
			"OPA.Products" : {
				autostart : false,
				module : ["sap/ui/core/sample/odata/v4/Products/Opa.qunit"],
				realOData : false // requires stable test data
			},
			"OPA.RecursiveHierarchy" : {
				autostart : false,
				module : ["sap/ui/core/sample/odata/v4/RecursiveHierarchy/Opa.qunit"],
				realOData : false // requires stable test data
			},
			"OPA.SalesOrders" : {
				autostart : false,
				module : ["sap/ui/core/sample/odata/v4/SalesOrders/Opa.qunit"]
			},
			"OPA.SalesOrdersRTATest" : {
				autostart : false,
				module : ["sap/ui/core/sample/odata/v4/SalesOrdersRTATest/Opa.qunit"],
				realOData : false // realOData brings nothing new
			},
			"OPA.SalesOrdersTemplate" : {
				autostart : false,
				module : ["sap/ui/core/sample/odata/v4/SalesOrdersTemplate/Opa.qunit"]
			},
			"OPA.SalesOrderTP100_V2" : {
				autostart : false,
				module : ["sap/ui/core/sample/odata/v4/SalesOrderTP100_V2/Opa.qunit"],
				realOData : false // different back end
			},
			"OPA.SalesOrderTP100_V4" : {
				autostart : false,
				module : ["sap/ui/core/sample/odata/v4/SalesOrderTP100_V4/Opa.qunit"],
				realOData : false // different back end
			},
			"OPA.ServerDrivenPaging" : {
				autostart : false,
				module : ["sap/ui/core/sample/odata/v4/ServerDrivenPaging/Opa.qunit"]
			},
			"OPA.Sticky" : {
				autostart : false,
				module : ["sap/ui/core/sample/odata/v4/Sticky/Opa.qunit"],
				realOData : false // requires stable test data
			},
			"OPA.Tutorial.08" : {
				autostart : false,
				module : ["sap/ui/core/tutorial/odatav4/test/integration/opaTests.qunit"],
				realOData : false, // requires stable test data
				loader : {
					paths : {
						"sap/ui/core/tutorial/odatav4"
							: "test-resources/sap/ui/core/demokit/tutorial/odatav4/08/webapp"
					}
				},
				$app : "test-resources/sap/ui/core/demokit/tutorial/odatav4/08/webapp/index.html"
			},
			"OPA.Tutorial.11" : {
				autostart : false,
				module : ["sap/ui/core/tutorial/odatav4/test/integration/opaTests.qunit"],
				realOData : false, // requires stable test data
				loader : {
					paths : {
						"sap/ui/core/tutorial/odatav4"
							: "test-resources/sap/ui/core/demokit/tutorial/odatav4/11/webapp"
					}
				},
				$app : "test-resources/sap/ui/core/demokit/tutorial/odatav4/11/webapp/index.html"
			}
		}
	};
});
