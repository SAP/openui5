sap.ui.define(function () {
	"use strict";

	return {
		name : "TestSuite for sap.ui.core: GTP testcase CORE/ODATA/TYPES",
		defaults : {
			group : "OData Types",
			qunit : {
				version : "edge"
			},
			sinon : {
				version : "edge"
			},
			ui5 : {
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
			"Boolean" : {},
			"Currency" : {},
			"Date" : {},
			"DateTimeBase" : {},
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
			"UnitMixin" : {}
		}
	};
});
