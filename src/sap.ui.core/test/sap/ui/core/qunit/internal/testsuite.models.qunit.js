sap.ui.define(function() {
	/*
	 * Run all UI5 Core - Models tests with one click. "1RingModels.qunit" is intended to run these
	 * tests performantly. Unfortunately there are some test that cannot be included into
	 * "1RingModels.qunit" because they are using a mock server, or a fake service, or that need
	 * some configuration that cannot be changed at runtime.
	 * TODO: adjust these test that they can be included into "1RingModels.qunit"
	 */

	"use strict";
	/*eslint camelcase: 0*/
	return {
		name : "Internal TestSuite for UI5 Core - Models",
		defaults : {
			group : "UI5 Core - Models",
			loader : {
				paths : {
					"sap/ui/core/qunit" : "test-resources/sap/ui/core/qunit"
				}
			},
			module : "test-resources/sap/ui/core/qunit/{name}.qunit",
			qunit : {
				version : 2,
				testTimeout : 6000
			},
			sinon : {
				version : 4,
				qunitBridge : true,
				useFakeTimers : false
			}
		},
		tests : {
			// all other sinon 4 UI5 Core - Models tests
			"1Ring" : {
				// 1RingModels takes care of starting the tests after theme is loaded
				autostart : false,
				title : "1RingModels.qunit",
				loader : {
					paths : {
						"sap/ui/core/qunit" : "test-resources/sap/ui/core/qunit",
						"sap/ui/test/qunit" : "test-resources/sap/ui/test/qunit",
						"sap/ui/testlib" : "test-resources/sap/ui/core/qunit/testdata/uilib",
						"testdata" : "test-resources/sap/ui/core/qunit/testdata"
					}
				},
				module : ["test-resources/sap/ui/core/qunit/internal/1RingModels.qunit"],
				qunit : {
					version : "edge",
					reorder : false
				},
				sinon : {
					version : "edge"
				},
				ui5 : {
					// to avoid failing tests because of log messages caused by theme initialization
					"xx-waitForTheme" : true
				}
			},
			// *************************************************************************
			// Tests considering model base types
			// *************************************************************************
			// contained in testsuite.databinding.qunit.js
			CalculatedFields : {
				// not in 1RingModels.qunit because test has to be refactored
				title : "sap.ui.model.* (CalculatedFields)",
				module : ["test-resources/sap/ui/core/qunit/CalculatedFields.qunit"],
				ui5 : {
					language : "en-US"
				}
			},
			DataBinding : {
				// not in 1RingModels.qunit because ODataModelFakeService is used
				title : "sap.ui.model.* (DataBinding)",
				module : ["test-resources/sap/ui/core/qunit/DataBinding.qunit"]
			},
			ListBinding : {
				// not in 1RingModels.qunit because test has to be refactored
				title : "sap.ui.model.* (ListBinding)",
				module : ["test-resources/sap/ui/core/qunit/ListBinding.qunit"]
			},
			MasterDetail : {
				// not in 1RingModels.qunit because test has to be refactored
				title : "sap.ui.model.* (MasterDetail)",
				module : ["test-resources/sap/ui/core/qunit/MasterDetail.qunit"]
			},

			// *************************************************************************
			// Tests considering AnalyticalBinding
			// *************************************************************************
			// contained in testsuite.databinding.qunit.js
			AnalyticalBinding : {
				title : "sap.ui.model.analytics.AnalyticalBinding",
				module : ["test-resources/sap/ui/core/qunit/analytics/AnalyticalBinding.qunit"],
				sinon : 1
			},
			// contained in sap.ui.table/test/sap/ui/table/qunit/testsuite.qunit.js
			AnalyticalTable : {
				title : "sap.ui.table.qunit.AnalyticalTable.qunit",
				loader : {
					paths : {
						"sap/ui/table/qunit" : "test-resources/sap/ui/table/qunit"
					}
				},
				module : ["test-resources/sap/ui/table/qunit/AnalyticalTable.qunit"],
				sinon : 1,
				ui5 : {
					libs : ["sap.ui.table", "sap.m"]
				}
			},
			// *************************************************************************
			// Tests considering messages
			// *************************************************************************
			// messages in combination with OData V2 - contained in testsuite.odatav2.qunit.js
			CanonicalRequests : {
				// not in 1RingModels.qunit because of MockServer usage
				title : "sap.ui.model.odata.v2.ODataModel (CanonicalRequests.qunit)",
				module : ["test-resources/sap/ui/core/qunit/odata/v2/CanonicalRequests.qunit"],
				sinon : 1
			},
			// contained in testsuite.messages.qunit.js
			messagesEnd2End : {
				// not in 1RingModels.qunit because of MockServer usage
				title : "Messaging (messagesEnd2End.qunit)",
				module : ["test-resources/sap/ui/core/qunit/messages/messagesEnd2End.qunit"]
			},
			messagesGeneral : {
				// not in 1RingModels.qunit because of MockServer usage
				title : "Messaging (messagesGeneral.qunit)",
				module : [
					"test-resources/sap/ui/core/qunit/messages/messagesGeneral.qunit"
				],
				ui5 : {
					libs : "sap.m,sap.ui.layout",
					language : "en",
					"xx-handleValidation" : true
				}
			},
			// contained in testsuite.databinding.qunit.js
			ODataMessageParser : {
				// not in 1RingModels.qunit because of ODataMessagesFakeService usage
				title : "sap.ui.model.ODataMessageParser",
				module : ["test-resources/sap/ui/core/qunit/odata/ODataMessageParser.qunit"]
			},

			// *************************************************************************
			// OData V1 model tests
			// *************************************************************************
			// contained in testsuite.databinding.qunit.js
			ODataAnnotations : {
				// not in 1RingModels.qunit because of ODataAnnotationsFakeService usage
				title : "sap.ui.model.odata.ODataAnnotations",
				module : ["test-resources/sap/ui/core/qunit/odata/ODataAnnotations.qunit"],
				ui5 : {
					language : "en-US"
				}
			},
			ODataListBinding : {
				// not in 1RingModels.qunit because of ODataModelFakeService usage
				title : "sap.ui.model.odata.ODataListBinding",
				module : ["test-resources/sap/ui/core/qunit/odata/v1/ODataListBinding.qunit"]
			},
			ODataMetadata : {
				// not in 1RingModels.qunit because of MockServer usage
				title : "sap.ui.model.odata.ODataMetadata",
				module : ["test-resources/sap/ui/core/qunit/odata/ODataMetadata.qunit"],
				qunit : {
					reorder : false
				},
				sinon : 1
			},
			ODataModel : {
				// not in 1RingModels.qunit because of ODataModelFakeService usage
				title : "sap.ui.model.odata.ODataModel",
				module : ["test-resources/sap/ui/core/qunit/odata/v1/ODataModel.qunit"]
			},
			ODataSharedMetadata : {
				// not in 1RingModels.qunit because of ODataModelFakeService usage
				title : "sap.ui.model.odata.ODataModel (ODataSharedMetadata)",
				module : ["test-resources/sap/ui/core/qunit/odata/v1/ODataSharedMetadata.qunit"],
				sinon : {
					useFakeTimers : true
				}
			},

			// *************************************************************************
			// OData V2 model tests
			// *************************************************************************
			// contained in testsuite.odatav2.qunit.js
			DerivedTypes : {
				// not in 1RingModels.qunit because of MockServer usage
				title : "DerivedTypes",
				module : ["test-resources/sap/ui/core/qunit/odata/v2/DerivedTypes.qunit"]
			},
			ODataAnnotationsV2 : {
				// not in 1RingModels.qunit because of ODataAnnotationsFakeService usage
				title : "sap.ui.model.odata.v2.ODataAnnotations",
				module : ["test-resources/sap/ui/core/qunit/odata/v2/ODataAnnotationsV2.qunit"]
			},
			ODataPropertyBinding : {
				// not in 1RingModels.qunit because of ODataModelFakeService usage
				title : "sap.ui.model.odata.v2.ODataPropertyBinding",
				module : ["test-resources/sap/ui/core/qunit/odata/v2/ODataPropertyBinding.qunit"]
			},
			ODataV2ListBinding : {
				// not in 1RingModels.qunit because of ODataModelFakeService usage
				title : "sap.ui.model.odata.v2.ODataListBinding",
				module : ["test-resources/sap/ui/core/qunit/odata/v2/ODataV2ListBinding.qunit"]
			},
			ODataV2ListBinding_Paging : {
				// not in 1RingModels.qunit because of ODataModelFakeService usage
				title : "sap.ui.model.odata.v2.ODataListBinding - Paging",
				module : [
					"test-resources/sap/ui/core/qunit/odata/v2/ODataV2ListBinding_Paging.qunit"
				]
			},
			ODataV2Model : {
				// not in 1RingModels.qunit because of ODataModelFakeService usage
				title : "sap.ui.model.odata.v2.ODataModel (ODataV2Model)",
				module : ["test-resources/sap/ui/core/qunit/odata/v2/ODataV2Model.qunit"]
			},
			PendingChanges : {
				// not in 1RingModels.qunit because of MockServer usage
				title : "sap.ui.model.odata.v2.ODataModel - Get all pending changes",
				module : ["test-resources/sap/ui/core/qunit/odata/v2/PendingChanges.qunit"],
				sinon : 1
			},
			V2ODataModel : {
				// not in 1RingModels.qunit because of MockServer usage
				title : "sap.ui.model.odata.v2.ODataModel (V2ODataModel.qunit)",
				module : ["test-resources/sap/ui/core/qunit/odata/v2/V2ODataModel.qunit"],
				sinon : 1,
				ui5 : {
					language : "en-US"
				}
			},
			V2ODataModelB : {
				// not in 1RingModels.qunit because of MockServer usage
				title : "sap.ui.model.odata.v2.ODataModel (V2ODataModelB.qunit)",
				module : ["test-resources/sap/ui/core/qunit/odata/v2/V2ODataModelB.qunit"],
				sinon : 1,
				ui5 : {
					language : "en-US"
				}
			},
			V2ODataModelDataState : {
				// not in 1RingModels.qunit because of MockServer usage
				title : "sap.ui.model.odata.v2.ODataModel (V2ODataModelDataState.qunit)",
				module : ["test-resources/sap/ui/core/qunit/odata/v2/V2ODataModelDataState.qunit"],
				sinon : 1,
				ui5 : {
					language : "en-US"
				}
			},

			// *************************************************************************
			// ResourceModel test
			// *************************************************************************
			// contained in testsuite.databinding.qunit.js
			ResourceModel : {
				// not in 1RingModels.qunit because "originInfo" cannot be changes at runtime
				title : "sap.ui.model.resource.ResourceModel",
				loader : {
					paths : {
						testdata : "test-resources/sap/ui/core/qunit/testdata",
						"sap/ui/testlib" : "test-resources/sap/ui/core/qunit/testdata/uilib"
					}
				},
				module : ["test-resources/sap/ui/core/qunit/resource/ResourceModel.qunit"],
				ui5 : {
					language : "en",
					originInfo : true
				}
			}
		}
	};
});
