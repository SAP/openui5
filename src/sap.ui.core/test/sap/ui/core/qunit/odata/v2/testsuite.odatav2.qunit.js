sap.ui.define(function() {

	"use strict";
	return {
		name: "TestSuite for sap.ui.core: GTP testcase CORE/DATABINDING",
		defaults: {
			qunit: {
				version: 2
			}
		},
		tests: {
			datajs: {
				title: "sap/ui/thirdparty/datajs"
			},
			ODataAnnotationsV2: {
				page: "test-resources/sap/ui/core/qunit/ODataAnnotationsV2.qunit.html",
				title: "OData Annotations - sap.ui.core",
				ui5: {
					libs: "sap.ui.commons,sap.ui.table",
					theme: "sap_bluecrystal",
					language: "en-US"
				},
				qunit: {
					version: 1
				},
				sinon: {
					version: 1,
					qunitBridge: true,
					useFakeTimers: false
				}
			},
			ODataV2ListBinding: {
				ui5: {
					libs: "sap.m"
				},
				sinon: {
					version: 1,
					qunitBridge: true
				}
			},
			ODataV2Model: {
				sinon: {
					version: 1,
					qunitBridge: true,
					useFakeTimers: false
				}
			},
			ODataV2TreeBinding: {
				path: {
					"mockdata": "test-resources/sap/ui/core/qunit/model"
				},
				sinon: {
					useFakeTimers: false
				}
			},
			ODataV2TreeBindingFlat: {
				sinon: {
					useFakeTimers: false
				}
			},
			ODataV2TreeBindingFlat_ExpansionState: {
				sinon: {
					version: 1,
					qunitBridge: true,
					useFakeTimers: false
				}
			},
			V2ODataModel: {
				title: "QUnit page for V2ODataModel - sap.ui.core",
				ui5: {
					language: "en-US"
				}
			},
			V2ODataModelB: {
				title: "QUnit page for V2ODataModelB - sap.ui.core",
				ui5: {
					language: "en-US"
				}
			},
			V2ODataModelDataState: {
				title: "QUnit page for V2ODataModelDataState - sap.ui.core",
				ui5: {
					libs: "sap.ui.commons,sap.ui.table,sap.m, sap.ui.layout",
					language: "en"
				}
			}
		}
	};
});
