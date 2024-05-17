sap.ui.define(function () {
	"use strict";

	return {
		name : "TestSuite for sap.ui.core: GTP testcase CORE/ODATA/TYPES and"
			+ " 'Currency and unit amount in two fields'",
		defaults : {
			group : "OData Types",
			qunit : {
				version : "edge"
			},
			sinon : {
				version : "edge"
			},
			ui5 : {
				libs: ["sap.ui.core"],
				language : "en-US",
				rtl : false,
				"xx-waitForTheme" : true
			},
			coverage : {
				only : "[sap/ui/model/odata/type]",
				branchTracking : true
			}
		},
		tests : {
			// *************************************************************************
			// Tests for sap.ui.core: GTP testcase CORE/ODATA/TYPES
			// *************************************************************************
			"Boolean" : {},
			"Currency" : {},
			"Date" : {},
			"DateTimeBase" : {},
			"DateTimeWithTimezone" : {},
			"Decimal" : {},
			"Double" : {},
			"Guid" : {},
			"Int" : {},
			"Int64" : {},
			"ODataType" : {},
			"Raw" : {},
			"Single" : {},
			"Stream" : {},
			"String" : {},
			"Time" : {},
			"TimeOfDay" : {},
			"Unit" : {},
			"UnitMixin" : {},

			// *************************************************************************
			// OPA Test for 'Currency and unit amount in two fields'
			// *************************************************************************
			"OPA.TwoFields" : {
				autostart : false,
				loader : {
					paths : {
						"sap/ui/core/sample" : "test-resources/sap/ui/core/demokit/sample",
						"sap/ui/core/internal/samples" :
							"test-resources/sap/ui/core/internal/samples"
					}
				},
				module : ["test-resources/sap/ui/core/internal/samples/odata/twoFields/Opa.qunit"],
				title : "OPA test sap.ui.core.internal.samples.odata.twoFields",
				ui5 : {
					language : "en-US"
				}
			},
			// *************************************************************************
			// OPA Test for OData Types
			// *************************************************************************
			"OPA.ViewTemplate.Types" : {
				autostart : false,
				loader : {
					paths : {
						"sap/ui/core/sample" : "test-resources/sap/ui/core/demokit/sample"
					}
				},
				module : ["sap/ui/core/sample/ViewTemplate/types/Opa.qunit"]
			}
		}
	};
});
