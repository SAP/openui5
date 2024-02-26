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
			// Tests considering CLDR / LocaleData
			// *************************************************************************
			// contained in testsuite.i18n.qunit.js
			LocaleData : {
				// not in 1RingModels.qunit because test has to be refactored
				title : "sap.ui.core.LocalData",
				module : ["test-resources/sap/ui/core/qunit/i18n/LocaleData.qunit"],
				qunit : {
					reorder : false // currency digits test seems to depend on execution order
				},
				ui5 : {
					language : "en-US"
				}
			},
			// *************************************************************************
			// Tests considering Formatters
			// *************************************************************************
			// contained in testsuite.types.qunit.js
			DateFormat : {
				// not in 1RingModels.qunit because test has to be refactored
				title : "sap.ui.core.format.DateFormat",
				module : ["test-resources/sap/ui/core/qunit/types/DateFormat.qunit"],
				ui5 : {
					language : "en-US"
				}
			},
			FormatUtils : {
				title : "sap.ui.core.format.FormatUtils",
				module : ["test-resources/sap/ui/core/qunit/format/FormatUtils.qunit"],
				ui5 : {
					language : "en-US"
				}
			},
			NumberFormatCurrencies : {
				// not in 1RingModels.qunit because test has to be refactored
				title : "sap.ui.core.format.NumberFormatCurrencies",
				module : ["test-resources/sap/ui/core/qunit/types/NumberFormatCurrencies.qunit"],
				ui5 : {
					language : "en-US"
				}
			},
			NumberFormatCurrenciesTrailing : {
				// not in 1RingModels.qunit because test has to be refactored
				title : "sap.ui.core.format.NumberFormatCurrenciesTrailing",
				module : ["test-resources/sap/ui/core/qunit/types/NumberFormatCurrenciesTrailing.qunit"],
				ui5 : {
					language : "en-US"
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
			/** @deprecated As of version 1.11.1 reason bindContext*/
			MasterDetail : {
				// not in 1RingModels.qunit because test has to be refactored
				title : "sap.ui.model.* (MasterDetail_legacyAPIs)",
				module : ["test-resources/sap/ui/core/qunit/MasterDetail_legacyAPIs.qunit"]
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
				ui5 : {
					libs : ["sap.ui.table", "sap.m"]
				}
			},

			// *************************************************************************
			// Tests considering JSONModel and JSONPropertyBinding
			// *************************************************************************
			// contained in testsuite.json.qunit.js
			JSONModel : {
				// not in 1RingModels.qunit because of fake service usage
				title : "sap.ui.model.json.JSONModel",
				module : ["test-resources/sap/ui/core/qunit/json/JSONModel.qunit"]
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
			/** @deprecated As of version 1.66.0 */
			ODataListBinding : {
				// not in 1RingModels.qunit because of ODataModelFakeService usage
				title : "sap.ui.model.odata.ODataListBinding",
				module : ["test-resources/sap/ui/core/qunit/odata/ODataListBinding_legacyAPIs.qunit"]
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
			/** @deprecated As of version 1.48.0 */
			ODataModel : {
				// not in 1RingModels.qunit because of ODataModelFakeService usage
				title : "sap.ui.model.odata.ODataModel (ODataModel_legacyAPIs)",
				module : ["test-resources/sap/ui/core/qunit/odata/ODataModel_legacyAPIs.qunit"]
			},
			/** @deprecated As of version 1.48.0 reason sap.ui.model.odata.ODataModel */
			ODataSharedMetadata : {
				// not in 1RingModels.qunit because of ODataModelFakeService usage
				title : "sap.ui.model.odata.ODataModel (ODataSharedMetadata_legacyAPIs)",
				module : ["test-resources/sap/ui/core/qunit/odata/ODataSharedMetadata_legacyAPIs.qunit"],
				sinon : {
					useFakeTimers : true
				}
			},
			/** @deprecated As of version 1.28.0 */
			ODataTreeBinding : {
				// not in 1RingModels.qunit because of MockServer usage
				title : "sap.ui.model.odata.ODataTreeBinding (ODataTreeBinding_legacyAPIs)",
				module : ["test-resources/sap/ui/core/qunit/odata/ODataTreeBinding_legacyAPIs.qunit"],
				sinon : 1
			},
			ODataTreeBindingAdapter : {
				// not in 1RingModels.qunit because of MockServer usage
				title : "sap.ui.model.odata.ODataTreeBindingAdapter",
				module : ["test-resources/sap/ui/core/qunit/odata/ODataTreeBindingAdapter.qunit"]
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
			/** @deprecated As of version 1.22.0, reason sap.ui.model.odata.Filter */
			ODataV2ListBinding_Filter_legacyAPIs: {
				title: "sap.ui.model.odata.v2.ODataListBinding_Filter - QUnit tests",
				module : ["test-resources/sap/ui/core/qunit/odata/v2/ODataV2ListBinding_Filter_legacyAPIs.qunit"]
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
			ODataV2TreeBinding : {
				// not in 1RingModels.qunit because of MockServer usage
				title : "sap.ui.model.odata.v2.ODataTreeBinding",
				module : ["test-resources/sap/ui/core/qunit/odata/v2/ODataV2TreeBinding.qunit"],
				path : {
					mockdata : "test-resources/sap/ui/core/qunit/model"
				},
				sinon : 1
			},
			ODataV2TreeBindingFlat_MockSrv : {
				// not in 1RingModels.qunit because of MockServer usage
				title : "sap.ui.model.odata.ODataTreeBindingFlat (MockSrv)",
				module : [
					"test-resources/sap/ui/core/qunit/odata/v2/ODataV2TreeBindingFlat_MockSrv.qunit"
				],
				sinon : 1
			},
			ODataV2TreeBindingFlat_FakeSrv : {
				// not in 1RingModels.qunit because of ODataModelFakeService usage
				title : "sap.ui.model.odata.ODataTreeBindingFlat (FakeSrv)",
				module : [
					"test-resources/sap/ui/core/qunit/odata/v2/ODataV2TreeBindingFlat_FakeSrv.qunit"
				]
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
			// Tests considering MockServer
			// *************************************************************************
			// contained in testsuite.mockserver.qunit.js
			MockServerSinon1: {
				title: "sap.ui.core.util.MockServer (Sinon: V1)",
				module: ["test-resources/sap/ui/core/qunit/mockserver/MockServer.qunit"],
				sinon: 1,
				ui5: {
					libs: ["sap.m"]
				}
			},
			MockServerFeatureSinon1: {
				title: "sap.ui.core.util.MockServer (Sinon: V1): given data and complex filter features",
				module: ["test-resources/sap/ui/core/qunit/mockserver/MockServerFeature.qunit"],
				sinon: 1
			},
			MockServerAPFSinon1: {
				title: "sap.ui.core.util.MockServer (Sinon: V1): APF model",
				module: ["test-resources/sap/ui/core/qunit/mockserver/MockServerAPF.qunit"],
				sinon: 1
			},
			DraftEnabledMockServerSinon1: {
				title: "sap.ui.core.util.DraftEnabledMockServer (Sinon: V1)",
				module: ["test-resources/sap/ui/core/qunit/mockserver/DraftEnabledMockServer.qunit"],
				sinon: 1
			},
			MockServer: {
				title: "sap.ui.core.util.MockServer (Sinon: V4)",
				module: ["test-resources/sap/ui/core/qunit/mockserver/MockServer.qunit"],
				ui5: {
					libs: ["sap.m"]
				}
			},
			MockServerFeature: {
				title: "sap.ui.core.util.MockServer (Sinon: V4): given data and complex filter features",
				module: ["test-resources/sap/ui/core/qunit/mockserver/MockServerFeature.qunit"]
			},
			MockServerAPF: {
				title: "sap.ui.core.util.MockServer (Sinon: V4): APF model",
				module: ["test-resources/sap/ui/core/qunit/mockserver/MockServerAPF.qunit"]
			},
			DraftEnabledMockServer: {
				title: "sap.ui.core.util.DraftEnabledMockServer (Sinon: V4)",
				module: ["test-resources/sap/ui/core/qunit/mockserver/DraftEnabledMockServer.qunit"]
			}
		}
	};
});
