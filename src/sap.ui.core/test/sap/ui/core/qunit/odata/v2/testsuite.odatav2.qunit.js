sap.ui.define(function() {

	"use strict";
	return {
		name: "TestSuite for sap.ui.core: GTP testcase CORE/DATABINDING",
		defaults: {
			qunit: {
				version: 2
			},
			sinon: {
				version: 4,
				qunitBridge: true,
				useFakeTimers: false
			}
		},
		tests: {
			datajs: {
				title: "sap.ui.thirdparty.datajs - QUnit tests"
			},
			ODataAnnotationsV2: {
				title: "sap.ui.model.odata.v2.ODataAnnotations - QUnit tests"
			},
			ODataV2ListBinding: {
				title: "sap.ui.model.odata.v2.ODataListBinding - QUnit tests"
			},
			ODataPropertyBinding: {
				title: "sap.ui.model.odata.v2.ODataPropertyBinding - QUnit tests"
			},
			ODataV2Model: {
				title: "sap.ui.model.odata.v2.ODataModel - Sinon QUnit tests"
			},
			ODataV2TreeBinding: {
				title: "sap.ui.model.odata.v2.ODataTreeBinding - QUnit tests",
				path: {
					"mockdata": "test-resources/sap/ui/core/qunit/model"
				}
			},
			ODataV2TreeBindingFlat_MockSrv: {
				title: "sap.ui.model.odata.ODataTreeBindingFlat - MockServer based QUnit tests"
			},
			ODataV2TreeBindingFlat_FakeSrv: {
				title: "sap.ui.model.odata.ODataTreeBindingFlat - Fake service QUnit tests"
			},
			V2ODataModel: {
				title: "sap.ui.model.odata.v2.ODataModel - Mockserver QUnit tests",
				ui5: {
					language: "en-US"
				}
			},
			V2ODataModelB: {
				title: "sap.ui.model.odata.v2.ODataModel - Mockserver QUnit tests",
				ui5: {
					language: "en-US"
				}
			},
			V2ODataModelDataState: {
				title: "sap.ui.model.DataState - v2.Model Datastate QUnit tests",
				ui5: {
					language: "en"
				}
			}
		}
	};
});
