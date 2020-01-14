sap.ui.define(function() {

	"use strict";
	/*eslint camelcase: 0*/
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
			},
			loader : {
				paths : {
					"sap/ui/core/qunit" : "test-resources/sap/ui/core/qunit"
				}
			}
		},
		tests: {
			CanonicalRequests: {
				title: "sap.ui.model.odata.v2.ODataModel - Canonical Requests",
				sinon: 1 /* MockServer usage */
			},
			datajs: {
				title: "sap.ui.thirdparty.datajs - QUnit tests"
			},
			PendingChanges: {
				title: "sap.ui.model.odata.v2.ODataModel - Get all pending changes",
				sinon: 1 /* MockServer usage */
			},
			DerivedTypes: {
				title: "DerivedTypes - QUnit tests"
			},
			ODataAnnotationsV2: {
				title: "sap.ui.model.odata.v2.ODataAnnotations - QUnit tests"
			},
			ODataListBindingNoFakeService: {
				title: "sap.ui.model.odata.v2.ODataListBinding (ODataListBindingNoFakeService.qunit)"
			},
			ODataModelNoFakeService: {
				title: "sap.ui.model.odata.v2.ODataModel (ODataModelNoFakeService.qunit)"
			},
			"ODataModel.integration": {
				title: "sap.ui.model.odata.v2.ODataModel.integration"
			},
			ODataV2ListBinding: {
				title: "sap.ui.model.odata.v2.ODataListBinding - QUnit tests"
			},
			ODataV2ListBinding_Paging: {
				title: "sap.ui.model.odata.v2.ODataListBinding_Paging - QUnit tests"
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
				},
				sinon: 1 // because MockServer is used which has a hard dependency to sinon V1
			},
			ODataV2TreeBindingFlat_MockSrv: {
				title: "sap.ui.model.odata.ODataTreeBindingFlat - MockServer based QUnit tests",
				sinon: 1 // because MockServer is used which has a hard dependency to sinon V1
			},
			ODataV2TreeBindingFlat_FakeSrv: {
				title: "sap.ui.model.odata.ODataTreeBindingFlat - Fake service QUnit tests"
			},
			V2ODataModel: {
				title: "sap.ui.model.odata.v2.ODataModel - Mockserver QUnit tests",
				sinon: 1, // because MockServer is used which has a hard dependency to sinon V1
				ui5: {
					language: "en-US"
				}
			},
			V2ODataModelB: {
				title: "sap.ui.model.odata.v2.ODataModel - Mockserver QUnit tests",
				sinon: 1, // because MockServer is used which has a hard dependency to sinon V1
				ui5: {
					language: "en-US"
				}
			},
			V2ODataModelDataState: {
				title: "sap.ui.model.DataState - v2.Model Datastate QUnit tests",
				sinon: 1, // because MockServer is used which has a hard dependency to sinon V1
				ui5: {
					language: "en"
				}
			}
		}
	};
});
